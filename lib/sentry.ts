import * as Sentry from "@sentry/react";
import { Platform } from "react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || "development";

/**
 * Sentryの初期化
 * クライアント側のエラー監視を有効化
 */
export function initSentry() {
  // Web以外では無効化（React Nativeは別途設定が必要）
  if (Platform.OS !== "web") {
    return;
  }

  // SENTRY_DSNが設定されていない場合は無効化
  if (!SENTRY_DSN) {
    console.warn("[Sentry] SENTRY_DSN is not set. Sentry is disabled.");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    // エラーのサンプリングレート（100% = すべてのエラーを送信）
    sampleRate: 1.0,
    
    // パフォーマンス監視のサンプリングレート（10% = 10%のトランザクションを送信）
    tracesSampleRate: 0.1,
    
    // リリース情報（commitShaを使用）
    release: process.env.EXPO_PUBLIC_COMMIT_SHA || "unknown",
    
    // エラーフィルタリング
    beforeSend(event, hint) {
      // 開発環境ではコンソールにも出力
      if (SENTRY_ENVIRONMENT === "development") {
        console.error("[Sentry]", hint.originalException || hint.syntheticException);
      }
      
      // 特定のエラーを除外
      const error = hint.originalException;
      if (error instanceof Error) {
        // ネットワークエラーは除外（UptimeRobotで検知）
        if (error.message.includes("Network request failed")) {
          return null;
        }
        
        // キャンセルされたリクエストは除外
        if (error.message.includes("AbortError")) {
          return null;
        }
      }
      
      return event;
    },
  });
  
  console.log("[Sentry] Initialized with environment:", SENTRY_ENVIRONMENT);
}

/**
 * ユーザー情報を設定
 * ログイン後に呼び出す
 */
export function setSentryUser(userId: string, username?: string) {
  Sentry.setUser({
    id: userId,
    username,
  });
}

/**
 * ユーザー情報をクリア
 * ログアウト時に呼び出す
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * カスタムエラーを送信
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * カスタムメッセージを送信
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}
