/**
 * 既存チャレンジのサムネイル画像を更新するマイグレーションスクリプト
 * 
 * 実行方法:
 * pnpm tsx scripts/migrate-challenge-thumbnails.ts
 */

import { getDb } from "../server/db/connection";
import { challenges, twitterUserCache } from "../drizzle/schema";
import { eq, isNull } from "drizzle-orm";

async function migrateThumbnails() {
  console.log("[Migration] Starting challenge thumbnail migration...");
  
  const db = await getDb();
  if (!db) {
    console.error("[Migration] Database not available");
    process.exit(1);
  }

  try {
    // hostProfileImageがNULLのチャレンジを取得
    const challengesWithoutThumbnail = await db
      .select()
      .from(challenges)
      .where(isNull(challenges.hostProfileImage));

    console.log(`[Migration] Found ${challengesWithoutThumbnail.length} challenges without thumbnail`);

    let updated = 0;
    let skipped = 0;

    for (const challenge of challengesWithoutThumbnail) {
      // hostTwitterIdからtwitterIdを抽出（"twitter:12345" -> "12345"）
      const twitterId = challenge.hostTwitterId?.replace("twitter:", "");
      
      if (!twitterId) {
        console.log(`[Migration] Skipping challenge ${challenge.id}: no twitterId`);
        skipped++;
        continue;
      }

      // twitterUserCacheからプロフィール画像を取得
      const cache = await db
        .select()
        .from(twitterUserCache)
        .where(eq(twitterUserCache.twitterId, twitterId))
        .limit(1);

      if (cache.length === 0) {
        console.log(`[Migration] Skipping challenge ${challenge.id}: no cache for twitterId ${twitterId}`);
        skipped++;
        continue;
      }

      const twitterData = cache[0];

      // チャレンジを更新
      await db
        .update(challenges)
        .set({
          hostProfileImage: twitterData.profileImage,
          hostFollowersCount: twitterData.followersCount,
          hostDescription: twitterData.description,
          hostUsername: twitterData.twitterUsername,
        })
        .where(eq(challenges.id, challenge.id));

      console.log(`[Migration] Updated challenge ${challenge.id} with thumbnail from @${twitterData.twitterUsername}`);
      updated++;
    }

    console.log(`[Migration] Migration completed: ${updated} updated, ${skipped} skipped`);
  } catch (error) {
    console.error("[Migration] Error:", error);
    process.exit(1);
  }
}

migrateThumbnails();
