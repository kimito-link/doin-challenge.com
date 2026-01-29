import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

const BASE_URL = process.env.EXPO_WEB_PREVIEW_URL || "http://localhost:8081";

test.describe("Challenge Creation", () => {
  test("should display challenge creation form", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Wait for the app to load
    await page.waitForSelector("text=ようこそ", { timeout: 10000 });

    // Skip onboarding if present
    const skipButton = page.locator("text=スキップ");
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Look for challenge creation button or link
    // This might be in a menu or on the home screen
    const createButton = page.locator("text=チャレンジを作成").or(page.locator("text=新規作成"));
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Verify form elements are present
      await expect(page.locator("text=タイトル").or(page.locator("text=目標"))).toBeVisible();
    } else {
      // If not logged in, should show login prompt
      await expect(
        page.locator("text=ログイン").or(page.locator("text=サインイン"))
      ).toBeVisible();
    }
  });

  test("should validate required fields", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Wait for the app to load
    await page.waitForSelector("text=ようこそ", { timeout: 10000 });

    // Skip onboarding
    const skipButton = page.locator("text=スキップ");
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Try to find and click create button
    const createButton = page.locator("text=チャレンジを作成").or(page.locator("text=新規作成"));
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Try to submit without filling required fields
      const submitButton = page.locator("text=作成").or(page.locator("text=保存"));
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show validation error
        await expect(
          page.locator("text=入力してください").or(page.locator("text=必須"))
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
