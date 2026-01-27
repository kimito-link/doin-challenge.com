/**
 * server/_core/sentry.ts
 * 
 * Sentry設定（サーバー側）
 * 
 * API 5xx / エラー急増の検知
 */

import * as Sentry from "@sentry/node";

/**
 * Sentryを初期化
 */
export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn("[Sentry] SENTRY_DSN is not set. Sentry will not be initialized.");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? "development",

    // まずは控えめに（コスト/ノイズを抑える）
    tracesSampleRate: 0.05,

    // ログイン等の「体験の失敗」はmessageで拾うので、例外は自動で十分
  });

  console.log("[Sentry] Initialized for server");
}

/**
 * tRPCのエラーをSentryへ送信
 */
export function captureTrpcError(error: Error, context: { path?: string; type?: string }) {
  Sentry.captureException(error, {
    tags: {
      trpc_path: context.path ?? "unknown",
      trpc_type: context.type ?? "unknown",
    },
  });
}
