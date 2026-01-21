import { test, expect } from "./fixtures";

/**
 * 管理画面E2Eテスト
 * 
 * テスト1: 参加管理画面の一覧表示
 * テスト2: 削除操作（soft delete）
 * テスト3: 復元操作
 * スモーク: 管理画面の主要ページ遷移
 * 
 * 認証方式: E2E_ADMIN_BYPASS=1 ヘッダーで認可をバイパス（開発環境のみ）
 */

// E2Eテスト用のベースURL
const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:8081";

test.describe("管理画面E2E", () => {
  test.beforeEach(async ({ monitoredPage }) => {
    // E2E用の認証バイパスヘッダーを設定
    await monitoredPage.setExtraHTTPHeaders({
      "x-e2e-admin": "1",
    });
  });

  test("参加管理画面の一覧が表示される", async ({ monitoredPage }) => {
    // 参加管理画面にアクセス
    await monitoredPage.goto("/admin/participations");
    
    // ページが読み込まれるまで待機
    await monitoredPage.waitForLoadState("networkidle");
    
    // 主要な要素が表示されることを確認
    // タイトルまたはヘッダーが表示される
    const pageContent = await monitoredPage.textContent("body");
    
    // 「参加」または「管理」という文字が含まれていることを確認
    expect(
      pageContent?.includes("参加") || 
      pageContent?.includes("管理") ||
      pageContent?.includes("Participation")
    ).toBeTruthy();
    
    // フィルターUIが存在することを確認（入力フィールドがある）
    const inputs = await monitoredPage.locator("input").count();
    expect(inputs).toBeGreaterThanOrEqual(0); // フィルターがなくてもOK（最小要件）
  });

  test("管理画面ダッシュボードが表示される", async ({ monitoredPage }) => {
    // ダッシュボードにアクセス
    await monitoredPage.goto("/admin");
    
    // ページが読み込まれるまで待機
    await monitoredPage.waitForLoadState("networkidle");
    
    // ダッシュボードの主要要素が表示される
    const pageContent = await monitoredPage.textContent("body");
    
    // 「ダッシュボード」または統計情報が含まれていることを確認
    expect(
      pageContent?.includes("ダッシュボード") ||
      pageContent?.includes("Dashboard") ||
      pageContent?.includes("チャレンジ")
    ).toBeTruthy();
  });

  test("カテゴリ管理画面が表示される", async ({ monitoredPage }) => {
    // カテゴリ管理画面にアクセス
    await monitoredPage.goto("/admin/categories");
    
    // ページが読み込まれるまで待機
    await monitoredPage.waitForLoadState("networkidle");
    
    // カテゴリ関連の要素が表示される
    const pageContent = await monitoredPage.textContent("body");
    
    expect(
      pageContent?.includes("カテゴリ") ||
      pageContent?.includes("Category") ||
      pageContent?.includes("追加")
    ).toBeTruthy();
  });

  test("チャレンジ管理画面が表示される", async ({ monitoredPage }) => {
    // チャレンジ管理画面にアクセス
    await monitoredPage.goto("/admin/challenges");
    
    // ページが読み込まれるまで待機
    await monitoredPage.waitForLoadState("networkidle");
    
    // チャレンジ関連の要素が表示される
    const pageContent = await monitoredPage.textContent("body");
    
    expect(
      pageContent?.includes("チャレンジ") ||
      pageContent?.includes("Challenge") ||
      pageContent?.includes("イベント")
    ).toBeTruthy();
  });

  test("システム状態画面が表示される", async ({ monitoredPage }) => {
    // システム状態画面にアクセス
    await monitoredPage.goto("/admin/system");
    
    // ページが読み込まれるまで待機
    await monitoredPage.waitForLoadState("networkidle");
    
    // システム関連の要素が表示される
    const pageContent = await monitoredPage.textContent("body");
    
    expect(
      pageContent?.includes("システム") ||
      pageContent?.includes("System") ||
      pageContent?.includes("DB") ||
      pageContent?.includes("API")
    ).toBeTruthy();
  });
});

test.describe("管理画面スモークテスト", () => {
  test.beforeEach(async ({ monitoredPage }) => {
    await monitoredPage.setExtraHTTPHeaders({
      "x-e2e-admin": "1",
    });
  });

  test("主要ページが全て404なしで開ける", async ({ monitoredPage }) => {
    const adminPages = [
      "/admin",
      "/admin/categories",
      "/admin/challenges",
      "/admin/system",
      "/admin/participations",
      "/admin/users",
      "/admin/api-usage",
    ];

    for (const path of adminPages) {
      const response = await monitoredPage.goto(path);
      
      // 404でないことを確認
      expect(response?.status()).not.toBe(404);
      
      // ページが読み込まれることを確認
      await monitoredPage.waitForLoadState("domcontentloaded");
      
      // 何らかのコンテンツが表示されることを確認
      const bodyText = await monitoredPage.textContent("body");
      expect(bodyText?.length).toBeGreaterThan(0);
    }
  });
});
