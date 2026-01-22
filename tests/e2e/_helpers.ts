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

// 無視するコンソールエラーのパターン（未ログイン状態では正常な動作）
const IGNORED_CONSOLE_ERRORS = [
  /Not authenticated/i,
  /401/,
  /getMe failed/i,
  /\[API\] Error response.*Not authenticated/i,
  /\[API\] Request failed.*Not authenticated/i,
  /\[API\] getMe failed/i,
  /Failed to load resource.*401/i,
];

// 無視するコンソール警告のパターン
const IGNORED_CONSOLE_WARNS = [
  /React does not recognize/i,
  /componentWillReceiveProps/i,
  /componentWillMount/i,
  /findDOMNode is deprecated/i,
  /Each child in a list should have a unique/i,
  /useNativeDriver/i, // React Native Webでは正常な警告
  /native animated module is missing/i,
  /RCTAnimation/i,
];

function shouldIgnoreError(text: string): boolean {
  return IGNORED_CONSOLE_ERRORS.some(pattern => pattern.test(text));
}

function shouldIgnoreWarn(text: string): boolean {
  return IGNORED_CONSOLE_WARNS.some(pattern => pattern.test(text));
}

export async function attachGuards(page: Page, testInfo: TestInfo) {
  const consoleErrors: string[] = [];
  const consoleWarns: string[] = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error" && !shouldIgnoreError(text)) {
      consoleErrors.push(text);
    }
    if (type === "warning" && !shouldIgnoreWarn(text)) {
      consoleWarns.push(text);
    }
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

    // console errors/warns（無視パターンを除外済み）
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
  await page.goto(path, { waitUntil: "networkidle" });
  // 画面が落ち着くまで待つ（Expo Webの初期レンダ対策）
  await page.waitForTimeout(2000);
  
  // 初回訪問時のオンボーディング画面をスキップ
  await dismissOnboarding(page);
}

/**
 * 初回訪問時のオンボーディング画面をスキップ
 * 「スキップ」ボタンがあればクリック
 */
async function dismissOnboarding(page: Page) {
  try {
    // 「スキップ」ボタンを探す
    const skipButton = page.getByText(/スキップ/i);
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
      return;
    }
    
    // 「あとで見る」ボタンを探す（別のモーダル用）
    const laterButton = page.getByText(/あとで見る/i);
    if (await laterButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await laterButton.click();
      await page.waitForTimeout(500);
      return;
    }
  } catch {
    // オンボーディングがない場合は何もしない
  }
}

// "開けた"の判定を安定させるため、見出し候補を待つヘルパ
export async function expectAnyHeading(page: Page, candidates: RegExp[]) {
  // 再度オンボーディングをスキップする試行
  await dismissOnboarding(page);
  
  // どれか1つが見つかればOK
  for (const re of candidates) {
    const loc = page.getByText(re, { exact: false });
    if (await loc.first().isVisible({ timeout: 3000 }).catch(() => false)) return;
  }
  
  // ページ全体のテキストを取得してデバッグ
  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("Page text:", bodyText.substring(0, 500));
  
  // どれも見つからない場合：デバッグ用にスクショはPlaywrightが自動保存
  expect(false, `見出し候補が見つかりません: ${candidates.map(String).join(", ")}`).toBeTruthy();
}
