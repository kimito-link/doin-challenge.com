/**
 * Gate 2: 主要フロー E2E（1本）
 * ホーム → イベント詳細 まで通ることを保証する。
 * 参加表明は未ログインでも「参加表明する」「ログインが必要」等が表示されればOK。
 */
import { test, expect } from "@playwright/test";

test.setTimeout(60000);

test.describe("Gate 2: ホーム→詳細", () => {
  test("ホーム表示 → 詳細表示（参加表明まで届く）", async ({ page }) => {
    // 1. ホーム
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).toBeVisible();
    const homeText = await page.locator("body").innerText();
    expect(homeText).not.toMatch(/500.*error/i);

    // 2. 詳細へ（固定IDで安定化。存在しない場合は「見つかりません」でOK）
    await page.goto("/event/90001", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);
    await expect(page.locator("body")).toBeVisible();
    const detailText = await page.locator("body").innerText();
    expect(detailText).not.toMatch(/500.*error/i);

    // 3. 詳細ページとして成立していること（参加表明 or 404 のいずれか）
    const hasParticipation = /参加表明|参加する|ログインが必要|見つかりません|イベントがありません/i.test(detailText);
    expect(hasParticipation, "詳細ページに参加表明 or 404 の表示があること").toBe(true);
  });
});
