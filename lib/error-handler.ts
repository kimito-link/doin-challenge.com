/**
 * グローバルエラーハンドラー
 * アプリ全体のエラーを捕捉して適切に処理する
 */

import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface AppError {
  message: string;
  code?: string;
  originalError?: Error;
  context?: Record<string, any>;
}

/**
 * エラーをユーザーフレンドリーなメッセージに変換
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // ネットワークエラー
    if (error.message.includes('Network request failed') || error.message.includes('ECONNREFUSED')) {
      return 'ネットワーク接続に失敗しました。インターネット接続を確認してください。';
    }

    // タイムアウトエラー
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return 'リクエストがタイムアウトしました。しばらくしてから再試行してください。';
    }

    // 認証エラー
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      return 'ログインセッションが期限切れです。再度ログインしてください。';
    }

    // 権限エラー
    if (error.message.includes('Forbidden') || error.message.includes('403')) {
      return 'この操作を実行する権限がありません。';
    }

    // サーバーエラー
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'サーバーエラーが発生しました。しばらくしてから再試行してください。';
    }

    return error.message;
  }

  return '予期しないエラーが発生しました。';
}

/**
 * エラーをユーザーに表示
 */
export function showError(error: unknown, title: string = 'エラー') {
  const message = getErrorMessage(error);

  // ハプティックフィードバック（エラー）
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  // アラート表示
  Alert.alert(title, message, [{ text: 'OK' }]);

  // コンソールにも出力（デバッグ用）
  console.error('[Error]', title, error);
}

/**
 * 非同期関数を安全に実行
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options?: {
    onError?: (error: unknown) => void;
    showAlert?: boolean;
    errorTitle?: string;
  }
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (options?.showAlert !== false) {
      showError(error, options?.errorTitle);
    }
    options?.onError?.(error);
    return null;
  }
}

/**
 * try-catchのラッパー関数
 */
export function tryCatch<T>(
  fn: () => T,
  options?: {
    onError?: (error: unknown) => void;
    showAlert?: boolean;
    errorTitle?: string;
    fallback?: T;
  }
): T | null {
  try {
    return fn();
  } catch (error) {
    if (options?.showAlert !== false) {
      showError(error, options?.errorTitle);
    }
    options?.onError?.(error);
    return options?.fallback ?? null;
  }
}

/**
 * エラーログを記録
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const errorMessage = getErrorMessage(error);
  const timestamp = new Date().toISOString();

  console.error('[Error Log]', {
    timestamp,
    message: errorMessage,
    context,
    error,
  });

  // 本番環境では、ここでエラートラッキングサービス（Sentry等）に送信
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { contexts: { custom: context } });
  // }
}
