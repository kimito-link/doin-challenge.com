import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // イベント関連API
  events: router({
    // 公開イベント一覧取得
    list: publicProcedure.query(async () => {
      return db.getAllEvents();
    }),

    // イベント詳細取得
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const event = await db.getEventById(input.id);
        if (!event) return null;
        const participantCount = await db.getTotalCompanionCountByEventId(input.id);
        return { ...event, participantCount };
      }),

    // 自分が作成したイベント一覧
    myEvents: protectedProcedure.query(async ({ ctx }) => {
      return db.getEventsByHostUserId(ctx.user.id);
    }),

    // イベント作成
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        eventDate: z.string(),
        venue: z.string().optional(),
        hostTwitterId: z.string().optional(),
        hostName: z.string(),
        hostUsername: z.string().optional(),
        hostProfileImage: z.string().optional(),
        hostFollowersCount: z.number().optional(),
        hostDescription: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const eventId = await db.createEvent({
          hostUserId: ctx.user.id,
          hostTwitterId: input.hostTwitterId,
          hostName: input.hostName,
          hostUsername: input.hostUsername,
          hostProfileImage: input.hostProfileImage,
          hostFollowersCount: input.hostFollowersCount,
          hostDescription: input.hostDescription,
          title: input.title,
          description: input.description,
          eventDate: new Date(input.eventDate),
          venue: input.venue,
          isPublic: true,
        });
        return { id: eventId };
      }),

    // イベント更新
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        eventDate: z.string().optional(),
        venue: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const event = await db.getEventById(input.id);
        if (!event || event.hostUserId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        const { id, eventDate, ...rest } = input;
        await db.updateEvent(id, {
          ...rest,
          ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
        });
        return { success: true };
      }),

    // イベント削除
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const event = await db.getEventById(input.id);
        if (!event || event.hostUserId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        await db.deleteEvent(input.id);
        return { success: true };
      }),
  }),

  // 参加登録関連API
  participations: router({
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

    // 参加登録（ログインユーザー）
    create: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        message: z.string().optional(),
        companionCount: z.number().default(0),
        prefecture: z.string().optional(),
        twitterId: z.string().optional(),
        displayName: z.string(),
        username: z.string().optional(),
        profileImage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const participationId = await db.createParticipation({
          challengeId: input.challengeId,
          userId: ctx.user.id,
          twitterId: input.twitterId,
          displayName: input.displayName,
          username: input.username,
          profileImage: input.profileImage,
          message: input.message,
          companionCount: input.companionCount,
          prefecture: input.prefecture,
          isAnonymous: false,
        });
        return { id: participationId };
      }),

    // 匿名参加登録
    createAnonymous: publicProcedure
      .input(z.object({
        challengeId: z.number(),
        displayName: z.string(),
        message: z.string().optional(),
        companionCount: z.number().default(0),
        prefecture: z.string().optional(),
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
        return { id: participationId };
      }),

    // 参加取消
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // 自分の参加のみ削除可能
        const participations = await db.getParticipationsByUserId(ctx.user.id);
        const participation = participations.find(p => p.id === input.id);
        if (!participation) {
          throw new Error("Unauthorized");
        }
        await db.deleteParticipation(input.id);
        return { success: true };
      }),
  }),

  // 通知関連API
  notifications: router({
    // 通知設定取得
    getSettings: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const settings = await db.getNotificationSettings(ctx.user.id);
        return settings;
      }),

    // 通知設定更新
    updateSettings: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        onGoalReached: z.boolean().optional(),
        onMilestone25: z.boolean().optional(),
        onMilestone50: z.boolean().optional(),
        onMilestone75: z.boolean().optional(),
        onNewParticipant: z.boolean().optional(),
        expoPushToken: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { challengeId, ...settings } = input;
        await db.upsertNotificationSettings(ctx.user.id, challengeId, settings);
        return { success: true };
      }),

    // 通知履歴取得
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotificationsByUserId(ctx.user.id);
    }),

    // 通知を既読にする
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),

    // 全ての通知を既読にする
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // OGP画像生成API
  ogp: router({
    // チャレンジのシェア用OGP画像を生成
    generateChallengeOgp: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ input }) => {
        const challenge = await db.getEventById(input.challengeId);
        if (!challenge) {
          throw new Error("Challenge not found");
        }

        const currentValue = challenge.currentValue || 0;
        const goalValue = challenge.goalValue || 100;
        const progress = Math.min(Math.round((currentValue / goalValue) * 100), 100);
        const unit = challenge.goalUnit || "人";

        // OGP画像のプロンプトを生成
        const prompt = `Create a vibrant social media share card for a Japanese idol fan challenge app called "動員ちゃれんじ". 

Design requirements:
- Modern dark theme with pink to purple gradient accents (#EC4899 to #8B5CF6)
- Title: "${challenge.title}"
- Progress: ${currentValue}/${goalValue}${unit} (${progress}%)
- Host: ${challenge.hostName}
- Include a progress bar visualization
- Japanese text style with cute idol aesthetic
- Include sparkles and star decorations
- Aspect ratio 1200x630 (Twitter/OGP standard)
- Text should be large and readable
- Include "#動員ちゃれんじ" hashtag at bottom`;

        try {
          const result = await generateImage({ prompt });
          return { url: result.url };
        } catch (error) {
          console.error("OGP image generation failed:", error);
          throw new Error("Failed to generate OGP image");
        }
      }),
  }),

  // バッジ関連API
  badges: router({
    // 全バッジ一覧
    list: publicProcedure.query(async () => {
      return db.getAllBadges();
    }),

    // ユーザーのバッジ一覧
    myBadges: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBadgesWithDetails(ctx.user.id);
    }),

    // バッジ付与（管理者用）
    award: protectedProcedure
      .input(z.object({
        userId: z.number(),
        badgeId: z.number(),
        challengeId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 管理者チェック
        if (ctx.user.role !== "admin") {
          throw new Error("Admin access required");
        }
        const result = await db.awardBadge(input.userId, input.badgeId, input.challengeId);
        return { success: !!result, id: result };
      }),
  }),

  // ピックアップコメント関連API
  pickedComments: router({
    // チャレンジのピックアップコメント一覧
    list: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return db.getPickedCommentsWithParticipation(input.challengeId);
      }),

    // コメントをピックアップ（管理者/ホスト用）
    pick: protectedProcedure
      .input(z.object({
        participationId: z.number(),
        challengeId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // ホストか管理者のみ
        const challenge = await db.getEventById(input.challengeId);
        if (!challenge) throw new Error("Challenge not found");
        if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Permission denied");
        }
        const result = await db.pickComment(input.participationId, input.challengeId, ctx.user.id, input.reason);
        return { success: !!result, id: result };
      }),

    // ピックアップ解除
    unpick: protectedProcedure
      .input(z.object({ participationId: z.number(), challengeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const challenge = await db.getEventById(input.challengeId);
        if (!challenge) throw new Error("Challenge not found");
        if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Permission denied");
        }
        await db.unpickComment(input.participationId);
        return { success: true };
      }),

    // 動画使用済みにマーク
    markAsUsed: protectedProcedure
      .input(z.object({ id: z.number(), challengeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const challenge = await db.getEventById(input.challengeId);
        if (!challenge) throw new Error("Challenge not found");
        if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Permission denied");
        }
        await db.markCommentAsUsedInVideo(input.id);
        return { success: true };
      }),

    // コメントがピックアップされているかチェック
    isPicked: publicProcedure
      .input(z.object({ participationId: z.number() }))
      .query(async ({ input }) => {
        return db.isCommentPicked(input.participationId);
      }),
  }),

  // 地域統計API
  prefectures: router({
    // 地域ランキング
    ranking: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return db.getPrefectureRanking(input.challengeId);
      }),

    // 地域フィルター付き参加者一覧
    participations: publicProcedure
      .input(z.object({ challengeId: z.number(), prefecture: z.string() }))
      .query(async ({ input }) => {
        return db.getParticipationsByPrefectureFilter(input.challengeId, input.prefecture);
      }),
  }),
});

export type AppRouter = typeof appRouter;
