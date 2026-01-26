/**
 * server/routers/profiles.ts
 * 
 * 公開プロフィール関連のルーター
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const profilesRouter = router({
  // ユーザーの公開プロフィールを取得
  get: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return db.getUserPublicProfile(input.userId);
    }),
  
  // twitterIdでユーザーを取得（外部共有URL用）
  getByTwitterId: publicProcedure
    .input(z.object({ twitterId: z.string() }))
    .query(async ({ input }) => {
      return db.getUserByTwitterId(input.twitterId);
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
  
  // ユーザーの性別を更新
  updateGender: protectedProcedure
    .input(z.object({ 
      gender: z.enum(["male", "female", "other"]).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.updateUserGender(ctx.user.id, input.gender);
    }),
  
  // ユーザーのジャンルを更新
  updateGenre: protectedProcedure
    .input(z.object({ 
      genre: z.enum(["idol", "artist", "vtuber", "streamer", "band", "dancer", "voice_actor", "other"]).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.updateUserGenre(ctx.user.id, input.genre);
    }),
});
