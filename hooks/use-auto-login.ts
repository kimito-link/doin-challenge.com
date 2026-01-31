/**
 * 自動ログインフック
 * 
 * アプリ起動時にリフレッシュトークンを使用して自動的にログイン状態を復元
 * - SecureStore/localStorageからトークンを読み込み
 * - 有効期限切れの場合は自動更新
 * - ユーザー情報をキャッシュから復元
 */

import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as Auth from "@/lib/_core/auth";
import {
  getRefreshToken,
  getValidAccessToken,
  isAccessTokenExpired,
  clearAllTokenData,
} from "@/lib/token-manager";

export interface AutoLoginState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: Auth.User | null;
  error: Error | null;
}

export function useAutoLogin() {
  const [state, setState] = useState<AutoLoginState>({
    isLoading: true,
    isLoggedIn: false,
    user: null,
    error: null,
  });

  const checkAndRestoreSession = useCallback(async () => {
    console.log("[AutoLogin] Checking session...");
    
    try {
      // まずキャッシュされたユーザー情報を確認
      const cachedUser = await Auth.getUserInfo();
      
      if (!cachedUser) {
        console.log("[AutoLogin] No cached user found");
        setState({
          isLoading: false,
          isLoggedIn: false,
          user: null,
          error: null,
        });
        return;
      }

      console.log("[AutoLogin] Found cached user:", cachedUser.name);

      // リフレッシュトークンがあるか確認
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        console.log("[AutoLogin] No refresh token, using cached user only");
        // リフレッシュトークンがなくてもキャッシュされたユーザー情報は使用
        setState({
          isLoading: false,
          isLoggedIn: true,
          user: cachedUser,
          error: null,
        });
        return;
      }

      // アクセストークンの有効期限をチェック
      const isExpired = await isAccessTokenExpired();
      
      if (isExpired) {
        console.log("[AutoLogin] Access token expired, attempting refresh...");
        
        // トークンを更新
        const newAccessToken = await getValidAccessToken();
        
        if (!newAccessToken) {
          console.log("[AutoLogin] Token refresh failed, clearing session");
          await clearAllTokenData();
          await Auth.clearUserInfo();
          
          setState({
            isLoading: false,
            isLoggedIn: false,
            user: null,
            error: new Error("セッションの有効期限が切れました。再ログインしてください。"),
          });
          return;
        }
        
        console.log("[AutoLogin] Token refreshed successfully");
      }

      // ログイン状態を復元
      setState({
        isLoading: false,
        isLoggedIn: true,
        user: cachedUser,
        error: null,
      });
      
      console.log("[AutoLogin] Session restored successfully");
      
    } catch (error) {
      console.error("[AutoLogin] Error:", error);
      setState({
        isLoading: false,
        isLoggedIn: false,
        user: null,
        error: error instanceof Error ? error : new Error("ログイン状態の確認に失敗しました"),
      });
    }
  }, []);

  // アプリ起動時に自動ログインをチェック
  useEffect(() => {
    checkAndRestoreSession();
  }, [checkAndRestoreSession]);

  // セッションを手動で更新
  const refreshSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await checkAndRestoreSession();
  }, [checkAndRestoreSession]);

  // ログアウト
  const logout = useCallback(async () => {
    console.log("[AutoLogin] Logging out...");
    
    await clearAllTokenData();
    await Auth.clearUserInfo();
    
    setState({
      isLoading: false,
      isLoggedIn: false,
      user: null,
      error: null,
    });
    
    console.log("[AutoLogin] Logged out successfully");
  }, []);

  return {
    ...state,
    refreshSession,
    logout,
  };
}
