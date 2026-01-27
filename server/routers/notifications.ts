/**
 * server/routers/notifications.ts
 * 
 * 通知関連のルーター
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const notificationsRouter = router({
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
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      cursor: z.number().optional(), // 最後に取得したnotificationId
    }))
    .query(async ({ ctx, input }) => {
      const notifications = await db.getNotificationsByUserId(
        ctx.user.id,
        input.limit,
        input.cursor
      );
      
      return {
        items: notifications,
        nextCursor: notifications.length === input.limit 
          ? notifications[notifications.length - 1].id 
          : undefined,
      };
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

  // テスト通知を送信
  sendTestNotification: protectedProcedure
    .input(z.object({
      challengeId: z.number(),
      type: z.enum(["goal", "milestone", "participant"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // イベント情報を取得
      const event = await db.getEventById(input.challengeId);
      if (!event) {
        throw new Error("Event not found");
      }

      // 通知を受け取るユーザーを取得
      let notificationType: "goal" | "milestone" | "participant";
      if (input.type === "goal") {
        notificationType = "goal";
      } else if (input.type === "milestone") {
        notificationType = "milestone";
      } else {
        notificationType = "participant";
      }

      const users = await db.getUsersWithNotificationEnabled(
        input.challengeId,
        notificationType
      );

      // 通知の内容を生成
      let title: string;
      let body: string;
      if (input.type === "goal") {
        title = "🏆 目標達成！";
        body = `${event.title}が目標を達成しました！`;
      } else if (input.type === "milestone") {
        title = "🚩 マイルストーン達成！";
        body = `${event.title}が50%を達成しました！`;
      } else {
        title = "🎉 新しい参加者！";
        body = `テストユーザーさんが参加表明しました！`;
      }

      // 各ユーザーに通知を作成
      for (const user of users) {
        await db.createNotification({
          userId: user.userId,
          challengeId: input.challengeId,
          type: input.type === "goal" ? "goal_reached" : input.type === "milestone" ? "milestone_50" : "new_participant",
          title,
          body,
        });
      }

      return {
        success: true,
        sentCount: users.length,
      };
    }),
});
