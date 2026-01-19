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

    // ページネーション対応のイベント一覧取得
    listPaginated: publicProcedure
      .input(z.object({
        cursor: z.number().optional(), // 次のページの開始位置
        limit: z.number().min(1).max(50).default(20),
        filter: z.enum(["all", "solo", "group"]).optional(),
      }))
      .query(async ({ input }) => {
        const { cursor = 0, limit, filter } = input;
        const allEvents = await db.getAllEvents();
        
        // フィルター適用
        let filteredEvents = allEvents;
        if (filter && filter !== "all") {
          filteredEvents = allEvents.filter((e: any) => e.eventType === filter);
        }
        
        // ページネーション
        const items = filteredEvents.slice(cursor, cursor + limit);
        const nextCursor = cursor + limit < filteredEvents.length ? cursor + limit : undefined;
        
        return {
          items,
          nextCursor,
          totalCount: filteredEvents.length,
        };
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
      // openIdはTwitter IDを保存しているので、hostTwitterIdでフィルタリング
      return db.getEventsByHostTwitterId(ctx.user.openId);
    }),

    // イベント作成（publicProcedureでフロントエンドのユーザー情報を使用）
    create: publicProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        eventDate: z.string(),
        venue: z.string().optional(),
        hostTwitterId: z.string(), // 必須に変更
        hostName: z.string(),
        hostUsername: z.string().optional(),
        hostProfileImage: z.string().optional(),
        hostFollowersCount: z.number().optional(),
        hostDescription: z.string().optional(),
        // 追加フィールド
        goalType: z.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
        goalValue: z.number().optional(),
        goalUnit: z.string().optional(),
        eventType: z.enum(["solo", "group"]).optional(),
        categoryId: z.number().optional(),
        externalUrl: z.string().optional(),
        ticketPresale: z.number().optional(),
        ticketDoor: z.number().optional(),
        ticketUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // フロントエンドから送信されたTwitter IDを使用（セッション認証に依存しない）
        if (!input.hostTwitterId) {
          throw new Error("ログインが必要です。Twitterでログインしてください。");
        }
        
        try {
          const eventId = await db.createEvent({
            hostUserId: null, // セッションに依存しない
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
            goalType: input.goalType || "attendance",
            goalValue: input.goalValue || 100,
            goalUnit: input.goalUnit || "人",
            eventType: input.eventType || "solo",
            categoryId: input.categoryId,
            externalUrl: input.externalUrl,
            ticketPresale: input.ticketPresale,
            ticketDoor: input.ticketDoor,
            ticketUrl: input.ticketUrl,
          });
          return { id: eventId };
        } catch (error) {
          console.error("[Challenge Create] Error:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // データベース接続エラー
          if (errorMessage.includes("Database not available") || errorMessage.includes("ECONNREFUSED")) {
            throw new Error("サーバーに接続できません。しばらく待ってから再度お試しください。");
          }
          
          // SQLエラー（カラム不足など）
          if (errorMessage.includes("SQL") || errorMessage.includes("Failed query") || errorMessage.includes("ER_")) {
            throw new Error("チャレンジの作成に失敗しました。入力内容を確認して再度お試しください。");
          }
          
          // 重複エラー
          if (errorMessage.includes("Duplicate entry") || errorMessage.includes("unique constraint")) {
            throw new Error("同じタイトルのチャレンジがすでに存在します。別のタイトルをお試しください。");
          }
          
          // その他のエラー
          throw new Error("チャレンジの作成中にエラーが発生しました。しばらく待ってから再度お試しください。");
        }
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
        goalValue: z.number().optional(),
        goalUnit: z.string().optional(),
        goalType: z.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
        eventType: z.enum(["solo", "group"]).optional(),
        categoryId: z.number().optional(),
        externalUrl: z.string().optional(),
        ticketPresale: z.number().optional(),
        ticketDoor: z.number().optional(),
        ticketUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const event = await db.getEventById(input.id);
        // hostTwitterIdで権限チェック（openIdはTwitter ID）
        if (!event || event.hostTwitterId !== ctx.user.openId) {
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
        // hostTwitterIdで権限チェック（openIdはTwitter ID）
        if (!event || event.hostTwitterId !== ctx.user.openId) {
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

    // 参加登録（ログインユーザー - publicProcedureでクライアントからユーザー情報を受け取る）
    create: publicProcedure
      .input(z.object({
        challengeId: z.number(),
        message: z.string().optional(),
        companionCount: z.number().default(0),
        prefecture: z.string().optional(),
        gender: z.enum(["male", "female", "unspecified"]).optional(), // v5.86: 性別を追加
        twitterId: z.string().optional(),
        displayName: z.string(),
        username: z.string().optional(),
        profileImage: z.string().optional(),
        followersCount: z.number().optional(),
        // 一緒に参加する友人（名前付き）
        companions: z.array(z.object({
          displayName: z.string(),
          twitterUsername: z.string().optional(),
          twitterId: z.string().optional(),
          profileImage: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // クライアントから送信されたユーザー情報を使用（セッション認証に依存しない）
        // twitterIdが必須（ログインユーザーのみ）
        if (!input.twitterId) {
          throw new Error("ログインが必要です。Twitterでログインしてください。");
        }
        
        try {
          const participationId = await db.createParticipation({
            challengeId: input.challengeId,
            userId: ctx.user?.id, // セッションがあれば使用、なくてもOK
            twitterId: input.twitterId,
            displayName: input.displayName,
            username: input.username,
            profileImage: input.profileImage,
            followersCount: input.followersCount,
            message: input.message,
            companionCount: input.companionCount,
            prefecture: input.prefecture,
            gender: input.gender || "unspecified", // v5.86: 性別を保存
            isAnonymous: false,
          });
          
          // 友人を登録
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
        // 一緒に参加する友人（名前付き）
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
        
        // 友人を登録
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

    // 参加表明の更新（都道府県・コメント・一緒に参加する人の変更）
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        twitterId: z.string().optional(),
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
      .mutation(async ({ input }) => {
        // 参加表明を取得
        const participation = await db.getParticipationById(input.id);
        if (!participation) {
          throw new Error("参加表明が見つかりません。");
        }
        
        // 参加表明を更新
        await db.updateParticipation(input.id, {
          message: input.message,
          prefecture: input.prefecture,
          companionCount: input.companionCount,
          gender: input.gender,
        });
        
        // 友人を更新（既存を削除して再作成）
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

    // 参加をキャンセル（チケット譲渡オプション付き）
    cancel: protectedProcedure
      .input(z.object({
        participationId: z.number(),
        createTransfer: z.boolean().default(false), // チケット譲渡投稿を同時に作成するか
        transferComment: z.string().max(500).optional(),
        userUsername: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.cancelParticipation(input.participationId, ctx.user.id);
        
        if (!result.success) {
          return result;
        }
        
        // チケット譲渡投稿を作成
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
          
          // 待機者に通知
          const waitlistUsers = await db.getWaitlistUsersForNotification(result.challengeId);
          // TODO: プッシュ通知を送信
        }
        
        return { success: true, challengeId: result.challengeId };
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

    // ページネーション対応の検索
    challengesPaginated: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input }) => {
        const { query, cursor = 0, limit } = input;
        const allResults = await db.searchChallenges(query);
        
        // ページネーション
        const items = allResults.slice(cursor, cursor + limit);
        const nextCursor = cursor + limit < allResults.length ? cursor + limit : undefined;
        
        return {
          items,
          nextCursor,
          totalCount: allResults.length,
        };
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

    // フォロワー一覧（特定ユーザーまたは自分）
    followers: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const targetUserId = input?.userId || ctx.user?.id;
        if (!targetUserId) return [];
        return db.getFollowersForUser(targetUserId);
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

    // 特定ユーザーのフォロワーID一覧を取得（ランキング優先表示用）
    followerIds: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getFollowerIdsForUser(input.userId);
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

    // カテゴリ作成（管理者のみ）
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        description: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // 管理者チェック
        if (ctx.user.role !== "admin") {
          throw new Error("管理者権限が必要です");
        }
        return db.createCategory(input);
      }),

    // カテゴリ更新（管理者のみ）
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("管理者権限が必要です");
        }
        const { id, ...data } = input;
        return db.updateCategory(id, data);
      }),

    // カテゴリ削除（管理者のみ）
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("管理者権限が必要です");
        }
        return db.deleteCategory(input.id);
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
    
    // 推し活状況を取得
    getOshikatsuStats: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
        twitterId: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getOshikatsuStats(input.userId, input.twitterId);
      }),
    
    // おすすめホスト（同じカテゴリのチャレンジを開催しているホスト）
    recommendedHosts: publicProcedure
      .input(z.object({ 
        categoryId: z.number().optional(),
        limit: z.number().min(1).max(10).default(5),
      }))
      .query(async ({ ctx, input }) => {
        const userId = ctx.user?.id;
        return db.getRecommendedHosts(userId, input.categoryId, input.limit);
      }),
  }),

  // 友人（コンパニオン）関連
  companions: router({
    // 参加者の友人一覧を取得
    forParticipation: publicProcedure
      .input(z.object({ participationId: z.number() }))
      .query(async ({ input }) => {
        return db.getCompanionsForParticipation(input.participationId);
      }),

    // チャレンジの友人一覧を取得
    forChallenge: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return db.getCompanionsForChallenge(input.challengeId);
      }),

    // 自分が招待した友人の統計
    myInviteStats: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getCompanionInviteStats(ctx.user.id);
      }),

    // 友人を削除
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // 自分が招待した友人のみ削除可能
        const stats = await db.getCompanionInviteStats(ctx.user.id);
        const companion = stats.companions.find(c => c.id === input.id);
        if (!companion) {
          throw new Error("Unauthorized");
        }
        await db.deleteCompanion(input.id);
        return { success: true };
      }),
  }),

  // AI向け最適化API（1ホップ取得・非正規化サマリー）
  ai: router({
    // AI向けチャレンジ詳細取得（JOINなし・1ホップ）
    getChallenge: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getChallengeForAI(input.id);
      }),

    // AI向け検索（意図タグベース）
    searchByTags: publicProcedure
      .input(z.object({
        tags: z.array(z.string()),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.searchChallengesForAI(input.tags, input.limit || 20);
      }),

    // チャレンジサマリーを手動更新
    refreshSummary: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ input }) => {
        await db.refreshChallengeSummary(input.challengeId);
        return { success: true };
      }),

    // 全チャレンジのサマリーを一括更新（管理者向け）
    refreshAllSummaries: protectedProcedure
      .mutation(async () => {
        const result = await db.refreshAllChallengeSummaries();
        return result;
      }),
  }),

  // 開発者向けサンプルデータ生成API
  dev: router({
    // サンプルチャレンジを生成
    generateSampleChallenges: publicProcedure
      .input(z.object({ count: z.number().min(1).max(20).default(6) }))
      .mutation(async ({ input }) => {
        const sampleChallenges = [
          {
            hostName: "りんく",
            hostUsername: "kimitolink",
            hostProfileImage: "https://ui-avatars.com/api/?name=%E3%82%8A%E3%82%93%E3%81%8F&background=EC4899&color=fff&size=128",
            hostFollowersCount: 5000,
            title: "生誕祭ライブ 動員100人達成チャレンジ",
            description: "きみとリンクの生誕祭ライブを成功させよう！みんなで100人動員を目指します。",
            goalType: "attendance" as const,
            goalValue: 100,
            goalUnit: "人",
            currentValue: 45,
            eventType: "solo" as const,
            eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            venue: "渋谷WWW",
            prefecture: "東京都",
          },
          {
            hostName: "アイドルファンチ",
            hostUsername: "idolfunch",
            hostProfileImage: "https://ui-avatars.com/api/?name=%E3%82%A2%E3%82%A4%E3%83%89%E3%83%AB&background=8B5CF6&color=fff&size=128",
            hostFollowersCount: 12000,
            title: "グループライブ フォロワー1万人チャレンジ",
            description: "アイドルファンチのフォロワーを1万人にしよう！",
            goalType: "followers" as const,
            goalValue: 10000,
            goalUnit: "人",
            currentValue: 8500,
            eventType: "group" as const,
            eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            venue: "新宿BLAZE",
            prefecture: "東京都",
          },
          {
            hostName: "こん太",
            hostUsername: "konta_idol",
            hostProfileImage: "https://ui-avatars.com/api/?name=%E3%81%93%E3%82%93%E5%A4%AA&background=DD6500&color=fff&size=128",
            hostFollowersCount: 3000,
            title: "ソロライブ 50人動員チャレンジ",
            description: "初めてのソロライブ！50人集まったら成功！",
            goalType: "attendance" as const,
            goalValue: 50,
            goalUnit: "人",
            currentValue: 32,
            eventType: "solo" as const,
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            venue: "下北沢SHELTER",
            prefecture: "東京都",
          },
          {
            hostName: "たぬ姉",
            hostUsername: "tanunee_idol",
            hostProfileImage: "https://ui-avatars.com/api/?name=%E3%81%9F%E3%81%AC%E5%A7%89&background=22C55E&color=fff&size=128",
            hostFollowersCount: 2500,
            title: "配信ライブ 同時視聴500人チャレンジ",
            description: "YouTube配信で同時視聴500人を目指します！",
            goalType: "viewers" as const,
            goalValue: 500,
            goalUnit: "人",
            currentValue: 280,
            eventType: "solo" as const,
            eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            venue: "オンライン",
            prefecture: null,
          },
          {
            hostName: "リンク",
            hostUsername: "link_official",
            hostProfileImage: "https://ui-avatars.com/api/?name=%E3%83%AA%E3%83%B3%E3%82%AF&background=3B82F6&color=fff&size=128",
            hostFollowersCount: 8000,
            title: "ワンマンライブ 200人動員チャレンジ",
            description: "ワンマンライブで200人動員を目指します！",
            goalType: "attendance" as const,
            goalValue: 200,
            goalUnit: "人",
            currentValue: 156,
            eventType: "solo" as const,
            eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            venue: "大阪城ホール",
            prefecture: "大阪府",
          },
          {
            hostName: "アイドルユニットA",
            hostUsername: "idol_unit_a",
            hostProfileImage: "https://ui-avatars.com/api/?name=Unit+A&background=F59E0B&color=fff&size=128",
            hostFollowersCount: 15000,
            title: "グループライブ 300人動員チャレンジ",
            description: "5人組アイドルユニットのライブ！300人動員を目指します。",
            goalType: "attendance" as const,
            goalValue: 300,
            goalUnit: "人",
            currentValue: 210,
            eventType: "group" as const,
            eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            venue: "横浜アリーナ",
            prefecture: "神奈川県",
          },
        ];

        const createdIds: number[] = [];
        const count = Math.min(input.count, sampleChallenges.length);
        
        for (let i = 0; i < count; i++) {
          const sample = sampleChallenges[i];
          const id = await db.createEvent({
            ...sample,
            isPublic: true,
          });
          createdIds.push(id);
        }

        return { success: true, createdIds, count: createdIds.length };
      }),

    // サンプルデータを削除
    clearSampleChallenges: publicProcedure
      .mutation(async () => {
        // hostUsernameがサンプルデータのものを削除
        const sampleUsernames = ["kimitolink", "idolfunch", "konta_idol", "tanunee_idol", "link_official", "idol_unit_a"];
        const allEvents = await db.getAllEvents();
        let deletedCount = 0;
        
        for (const event of allEvents) {
          if (event.hostUsername && sampleUsernames.includes(event.hostUsername)) {
            await db.deleteEvent(event.id);
            deletedCount++;
          }
        }

        return { success: true, deletedCount };
      }),
  }),

  // チケット譲渡関連
  ticketTransfer: router({
    // 譲渡投稿を作成
    create: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        ticketCount: z.number().min(1).max(10).default(1),
        priceType: z.enum(["face_value", "negotiable", "free"]).default("face_value"),
        comment: z.string().max(500).optional(),
        userUsername: z.string().optional(), // XのDM用ユーザー名
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createTicketTransfer({
          challengeId: input.challengeId,
          userId: ctx.user.id,
          userName: ctx.user.name || "匿名",
          userUsername: input.userUsername,
          userImage: null,
          ticketCount: input.ticketCount,
          priceType: input.priceType,
          comment: input.comment,
        });
        
        // 待機者に通知を送る
        const waitlistUsers = await db.getWaitlistUsersForNotification(input.challengeId);
        // TODO: プッシュ通知を送信
        
        return { success: !!result, id: result, notifiedCount: waitlistUsers.length };
      }),

    // チャレンジの譲渡投稿一覧を取得
    listByChallenge: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return db.getTicketTransfersForChallenge(input.challengeId);
      }),

    // 自分の譲渡投稿一覧を取得
    myTransfers: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getTicketTransfersForUser(ctx.user.id);
      }),

    // 譲渡投稿のステータスを更新
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["available", "reserved", "completed", "cancelled"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // TODO: 権限チェック
        await db.updateTicketTransferStatus(input.id, input.status);
        return { success: true };
      }),

    // 譲渡投稿をキャンセル
    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.cancelTicketTransfer(input.id, ctx.user.id);
        return { success: result };
      }),
  }),

  // チケット待機リスト関連
  ticketWaitlist: router({
    // 待機リストに登録
    add: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        desiredCount: z.number().min(1).max(10).default(1),
        userUsername: z.string().optional(), // XのDM用ユーザー名
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.addToTicketWaitlist({
          challengeId: input.challengeId,
          userId: ctx.user.id,
          userName: ctx.user.name || "匿名",
          userUsername: input.userUsername,
          userImage: null,
          desiredCount: input.desiredCount,
        });
        return { success: !!result, id: result };
      }),

    // 待機リストから削除
    remove: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.removeFromTicketWaitlist(input.challengeId, ctx.user.id);
        return { success: result };
      }),

    // チャレンジの待機リストを取得
    listByChallenge: publicProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ input }) => {
        return db.getTicketWaitlistForChallenge(input.challengeId);
      }),

    // 自分の待機リストを取得
    myWaitlist: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getTicketWaitlistForUser(ctx.user.id);
      }),

    // 待機リストに登録しているかチェック
    isInWaitlist: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.isUserInWaitlist(input.challengeId, ctx.user.id);
      }),
  }),

  // 管理者用ユーザー管理API
  admin: router({
    // ユーザー一覧取得
    users: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("管理者権限が必要です");
        }
        return db.getAllUsers();
      }),

    // ユーザー権限変更
    updateUserRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("管理者権限が必要です");
        }
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    // ユーザー詳細取得
    getUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("管理者権限が必要です");
        }
        return db.getUserById(input.userId);
      }),

    // データ整合性レポート取得
    getDataIntegrityReport: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("管理者権限が必要です");
        }
        return db.getDataIntegrityReport();
      }),

    // チャレンジのcurrentValueを再計算して修正
    recalculateCurrentValues: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("管理者権限が必要です");
        }
        const results = await db.recalculateChallengeCurrentValues();
        return { success: true, fixedCount: results.length, details: results };
      }),
  }),
});

export type AppRouter = typeof appRouter;
