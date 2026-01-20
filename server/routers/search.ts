/**
 * server/routers/search.ts
 * 
 * 検索関連のルーター
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const searchRouter = router({
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
});
