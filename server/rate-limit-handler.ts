/**
 * Twitter API レート制限対応ユーティリティ
 * 
 * 指数バックオフによるリトライ機能を提供
 * ドキュメント参照: Twitter (X) API OAuth 2.0 認証 実装ガイド
 */

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
};

/**
 * レスポンスヘッダーからレート制限情報を抽出
 */
export function extractRateLimitInfo(headers: Headers): RateLimitInfo | null {
  const limit = headers.get("x-rate-limit-limit");
  const remaining = headers.get("x-rate-limit-remaining");
  const reset = headers.get("x-rate-limit-reset");

  if (!limit || !remaining || !reset) {
    return null;
  }

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10),
  };
}

/**
 * レート制限リセットまでの待機時間を計算（ミリ秒）
 */
export function calculateWaitTime(resetTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000);
  const waitSeconds = Math.max(0, resetTimestamp - now + 1); // 1秒のバッファを追加
  return waitSeconds * 1000;
}

/**
 * 指数バックオフによる待機時間を計算
 */
export function calculateExponentialBackoff(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number
): number {
  const delay = initialDelayMs * Math.pow(2, attempt);
  // ジッター（ランダムな揺らぎ）を追加して同時リトライを防ぐ
  const jitter = Math.random() * 0.3 * delay;
  return Math.min(delay + jitter, maxDelayMs);
}

/**
 * 指定時間待機
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 指数バックオフ付きでAPIリクエストを実行
 * 
 * @param requestFn - 実行するリクエスト関数
 * @param options - リトライオプション
 * @returns レスポンス
 */
export async function withExponentialBackoff<T>(
  requestFn: () => Promise<Response>,
  options: RetryOptions = {}
): Promise<{ response: Response; data: T; rateLimitInfo: RateLimitInfo | null }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      const response = await requestFn();
      const rateLimitInfo = extractRateLimitInfo(response.headers);

      // レート制限に近づいている場合は警告ログ
      if (rateLimitInfo && rateLimitInfo.remaining < 10) {
        console.warn(
          `[RateLimit] Warning: Only ${rateLimitInfo.remaining}/${rateLimitInfo.limit} requests remaining. ` +
          `Resets at ${new Date(rateLimitInfo.reset * 1000).toISOString()}`
        );
      }

      // 429 Too Many Requests
      if (response.status === 429) {
        let waitTime: number;

        if (rateLimitInfo) {
          // レート制限リセット時刻まで待機
          waitTime = calculateWaitTime(rateLimitInfo.reset);
          console.log(
            `[RateLimit] Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)}s until reset...`
          );
        } else {
          // ヘッダーがない場合は指数バックオフ
          waitTime = calculateExponentialBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);
          console.log(
            `[RateLimit] Rate limit exceeded. Exponential backoff: waiting ${Math.ceil(waitTime / 1000)}s...`
          );
        }

        await sleep(waitTime);
        continue; // リトライ
      }

      // 5xx サーバーエラー
      if (response.status >= 500) {
        const waitTime = calculateExponentialBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);
        console.log(
          `[RateLimit] Server error (${response.status}). Exponential backoff: waiting ${Math.ceil(waitTime / 1000)}s...`
        );
        await sleep(waitTime);
        continue; // リトライ
      }

      // 成功またはクライアントエラー（4xx、429以外）
      const data = await response.json() as T;
      return { response, data, rateLimitInfo };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // ネットワークエラーの場合はリトライ
      if (attempt < opts.maxRetries - 1) {
        const waitTime = calculateExponentialBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);
        console.log(
          `[RateLimit] Network error: ${lastError.message}. Retrying in ${Math.ceil(waitTime / 1000)}s...`
        );
        await sleep(waitTime);
        continue;
      }
    }
  }

  throw new Error(
    `Failed after ${opts.maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Twitter API用のfetchラッパー
 * レート制限対応と指数バックオフを自動適用
 */
export async function twitterApiFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<{ data: T; rateLimitInfo: RateLimitInfo | null }> {
  const result = await withExponentialBackoff<T>(
    () => fetch(url, options),
    retryOptions
  );

  if (!result.response.ok && result.response.status !== 429) {
    const errorText = JSON.stringify(result.data);
    throw new Error(`Twitter API error (${result.response.status}): ${errorText}`);
  }

  return {
    data: result.data,
    rateLimitInfo: result.rateLimitInfo,
  };
}

/**
 * レート制限の残り回数をチェックし、必要に応じて待機
 */
export async function waitIfRateLimited(rateLimitInfo: RateLimitInfo | null): Promise<void> {
  if (!rateLimitInfo) return;

  // 残り回数が5以下の場合は予防的に待機
  if (rateLimitInfo.remaining <= 5) {
    const waitTime = calculateWaitTime(rateLimitInfo.reset);
    console.log(
      `[RateLimit] Preemptive wait: Only ${rateLimitInfo.remaining} requests remaining. ` +
      `Waiting ${Math.ceil(waitTime / 1000)}s...`
    );
    await sleep(waitTime);
  }
}
