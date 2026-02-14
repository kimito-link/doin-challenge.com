/**
 * Twitter OAuth時にプロフィール画像を保存する機能のユニットテスト
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../server/db/connection";
import { twitterUserCache } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Twitter Profile Image Save", () => {
  const testTwitterId = "test_user_" + Date.now();
  const testUsername = "testuser";
  const testProfileImage = "https://pbs.twimg.com/profile_images/test_400x400.jpg";
  const testFollowersCount = 1000;
  const testDescription = "Test user bio";

  beforeAll(async () => {
    // テスト用データをクリーンアップ
    const db = await getDb();
    if (db) {
      await db.delete(twitterUserCache).where(eq(twitterUserCache.twitterId, testTwitterId));
    }
  });

  afterAll(async () => {
    // テスト用データをクリーンアップ
    const db = await getDb();
    if (db) {
      await db.delete(twitterUserCache).where(eq(twitterUserCache.twitterId, testTwitterId));
    }
  });

  it("should save Twitter profile to twitterUserCache", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();

    if (!db) return;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Twitter情報を保存
    await db.insert(twitterUserCache).values({
      twitterUsername: testUsername,
      twitterId: testTwitterId,
      displayName: "Test User",
      profileImage: testProfileImage,
      followersCount: testFollowersCount,
      description: testDescription,
      expiresAt,
    });

    // 保存されたデータを取得
    const result = await db
      .select()
      .from(twitterUserCache)
      .where(eq(twitterUserCache.twitterId, testTwitterId))
      .limit(1);

    expect(result.length).toBe(1);
    expect(result[0].twitterUsername).toBe(testUsername);
    expect(result[0].profileImage).toBe(testProfileImage);
    expect(result[0].followersCount).toBe(testFollowersCount);
    expect(result[0].description).toBe(testDescription);
  });

  it("should update existing Twitter profile in twitterUserCache", async () => {
    const db = await getDb();
    if (!db) return;

    const updatedFollowersCount = 2000;
    const updatedDescription = "Updated bio";
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 既存データを更新
    await db.insert(twitterUserCache).values({
      twitterUsername: testUsername,
      twitterId: testTwitterId,
      displayName: "Test User",
      profileImage: testProfileImage,
      followersCount: updatedFollowersCount,
      description: updatedDescription,
      expiresAt,
    }).onDuplicateKeyUpdate({
      set: {
        followersCount: updatedFollowersCount,
        description: updatedDescription,
        cachedAt: new Date(),
        expiresAt,
      },
    });

    // 更新されたデータを取得
    const result = await db
      .select()
      .from(twitterUserCache)
      .where(eq(twitterUserCache.twitterId, testTwitterId))
      .limit(1);

    expect(result.length).toBe(1);
    expect(result[0].followersCount).toBe(updatedFollowersCount);
    expect(result[0].description).toBe(updatedDescription);
  });

  it("should retrieve Twitter profile from cache by twitterId", async () => {
    const db = await getDb();
    if (!db) return;

    const result = await db
      .select()
      .from(twitterUserCache)
      .where(eq(twitterUserCache.twitterId, testTwitterId))
      .limit(1);

    expect(result.length).toBe(1);
    expect(result[0].twitterId).toBe(testTwitterId);
    expect(result[0].profileImage).toBeTruthy();
  });

  it("should retrieve Twitter profile from cache by username", async () => {
    const db = await getDb();
    if (!db) return;

    const result = await db
      .select()
      .from(twitterUserCache)
      .where(eq(twitterUserCache.twitterUsername, testUsername))
      .limit(1);

    expect(result.length).toBe(1);
    expect(result[0].twitterUsername).toBe(testUsername);
    expect(result[0].profileImage).toBeTruthy();
  });

  it("should return empty array for non-existent twitterId", async () => {
    const db = await getDb();
    if (!db) return;

    const result = await db
      .select()
      .from(twitterUserCache)
      .where(eq(twitterUserCache.twitterId, "non_existent_id"))
      .limit(1);

    expect(result.length).toBe(0);
  });
});
