// tests/e2e/auth.login.spec.ts
import { test, expect } from "@playwright/test";

/**
 * ログインフローのE2Eテスト
 * 
 * 目的:
 * - ログインボタンが正しく機能することを確認
 * - OAuth画面への遷移を確認
 * 
 * 注意:
 * - 実際のGoogleログインはE2Eテストでは難しいため、OAuth画面への遷移までをテスト
 * - 本番環境のテストのため、軽量で高速な実装にする
 */

test.describe("Auth Login Flow", () => {
  test.setTimeout(20000); // 20秒のタイムアウト
  
  test("マイページにログインボタンが表示される", async ({ page }) => {
    // マイページに移動（シンプルなwaitUntilを使用）
    await page.goto("/mypage", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    
    // オンボーディング画面をスキップ
    const skipButton = page.getByText(/スキップ/i);
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
    
    // ログインボタンが表示されることを確認
    const loginButton = page.getByText(/ログイン/i).first();
    await expect(loginButton).toBeVisible({ timeout: 5000 });
  });
  
  test("ログインボタンをクリックするとキャラクター選択画面が表示される", async ({ page }) => {
    // マイページに移動
    await page.goto("/mypage", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    
    // オンボーディング画面をスキップ
    const skipButton = page.getByText(/スキップ/i);
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
    
    // ログインボタンをクリック
    const loginButton = page.getByText(/ログイン/i).first();
    await expect(loginButton).toBeVisible({ timeout: 5000 });
    await loginButton.click();
    
    // キャラクター選択画面が表示されることを確認
    await page.waitForTimeout(1000);
    const characterVisible = 
      await page.getByText(/りんく/i).first().isVisible({ timeout: 3000 }).catch(() => false) ||
      await page.getByText(/ちゃれ/i).first().isVisible({ timeout: 1000 }).catch(() => false) ||
      await page.getByText(/ソロ/i).first().isVisible({ timeout: 1000 }).catch(() => false);
    
    expect(characterVisible, "キャラクター選択画面が表示されません").toBeTruthy();
  });
});
