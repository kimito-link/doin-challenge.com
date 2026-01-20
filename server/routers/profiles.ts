/**
 * server/routers/profiles.ts
 * 
 * 公開プロフィール関連のルーター
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const profilesRouter = router({
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
});
