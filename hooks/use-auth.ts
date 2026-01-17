import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import {
  getRefreshToken,
  getValidAccessToken,
  isAccessTokenExpired,
  clearAllTokenData,
} from "@/lib/token-manager";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Linking } from "react-native";
import Constants from "expo-constants";
import { USER_INFO_KEY } from "@/constants/oauth";

type UseAuthOptions = {
  autoFetch?: boolean;
};

// Get API base URL from environment variable or derive from hostname
function getApiBaseUrl(): string {
  // Check for environment variable first (production)
  const envApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // On web, derive from current hostname
  // Note: Use global `location` directly instead of `window.location` for Expo Web compatibility
  // window.location.hostname returns undefined in Expo Web, but location.hostname works
  if (Platform.OS === "web" && typeof location !== "undefined") {
    const protocol = location.protocol;
    const hostname = location.hostname;
    
    // Production: doin-challenge.com -> Railway backend
    if (hostname.includes("doin-challenge.com") || hostname.includes("doin-challengecom.vercel.app")) {
      return "https://doin-challengecom-production.up.railway.app";
    }
    
    // Development: Pattern: 8081-sandboxid.region.domain -> 3000-sandboxid.region.domain
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    return `${protocol}//${apiHostname}`;
  }
  
  // Native fallback
  return Constants.expoConfig?.extra?.apiUrl || "http://localhost:3000";
}

// 認証状態のキャッシュ（メモリ内）
let cachedAuthState: { user: Auth.User | null; timestamp: number } | null = null;
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5分

// Webの場合、初期化時にlocalStorageから同期的にユーザー情報を読み込む
function getInitialUserFromLocalStorage(): Auth.User | null {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      const info = window.localStorage.getItem(USER_INFO_KEY);
      if (info) {
        const user = JSON.parse(info);
        console.log("[useAuth] Initial user loaded from localStorage:", user?.name);
        return user;
      }
    } catch (e) {
      console.error("[useAuth] Failed to parse localStorage user:", e);
    }
  }
  return null;
}

// モジュール初期化時にlocalStorageからキャッシュを設定
if (!cachedAuthState) {
  const initialUser = getInitialUserFromLocalStorage();
  if (initialUser) {
    cachedAuthState = { user: initialUser, timestamp: Date.now() };
    console.log("[useAuth] Cache initialized from localStorage");
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
    console.log("[useAuth] fetchUser called");
    try {
      setLoading(true);
      setError(null);

      // Web platform: check localStorage first for Twitter auth, then try API
      if (Platform.OS === "web") {
        console.log("[useAuth] Web platform: checking localStorage for cached user...");
        
        // First check localStorage for Twitter auth data
        const cachedUser = await Auth.getUserInfo();
        if (cachedUser) {
          console.log("[useAuth] Web: Found cached user in localStorage:", cachedUser);
          setUser(cachedUser);
          cachedAuthState = { user: cachedUser, timestamp: Date.now() };
          return;
        }
        
        // If no cached user, try API (for server-side session auth)
        console.log("[useAuth] Web platform: fetching user from API...");
        try {
          const apiUser = await Api.getMe();
          console.log("[useAuth] API user response:", apiUser);

          if (apiUser) {
            const userInfo: Auth.User = {
              id: apiUser.id,
              openId: apiUser.openId,
              name: apiUser.name,
              email: apiUser.email,
              loginMethod: apiUser.loginMethod,
              lastSignedIn: new Date(apiUser.lastSignedIn),
            };
            setUser(userInfo);
            cachedAuthState = { user: userInfo, timestamp: Date.now() };
            // Cache user info in localStorage for faster subsequent loads
            await Auth.setUserInfo(userInfo);
            console.log("[useAuth] Web user set from API:", userInfo);
          } else {
            console.log("[useAuth] Web: No authenticated user from API");
            setUser(null);
            cachedAuthState = { user: null, timestamp: Date.now() };
          }
        } catch (apiError) {
          console.log("[useAuth] Web: API call failed, no user authenticated");
          setUser(null);
          cachedAuthState = { user: null, timestamp: Date.now() };
        }
        return;
      }

      // Native platform: use token-based auth
      console.log("[useAuth] Native platform: checking for session token...");
      const sessionToken = await Auth.getSessionToken();
      console.log(
        "[useAuth] Session token:",
        sessionToken ? `present (${sessionToken.substring(0, 20)}...)` : "missing",
      );
      if (!sessionToken) {
        console.log("[useAuth] No session token, setting user to null");
        setUser(null);
        cachedAuthState = { user: null, timestamp: Date.now() };
        return;
      }

      // Use cached user info for native (token validates the session)
      const cachedUser = await Auth.getUserInfo();
      console.log("[useAuth] Cached user:", cachedUser);
      if (cachedUser) {
        console.log("[useAuth] Using cached user info");
        setUser(cachedUser);
        cachedAuthState = { user: cachedUser, timestamp: Date.now() };
      } else {
        console.log("[useAuth] No cached user, setting user to null");
        setUser(null);
        cachedAuthState = { user: null, timestamp: Date.now() };
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user");
      console.error("[useAuth] fetchUser error:", error);
      setError(error);
      setUser(null);
      // エラー時もキャッシュを更新（未認証状態をキャッシュ）
      cachedAuthState = { user: null, timestamp: Date.now() };
    } finally {
      setLoading(false);
      console.log("[useAuth] fetchUser completed, loading:", false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.logout();
    } catch (err) {
      console.error("[Auth] Logout API call failed:", err);
      // Continue with logout even if API call fails
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      // Clear all token data including refresh token
      await clearAllTokenData();
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
        // On native, use configured API URL
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

  useEffect(() => {
    console.log("[useAuth] useEffect triggered, autoFetch:", autoFetch, "platform:", Platform.OS);
    if (autoFetch) {
      if (Platform.OS === "web") {
        // Web: fetch user from API directly (user will login manually if needed)
        console.log("[useAuth] Web: fetching user from API...");
        fetchUser();
      } else {
        // Native: check for cached user info first for faster initial load
        Auth.getUserInfo().then((cachedUser) => {
          console.log("[useAuth] Native cached user check:", cachedUser);
          if (cachedUser) {
            console.log("[useAuth] Native: setting cached user immediately");
            setUser(cachedUser);
            setLoading(false);
          } else {
            // No cached user, check session token
            fetchUser();
          }
        });
      }
    } else {
      console.log("[useAuth] autoFetch disabled, setting loading to false");
      setLoading(false);
    }
  }, [autoFetch, fetchUser]);

  useEffect(() => {
    console.log("[useAuth] State updated:", {
      hasUser: !!user,
      loading,
      isAuthenticated,
      error: error?.message,
    });
  }, [user, loading, isAuthenticated, error]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    refresh: fetchUser,
    logout,
    login,
  };
}
