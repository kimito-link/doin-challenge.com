// tests/e2e/login-ux.spec.ts
import { test, expect } from "@playwright/test";
import { attachGuards, gotoAndWait } from "./_helpers";

/**
 * ログインUX（Phase 2）のE2Eテスト
 * 
 * URLパラメータを使って、キャンセル/エラー画面の表示を検証
 * 実際のOAuthフローは通さず、UI分岐のみをテスト
 */
test.describe("Login UX (Phase 2)", () => {
  test("キャンセル画面が表示される", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    
    // キャンセルパラメータ付きでアクセス
    await gotoAndWait(page, "/oauth/callback?error=access_denied");

    // キャンセル画面のタイトルが表示される
    await expect(page.locator("text=ログインをキャンセルしました")).toBeVisible();
    
    // りんく吹き出しが表示される
    await expect(page.locator("text=またいつでもログインできるから、安心してね！")).toBeVisible();
    
    // 戻るボタンが表示される
    await expect(page.locator("text=戻る")).toBeVisible();

    await assertNoErrors();
  });

  test("ネットワークエラー画面が表示される", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    
    // ネットワークエラーパラメータ付きでアクセス
    await gotoAndWait(page, "/oauth/callback?error=network_error");

    // エラー画面のタイトルが表示される
    await expect(page.locator("text=ログインできませんでした")).toBeVisible();
    
    // りんく吹き出し（ネットワークエラー）が表示される
    await expect(page.locator("text=/通信がうまくいかなかったみたい/")).toBeVisible();
    
    // もう一度試すボタンが表示される
    await expect(page.locator("text=もう一度試す")).toBeVisible();
    
    // 戻るボタンが表示される
    await expect(page.locator("text=戻る")).toBeVisible();

    await assertNoErrors();
  });

  test("OAuthエラー画面が表示される", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    
    // OAuthエラーパラメータ付きでアクセス
    await gotoAndWait(page, "/oauth/callback?error=oauth_error");

    // エラー画面のタイトルが表示される
    await expect(page.locator("text=ログインできませんでした")).toBeVisible();
    
    // りんく吹き出し（OAuthエラー）が表示される
    await expect(page.locator("text=/X側でエラーが起きたみたい/")).toBeVisible();
    
    // もう一度試すボタンが表示される
    await expect(page.locator("text=もう一度試す")).toBeVisible();

    await assertNoErrors();
  });

  test("その他エラー画面が表示される", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    
    // その他エラーパラメータ付きでアクセス
    await gotoAndWait(page, "/oauth/callback?error=unknown_error");

    // エラー画面のタイトルが表示される
    await expect(page.locator("text=ログインできませんでした")).toBeVisible();
    
    // りんく吹き出し（その他エラー）が表示される
    await expect(page.locator("text=/予期しないエラーが起きちゃった/")).toBeVisible();
    
    // もう一度試すボタンが表示される
    await expect(page.locator("text=もう一度試す")).toBeVisible();

    await assertNoErrors();
  });
});
