import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
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
        eventId: z.number(),
        message: z.string().optional(),
        companionCount: z.number().default(0),
        twitterId: z.string().optional(),
        displayName: z.string(),
        username: z.string().optional(),
        profileImage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const participationId = await db.createParticipation({
          eventId: input.eventId,
          userId: ctx.user.id,
          twitterId: input.twitterId,
          displayName: input.displayName,
          username: input.username,
          profileImage: input.profileImage,
          message: input.message,
          companionCount: input.companionCount,
          isAnonymous: false,
        });
        return { id: participationId };
      }),

    // 匿名参加登録
    createAnonymous: publicProcedure
      .input(z.object({
        eventId: z.number(),
        displayName: z.string(),
        message: z.string().optional(),
        companionCount: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const participationId = await db.createParticipation({
          eventId: input.eventId,
          displayName: input.displayName,
          message: input.message,
          companionCount: input.companionCount,
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
});

export type AppRouter = typeof appRouter;
