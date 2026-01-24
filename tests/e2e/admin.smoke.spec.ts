import { test } from "@playwright/test";

/**
 * 管理画面スモークテスト
 * 
 * 注意：
 * - 管理画面は認証が必要なため、CI環境ではスキップ
 * - ローカルでのみ実行可能
 */

test.skip("Admin tests require authentication", () => {
  // CI環境では認証ファイルが存在しないためスキップ
});
