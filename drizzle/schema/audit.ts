/**
 * Audit Log Schema
 * 
 * 監査ログテーブル定義
 * 
 * v6.41: 監査ログ機能追加
 * - 全ての重要な操作（EDIT/DELETE/RESTORE/BULK_DELETE）を記録
 * - requestIdで追跡可能
 * - before/afterでデータ変更を記録
 */

import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, json } from "drizzle-orm/mysql-core";

// =============================================================================
// Audit Logs Table
// =============================================================================

/**
 * 監査ログテーブル
 * 
 * 重要な操作を記録し、問題発生時の追跡を可能にする
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // リクエスト追跡用ID（tRPC middlewareで生成）
  requestId: varchar("requestId", { length: 36 }).notNull(),
  
  // 操作種別
  action: mysqlEnum("action", [
    "CREATE",
    "EDIT",
    "DELETE",
    "RESTORE",
    "BULK_DELETE",
    "BULK_RESTORE",
    "LOGIN",
    "LOGOUT",
    "ADMIN_ACTION",
  ]).notNull(),
  
  // 操作対象のエンティティ種別
  entityType: varchar("entityType", { length: 64 }).notNull(),
  
  // 操作対象のID
  targetId: int("targetId"),
  
  // 操作を実行したユーザーID
  actorId: int("actorId"),
  
  // 操作を実行したユーザー名（ログイン名のスナップショット）
  actorName: varchar("actorName", { length: 255 }),
  
  // 操作を実行したユーザーのロール
  actorRole: varchar("actorRole", { length: 32 }),
  
  // 変更前のデータ（JSON）
  beforeData: json("beforeData").$type<Record<string, unknown> | null>(),
  
  // 変更後のデータ（JSON）
  afterData: json("afterData").$type<Record<string, unknown> | null>(),
  
  // 操作の詳細・理由（任意）
  reason: text("reason"),
  
  // クライアント情報
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  // タイムスタンプ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// =============================================================================
// 監査ログのアクション定数
// =============================================================================

export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  EDIT: "EDIT",
  DELETE: "DELETE",
  RESTORE: "RESTORE",
  BULK_DELETE: "BULK_DELETE",
  BULK_RESTORE: "BULK_RESTORE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  ADMIN_ACTION: "ADMIN_ACTION",
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// =============================================================================
// エンティティ種別定数
// =============================================================================

export const ENTITY_TYPES = {
  PARTICIPATION: "participation",
  CHALLENGE: "challenge",
  USER: "user",
  CHEER: "cheer",
  COMMENT: "comment",
  INVITATION: "invitation",
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];
