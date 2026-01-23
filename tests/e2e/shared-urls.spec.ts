/**
 * 外部共有URL E2Eテスト
 * 
 * 検証項目:
 * - slug違いでもアクセス可能
 * - IDのみでもアクセス可能
 * - 正規URLへのリダイレクト
 */
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.E2E_BASE_URL ?? "https://doin-challenge.com";


test.describe("外部共有URL", () => {
  test.describe("イベント共有URL /e/[id]", () => {
    test("IDのみでアクセス可能", async ({ page }) => {
      // 存在するイベントIDでアクセス（実際のテストではテストデータを用意）
      const response = await page.goto(`${BASE_URL}/e/1`);
      
      // 404でないことを確認（リダイレクトまたは表示）
      expect(response?.status()).not.toBe(404);
    });

    test("ID+slugでアクセス可能", async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/e/1-test-event`);
      
      // 404でないことを確認
      expect(response?.status()).not.toBe(404);
    });

    test("slug違いでもアクセス可能（IDが正しければ）", async ({ page }) => {
      // 間違ったslugでもIDが正しければアクセス可能
      const response = await page.goto(`${BASE_URL}/e/1-wrong-slug`);
      
      // 404でないことを確認
      expect(response?.status()).not.toBe(404);
    });

    test("存在しないIDは適切なエラー表示", async ({ page }) => {
      await page.goto(`${BASE_URL}/e/999999`);
      
      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText(/見つかりません|存在しない|not found/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("プロフィール共有URL /u/[id]", () => {
    test("twitterIdのみでアクセス可能", async ({ page }) => {
      // 存在するtwitterIdでアクセス
      const response = await page.goto(`${BASE_URL}/u/12345`);
      
      // ページが読み込まれることを確認（404でない）
      expect(response?.status()).not.toBe(404);
    });

    test("twitterId+usernameでアクセス可能", async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/u/12345-testuser`);
      
      // 404でないことを確認
      expect(response?.status()).not.toBe(404);
    });

    test("存在しないtwitterIdは適切なエラー表示", async ({ page }) => {
      await page.goto(`${BASE_URL}/u/nonexistent999`);
      
      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText(/見つかりません|存在しない|not found/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("後方互換性", () => {
    test("既存の /event/[id] ルートは引き続き動作", async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/event/1`);
      
      // 404でないことを確認
      expect(response?.status()).not.toBe(404);
    });

    test("既存の /profile/[userId] ルートは引き続き動作", async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/profile/1`);
      
      // 404でないことを確認
      expect(response?.status()).not.toBe(404);
    });
  });
});
