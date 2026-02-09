import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  clearAllTokenData,
} from "@/lib/token-manager";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_INFO_KEY } from "@/constants/oauth";

type UseAuthOptions = {
  autoFetch?: boolean;
};

// 認証状態のキャッシュ（メモリ内）
let cachedAuthState: { user: Auth.User | null; timestamp: number } | null = null;
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5分

// Web: 初期化時にlocalStorageから同期的にユーザー情報を読み込む
function getInitialUserFromLocalStorage(): Auth.User | null {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      const info = window.localStorage.getItem(USER_INFO_KEY);
      if (info) return JSON.parse(info);
    } catch {
      // localStorageパースエラーは無視
    }
  }
  return null;
}

// モジュール初期化時にlocalStorageからキャッシュを設定
if (!cachedAuthState) {
  const initialUser = getInitialUserFromLocalStorage();
  if (initialUser) {
    cachedAuthState = { user: initialUser, timestamp: Date.now() };
  }
}

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  
  // キャッシュが有効な場合は即座に表示（loading=false）
  const hasCachedAuth = cachedAuthState !== null && (Date.now() - cachedAuthState.timestamp) < AUTH_CACHE_TTL;
  const [user, setUser] = useState<Auth.User | null>(hasCachedAuth && cachedAuthState ? cachedAuthState.user : null);
  // キャッシュがあればloading=falseで開始（スケルトン表示をスキップ）
  const [loading, setLoading] = useState(!hasCachedAuth);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Web: localStorageキャッシュ → API の順で認証状態を取得
      if (Platform.OS === "web") {
        const cachedUser = await Auth.getUserInfo();
        if (cachedUser) {
          setUser(cachedUser);
          cachedAuthState = { user: cachedUser, timestamp: Date.now() };
          return;
        }
        
        // キャッシュなし → APIで認証確認（ネットワークエラー時1回リトライ）
        let apiUser = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            apiUser = await Api.getMe();
            break;
          } catch (apiError) {
            const isNetworkError = apiError instanceof Error && 
              (apiError.message.includes("fetch") || apiError.message.includes("network") || apiError.message.includes("Failed"));
            if (isNetworkError && attempt === 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            break;
          }
        }

        if (apiUser) {
          const userInfo: Auth.User = {
            id: apiUser.id,
            openId: apiUser.openId,
            name: apiUser.name,
            email: apiUser.email,
            loginMethod: apiUser.loginMethod,
            lastSignedIn: new Date(apiUser.lastSignedIn),
            prefecture: apiUser.prefecture ?? null,
            gender: apiUser.gender ?? null,
            role: apiUser.role ?? undefined,
          };
          setUser(userInfo);
          cachedAuthState = { user: userInfo, timestamp: Date.now() };
          await Auth.setUserInfo(userInfo);
        } else {
          setUser(null);
          cachedAuthState = { user: null, timestamp: Date.now() };
        }
        return;
      }

      // Native: トークンベース認証
      const sessionToken = await Auth.getSessionToken();
      if (!sessionToken) {
        setUser(null);
        cachedAuthState = { user: null, timestamp: Date.now() };
        return;
      }

      const cachedUser = await Auth.getUserInfo();
      if (cachedUser) {
        setUser(cachedUser);
        cachedAuthState = { user: cachedUser, timestamp: Date.now() };
      } else {
        setUser(null);
        cachedAuthState = { user: null, timestamp: Date.now() };
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user");
      console.error("[useAuth] fetchUser error:", error);
      setError(error);
      setUser(null);
      cachedAuthState = { user: null, timestamp: Date.now() };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // BFFパターン: サーバーが自動でトークンリボーク+削除するため、トークン送信不要
      await Api.logout();
    } catch (err) {
      console.error("[Auth] Logout API call failed:", err);
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      await clearAllTokenData();
      cachedAuthState = null;
      setUser(null);
      setError(null);
    }
  }, []);

  // login関数: forceSwitch=trueで別のアカウントでログイン可能
  const login = useCallback(async (returnUrl?: string, forceSwitch: boolean = false) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      
      if (Platform.OS === "web" && typeof window !== "undefined") {
        // ログイン後のリダイレクト先を保存（指定がなければ現在のページ）
        const redirectPath = returnUrl || window.location.pathname;
        localStorage.setItem("auth_return_url", redirectPath);
        console.log("[Auth] Saved return URL:", redirectPath);
        
        // forceSwitchがtrueの場合は別のアカウントでログインできるようにする
        const switchParam = forceSwitch ? "?switch=true" : "";
        const loginUrl = `${apiBaseUrl}/api/twitter/auth${switchParam}`;
        console.log("[Auth] Web login URL:", loginUrl, "forceSwitch:", forceSwitch);
        window.location.href = loginUrl;
      } else {
        // On native, save return URL to AsyncStorage
        if (returnUrl) {
          await AsyncStorage.setItem("auth_return_url", returnUrl);
          console.log("[Auth] Saved return URL (native):", returnUrl);
        }
        
        const switchParam = forceSwitch ? "?switch=true" : "";
        const loginUrl = `${apiBaseUrl}/api/twitter/auth${switchParam}`;
        console.log("[Auth] Native login URL:", loginUrl, "forceSwitch:", forceSwitch);
        await Linking.openURL(loginUrl);
      }
    } catch (err) {
      console.error("[Auth] Login failed:", err);
      setError(err instanceof Error ? err : new Error("Login failed"));
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);
  /** 認証状態が確定済み（loading 完了）。これが true になるまで user 依存の表示を出さず点滅を防ぐ */
  const isAuthReady = !loading;

  useEffect(() => {
    if (autoFetch) {
      if (Platform.OS === "web") {
        fetchUser();
      } else {
        // Native: キャッシュがあれば即座に表示、なければAPI
        Auth.getUserInfo().then((cachedUser) => {
          if (cachedUser) {
            setUser(cachedUser);
            setLoading(false);
          } else {
            fetchUser();
          }
        });
      }
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAuthReady,
    refresh: fetchUser,
    logout,
    login,
  };
}
