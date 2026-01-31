/**
 * server/routers/admin.ts
 * 
 * 管理者用ユーザー管理API
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { adminParticipationsRouter } from "./admin-participations";

export const adminRouter = router({
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

  // DB構造確認API
  getDbSchema: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }
      return db.getDbSchema();
    }),

  // テーブル構造とコードの比較
  compareSchemas: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }
      return db.compareSchemas();
    }),

  // 参加管理（削除済み投稿の管理）
  participations: adminParticipationsRouter,
});
