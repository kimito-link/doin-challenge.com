import { useAuth0 } from "@/lib/auth0-provider";
import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  autoFetch?: boolean;
};

/**
 * Auth0専用の認証フック
 * 
 * 機能:
 * - Auth0経由のログイン/ログアウト
 * - セッション管理（Web: Cookie、Native: SecureStore）
 * - ユーザー情報のキャッシング（メモリ + localStorage/AsyncStorage）
 * 
 * @param options - autoFetch: 自動的にユーザー情報を取得するか（デフォルト: true）
 */
export function useAuth(options?: UseAuthOptions) {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    login: auth0Login, 
    logout: auth0Logout 
  } = useAuth0();

  const login = useCallback(async (returnUrl?: string, forceSwitch: boolean = false) => {
    try {
      await auth0Login();
    } catch (err) {
      console.error("[Auth] Login failed:", err);
      throw err;
    }
  }, [auth0Login]);

  const logout = useCallback(async () => {
    try {
      await auth0Logout();
    } catch (err) {
      console.error("[Auth] Logout failed:", err);
      throw err;
    }
  }, [auth0Logout]);

  /** 認証状態が確定済み（loading 完了）。これが true になるまで user 依存の表示を出さず点滅を防ぐ */
  const isAuthReady = !isLoading;

  return {
    user,
    loading: isLoading,
    error: null,
    isAuthenticated,
    isAuthReady,
    refresh: async () => {}, // Auth0Providerが自動的に管理
    logout,
    login,
  };
}
