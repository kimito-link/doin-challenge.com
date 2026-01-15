/**
 * 自動ログインプロバイダー
 * 
 * アプリ起動時にリフレッシュトークンを使用して自動的にログイン状態を復元
 * ブラウザを閉じてもログイン状態を維持（最大6ヶ月）
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Platform } from "react-native";
import * as Auth from "@/lib/_core/auth";
import {
  getRefreshToken,
  getValidAccessToken,
  isAccessTokenExpired,
  clearAllTokenData,
  saveTokenData,
} from "@/lib/token-manager";
import { getApiBaseUrl } from "@/constants/oauth";

interface AutoLoginContextType {
  isInitialized: boolean;
  isRestoring: boolean;
  restorationError: Error | null;
  refreshSession: () => Promise<void>;
}

const AutoLoginContext = createContext<AutoLoginContextType>({
  isInitialized: false,
  isRestoring: true,
  restorationError: null,
  refreshSession: async () => {},
});

export function useAutoLoginContext() {
  return useContext(AutoLoginContext);
}

interface AutoLoginProviderProps {
  children: ReactNode;
}

export function AutoLoginProvider({ children }: AutoLoginProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [restorationError, setRestorationError] = useState<Error | null>(null);

  const restoreSession = useCallback(async () => {
    console.log("[AutoLoginProvider] Starting session restoration...");
    setIsRestoring(true);
    setRestorationError(null);

    try {
      // 1. まずキャッシュされたユーザー情報を確認
      const cachedUser = await Auth.getUserInfo();
      
      if (!cachedUser) {
        console.log("[AutoLoginProvider] No cached user found, skipping restoration");
        setIsInitialized(true);
        setIsRestoring(false);
        return;
      }

      console.log("[AutoLoginProvider] Found cached user:", cachedUser.name);

      // 2. リフレッシュトークンがあるか確認
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        console.log("[AutoLoginProvider] No refresh token, using cached user only");
        // リフレッシュトークンがなくてもキャッシュされたユーザー情報は使用可能
        setIsInitialized(true);
        setIsRestoring(false);
        return;
      }

      // 3. アクセストークンの有効期限をチェック
      const isExpired = await isAccessTokenExpired();
      
      if (isExpired) {
        console.log("[AutoLoginProvider] Access token expired, attempting refresh...");
        
        // トークンを更新
        const newAccessToken = await getValidAccessToken();
        
        if (!newAccessToken) {
          console.log("[AutoLoginProvider] Token refresh failed");
          // リフレッシュに失敗しても、キャッシュされたユーザー情報は維持
          // 次回のAPI呼び出し時に再認証を促す
          setRestorationError(new Error("セッションの更新に失敗しました"));
        } else {
          console.log("[AutoLoginProvider] Token refreshed successfully");
        }
      } else {
        console.log("[AutoLoginProvider] Access token is still valid");
      }

      setIsInitialized(true);
      setIsRestoring(false);
      console.log("[AutoLoginProvider] Session restoration complete");

    } catch (error) {
      console.error("[AutoLoginProvider] Restoration error:", error);
      setRestorationError(error instanceof Error ? error : new Error("セッション復元エラー"));
      setIsInitialized(true);
      setIsRestoring(false);
    }
  }, []);

  // アプリ起動時に自動的にセッションを復元
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // 定期的にトークンを更新（バックグラウンドで）
  useEffect(() => {
    if (!isInitialized) return;

    // 30分ごとにトークンの有効期限をチェック
    const intervalId = setInterval(async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) return;

        const isExpired = await isAccessTokenExpired();
        if (isExpired) {
          console.log("[AutoLoginProvider] Background token refresh...");
          await getValidAccessToken();
        }
      } catch (error) {
        console.error("[AutoLoginProvider] Background refresh error:", error);
      }
    }, 30 * 60 * 1000); // 30分

    return () => clearInterval(intervalId);
  }, [isInitialized]);

  const refreshSession = useCallback(async () => {
    await restoreSession();
  }, [restoreSession]);

  return (
    <AutoLoginContext.Provider
      value={{
        isInitialized,
        isRestoring,
        restorationError,
        refreshSession,
      }}
    >
      {children}
    </AutoLoginContext.Provider>
  );
}
