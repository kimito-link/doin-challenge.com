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

  // エール（参加者同士の応援）API
  cheers: router({
    // エールを送る
    send: protectedProcedure
      .input(z.object({
        toParticipationId: z.number(),
        toUserId: z.number().optional(),
        challengeId: z.number(),
        message: z.string().optional(),
        emoji: z.string().default("👏"),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.sendCheer({
          fromUserId: ctx.user.id,
          fromUserName: ctx.user.name || "匿名",
          fromUserImage: null,
          toParticipationId: input.toParticipationId,
          toUserId: input.toUserId,
          challengeId: input.challengeId,
          message: input.message,
          emoji: input.emoji,
        });
        return { success: !!result, id: result };
      }),

    // 参加者へのエール一覧
    forParticipation: publicProcedure
      .input(z.object({ participationId: z.number() }))
      .query(async ({ input }) => {
        return db.getCheersForParticipation(input.participationId);
      }),

    // チャレンジのエール一覧
    forChallenge: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return db.getCheersForChallenge(input.challengeId);
      }),

    // エール数を取得
    count: publicProcedure
      .input(z.object({ participationId: z.number() }))
      .query(async ({ input }) => {
        return db.getCheerCountForParticipation(input.participationId);
      }),

    // 自分が受けたエール
    received: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getCheersReceivedByUser(ctx.user.id);
      }),

    // 自分が送ったエール
    sent: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getCheersSentByUser(ctx.user.id);
      }),
  }),

  // 達成記念ページAPI
  achievements: router({
    // 達成記念ページを作成
    create: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        title: z.string(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const challenge = await db.getEventById(input.challengeId);
        if (!challenge) throw new Error("Challenge not found");
        if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Permission denied");
        }
        
        const participations = await db.getParticipationsByEventId(input.challengeId);
        
        const result = await db.createAchievementPage({
          challengeId: input.challengeId,
          achievedAt: new Date(),
          finalValue: challenge.currentValue || 0,
          goalValue: challenge.goalValue || 100,
          totalParticipants: participations.length,
          title: input.title,
          message: input.message,
          isPublic: true,
        });
        return { success: !!result, id: result };
      }),

    // 達成記念ページを取得
    get: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return db.getAchievementPage(input.challengeId);
      }),

    // 達成記念ページを更新
    update: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        title: z.string().optional(),
        message: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const challenge = await db.getEventById(input.challengeId);
        if (!challenge) throw new Error("Challenge not found");
        if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Permission denied");
        }
        await db.updateAchievementPage(input.challengeId, {
          title: input.title,
          message: input.message,
          isPublic: input.isPublic,
        });
        return { success: true };
      }),

    // 公開中の達成記念ページ一覧
    public: publicProcedure
      .query(async () => {
        return db.getPublicAchievementPages();
      }),
  }),

  // リマインダー関連
  reminders: router({
    // リマインダーを作成
    create: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        reminderType: z.enum(["day_before", "day_of", "hour_before", "custom"]),
        customTime: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createReminder({
          challengeId: input.challengeId,
          userId: ctx.user.id,
          reminderType: input.reminderType,
          customTime: input.customTime ? new Date(input.customTime) : undefined,
        });
        return { success: !!result, id: result };
      }),

    // ユーザーのリマインダー一覧
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getRemindersForUser(ctx.user.id);
      }),

    // チャレンジのリマインダー設定を取得
    getForChallenge: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getUserReminderForChallenge(ctx.user.id, input.challengeId);
      }),

    // リマインダーを更新
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        reminderType: z.enum(["day_before", "day_of", "hour_before", "custom"]).optional(),
        customTime: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateReminder(input.id, {
          reminderType: input.reminderType,
          customTime: input.customTime ? new Date(input.customTime) : undefined,
        });
        return { success: true };
      }),

    // リマインダーを削除
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReminder(input.id);
        return { success: true };
      }),
  }),

  // DM関連
  dm: router({
    // DMを送信
    send: protectedProcedure
      .input(z.object({
        toUserId: z.number(),
        challengeId: z.number(),
        message: z.string().min(1).max(1000),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.sendDirectMessage({
          fromUserId: ctx.user.id,
          fromUserName: ctx.user.name || "匿名",
          fromUserImage: null,
          toUserId: input.toUserId,
          challengeId: input.challengeId,
          message: input.message,
        });
        return { success: !!result, id: result };
      }),

    // 会話一覧を取得
    conversations: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getConversationList(ctx.user.id);
      }),

    // 特定の会話を取得
    getConversation: protectedProcedure
      .input(z.object({
        partnerId: z.number(),
        challengeId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getConversation(ctx.user.id, input.partnerId, input.challengeId);
      }),

    // 未読メッセージ数を取得
    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUnreadMessageCount(ctx.user.id);
      }),

    // メッセージを既読にする
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markMessageAsRead(input.id);
        return { success: true };
      }),

    // 特定の相手からのメッセージを全て既読にする
    markAllAsRead: protectedProcedure
      .input(z.object({ fromUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markAllMessagesAsRead(ctx.user.id, input.fromUserId);
        return { success: true };
      }),
  }),

  // テンプレート関連
  templates: router({
    // テンプレートを作成
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        goalType: z.enum(["attendance", "followers", "viewers", "points", "custom"]),
        goalValue: z.number().min(1),
        goalUnit: z.string().default("人"),
        eventType: z.enum(["solo", "group"]),
        ticketPresale: z.number().optional(),
        ticketDoor: z.number().optional(),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createChallengeTemplate({
          userId: ctx.user.id,
          ...input,
        });
        return { success: !!result, id: result };
      }),

    // ユーザーのテンプレート一覧
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getChallengeTemplatesForUser(ctx.user.id);
      }),

    // 公開テンプレート一覧
    public: publicProcedure
      .query(async () => {
        return db.getPublicChallengeTemplates();
      }),

    // テンプレート詳細を取得
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getChallengeTemplateById(input.id);
      }),

    // テンプレートを更新
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        goalType: z.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
        goalValue: z.number().min(1).optional(),
        goalUnit: z.string().optional(),
        eventType: z.enum(["solo", "group"]).optional(),
        ticketPresale: z.number().optional(),
        ticketDoor: z.number().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const template = await db.getChallengeTemplateById(input.id);
        if (!template) throw new Error("Template not found");
        if (template.userId !== ctx.user.id) throw new Error("Permission denied");
        await db.updateChallengeTemplate(input.id, input);
        return { success: true };
      }),

    // テンプレートを削除
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const template = await db.getChallengeTemplateById(input.id);
        if (!template) throw new Error("Template not found");
        if (template.userId !== ctx.user.id) throw new Error("Permission denied");
        await db.deleteChallengeTemplate(input.id);
        return { success: true };
      }),

    // テンプレートの使用回数をインクリメント
    incrementUseCount: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementTemplateUseCount(input.id);
        return { success: true };
      }),
  }),

  // 検索関連
  search: router({
    // チャレンジを検索
    challenges: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        return db.searchChallenges(input.query);
      }),

    // 検索履歴を保存
    saveHistory: protectedProcedure
      .input(z.object({ query: z.string(), resultCount: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.saveSearchHistory({
          userId: ctx.user.id,
          query: input.query,
          resultCount: input.resultCount,
        });
        return { success: !!result, id: result };
      }),

    // 検索履歴を取得
    history: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getSearchHistoryForUser(ctx.user.id, input.limit || 10);
      }),

    // 検索履歴をクリア
    clearHistory: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.clearSearchHistoryForUser(ctx.user.id);
        return { success: true };
      }),
  }),

  // フォロー関連
  follows: router({
    // フォローする
    follow: protectedProcedure
      .input(z.object({
        followeeId: z.number(),
        followeeName: z.string().optional(),
        followeeImage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.followUser({
          followerId: ctx.user.id,
          followerName: ctx.user.name || "匿名",
          followeeId: input.followeeId,
          followeeName: input.followeeName,
          followeeImage: input.followeeImage,
        });
        return { success: !!result, id: result };
      }),

    // フォロー解除
    unfollow: protectedProcedure
      .input(z.object({ followeeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unfollowUser(ctx.user.id, input.followeeId);
        return { success: true };
      }),

    // フォロー中のユーザー一覧
    following: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getFollowingForUser(ctx.user.id);
      }),

    // フォロワー一覧
    followers: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getFollowersForUser(ctx.user.id);
      }),

    // フォローしているかチェック
    isFollowing: protectedProcedure
      .input(z.object({ followeeId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.isFollowing(ctx.user.id, input.followeeId);
      }),

    // フォロワー数を取得
    followerCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getFollowerCount(input.userId);
      }),

    // フォロー中の数を取得
    followingCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getFollowingCount(input.userId);
      }),

    // 新着チャレンジ通知設定を更新
    updateNotification: protectedProcedure
      .input(z.object({ followeeId: z.number(), notify: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateFollowNotification(ctx.user.id, input.followeeId, input.notify);
        return { success: true };
      }),
  }),

  // ランキング関連
  rankings: router({
    // 貢献度ランキング
    contribution: publicProcedure
      .input(z.object({
        period: z.enum(["weekly", "monthly", "all"]).optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getGlobalContributionRanking(input.period || "all", input.limit || 50);
      }),

    // チャレンジ達成率ランキング
    challengeAchievement: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getChallengeAchievementRanking(input.limit || 50);
      }),

    // ホストランキング
    hosts: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getHostRanking(input.limit || 50);
      }),

    // 自分のランキング位置を取得
    myPosition: protectedProcedure
      .input(z.object({ period: z.enum(["weekly", "monthly", "all"]).optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserRankingPosition(ctx.user.id, input.period || "all");
      }),
  }),

  // カテゴリ関連
  categories: router({
    // カテゴリ一覧を取得
    list: publicProcedure
      .query(async () => {
        return db.getAllCategories();
      }),

    // カテゴリ詳細を取得
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCategoryById(input.id);
      }),

    // カテゴリ別チャレンジ一覧
    challenges: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getChallengesByCategory(input.categoryId);
      }),
  }),

  // 招待関連
  invitations: router({
    // 招待リンクを作成
    create: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        maxUses: z.number().optional(),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // ランダムな招待コードを生成
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const result = await db.createInvitation({
          challengeId: input.challengeId,
          inviterId: ctx.user.id,
          code,
          maxUses: input.maxUses,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        });
        return { success: !!result, id: result, code };
      }),

    // 招待コードで情報を取得
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return db.getInvitationByCode(input.code);
      }),

    // チャレンジの招待一覧
    forChallenge: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return db.getInvitationsForChallenge(input.challengeId);
      }),

    // 自分が作成した招待一覧
    mine: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getInvitationsForUser(ctx.user.id);
      }),

    // 招待を使用
    use: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const invitation = await db.getInvitationByCode(input.code);
        if (!invitation) throw new Error("Invitation not found");
        if (!invitation.isActive) throw new Error("Invitation is no longer active");
        if (invitation.maxUses && invitation.useCount >= invitation.maxUses) {
          throw new Error("Invitation has reached maximum uses");
        }
        if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
          throw new Error("Invitation has expired");
        }
        
        await db.incrementInvitationUseCount(input.code);
        await db.recordInvitationUse({
          invitationId: invitation.id,
          userId: ctx.user.id,
        });
        
        return { success: true, challengeId: invitation.challengeId };
      }),

    // 招待を無効化
    deactivate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deactivateInvitation(input.id);
        return { success: true };
      }),

    // 招待の統計を取得
    stats: protectedProcedure
      .input(z.object({ invitationId: z.number() }))
      .query(async ({ input }) => {
        return db.getInvitationStats(input.invitationId);
      }),
  }),

  // 公開プロフィール関連
  profiles: router({
    // ユーザーの公開プロフィールを取得
    get: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getUserPublicProfile(input.userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
