/**
 * API Client Utilities
 * 
 * このファイルはfetch呼び出しのラッパーを提供し、
 * エラーハンドリング、ログ機能、リトライ、キャッシュ、オフラインサポートを一元管理します。
 * 
 * @see docs/API-ARCHITECTURE.md
 */

import { getApiBaseUrl } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

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
  /** キャッシュから取得したかどうか */
  fromCache?: boolean;
  /** オフラインキューに追加されたかどうか */
  queued?: boolean;
}

/**
 * リトライ設定
 */
export interface RetryConfig {
  /** 最大リトライ回数。デフォルト: 3 */
  maxRetries?: number;
  /** 初期遅延（ミリ秒）。デフォルト: 1000 */
  initialDelay?: number;
  /** 最大遅延（ミリ秒）。デフォルト: 10000 */
  maxDelay?: number;
  /** バックオフ係数。デフォルト: 2 */
  backoffFactor?: number;
  /** リトライ対象のステータスコード。デフォルト: [408, 429, 500, 502, 503, 504] */
  retryableStatuses?: number[];
}

/**
 * キャッシュ設定
 */
export interface CacheConfig {
  /** キャッシュを有効にするか。デフォルト: false */
  enabled?: boolean;
  /** キャッシュの有効期限（ミリ秒）。デフォルト: 300000 (5分) */
  ttl?: number;
  /** キャッシュキー（指定しない場合はエンドポイントから自動生成） */
  key?: string;
  /** オフライン時にキャッシュを使用するか。デフォルト: true */
  useWhenOffline?: boolean;
}

/**
 * APIリクエストオプション
 */
export interface ApiRequestOptions extends Omit<RequestInit, "body" | "cache"> {
  /** リクエストボディ（自動的にJSON.stringifyされる） */
  body?: unknown;
  /** タイムアウト（ミリ秒）。デフォルト: 30000 */
  timeout?: number;
  /** エラー時にコンソールにログを出力するか。デフォルト: true */
  logErrors?: boolean;
  /** リトライ設定 */
  retry?: RetryConfig;
  /** キャッシュ設定 */
  apiCache?: CacheConfig;
  /** オフライン時にキューに追加するか。デフォルト: false */
  queueWhenOffline?: boolean;
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

/**
 * オフラインキューアイテム
 */
interface QueuedRequest {
  id: string;
  endpoint: string;
  options: ApiRequestOptions;
  timestamp: number;
}

// =============================================================================
// キャッシュ管理
// =============================================================================

const CACHE_PREFIX = "api_cache_";
const QUEUE_KEY = "api_offline_queue";

// メモリキャッシュ（高速アクセス用）
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>();

/**
 * キャッシュキーを生成
 */
function generateCacheKey(endpoint: string, body?: unknown): string {
  const bodyHash = body ? JSON.stringify(body) : "";
  return `${CACHE_PREFIX}${endpoint}_${bodyHash}`;
}

/**
 * キャッシュからデータを取得
 */
async function getFromCache<T>(key: string): Promise<T | null> {
  // まずメモリキャッシュを確認
  const memCached = memoryCache.get(key);
  if (memCached && memCached.expiresAt > Date.now()) {
    if (apiLoggingEnabled) {
      console.log(`[API Cache] Memory hit: ${key}`);
    }
    return memCached.data as T;
  }

  // メモリキャッシュにない場合はAsyncStorageを確認
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const { data, expiresAt } = JSON.parse(stored);
      if (expiresAt > Date.now()) {
        // メモリキャッシュにも保存
        memoryCache.set(key, { data, expiresAt });
        if (apiLoggingEnabled) {
          console.log(`[API Cache] Storage hit: ${key}`);
        }
        return data as T;
      } else {
        // 期限切れなので削除
        await AsyncStorage.removeItem(key);
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.warn("[API Cache] Failed to read from cache:", error);
  }

  return null;
}

/**
 * キャッシュにデータを保存
 */
async function saveToCache<T>(key: string, data: T, ttl: number): Promise<void> {
  const expiresAt = Date.now() + ttl;
  
  // メモリキャッシュに保存
  memoryCache.set(key, { data, expiresAt });

  // AsyncStorageにも保存
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, expiresAt }));
    if (apiLoggingEnabled) {
      console.log(`[API Cache] Saved: ${key} (TTL: ${ttl}ms)`);
    }
  } catch (error) {
    console.warn("[API Cache] Failed to save to cache:", error);
  }
}

/**
 * キャッシュをクリア
 */
export async function clearApiCache(): Promise<void> {
  // メモリキャッシュをクリア
  memoryCache.clear();

  // AsyncStorageからキャッシュを削除
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    if (apiLoggingEnabled) {
      console.log(`[API Cache] Cleared ${cacheKeys.length} items`);
    }
  } catch (error) {
    console.warn("[API Cache] Failed to clear cache:", error);
  }
}

// =============================================================================
// オフラインキュー管理
// =============================================================================

let isProcessingQueue = false;
let networkListener: (() => void) | null = null;

/**
 * オフラインキューにリクエストを追加
 */
async function addToQueue(endpoint: string, options: ApiRequestOptions): Promise<string> {
  const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const queuedRequest: QueuedRequest = {
    id,
    endpoint,
    options,
    timestamp: Date.now(),
  };

  try {
    const stored = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedRequest[] = stored ? JSON.parse(stored) : [];
    queue.push(queuedRequest);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    if (apiLoggingEnabled) {
      console.log(`[API Queue] Added request: ${endpoint} (ID: ${id})`);
    }
  } catch (error) {
    console.warn("[API Queue] Failed to add to queue:", error);
  }

  return id;
}

/**
 * オフラインキューを取得
 */
async function getQueue(): Promise<QueuedRequest[]> {
  try {
    const stored = await AsyncStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("[API Queue] Failed to get queue:", error);
    return [];
  }
}

/**
 * オフラインキューからリクエストを削除
 */
async function removeFromQueue(id: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn("[API Queue] Failed to remove from queue:", error);
  }
}

/**
 * オフラインキューを処理
 */
async function processQueue(): Promise<void> {
  if (isProcessingQueue) return;
  
  isProcessingQueue = true;
  
  try {
    const queue = await getQueue();
    if (queue.length === 0) {
      isProcessingQueue = false;
      return;
    }

    if (apiLoggingEnabled) {
      console.log(`[API Queue] Processing ${queue.length} queued requests`);
    }

    for (const request of queue) {
      try {
        // キューイングオプションを無効にして再送信
        const result = await apiRequest(request.endpoint, {
          ...request.options,
          queueWhenOffline: false,
        });

        if (result.ok) {
          await removeFromQueue(request.id);
          if (apiLoggingEnabled) {
            console.log(`[API Queue] Successfully processed: ${request.endpoint}`);
          }
        }
      } catch (error) {
        console.warn(`[API Queue] Failed to process: ${request.endpoint}`, error);
      }
    }
  } finally {
    isProcessingQueue = false;
  }
}

/**
 * ネットワーク状態の監視を開始
 */
export function startNetworkMonitoring(): void {
  if (networkListener) return;

  networkListener = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      if (apiLoggingEnabled) {
        console.log("[API Network] Online - processing queue");
      }
      processQueue();
    } else {
      if (apiLoggingEnabled) {
        console.log("[API Network] Offline");
      }
    }
  });
}

/**
 * ネットワーク状態の監視を停止
 */
export function stopNetworkMonitoring(): void {
  if (networkListener) {
    networkListener();
    networkListener = null;
  }
}

/**
 * オフラインキューのサイズを取得
 */
export async function getQueueSize(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

/**
 * オフラインキューをクリア
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
    if (apiLoggingEnabled) {
      console.log("[API Queue] Cleared");
    }
  } catch (error) {
    console.warn("[API Queue] Failed to clear queue:", error);
  }
}

// =============================================================================
// ログ機能
// =============================================================================

/**
 * APIリクエストをログ出力
 */
function logRequest(method: string, endpoint: string, options?: ApiRequestOptions, attempt?: number): void {
  if (!apiLoggingEnabled) return;
  
  const attemptInfo = attempt && attempt > 1 ? ` (attempt ${attempt})` : "";
  console.log(`[API] ${method} ${endpoint}${attemptInfo}`, {
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
  const cacheInfo = response.fromCache ? " [CACHE]" : "";
  const queueInfo = response.queued ? " [QUEUED]" : "";
  console[logLevel](`[API] ${method} ${endpoint} → ${response.status}${cacheInfo}${queueInfo}`, {
    ok: response.ok,
    data: response.data,
    error: response.error,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
}

// =============================================================================
// リトライロジック
// =============================================================================

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * リトライ可能かどうかを判定
 */
function shouldRetry(status: number, attempt: number, config: Required<RetryConfig>): boolean {
  if (attempt >= config.maxRetries) return false;
  if (status === 0) return true; // ネットワークエラー
  return config.retryableStatuses.includes(status);
}

/**
 * リトライ遅延を計算（指数バックオフ）
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
  const delay = config.initialDelay * Math.pow(config.backoffFactor, attempt);
  // ジッターを追加（±20%）
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return Math.min(delay + jitter, config.maxDelay);
}

/**
 * 指定時間待機
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
 * // POSTリクエスト（リトライ付き）
 * const response = await apiRequest("/api/users", {
 *   method: "POST",
 *   body: { name: "John" },
 *   retry: { maxRetries: 3 },
 * });
 * 
 * // キャッシュ付きGETリクエスト
 * const response = await apiRequest("/api/users", {
 *   cache: { enabled: true, ttl: 60000 },
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
    retry,
    apiCache,
    queueWhenOffline = false,
    ...fetchOptions
  } = options;

  const startTime = Date.now();
  const retryConfig: Required<RetryConfig> = { ...DEFAULT_RETRY_CONFIG, ...retry };
  const cacheKey = apiCache?.key || generateCacheKey(endpoint, body);

  // オンライン状態を確認
  const networkState = await NetInfo.fetch();
  const isOnline = networkState.isConnected ?? true;

  // オフライン時の処理
  if (!isOnline) {
    // キャッシュがあれば返す
    if (apiCache?.useWhenOffline !== false) {
      const cached = await getFromCache<T>(cacheKey);
      if (cached !== null) {
        const result: ApiResponse<T> = {
          ok: true,
          status: 200,
          data: cached,
          error: null,
          fromCache: true,
        };
        logResponse(method, endpoint, result, Date.now() - startTime);
        return result;
      }
    }

    // キューイングが有効なら追加
    if (queueWhenOffline && method !== "GET") {
      await addToQueue(endpoint, options);
      const result: ApiResponse<T> = {
        ok: false,
        status: 0,
        data: null,
        error: "オフラインです。ネットワーク復帰後に自動的に送信されます。",
        queued: true,
      };
      logResponse(method, endpoint, result, Date.now() - startTime);
      return result;
    }

    // オフラインエラーを返す
    const result: ApiResponse<T> = {
      ok: false,
      status: 0,
      data: null,
      error: "ネットワークに接続されていません。",
    };
    logResponse(method, endpoint, result, Date.now() - startTime);
    return result;
  }

  // キャッシュを確認（GETリクエストのみ）
  if (method === "GET" && apiCache?.enabled) {
    const cached = await getFromCache<T>(cacheKey);
    if (cached !== null) {
      const result: ApiResponse<T> = {
        ok: true,
        status: 200,
        data: cached,
        error: null,
        fromCache: true,
      };
      logResponse(method, endpoint, result, Date.now() - startTime);
      return result;
    }
  }

  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}${endpoint}`;

  // リトライループ
  let lastResult: ApiResponse<T> | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = calculateDelay(attempt - 1, retryConfig);
      if (apiLoggingEnabled) {
        console.log(`[API Retry] Waiting ${Math.round(delay)}ms before retry ${attempt}/${retryConfig.maxRetries}`);
      }
      await sleep(delay);
    }

    // リクエストログ
    logRequest(method, endpoint, options, attempt + 1);

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

      // 成功した場合はキャッシュに保存
      if (response.ok && method === "GET" && apiCache?.enabled && data !== null) {
        await saveToCache(cacheKey, data, apiCache.ttl || 300000);
      }

      // リトライ不要なら結果を返す
      if (!shouldRetry(response.status, attempt, retryConfig)) {
        const duration = Date.now() - startTime;
        logResponse(method, endpoint, result, duration);
        return result;
      }

      lastResult = result;
    } catch (error) {
      clearTimeout(timeoutId);

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

      // リトライ不要なら結果を返す
      if (!shouldRetry(0, attempt, retryConfig)) {
        const duration = Date.now() - startTime;
        if (logErrors) {
          logResponse(method, endpoint, result, duration);
        }
        return result;
      }

      lastResult = result;
    }
  }

  // すべてのリトライが失敗した場合
  const duration = Date.now() - startTime;
  if (logErrors && lastResult) {
    logResponse(method, endpoint, lastResult, duration);
  }

  return lastResult || {
    ok: false,
    status: 0,
    data: null,
    error: "All retries failed",
  };
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

  // キューイングされた場合
  if (response.queued) {
    return "オフラインです。ネットワーク復帰後に自動的に送信されます。";
  }

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
