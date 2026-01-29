// tests/e2e/visual.spec.ts
import { test, expect } from "@playwright/test";

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
  test.setTimeout(30000); // 30秒のタイムアウト
  
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
    await page.goto("/mypage", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    
    // オンボーディング画面をスキップ
    const skipButton = page.getByText(/スキップ/i);
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
    
    await expect(page).toHaveScreenshot("mypage.png", {
      fullPage: true,
    });
  });
  
  test("チャレンジ一覧画面のスクリーンショット", async ({ page }) => {
    // チャレンジ一覧画面に移動
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    
    // オンボーディング画面をスキップ
    const skipButton = page.getByText(/スキップ/i);
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
    
    await expect(page).toHaveScreenshot("challenges.png", {
      fullPage: true,
    });
  });
});
