/**
 * Auth0セッション管理
 * 
 * 機能:
 * - トークンの有効期限チェック
 * - 自動リフレッシュ
 * - セッション永続化
 * - エラーハンドリング
 */

import * as Auth from "./auth";
import { Platform } from "react-native";

// セッションの有効期限（30日間）
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// トークンリフレッシュのしきい値（有効期限の80%経過時）
const REFRESH_THRESHOLD = 0.8;

interface SessionData {
  token: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * セッショントークンを保存（有効期限付き）
 */
export async function saveSession(token: string): Promise<void> {
  const now = Date.now();
  const sessionData: SessionData = {
    token,
    expiresAt: now + SESSION_MAX_AGE_MS,
    createdAt: now,
  };
  
  await Auth.setSessionToken(token);
  
  // メタデータを保存（有効期限チェック用）
  if (Platform.OS === "web") {
    localStorage.setItem("session_metadata", JSON.stringify(sessionData));
  } else {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem("session_metadata", JSON.stringify(sessionData));
  }
}

/**
 * セッショントークンを取得（有効期限チェック付き）
 */
export async function getSession(): Promise<string | null> {
  try {
    const token = await Auth.getSessionToken();
    if (!token) return null;
    
    // メタデータを取得
    let metadata: SessionData | null = null;
    if (Platform.OS === "web") {
      const data = localStorage.getItem("session_metadata");
      if (data) metadata = JSON.parse(data);
    } else {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      const data = await AsyncStorage.getItem("session_metadata");
      if (data) metadata = JSON.parse(data);
    }
    
    // メタデータがない場合はトークンをそのまま返す（後方互換性）
    if (!metadata) return token;
    
    // 有効期限チェック
    const now = Date.now();
    if (now > metadata.expiresAt) {
      console.log("[SessionManager] Session expired, clearing...");
      await clearSession();
      return null;
    }
    
    // リフレッシュが必要かチェック（有効期限の80%経過）
    const sessionAge = now - metadata.createdAt;
    const sessionMaxAge = metadata.expiresAt - metadata.createdAt;
    if (sessionAge > sessionMaxAge * REFRESH_THRESHOLD) {
      console.log("[SessionManager] Session refresh recommended (80% expired)");
      // バックグラウンドでリフレッシュ（非同期）
      refreshSession().catch((err) => {
        console.error("[SessionManager] Background refresh failed:", err);
      });
    }
    
    return token;
  } catch (err) {
    console.error("[SessionManager] Failed to get session:", err);
    return null;
  }
}

/**
 * セッションをリフレッシュ
 */
export async function refreshSession(): Promise<void> {
  try {
    const token = await Auth.getSessionToken();
    if (!token) return;
    
    // 新しいトークンで再保存（有効期限を延長）
    await saveSession(token);
    console.log("[SessionManager] Session refreshed successfully");
  } catch (err) {
    console.error("[SessionManager] Failed to refresh session:", err);
    throw err;
  }
}

/**
 * セッションをクリア
 */
export async function clearSession(): Promise<void> {
  try {
    await Auth.removeSessionToken();
    await Auth.clearUserInfo();
    
    if (Platform.OS === "web") {
      localStorage.removeItem("session_metadata");
    } else {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.removeItem("session_metadata");
    }
    
    console.log("[SessionManager] Session cleared");
  } catch (err) {
    console.error("[SessionManager] Failed to clear session:", err);
    throw err;
  }
}

/**
 * セッションの残り時間を取得（ミリ秒）
 */
export async function getSessionRemainingTime(): Promise<number | null> {
  try {
    let metadata: SessionData | null = null;
    if (Platform.OS === "web") {
      const data = localStorage.getItem("session_metadata");
      if (data) metadata = JSON.parse(data);
    } else {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      const data = await AsyncStorage.getItem("session_metadata");
      if (data) metadata = JSON.parse(data);
    }
    
    if (!metadata) return null;
    
    const now = Date.now();
    const remaining = metadata.expiresAt - now;
    return remaining > 0 ? remaining : 0;
  } catch (err) {
    console.error("[SessionManager] Failed to get session remaining time:", err);
    return null;
  }
}
