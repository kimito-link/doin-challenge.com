/**
 * パフォーマンス最適化ユーティリティ
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * デバウンス: 連続した呼び出しを遅延させて最後の呼び出しのみ実行
 * 検索入力などで使用
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * スロットル: 一定時間内に1回のみ実行
 * スクロールイベントなどで使用
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * デバウンスフック
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * スロットルフック
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef<T | null>(null);

  useEffect(() => {
    throttledCallback.current = throttle(callback, delay) as T;
  }, [callback, delay]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (throttledCallback.current) {
        throttledCallback.current(...args);
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * 遅延ローディング: コンポーネントの表示を遅延
 */
export function useLazyLoad(delay: number = 100): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isReady;
}

/**
 * メモ化された値を返す（useMemoの簡易版）
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * パフォーマンス測定
 */
export function measurePerformance(label: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
}

/**
 * 非同期パフォーマンス測定
 */
export async function measurePerformanceAsync(
  label: string,
  fn: () => Promise<void>
) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
}

/**
 * バッチ処理: 配列を分割して処理
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}
