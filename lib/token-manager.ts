/**
 * Twitter OAuth 2.0 トークン管理ユーティリティ
 * 
 * リフレッシュトークンの保存と自動更新機能を提供
 * - SecureStore（ネイティブ）/ localStorage（Web）にトークンを安全に保存
 * - アクセストークン期限切れ時に自動更新
 * - トークン有効期限の管理
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  SESSION_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRES_AT_KEY,
} from "@/constants/oauth";
import { apiPost } from "@/lib/api";

// アクセストークンの有効期限（2時間 = 7200秒）
const ACCESS_TOKEN_EXPIRES_IN = 7200;
// 更新のバッファ時間（5分前に更新）
const REFRESH_BUFFER_SECONDS = 300;

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp (seconds)
}

/**
 * リフレッシュトークンを保存
 */
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log("[TokenManager] Refresh token saved to localStorage");
    } else {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      console.log("[TokenManager] Refresh token saved to SecureStore");
    }
  } catch (error) {
    console.error("[TokenManager] Failed to save refresh token:", error);
  }
}

/**
 * リフレッシュトークンを取得
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error("[TokenManager] Failed to get refresh token:", error);
    return null;
  }
}

/**
 * リフレッシュトークンを削除
 */
export async function removeRefreshToken(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
    console.log("[TokenManager] Refresh token removed");
  } catch (error) {
    console.error("[TokenManager] Failed to remove refresh token:", error);
  }
}

/**
 * トークン有効期限を保存
 */
export async function saveTokenExpiresAt(expiresAt: number): Promise<void> {
  try {
    const expiresAtStr = expiresAt.toString();
    if (Platform.OS === "web") {
      window.localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAtStr);
    } else {
      await SecureStore.setItemAsync(TOKEN_EXPIRES_AT_KEY, expiresAtStr);
    }
    console.log("[TokenManager] Token expires at:", new Date(expiresAt * 1000).toISOString());
  } catch (error) {
    console.error("[TokenManager] Failed to save token expires at:", error);
  }
}

/**
 * トークン有効期限を取得
 */
export async function getTokenExpiresAt(): Promise<number | null> {
  try {
    let expiresAtStr: string | null;
    if (Platform.OS === "web") {
      expiresAtStr = window.localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    } else {
      expiresAtStr = await SecureStore.getItemAsync(TOKEN_EXPIRES_AT_KEY);
    }
    return expiresAtStr ? parseInt(expiresAtStr, 10) : null;
  } catch (error) {
    console.error("[TokenManager] Failed to get token expires at:", error);
    return null;
  }
}

/**
 * トークン有効期限を削除
 */
export async function removeTokenExpiresAt(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window.localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_EXPIRES_AT_KEY);
    }
  } catch (error) {
    console.error("[TokenManager] Failed to remove token expires at:", error);
  }
}

/**
 * アクセストークンが期限切れかどうかをチェック
 */
export async function isAccessTokenExpired(): Promise<boolean> {
  const expiresAt = await getTokenExpiresAt();
  if (!expiresAt) {
    // 有効期限が不明な場合は期限切れとみなす
    return true;
  }
  
  const now = Math.floor(Date.now() / 1000);
  // バッファ時間を考慮して、期限の5分前から期限切れとみなす
  return now >= expiresAt - REFRESH_BUFFER_SECONDS;
}

/**
 * トークンデータを保存（ログイン成功時に呼び出す）
 */
export async function saveTokenData(data: {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}): Promise<void> {
  const { accessToken, refreshToken, expiresIn = ACCESS_TOKEN_EXPIRES_IN } = data;
  
  // アクセストークンを保存
  if (Platform.OS === "web") {
    window.localStorage.setItem(SESSION_TOKEN_KEY, accessToken);
  } else {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, accessToken);
  }
  
  // リフレッシュトークンを保存
  if (refreshToken) {
    await saveRefreshToken(refreshToken);
  }
  
  // 有効期限を計算して保存
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  await saveTokenExpiresAt(expiresAt);
  
  console.log("[TokenManager] Token data saved, expires at:", new Date(expiresAt * 1000).toISOString());
}

/**
 * すべてのトークンデータを削除（ログアウト時に呼び出す）
 */
export async function clearAllTokenData(): Promise<void> {
  await removeRefreshToken();
  await removeTokenExpiresAt();
  
  if (Platform.OS === "web") {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  }
  
  console.log("[TokenManager] All token data cleared");
}

/**
 * リフレッシュトークンを使用してアクセストークンを更新
 * ネットワークエラー時は1回リトライ。トークン無効(401/400)はリトライしない。
 */
export async function refreshAccessToken(): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
} | null> {
  const refreshToken = await getRefreshToken();
  
  if (!refreshToken) {
    console.log("[TokenManager] No refresh token available");
    return null;
  }
  
  const maxAttempts = 2;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await apiPost<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>("/api/twitter/refresh", {
        body: { refreshToken },
      });
      
      if (!result.ok) {
        console.error(`[TokenManager] Token refresh failed (attempt ${attempt + 1}):`, result.error);
        
        // リフレッシュトークンが無効な場合はクリアして即座に終了（リトライしない）
        if (result.status === 401 || result.status === 400) {
          console.warn("[TokenManager] Refresh token invalid, clearing all token data");
          await clearAllTokenData();
          return null;
        }
        
        // サーバーエラー(5xx)の場合はリトライ
        if (result.status && result.status >= 500 && attempt < maxAttempts - 1) {
          console.warn("[TokenManager] Server error, retrying in 1s...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        return null;
      }
      
      if (!result.data) {
        console.error("[TokenManager] No data in response");
        return null;
      }
      
      // 新しいトークンデータを保存
      await saveTokenData({
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
        expiresIn: result.data.expires_in,
      });
      
      console.log("[TokenManager] Token refreshed successfully");
      
      return {
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
        expiresIn: result.data.expires_in,
      };
    } catch (error) {
      const isNetworkError = error instanceof Error && 
        (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("Failed"));
      
      if (isNetworkError && attempt < maxAttempts - 1) {
        console.warn(`[TokenManager] Network error on attempt ${attempt + 1}, retrying in 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      console.error("[TokenManager] Token refresh error:", error);
      return null;
    }
  }
  
  return null;
}

/**
 * セッション有効期限情報を取得
 */
export interface SessionExpiryInfo {
  expiresAt: Date | null;
  remainingSeconds: number | null;
  isExpired: boolean;
  formattedExpiry: string;
}

export async function getSessionExpiryInfo(): Promise<SessionExpiryInfo> {
  const expiresAt = await getTokenExpiresAt();
  
  if (!expiresAt) {
    return {
      expiresAt: null,
      remainingSeconds: null,
      isExpired: true,
      formattedExpiry: "不明",
    };
  }
  
  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = expiresAt - now;
  const isExpired = remainingSeconds <= 0;
  
  // 有効期限をフォーマット
  let formattedExpiry: string;
  if (isExpired) {
    formattedExpiry = "期限切れ";
  } else if (remainingSeconds < 60) {
    formattedExpiry = `${remainingSeconds}秒後`;
  } else if (remainingSeconds < 3600) {
    const minutes = Math.floor(remainingSeconds / 60);
    formattedExpiry = `${minutes}分後`;
  } else {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    if (minutes > 0) {
      formattedExpiry = `${hours}時間${minutes}分後`;
    } else {
      formattedExpiry = `${hours}時間後`;
    }
  }
  
  return {
    expiresAt: new Date(expiresAt * 1000),
    remainingSeconds,
    isExpired,
    formattedExpiry,
  };
}

/**
 * 有効なアクセストークンを取得（必要に応じて自動更新）
 */
export async function getValidAccessToken(): Promise<string | null> {
  // まず現在のアクセストークンをチェック
  let accessToken: string | null;
  if (Platform.OS === "web") {
    accessToken = window.localStorage.getItem(SESSION_TOKEN_KEY);
  } else {
    accessToken = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  }
  
  if (!accessToken) {
    console.log("[TokenManager] No access token available");
    return null;
  }
  
  // 期限切れかどうかをチェック
  const isExpired = await isAccessTokenExpired();
  
  if (!isExpired) {
    console.log("[TokenManager] Access token is still valid");
    return accessToken;
  }
  
  console.log("[TokenManager] Access token expired, attempting refresh...");
  
  // リフレッシュを試行
  const refreshResult = await refreshAccessToken();
  
  if (refreshResult) {
    return refreshResult.accessToken;
  }
  
  // リフレッシュに失敗した場合は現在のトークンを返す（サーバー側で検証）
  console.log("[TokenManager] Refresh failed, returning current token");
  return accessToken;
}
