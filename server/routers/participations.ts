/**
 * server/routers/participations.ts
 * 
 * 参加登録関連のルーター
 * 
 * v6.40: ソフトデリート対応
 * v6.41: 監査ログ対応
 * - update/delete/softDelete操作時に監査ログを記録
 * - requestIdを監査ログに含める
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { AUDIT_ACTIONS, ENTITY_TYPES } from "../../drizzle/schema";

export const participationsRouter = router({
  // イベントの参加者一覧
  listByEvent: publicProcedure
    .input(z.object({ 
      eventId: z.number(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return db.getParticipationsByEventId(input.eventId, input.limit, input.offset);
    }),

  // 参加方法別集計
  getAttendanceTypeCounts: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return db.getAttendanceTypeCounts(input.eventId);
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
      attendanceType: z.enum(["venue", "streaming", "both"]).default("venue"),
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
          attendanceType: input.attendanceType || "venue",
          isAnonymous: false,
        });
        
        // 監査ログ: CREATE
        if (participationId && ctx.requestId) {
          await db.logAction({
            requestId: ctx.requestId,
            action: AUDIT_ACTIONS.CREATE,
            entityType: ENTITY_TYPES.PARTICIPATION,
            targetId: participationId,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || input.displayName,
            afterData: {
              id: participationId,
              challengeId: input.challengeId,
              message: input.message,
              companionCount: input.companionCount,
              prefecture: input.prefecture,
            },
            ipAddress: ctx.req.ip,
            userAgent: ctx.req.headers["user-agent"],
          });
        }
        
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
        
        // Get participant number (total participations for this challenge)
        const participations = await db.getParticipationsByEventId(input.challengeId);
        const participantNumber = participations.length;
        
        // 参加表明後にプッシュ通知を送信
        try {
          const challenge = await db.getEventById(input.challengeId);
          if (challenge) {
            // 通知を受け取るユーザーを取得
            const usersWithNotification = await db.getUsersWithNotificationEnabled(input.challengeId, "participant");
            
            // 各ユーザーに通知を作成
            for (const setting of usersWithNotification) {
              // 自分自身の参加表明には通知しない
              if (setting.userId === ctx.user?.id) continue;
              
              await db.createNotification({
                userId: setting.userId,
                challengeId: input.challengeId,
                type: "new_participant",
                title: "🎉 新しい参加者！",
                body: `${input.displayName}さんが参加表明しました！現在${participantNumber}人`,
                sentAt: new Date(),
              });
            }
          }
        } catch (notificationError) {
          console.error("[Notification] Failed to send notification:", notificationError);
          // 通知の送信に失敗しても参加表明は成功とする
        }
        
        return { id: participationId, requestId: ctx.requestId, participantNumber };
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
    .mutation(async ({ ctx, input }) => {
      const participationId = await db.createParticipation({
        challengeId: input.challengeId,
        displayName: input.displayName,
        message: input.message,
        companionCount: input.companionCount,
        prefecture: input.prefecture,
        isAnonymous: true,
      });
      
      // 監査ログ: CREATE (匿名)
      if (participationId && ctx.requestId) {
        await db.logAction({
          requestId: ctx.requestId,
          action: AUDIT_ACTIONS.CREATE,
          entityType: ENTITY_TYPES.PARTICIPATION,
          targetId: participationId,
          actorName: input.displayName + " (匿名)",
          afterData: {
            id: participationId,
            challengeId: input.challengeId,
            message: input.message,
            companionCount: input.companionCount,
            prefecture: input.prefecture,
            isAnonymous: true,
          },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"],
        });
      }
      
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
      
      return { id: participationId, requestId: ctx.requestId };
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
      
      // 変更前のデータを保存
      const beforeData = {
        id: participation.id,
        message: participation.message,
        prefecture: participation.prefecture,
        companionCount: participation.companionCount,
        gender: participation.gender,
      };
      
      await db.updateParticipation(input.id, {
        message: input.message,
        prefecture: input.prefecture,
        companionCount: input.companionCount,
        gender: input.gender,
      });
      
      // 監査ログ: EDIT
      if (ctx.requestId) {
        await db.logAction({
          requestId: ctx.requestId,
          action: AUDIT_ACTIONS.EDIT,
          entityType: ENTITY_TYPES.PARTICIPATION,
          targetId: input.id,
          actorId: ctx.user.id,
          actorName: ctx.user.name || undefined,
          beforeData,
          afterData: {
            id: input.id,
            message: input.message,
            prefecture: input.prefecture,
            companionCount: input.companionCount,
            gender: input.gender,
          },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"],
        });
      }
      
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
      
      return { success: true, requestId: ctx.requestId };
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
      
      // 変更前のデータを保存
      const beforeData = {
        id: participation.id,
        challengeId: participation.challengeId,
        message: participation.message,
        displayName: participation.displayName,
        deletedAt: null,
      };
      
      // ソフトデリート実行
      await db.softDeleteParticipation(input.id, ctx.user.id);
      
      // 監査ログ: DELETE
      if (ctx.requestId) {
        await db.logAction({
          requestId: ctx.requestId,
          action: AUDIT_ACTIONS.DELETE,
          entityType: ENTITY_TYPES.PARTICIPATION,
          targetId: input.id,
          actorId: ctx.user.id,
          actorName: ctx.user.name || undefined,
          beforeData,
          afterData: {
            id: input.id,
            deletedAt: new Date().toISOString(),
            deletedBy: ctx.user.id,
          },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"],
        });
      }
      
      return { success: true, requestId: ctx.requestId };
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
      
      // 変更前のデータを保存
      const beforeData = {
        id: participation.id,
        challengeId: participation.challengeId,
        message: participation.message,
        displayName: participation.displayName,
        deletedAt: null,
      };
      
      // ソフトデリート実行
      const result = await db.softDeleteParticipation(input.id, ctx.user.id);
      
      // 監査ログ: DELETE
      if (ctx.requestId) {
        await db.logAction({
          requestId: ctx.requestId,
          action: AUDIT_ACTIONS.DELETE,
          entityType: ENTITY_TYPES.PARTICIPATION,
          targetId: input.id,
          actorId: ctx.user.id,
          actorName: ctx.user.name || undefined,
          beforeData,
          afterData: {
            id: input.id,
            deletedAt: new Date().toISOString(),
            deletedBy: ctx.user.id,
          },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"],
        });
      }
      
      return { success: true, challengeId: result.challengeId, requestId: ctx.requestId };
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
      
      // 監査ログ: DELETE (cancel)
      if (ctx.requestId) {
        await db.logAction({
          requestId: ctx.requestId,
          action: AUDIT_ACTIONS.DELETE,
          entityType: ENTITY_TYPES.PARTICIPATION,
          targetId: input.participationId,
          actorId: ctx.user.id,
          actorName: ctx.user.name || undefined,
          reason: "参加キャンセル" + (input.createTransfer ? " (チケット譲渡あり)" : ""),
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"],
        });
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
      
      return { success: true, challengeId: result.challengeId, requestId: ctx.requestId };
    }),
});
