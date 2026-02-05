/**
 * Admin Password Authentication
 * 管理者パスワード認証（サーバー側）
 */

import { ENV } from "./_core/env";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pass304130";

/**
 * パスワードが正しいかチェック
 */
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * 管理者パスワードを取得（環境変数から）
 */
export function getAdminPassword(): string {
  return ADMIN_PASSWORD;
}
