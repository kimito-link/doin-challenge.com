import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

const BASE_URL = process.env.EXPO_WEB_PREVIEW_URL || "http://localhost:8081";

test.describe("Support Message", () => {
  test("should display support message form", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Look for support/cheer button
    const supportButton = page.locator("text=応援").or(page.locator("text=メッセージ"));
    
    if (await supportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await supportButton.click();
      await page.waitForTimeout(1000);
      
      // Verify message input is present
      await expect(
        page.locator("textarea").or(page.locator("input[type='text']"))
      ).toBeVisible({ timeout: 10000 });
    } else {
      // If not logged in, should show login prompt
      await expect(
        page.locator("text=ログイン").or(page.locator("text=サインイン"))
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should validate message length", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Try to find and click support button
    const supportButton = page.locator("text=応援").or(page.locator("text=メッセージ"));
    
    if (await supportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await supportButton.click();
      await page.waitForTimeout(1000);
      
      // Find message input
      const messageInput = page.locator("textarea").or(page.locator("input[type='text']")).first();
      
      if (await messageInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Try to submit empty message
        const submitButton = page.locator("text=送信").or(page.locator("text=投稿"));
        if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          // Should show validation error
          await expect(
            page.locator("text=入力してください").or(page.locator("text=必須"))
          ).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test("should display character count", async ({ page }) => {
    await gotoAndWait(page, BASE_URL);

    // Try to find and click support button
    const supportButton = page.locator("text=応援").or(page.locator("text=メッセージ"));
    
    if (await supportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await supportButton.click();
      await page.waitForTimeout(1000);
      
      // Find message input
      const messageInput = page.locator("textarea").or(page.locator("input[type='text']")).first();
      
      if (await messageInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Type a message
        await messageInput.fill("頑張ってください！");
        await page.waitForTimeout(500);
        
        // Should display character count (e.g., "9 / 100")
        await expect(
          page.locator("text=/\\d+\\s*\\/\\s*\\d+/")
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });
});
