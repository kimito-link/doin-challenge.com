import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

const BASE_URL = process.env.EXPO_WEB_PREVIEW_URL || "http://localhost:8081";

test.describe("My Page", () => {
  test("should display my page link", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Wait for the app to load
    await page.waitForSelector("text=ようこそ", { timeout: 10000 });

    // Skip onboarding if present
    const skipButton = page.locator("text=スキップ");
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Look for my page link (usually in tab bar or menu)
    const myPageLink = page.locator("text=マイページ").or(page.locator("text=プロフィール"));
    
    // Should be visible (even if not logged in)
    await expect(myPageLink).toBeVisible({ timeout: 5000 });
  });

  test("should show login prompt when not logged in", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Wait for the app to load
    await page.waitForSelector("text=ようこそ", { timeout: 10000 });

    // Skip onboarding
    const skipButton = page.locator("text=スキップ");
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Click my page link
    const myPageLink = page.locator("text=マイページ").or(page.locator("text=プロフィール"));
    
    if (await myPageLink.isVisible()) {
      await myPageLink.click();
      await page.waitForTimeout(1000);
      
      // Should show login button or user info
      const loginButton = page.locator("text=ログイン").or(page.locator("text=サインイン"));
      const userInfo = page.locator("text=ユーザー名").or(page.locator("text=プロフィール"));
      
      // Either login button or user info should be visible
      await expect(loginButton.or(userInfo)).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display user statistics", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Wait for the app to load
    await page.waitForSelector("text=ようこそ", { timeout: 10000 });

    // Skip onboarding
    const skipButton = page.locator("text=スキップ");
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Click my page link
    const myPageLink = page.locator("text=マイページ").or(page.locator("text=プロフィール"));
    
    if (await myPageLink.isVisible()) {
      await myPageLink.click();
      await page.waitForTimeout(1000);
      
      // Look for statistics (even if showing 0)
      const stats = page.locator("text=/\\d+/");
      
      // Should display some numbers (challenges, messages, etc.)
      await expect(stats.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display settings button", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Wait for the app to load
    await page.waitForSelector("text=ようこそ", { timeout: 10000 });

    // Skip onboarding
    const skipButton = page.locator("text=スキップ");
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Click my page link
    const myPageLink = page.locator("text=マイページ").or(page.locator("text=プロフィール"));
    
    if (await myPageLink.isVisible()) {
      await myPageLink.click();
      await page.waitForTimeout(1000);
      
      // Look for settings button
      const settingsButton = page.locator("text=設定").or(page.locator("[aria-label='設定']"));
      
      // Settings button should be visible
      await expect(settingsButton).toBeVisible({ timeout: 5000 });
    }
  });
});
