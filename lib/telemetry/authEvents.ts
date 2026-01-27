/**
 * lib/telemetry/authEvents.ts
 * 
 * 認証イベントのトラッキング
 * 
 * ログイン失敗率の監視
 */

import * as Sentry from "@sentry/react-native";

/**
 * ログイン開始
 */
export function trackAuthLoginStart() {
  Sentry.addBreadcrumb({ 
    category: "auth", 
    message: "auth_login_start", 
    level: "info" 
  });
}

/**
 * ログイン成功
 */
export function trackAuthLoginSuccess() {
  Sentry.captureMessage("auth_login_success", { level: "info" });
}

/**
 * ログイン失敗
 */
export function trackAuthLoginFailed(reason: string) {
  Sentry.captureMessage("auth_login_failed", {
    level: "warning",
    tags: { reason },
  });
}

/**
 * OAuthコールバック失敗
 */
export function trackAuthCallbackFailed(reason: string) {
  Sentry.captureMessage("auth_callback_failed", {
    level: "error",
    tags: { reason },
  });
}
