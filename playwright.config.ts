import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Test Configuration
 * 
 * 管理画面の回帰テスト用設定
 * - console.error / 4xx-5xx / pageerror の自動検出
 * - 失敗時のtrace + screenshot + requestId保存
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  
  use: {
    // ベースURL（開発サーバー）
    baseURL: process.env.E2E_BASE_URL || "http://localhost:8081",
    
    // トレース設定（失敗時のみ保存）
    trace: "on-first-retry",
    
    // スクリーンショット設定（失敗時のみ保存）
    screenshot: "only-on-failure",
    
    // ビデオ設定（失敗時のみ保存）
    video: "on-first-retry",
    
    // タイムアウト設定
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // テスト全体のタイムアウト
  timeout: 60000,

  // 出力ディレクトリ
  outputDir: "test-results",

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // 開発サーバーの起動設定（CIでは事前に起動済みを想定）
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm dev:metro",
        url: "http://localhost:8081",
        reuseExistingServer: true,
        timeout: 120000,
      },
});
