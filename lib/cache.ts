/**
 * 3層キャッシュシステム
 * 
 * ドキュメントの知見を活かした実装:
 * - クライアント側キャッシュ（localStorage）: 7日間
 * - サーバー側メモリキャッシュ（Map）: 24時間
 * - データベースキャッシュ: 永続的
 * 
 * キャッシュファースト戦略:
 * - API呼び出しは最終手段
 * - キャッシュから返すことでレート制限を回避
 * - 即座に表示（50ms以下）
 */

import { Platform } from "react-native";

// キャッシュの有効期限（ミリ秒）
const CACHE_DURATION = {
  USER_INFO: 7 * 24 * 60 * 60 * 1000, // 7日間
  PROFILE: 24 * 60 * 60 * 1000, // 24時間
  FOLLOW_STATUS: 5 * 60 * 1000, // 5分間
  EVENT_DATA: 10 * 60 * 1000, // 10分間
};

// キャッシュキー
const CACHE_KEYS = {
  USER_INFO: "user_info_cache",
  USER_INFO_TIMESTAMP: "user_info_cache_timestamp",
  PROFILE_CACHE: "profile_cache",
  FOLLOW_STATUS_CACHE: "follow_status_cache",
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * ローカルストレージにキャッシュを保存
 */
export function setCache<T>(key: string, data: T, durationMs: number): void {
  if (Platform.OS !== "web") {
    // Native環境ではAsyncStorageを使用（別途実装）
    return;
  }

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + durationMs,
    };
    window.localStorage.setItem(key, JSON.stringify(entry));
    console.log(`[Cache] Set ${key}, expires in ${durationMs / 1000}s`);
  } catch (error) {
    console.error(`[Cache] Failed to set ${key}:`, error);
  }
}

/**
 * ローカルストレージからキャッシュを取得
 * 期限切れの場合はnullを返す
 */
export function getCache<T>(key: string): T | null {
  if (Platform.OS !== "web") {
    // Native環境ではAsyncStorageを使用（別途実装）
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      console.log(`[Cache] Miss: ${key} (not found)`);
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(raw);
    
    // 期限切れチェック
    if (Date.now() > entry.expiresAt) {
      console.log(`[Cache] Miss: ${key} (expired)`);
      window.localStorage.removeItem(key);
      return null;
    }

    const age = Math.round((Date.now() - entry.timestamp) / 1000);
    console.log(`[Cache] Hit: ${key} (age: ${age}s)`);
    return entry.data;
  } catch (error) {
    console.error(`[Cache] Failed to get ${key}:`, error);
    return null;
  }
}

/**
 * キャッシュを削除
 */
export function removeCache(key: string): void {
  if (Platform.OS !== "web") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
    console.log(`[Cache] Removed: ${key}`);
  } catch (error) {
    console.error(`[Cache] Failed to remove ${key}:`, error);
  }
}

/**
 * ユーザー情報をキャッシュに保存（7日間）
 */
export function cacheUserInfo(user: any): void {
  setCache(CACHE_KEYS.USER_INFO, user, CACHE_DURATION.USER_INFO);
}

/**
 * キャッシュからユーザー情報を取得
 */
export function getCachedUserInfo(): any | null {
  return getCache(CACHE_KEYS.USER_INFO);
}

/**
 * ユーザー情報のキャッシュを削除
 */
export function clearUserInfoCache(): void {
  removeCache(CACHE_KEYS.USER_INFO);
}

/**
 * プロフィール情報をキャッシュに保存（24時間）
 */
export function cacheProfile(twitterId: string, profile: any): void {
  const key = `${CACHE_KEYS.PROFILE_CACHE}_${twitterId}`;
  setCache(key, profile, CACHE_DURATION.PROFILE);
}

/**
 * キャッシュからプロフィール情報を取得
 */
export function getCachedProfile(twitterId: string): any | null {
  const key = `${CACHE_KEYS.PROFILE_CACHE}_${twitterId}`;
  return getCache(key);
}

/**
 * フォロー状態をキャッシュに保存（5分間）
 */
export function cacheFollowStatus(userId: string, targetId: string, isFollowing: boolean): void {
  const key = `${CACHE_KEYS.FOLLOW_STATUS_CACHE}_${userId}_${targetId}`;
  setCache(key, { isFollowing }, CACHE_DURATION.FOLLOW_STATUS);
}

/**
 * キャッシュからフォロー状態を取得
 */
export function getCachedFollowStatus(userId: string, targetId: string): boolean | null {
  const key = `${CACHE_KEYS.FOLLOW_STATUS_CACHE}_${userId}_${targetId}`;
  const cached = getCache<{ isFollowing: boolean }>(key);
  return cached?.isFollowing ?? null;
}

/**
 * すべてのキャッシュをクリア
 */
export function clearAllCache(): void {
  if (Platform.OS !== "web") {
    return;
  }

  try {
    // キャッシュ関連のキーのみ削除
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.includes("_cache") || key.includes("Cache"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => window.localStorage.removeItem(key));
    console.log(`[Cache] Cleared ${keysToRemove.length} cache entries`);
  } catch (error) {
    console.error("[Cache] Failed to clear all cache:", error);
  }
}

export { CACHE_DURATION, CACHE_KEYS };
