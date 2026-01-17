/**
 * API Client Utilities
 * 
 * このファイルはfetch呼び出しのラッパーを提供し、
 * エラーハンドリングとログ機能を一元管理します。
 * 
 * @see docs/API-ARCHITECTURE.md
 */

import { getApiBaseUrl } from "./config";

// =============================================================================
// 設定
// =============================================================================

/**
 * APIログを有効にするかどうか
 * 開発環境では自動的に有効、本番環境では無効
 */
let apiLoggingEnabled = __DEV__;

/**
 * APIログを有効/無効にする
 */
export function setApiLogging(enabled: boolean): void {
  apiLoggingEnabled = enabled;
}

/**
 * APIログが有効かどうかを取得
 */
export function isApiLoggingEnabled(): boolean {
  return apiLoggingEnabled;
}

// =============================================================================
// 型定義
// =============================================================================

/**
 * APIレスポンスの型
 */
export interface ApiResponse<T = unknown> {
  /** レスポンスが成功したかどうか */
  ok: boolean;
  /** HTTPステータスコード */
  status: number;
  /** レスポンスデータ */
  data: T | null;
  /** エラーメッセージ（エラー時のみ） */
  error: string | null;
}

/**
 * APIリクエストオプション
 */
export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** リクエストボディ（自動的にJSON.stringifyされる） */
  body?: unknown;
  /** タイムアウト（ミリ秒）。デフォルト: 30000 */
  timeout?: number;
  /** エラー時にコンソールにログを出力するか。デフォルト: true */
  logErrors?: boolean;
}

/**
 * APIエラーの型
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// =============================================================================
// ログ機能
// =============================================================================

/**
 * APIリクエストをログ出力
 */
function logRequest(method: string, endpoint: string, options?: ApiRequestOptions): void {
  if (!apiLoggingEnabled) return;
  
  console.log(`[API] ${method} ${endpoint}`, {
    headers: options?.headers,
    body: options?.body,
    timestamp: new Date().toISOString(),
  });
}

/**
 * APIレスポンスをログ出力
 */
function logResponse<T>(
  method: string,
  endpoint: string,
  response: ApiResponse<T>,
  duration: number
): void {
  if (!apiLoggingEnabled) return;
  
  const logLevel = response.ok ? "log" : "error";
  console[logLevel](`[API] ${method} ${endpoint} → ${response.status}`, {
    ok: response.ok,
    data: response.data,
    error: response.error,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
}

// =============================================================================
// コアAPI関数
// =============================================================================

/**
 * APIリクエストを実行する汎用関数
 * 
 * @param endpoint APIエンドポイント（/api/xxx形式）
 * @param options リクエストオプション
 * @returns APIレスポンス
 * 
 * @example
 * ```tsx
 * // GETリクエスト
 * const response = await apiRequest("/api/users");
 * 
 * // POSTリクエスト
 * const response = await apiRequest("/api/users", {
 *   method: "POST",
 *   body: { name: "John" },
 * });
 * ```
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    timeout = 30000,
    logErrors = true,
    ...fetchOptions
  } = options;

  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}${endpoint}`;
  const startTime = Date.now();

  // リクエストログ
  logRequest(method, endpoint, options);

  // AbortControllerでタイムアウトを実装
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // レスポンスボディを取得
    let data: T | null = null;
    let errorMessage: string | null = null;

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        const json = await response.json();
        if (response.ok) {
          data = json as T;
        } else {
          errorMessage = json.error || json.message || `HTTP ${response.status}`;
        }
      } catch {
        errorMessage = "Invalid JSON response";
      }
    } else if (!response.ok) {
      errorMessage = `HTTP ${response.status}`;
    }

    const result: ApiResponse<T> = {
      ok: response.ok,
      status: response.status,
      data,
      error: errorMessage,
    };

    // レスポンスログ
    const duration = Date.now() - startTime;
    logResponse(method, endpoint, result, duration);

    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    let errorMessage = "Unknown error";

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = `Request timeout after ${timeout}ms`;
      } else {
        errorMessage = error.message;
      }
    }

    const result: ApiResponse<T> = {
      ok: false,
      status: 0,
      data: null,
      error: errorMessage,
    };

    // エラーログ
    if (logErrors) {
      logResponse(method, endpoint, result, duration);
    }

    return result;
  }
}

// =============================================================================
// 便利なショートカット関数
// =============================================================================

/**
 * GETリクエストを実行
 * 
 * @example
 * ```tsx
 * const response = await apiGet<User[]>("/api/users");
 * if (response.ok) {
 *   console.log(response.data);
 * }
 * ```
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POSTリクエストを実行
 * 
 * @example
 * ```tsx
 * const response = await apiPost<User>("/api/users", {
 *   body: { name: "John", email: "john@example.com" },
 * });
 * ```
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: "POST" });
}

/**
 * PUTリクエストを実行
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: "PUT" });
}

/**
 * DELETEリクエストを実行
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}

// =============================================================================
// エラーハンドリングユーティリティ
// =============================================================================

/**
 * APIレスポンスからエラーメッセージを取得
 * ユーザーに表示するための日本語メッセージを返す
 */
export function getErrorMessage(response: ApiResponse): string {
  if (response.ok) return "";

  // ステータスコード別のメッセージ
  switch (response.status) {
    case 0:
      return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
    case 400:
      return "リクエストが不正です。入力内容を確認してください。";
    case 401:
      return "認証が必要です。再度ログインしてください。";
    case 403:
      return "アクセスが拒否されました。";
    case 404:
      return "リソースが見つかりませんでした。";
    case 429:
      return "リクエストが多すぎます。しばらく待ってから再試行してください。";
    case 500:
    case 502:
    case 503:
      return "サーバーエラーが発生しました。しばらく待ってから再試行してください。";
    default:
      return response.error || "エラーが発生しました。";
  }
}

/**
 * APIレスポンスが成功かどうかを型ガードで判定
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { ok: true; data: T } {
  return response.ok && response.data !== null;
}
