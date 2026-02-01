/**
 * Release Notes Router
 * 
 * リリースノート（アップデート履歴）のtRPCエンドポイント
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb, desc } from "../db/connection";
import { releaseNotes } from "../../drizzle/schema";

export const releaseNotesRouter = router({
  // すべてのリリースノートを取得
  getAll: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select().from(releaseNotes).orderBy(desc(releaseNotes.date));
    }),
  
  // 最新のリリースノートを取得
  getLatest: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select().from(releaseNotes).orderBy(desc(releaseNotes.date)).limit(input.limit);
    }),
});
