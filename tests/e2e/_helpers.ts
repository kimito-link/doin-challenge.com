// tests/e2e/_helpers.ts
import { expect, Page, TestInfo } from "@playwright/test";

const ERROR_TEXT_PATTERNS = [
  /イベントが見つかりません/i,
  /見つかりません/i,
  /問題が発生/i,
  /エラー/i,
  /Unauthorized/i,
  /Forbidden/i,
];

export async function attachGuards(page: Page, testInfo: TestInfo) {
  const consoleErrors: string[] = [];
  const consoleWarns: string[] = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") consoleErrors.push(text);
    if (type === "warning") consoleWarns.push(text);
  });

  // requestId を拾える範囲で拾う（ヘッダー優先）
  const requestIds = new Set<string>();
  page.on("response", async (res) => {
    const rid =
      res.headers()["x-request-id"] ||
      res.headers()["x-requestid"] ||
      res.headers()["request-id"] ||
      res.headers()["x-vercel-id"];
    if (rid) requestIds.add(rid);
  });

  // 各テストの最後にまとめてチェックするためのフックを返す
  return async function assertNoErrors() {
    // 画面内の「エラーっぽい文言」をチェック（軽く全体テキストを見る）
    const bodyText = await page.locator("body").innerText().catch(() => "");
    for (const pat of ERROR_TEXT_PATTERNS) {
      expect(bodyText, `画面にエラー文言が出ています: ${pat}`).not.toMatch(pat);
    }

    // console errors/warns
    expect(consoleErrors, `console.error が出ています:\n${consoleErrors.join("\n")}`).toEqual([]);
    expect(consoleWarns, `console.warn が出ています:\n${consoleWarns.join("\n")}`).toEqual([]);

    // 参考情報として requestId を添付（failしない）
    const ridList = Array.from(requestIds);
    if (ridList.length) {
      await testInfo.attach("requestIds", {
        body: ridList.join("\n"),
        contentType: "text/plain",
      });
    }
  };
}

export async function gotoAndWait(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  // 画面が落ち着くまでほんの少し待つ（Expo Webの初期レンダ対策）
  await page.waitForTimeout(300);
}

// "開けた"の判定を安定させるため、見出し候補を待つヘルパ
export async function expectAnyHeading(page: Page, candidates: RegExp[]) {
  // どれか1つが見つかればOK
  for (const re of candidates) {
    const loc = page.getByText(re, { exact: false });
    if (await loc.first().isVisible().catch(() => false)) return;
  }
  // どれも見つからない場合：デバッグ用にスクショはPlaywrightが自動保存
  expect(false, `見出し候補が見つかりません: ${candidates.map(String).join(", ")}`).toBeTruthy();
}
