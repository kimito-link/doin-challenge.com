/**
 * パフォーマンスユーティリティのテスト
 */
import { describe, it, expect, vi } from 'vitest';
import { debounce, throttle, memoize, batchProcess } from '../lib/performance';

describe('Performance Utilities', () => {
  describe('debounce', () => {
    it('連続した呼び出しを遅延させる', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('一定時間内に1回のみ実行', async () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => setTimeout(resolve, 150));
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoize', () => {
    it('同じ引数で呼ばれた場合はキャッシュを返す', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);

      expect(memoized(10)).toBe(20);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('batchProcess', () => {
    it('配列をバッチ処理する', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const processor = async (item: number) => item * 2;

      const results = await batchProcess(items, processor, 3);

      expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    });
  });
});
