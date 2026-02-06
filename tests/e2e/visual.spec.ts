// tests/e2e/visual.spec.ts
import { test, expect } from "@playwright/test";
import { dismissOnboarding } from "./_helpers";

/**
 * Visual Regression Testing
 * 
 * 目的:
 * - 主要な画面のスクリーンショットを撮影し、ベースラインと比較
 * - 意図しない視覚的変更を検出
 * 
 * 使い方:
 * 1. 初回実行: `pnpm exec playwright test tests/e2e/visual.spec.ts --update-snapshots`
 * 2. 以降の実行: `pnpm exec playwright test tests/e2e/visual.spec.ts`
 */

test.describe("Visual Regression Tests", () => {
  test.setTimeout(60000); // 60秒のタイムアウト
  
  test("オンボーディング画面のスクリーンショット", async ({ page }) => {
    // オンボーディング画面に移動
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    
    // バージョン表示が含まれるため、それを除外してスクリーンショット
    await expect(page).toHaveScreenshot("onboarding.png", {
      fullPage: true,
      mask: [page.locator('text=/v\\d+\\.\\d+/')], // バージョン表示をマスク
    });
  });
  
  test("マイページのスクリーンショット", async ({ page }) => {
    // マイページに移動
    await page.goto("/mypage", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // オンボーディング画面をスキップ
    await dismissOnboarding(page);
    
    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot("mypage.png", {
      fullPage: true,
    });
  });
  
  test("チャレンジ一覧画面のスクリーンショット", async ({ page }) => {
    // チャレンジ一覧画面に移動
    await page.goto("/", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // オンボーディング画面をスキップ
    await dismissOnboarding(page);
    
    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot("challenges.png", {
      fullPage: true,
    });
  });
});
