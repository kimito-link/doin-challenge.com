import { test, expect } from "./fixtures";

/**
 * 管理画面スモークテスト（強化版）
 * 
 * 目的：
 * - リンク切れ / 404 / 画面クラッシュを最短で検知
 * - 各ページの必須要素（mustSee）で誤検知を防止
 * 
 * 認証：x-e2e-admin: 1 ヘッダーでバイパス（開発環境のみ）
 */

type SmokeCase = {
  path: string;
  name: string;
  // そのページで必ず見えるはずの要素を1個だけ指定
  mustSee?: { by: "text" | "testid" | "css"; value: string };
};

/**
 * 管理画面の全ルート一覧
 * expo-routerのファイル構成から機械的に抽出
 */
const ADMIN_ROUTES: SmokeCase[] = [
  { 
    path: "/admin", 
    name: "ダッシュボード",
    mustSee: { by: "text", value: "ダッシュボード" }
  },
  { 
    path: "/admin/categories", 
    name: "カテゴリ管理",
    mustSee: { by: "text", value: "カテゴリ" }
  },
  { 
    path: "/admin/challenges", 
    name: "チャレンジ管理",
    mustSee: { by: "text", value: "チャレンジ" }
  },
  { 
    path: "/admin/participations", 
    name: "参加管理",
    mustSee: { by: "text", value: "参加" }
  },
  { 
    path: "/admin/users", 
    name: "ユーザー管理",
    mustSee: { by: "text", value: "ユーザー" }
  },
  { 
    path: "/admin/system", 
    name: "システム状態",
    mustSee: { by: "text", value: "システム" }
  },
  { 
    path: "/admin/api-usage", 
    name: "API使用量",
    mustSee: { by: "text", value: "API" }
  },
  { 
    path: "/admin/errors", 
    name: "エラーログ",
    mustSee: { by: "text", value: "エラー" }
  },
  { 
    path: "/admin/data-integrity", 
    name: "データ整合性",
    mustSee: { by: "text", value: "整合性" }
  },
  { 
    path: "/admin/components", 
    name: "コンポーネントギャラリー",
    mustSee: { by: "text", value: "コンポーネント" }
  },
];

function locatorFor(page: any, mustSee: SmokeCase["mustSee"]) {
  if (!mustSee) return null;
  if (mustSee.by === "text") return page.getByText(new RegExp(mustSee.value, "i"));
  if (mustSee.by === "testid") return page.getByTestId(mustSee.value);
  return page.locator(mustSee.value);
}

test.describe("管理画面スモーク巡回", () => {
  test.beforeEach(async ({ monitoredPage }) => {
    // E2E用の認証バイパスヘッダーを設定
    await monitoredPage.setExtraHTTPHeaders({
      "x-e2e-admin": "1",
    });
  });

  for (const route of ADMIN_ROUTES) {
    test(`smoke: ${route.name} (${route.path})`, async ({ monitoredPage }) => {
      // ページにアクセス
      const res = await monitoredPage.goto(route.path, { waitUntil: "domcontentloaded" });

      // 1) HTTP 4xx/5xx を弾く
      if (res) {
        expect(res.status(), `HTTP status for ${route.path}`).toBeLessThan(400);
      }

      // 2) 明確な 404 表示を弾く
      await expect(
        monitoredPage.getByText(/not found|404|ページが見つかりません/i)
      ).toHaveCount(0);

      // 3) 必須要素が表示されることを確認
      const must = locatorFor(monitoredPage, route.mustSee);
      if (must) {
        await expect(must, `mustSee "${route.mustSee?.value}" not found on ${route.path}`).toBeVisible({ timeout: 10000 });
      } else {
        // mustSeeがない場合はbodyが表示されることを確認
        await expect(monitoredPage.locator("body")).toBeVisible();
      }

      // 4) 画面が真っ白でないことを確認（何らかのレイアウトがある）
      const hasSomeLayout =
        (await monitoredPage.locator("main").count()) > 0 ||
        (await monitoredPage.locator("h1, h2").count()) > 0 ||
        (await monitoredPage.locator("[role='heading']").count()) > 0 ||
        (await monitoredPage.locator("div").count()) > 5;

      expect(hasSomeLayout, `Layout not found on ${route.path}`).toBeTruthy();
    });
  }
});

test.describe("管理画面一括巡回", () => {
  test.beforeEach(async ({ monitoredPage }) => {
    await monitoredPage.setExtraHTTPHeaders({
      "x-e2e-admin": "1",
    });
  });

  test("全ページが404なしで連続アクセス可能", async ({ monitoredPage }) => {
    const failedPages: string[] = [];

    for (const route of ADMIN_ROUTES) {
      try {
        const res = await monitoredPage.goto(route.path, { waitUntil: "domcontentloaded", timeout: 15000 });
        
        if (res && res.status() >= 400) {
          failedPages.push(`${route.path}: HTTP ${res.status()}`);
        }
      } catch (error) {
        failedPages.push(`${route.path}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    expect(failedPages, `Failed pages:\n${failedPages.join("\n")}`).toHaveLength(0);
  });
});
