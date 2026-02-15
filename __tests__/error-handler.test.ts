/**
 * エラーハンドラーのテスト
 */
import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../lib/error-handler';

describe('Error Handler', () => {
  describe('getErrorMessage', () => {
    it('文字列エラーをそのまま返す', () => {
      expect(getErrorMessage('テストエラー')).toBe('テストエラー');
    });

    it('ネットワークエラーを適切に変換', () => {
      const error = new Error('Network request failed');
      expect(getErrorMessage(error)).toContain('ネットワーク接続');
    });

    it('タイムアウトエラーを適切に変換', () => {
      const error = new Error('Request timeout');
      expect(getErrorMessage(error)).toContain('タイムアウト');
    });

    it('認証エラーを適切に変換', () => {
      const error = new Error('Unauthorized');
      expect(getErrorMessage(error)).toContain('ログインセッション');
    });

    it('権限エラーを適切に変換', () => {
      const error = new Error('Forbidden');
      expect(getErrorMessage(error)).toContain('権限');
    });

    it('サーバーエラーを適切に変換', () => {
      const error = new Error('500 Internal Server Error');
      expect(getErrorMessage(error)).toContain('サーバーエラー');
    });

    it('未知のエラーを適切に処理', () => {
      expect(getErrorMessage(null)).toBe('予期しないエラーが発生しました。');
    });
  });
});
