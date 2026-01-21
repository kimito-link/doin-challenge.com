/**
 * server/routers/participations.ts
 * 
 * 参加登録関連のルーター
 * 
 * v6.40: ソフトデリート対応
 * - update: 認証チェック追加（自分の投稿のみ編集可能）
 * - delete: 物理削除→ソフトデリートに変更
 * - softDelete: 新規追加（ソフトデリート専用）
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const participationsRouter = router({
  // イベントの参加者一覧
  listByEvent: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return db.getParticipationsByEventId(input.eventId);
    }),

  // 自分の参加一覧
  myParticipations: protectedProcedure.query(async ({ ctx }) => {
    return db.getParticipationsByUserId(ctx.user.id);
  }),

  // 参加登録
  create: publicProcedure
    .input(z.object({
      challengeId: z.number(),
      message: z.string().optional(),
      companionCount: z.number().default(0),
      prefecture: z.string().optional(),
      gender: z.enum(["male", "female", "unspecified"]).optional(),
      twitterId: z.string().optional(),
      displayName: z.string(),
      username: z.string().optional(),
      profileImage: z.string().optional(),
      followersCount: z.number().optional(),
      companions: z.array(z.object({
        displayName: z.string(),
        twitterUsername: z.string().optional(),
        twitterId: z.string().optional(),
        profileImage: z.string().optional(),
      })).optional(),
      invitationCode: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!input.twitterId) {
        throw new Error("ログインが必要です。Twitterでログインしてください。");
      }
      
      try {
        const participationId = await db.createParticipation({
          challengeId: input.challengeId,
          userId: ctx.user?.id,
          twitterId: input.twitterId,
          displayName: input.displayName,
          username: input.username,
          profileImage: input.profileImage,
          followersCount: input.followersCount,
          message: input.message,
          companionCount: input.companionCount,
          prefecture: input.prefecture,
          gender: input.gender || "unspecified",
          isAnonymous: false,
        });
        
        if (input.companions && input.companions.length > 0 && participationId) {
          const companionRecords = input.companions.map(c => ({
            participationId,
            challengeId: input.challengeId,
            displayName: c.displayName,
            twitterUsername: c.twitterUsername,
            twitterId: c.twitterId,
            profileImage: c.profileImage,
            invitedByUserId: ctx.user?.id,
          }));
          await db.createCompanions(companionRecords);
        }
        
        if (input.invitationCode && participationId && ctx.user?.id) {
          const invitation = await db.getInvitationByCode(input.invitationCode);
          if (invitation) {
            await db.confirmInvitationUse(invitation.id, ctx.user.id, participationId);
          }
        }
        
        return { id: participationId };
      } catch (error) {
        console.error("[Participation Create] Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes("Database not available") || errorMessage.includes("ECONNREFUSED")) {
          throw new Error("サーバーに接続できません。しばらく待ってから再度お試しください。");
        }
        
        if (errorMessage.includes("Duplicate entry") || errorMessage.includes("unique constraint")) {
          throw new Error("すでに参加表明済みです。");
        }
        
        throw new Error("参加表明の登録中にエラーが発生しました。しばらく待ってから再度お試しください。");
      }
    }),

  // 匿名参加登録
  createAnonymous: publicProcedure
    .input(z.object({
      challengeId: z.number(),
      displayName: z.string(),
      message: z.string().optional(),
      companionCount: z.number().default(0),
      prefecture: z.string().optional(),
      companions: z.array(z.object({
        displayName: z.string(),
        twitterUsername: z.string().optional(),
        twitterId: z.string().optional(),
        profileImage: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const participationId = await db.createParticipation({
        challengeId: input.challengeId,
        displayName: input.displayName,
        message: input.message,
        companionCount: input.companionCount,
        prefecture: input.prefecture,
        isAnonymous: true,
      });
      
      if (input.companions && input.companions.length > 0 && participationId) {
        const companionRecords = input.companions.map(c => ({
          participationId,
          challengeId: input.challengeId,
          displayName: c.displayName,
          twitterUsername: c.twitterUsername,
          twitterId: c.twitterId,
          profileImage: c.profileImage,
        }));
        await db.createCompanions(companionRecords);
      }
      
      return { id: participationId };
    }),

  // 参加表明の更新（認証必須 - 自分の投稿のみ編集可能）
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      message: z.string().optional(),
      prefecture: z.string().optional(),
      gender: z.enum(["male", "female", "unspecified"]).optional(),
      companionCount: z.number().default(0),
      companions: z.array(z.object({
        displayName: z.string(),
        twitterUsername: z.string().optional(),
        twitterId: z.string().optional(),
        profileImage: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 参加情報を取得（削除済みを除く）
      const participation = await db.getActiveParticipationById(input.id);
      if (!participation) {
        throw new Error("参加表明が見つかりません。");
      }
      
      // 自分の投稿かチェック
      if (participation.userId !== ctx.user.id) {
        throw new Error("自分の参加表明のみ編集できます。");
      }
      
      await db.updateParticipation(input.id, {
        message: input.message,
        prefecture: input.prefecture,
        companionCount: input.companionCount,
        gender: input.gender,
      });
      
      await db.deleteCompanionsForParticipation(input.id);
      if (input.companions && input.companions.length > 0) {
        const companionRecords = input.companions.map(c => ({
          participationId: input.id,
          challengeId: participation.challengeId,
          displayName: c.displayName,
          twitterUsername: c.twitterUsername,
          twitterId: c.twitterId,
          profileImage: c.profileImage,
        }));
        await db.createCompanions(companionRecords);
      }
      
      return { success: true };
    }),

  // 参加取消（ソフトデリート）
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // 参加情報を取得（削除済みを除く）
      const participation = await db.getActiveParticipationById(input.id);
      if (!participation) {
        throw new Error("参加表明が見つかりません。");
      }
      
      // 自分の投稿かチェック
      if (participation.userId !== ctx.user.id) {
        throw new Error("自分の参加表明のみ削除できます。");
      }
      
      // ソフトデリート実行
      await db.softDeleteParticipation(input.id, ctx.user.id);
      return { success: true };
    }),

  // ソフトデリート（明示的なAPI）
  softDelete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // 参加情報を取得（削除済みを除く）
      const participation = await db.getActiveParticipationById(input.id);
      if (!participation) {
        throw new Error("参加表明が見つかりません。");
      }
      
      // 自分の投稿かチェック
      if (participation.userId !== ctx.user.id) {
        throw new Error("自分の参加表明のみ削除できます。");
      }
      
      // ソフトデリート実行
      const result = await db.softDeleteParticipation(input.id, ctx.user.id);
      return { success: true, challengeId: result.challengeId };
    }),

  // 参加をキャンセル（チケット譲渡オプション付き）
  cancel: protectedProcedure
    .input(z.object({
      participationId: z.number(),
      createTransfer: z.boolean().default(false),
      transferComment: z.string().max(500).optional(),
      userUsername: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.cancelParticipation(input.participationId, ctx.user.id);
      
      if (!result.success) {
        return result;
      }
      
      if (input.createTransfer && result.challengeId) {
        await db.createTicketTransfer({
          challengeId: result.challengeId,
          userId: ctx.user.id,
          userName: ctx.user.name || "匿名",
          userUsername: input.userUsername,
          userImage: null,
          ticketCount: result.contribution || 1,
          priceType: "face_value",
          comment: input.transferComment || "参加キャンセルのため譲渡します",
        });
        
        const waitlistUsers = await db.getWaitlistUsersForNotification(result.challengeId);
      }
      
      return { success: true, challengeId: result.challengeId };
    }),
});
