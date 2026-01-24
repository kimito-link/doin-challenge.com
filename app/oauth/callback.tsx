import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { navigateReplace } from "@/lib/navigation/app-routes";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveLoginSuccessPending } from "@/lib/login-success-context";
import { useColors } from "@/hooks/use-colors";
import { LinkAuthResult } from "@/components/organisms/link-auth-result";
import { LinkAuthLoading } from "@/components/organisms/link-auth-loading";

type AuthStatus = "processing" | "success" | "error" | "cancel";
type AuthStep = 1 | 2 | 3; // 1: ログイン中, 2: ユーザー情報取得中, 3: 完了
type ErrorType = "network" | "oauth" | "other";

/**
 * OAuthエラーを種別分類する
 * 
 * @param error - エラー文字列
 * @returns エラー種別（network/oauth/other）
 */
function classifyOAuthError(error?: string): ErrorType {
  if (!error) return "other";
  if (error.includes("network") || error.includes("fetch")) return "network";
  if (error.includes("oauth") || error.includes("exchange")) return "oauth";
  return "other";
}

export default function OAuthCallback() {

  const colors = useColors();
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
    sessionToken?: string;
    user?: string;
  }>();
  const [status, setStatus] = useState<AuthStatus>("processing");
  const [step, setStep] = useState<AuthStep>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>("other");
  const [requestId, setRequestId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleCallback = async () => {
      console.log("[OAuth] Callback handler triggered");
      console.log("[OAuth] Params received:", {
        code: params.code,
        state: params.state,
        error: params.error,
        sessionToken: params.sessionToken ? "present" : "missing",
        user: params.user ? "present" : "missing",
      });
      try {
        // ステップ1: ログイン中
        setStep(1);

        // Check for sessionToken in params first (web OAuth callback from server redirect)
        if (params.sessionToken) {
          console.log("[OAuth] Session token found in params (web callback)");
          
          // ステップ2: ユーザー情報取得中
          setStep(2);
          await Auth.setSessionToken(params.sessionToken);

          // Decode and store user info if available
          if (params.user) {
            try {
              // Use atob for base64 decoding (works in both web and React Native)
              const userJson =
                typeof atob !== "undefined"
                  ? atob(params.user)
                  : Buffer.from(params.user, "base64").toString("utf-8");
              const userData = JSON.parse(userJson);
              const userInfo: Auth.User = {
                id: userData.id,
                openId: userData.openId,
                name: userData.name,
                email: userData.email,
                loginMethod: userData.loginMethod,
                lastSignedIn: new Date(userData.lastSignedIn || Date.now()),
              };
              await Auth.setUserInfo(userInfo);
              console.log("[OAuth] User info stored:", userInfo);
              // ログイン成功を保存（モーダル表示用）
              await saveLoginSuccessPending(userInfo.name || undefined, (userData as { profileImage?: string }).profileImage);
            } catch (err) {
              console.error("[OAuth] Failed to parse user data:", err);
            }
          }

          // ステップ3: 完了
          setStep(3);
          setStatus("success");
          console.log("[OAuth] Web login successful, redirecting to home...");
          setTimeout(() => {
            navigateReplace.toHome();
          }, 1500);
          return;
        }

        // Get URL from params or Linking
        let url: string | null = null;

        // Try to get from local search params first (works with expo-router)
        if (params.code || params.state || params.error) {
          console.log("[OAuth] Found params in route params");
          // Extract from params
          const urlParams = new URLSearchParams();
          if (params.code) urlParams.set("code", params.code);
          if (params.state) urlParams.set("state", params.state);
          if (params.error) urlParams.set("error", params.error);
          url = `?${urlParams.toString()}`;
          console.log("[OAuth] Constructed URL from params:", url);
        } else {
          console.log("[OAuth] No params found, checking Linking.getInitialURL()...");
          // Fallback: try to get from Linking
          const initialUrl = await Linking.getInitialURL();
          console.log("[OAuth] Linking.getInitialURL():", initialUrl);
          if (initialUrl) {
            url = initialUrl;
          }
        }

        // Check for error
        const error =
          params.error || (url ? new URL(url, "http://dummy").searchParams.get("error") : null);
        if (error) {
          console.error("[OAuth] Error parameter found:", error);
          
          // キャンセル判定
          if (error === "access_denied") {
            setStatus("cancel");
            return;
          }
          
          // エラー種別を判定
          setErrorType(classifyOAuthError(error));
          
          setStatus("error");
          setErrorMessage(error || "OAuth error occurred");
          // requestIdを生成（開発環境のみ）
          if (process.env.NODE_ENV === "development") {
            setRequestId(`ERR-${Date.now()}`);
          }
          return;
        }

        // Check for code and state
        let code: string | null = null;
        let state: string | null = null;
        let sessionToken: string | null = null;

        // Try to get from params first
        if (params.code && params.state) {
          console.log("[OAuth] Using code and state from route params");
          code = params.code;
          state = params.state;
        } else if (url) {
          console.log("[OAuth] Parsing code and state from URL:", url);
          // Parse from URL
          try {
            const urlObj = new URL(url);
            code = urlObj.searchParams.get("code");
            state = urlObj.searchParams.get("state");
            sessionToken = urlObj.searchParams.get("sessionToken");
            console.log("[OAuth] Extracted from URL:", {
              code: code?.substring(0, 20) + "...",
              state: state?.substring(0, 20) + "...",
              sessionToken: sessionToken ? "present" : "missing",
            });
          } catch (e) {
            console.log("[OAuth] Failed to parse as full URL, trying regex:", e);
            // Try parsing as relative URL with query params
            const match = url.match(/[?&](code|state|sessionToken)=([^&]+)/g);
            if (match) {
              match.forEach((param) => {
                const [key, value] = param.substring(1).split("=");
                if (key === "code") code = decodeURIComponent(value);
                if (key === "state") state = decodeURIComponent(value);
                if (key === "sessionToken") sessionToken = decodeURIComponent(value);
              });
              console.log("[OAuth] Extracted from regex:", {
                code: code?.substring(0, 20) + "...",
                state: state?.substring(0, 20) + "...",
                sessionToken: sessionToken ? "present" : "missing",
              });
            }
          }
        }

        console.log("[OAuth] Final extracted values:", {
          hasCode: !!code,
          hasState: !!state,
          hasSessionToken: !!sessionToken,
        });

        // If we have sessionToken directly from URL, use it
        if (sessionToken) {
          console.log("[OAuth] Session token found in URL, storing...");
          setStep(2);
          await Auth.setSessionToken(sessionToken);
          console.log("[OAuth] Session token stored successfully");
          // User info is already in the OAuth callback response
          // No need to fetch from API
          setStep(3);
          setStatus("success");
          console.log("[OAuth] Redirecting to home...");
          setTimeout(() => {
            navigateReplace.toHome();
          }, 1500);
          return;
        }

        // Otherwise, exchange code for session token
        if (!code || !state) {
          console.error("[OAuth] Missing code or state parameter", {
            hasCode: !!code,
            hasState: !!state,
          });
          setStatus("error");
          setErrorMessage("Missing code or state parameter");
          return;
        }

        // ステップ2: ユーザー情報取得中
        setStep(2);

        // Exchange code for session token
        console.log("[OAuth] Exchanging code for session token...", {
          code: code.substring(0, 20) + "...",
          state: state.substring(0, 20) + "...",
        });
        const result = await Api.exchangeOAuthCode(code, state);
        console.log("[OAuth] Exchange result:", {
          hasSessionToken: !!result.sessionToken,
          hasUser: !!result.user,
        });

        if (result.sessionToken) {
          console.log("[OAuth] Session token received, storing...");
          // Store session token
          await Auth.setSessionToken(result.sessionToken);
          console.log("[OAuth] Session token stored successfully");

          // Store user info if available
          if (result.user) {
            console.log("[OAuth] User data received:", result.user);
            const userInfo: Auth.User = {
              id: result.user.id,
              openId: result.user.openId,
              name: result.user.name,
              email: result.user.email,
              loginMethod: result.user.loginMethod,
              lastSignedIn: new Date(result.user.lastSignedIn || Date.now()),
            };
            await Auth.setUserInfo(userInfo);
            console.log("[OAuth] User info stored:", userInfo);
            // ログイン成功を保存（モーダル表示用）
            await saveLoginSuccessPending(userInfo.name || undefined, (result.user as { profileImage?: string }).profileImage);
          } else {
            console.log("[OAuth] No user data in result");
          }

          // ステップ3: 完了
          setStep(3);
          setStatus("success");
          console.log("[OAuth] Login successful, redirecting to home...");

          // Redirect to home after a short delay
          setTimeout(() => {
            console.log("[OAuth] Executing redirect...");
            navigateReplace.toHome();
          }, 1500);
        } else {
          console.error("[OAuth] No session token in result:", result);
          setStatus("error");
          setErrorMessage("No session token received");
        }
      } catch (error) {
        console.error("[OAuth] Callback error:", error);
        
        // エラー種別を判定
        const errorMsg = error instanceof Error ? error.message : "Failed to complete login";
        setErrorType(classifyOAuthError(errorMsg));
        
        setStatus("error");
        setErrorMessage(errorMsg);
        // requestIdを生成（開発環境のみ）
        if (process.env.NODE_ENV === "development") {
          setRequestId(`ERR-${Date.now()}`);
        }
      }
    };

    handleCallback();
  }, [params.code, params.state, params.error, params.sessionToken, params.user]);

  // キャンセル画面
  if (status === "cancel") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom", "left", "right"]}>
        <LinkAuthResult
          type="cancel"
          onBack={() => navigateReplace.toMypageTab()}
        />
      </SafeAreaView>
    );
  }

  // エラー画面
  if (status === "error") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom", "left", "right"]}>
        <LinkAuthResult
          type="error"
          errorType={errorType}
          requestId={requestId}
          onRetry={() => {
            // 再試行：ログイン画面に戻る
            navigateReplace.toMypageTab();
          }}
          onBack={() => navigateReplace.toMypageTab()}
        />
      </SafeAreaView>
    );
  }

  // ローディング画面
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom", "left", "right"]}>
      <LinkAuthLoading currentStep={step} />
    </SafeAreaView>
  );
}
