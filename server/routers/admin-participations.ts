/**
 * server/routers/admin-participations.ts
 * 
 * 管理者用参加管理API（v6.44）
 * - 削除済み投稿一覧
 * - 復元
 * - 一括削除・一括復元
 * - 全て audit_logs + requestId 連動
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const adminParticipationsRouter = router({
  // 削除済み参加一覧取得
  listDeleted: protectedProcedure
    .input(z.object({
      challengeId: z.number().optional(),
      userId: z.number().optional(),
      limit: z.number().optional().default(100),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }
      return db.getDeletedParticipations({
        challengeId: input.challengeId,
        userId: input.userId,
        limit: input.limit,
      });
    }),

  // 参加を復元
  restore: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }

      // 復元前の状態を取得
      const before = await db.getParticipationById(input.id);
      if (!before) {
        throw new Error("参加が見つかりません");
      }

      // 復元実行
      const result = await db.restoreParticipation(input.id);

      const requestId = ctx.requestId || "unknown";

      // 監査ログ記録
      await db.logAction({
        action: "RESTORE",
        entityType: "participation",
        targetId: input.id,
        actorId: ctx.user.id,
        actorName: ctx.user.name || "Unknown",
        beforeData: {
          deletedAt: before.deletedAt?.toISOString() || null,
          deletedBy: before.deletedBy,
        },
        afterData: {
          deletedAt: null,
          deletedBy: null,
        },
        requestId,
      });

      return { ...result, requestId };
    }),

  // 一括ソフトデリート
  bulkDelete: protectedProcedure
    .input(z.object({
      challengeId: z.number().optional(),
      userId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }

      if (!input.challengeId && !input.userId) {
        throw new Error("challengeId または userId を指定してください");
      }

      // 一括削除実行
      const result = await db.bulkSoftDeleteParticipations(
        { challengeId: input.challengeId, userId: input.userId },
        ctx.user.id
      );

      const requestId = ctx.requestId || "unknown";

      // 監査ログ記録
      await db.logAction({
        action: "BULK_DELETE",
        entityType: "participation",
        targetId: input.challengeId || input.userId || 0,
        actorId: ctx.user.id,
        actorName: ctx.user.name || "Unknown",
        beforeData: null,
        afterData: {
          filter: input,
          deletedCount: result.deletedCount,
          affectedChallengeIds: result.affectedChallengeIds,
        },
        requestId,
      });

      return { success: true, ...result, requestId };
    }),

  // 一括復元
  bulkRestore: protectedProcedure
    .input(z.object({
      challengeId: z.number().optional(),
      userId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }

      if (!input.challengeId && !input.userId) {
        throw new Error("challengeId または userId を指定してください");
      }

      // 一括復元実行
      const result = await db.bulkRestoreParticipations({
        challengeId: input.challengeId,
        userId: input.userId,
      });

      const requestId = ctx.requestId || "unknown";

      // 監査ログ記録
      await db.logAction({
        action: "BULK_RESTORE",
        entityType: "participation",
        targetId: input.challengeId || input.userId || 0,
        actorId: ctx.user.id,
        actorName: ctx.user.name || "Unknown",
        beforeData: null,
        afterData: {
          filter: input,
          restoredCount: result.restoredCount,
          affectedChallengeIds: result.affectedChallengeIds,
        },
        requestId,
      });

      return { success: true, ...result, requestId };
    }),

  // 監査ログ取得（参加関連のみ）
  getAuditLogs: protectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      targetId: z.number().optional(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }
      return db.getAuditLogs({
        entityType: input.entityType || "participation",
        targetId: input.targetId,
        limit: input.limit,
      });
    }),
});
