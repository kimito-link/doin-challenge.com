/**
 * Audit Log Schema
 *
 * 監査ログテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";

const auditActionEnum = pgEnum("audit_action", [
  "CREATE", "EDIT", "DELETE", "RESTORE", "BULK_DELETE", "BULK_RESTORE", "LOGIN", "LOGOUT", "ADMIN_ACTION",
]);

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  requestId: varchar("requestId", { length: 36 }).notNull(),
  action: auditActionEnum("action").notNull(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  targetId: integer("targetId"),
  actorId: integer("actorId"),
  actorName: varchar("actorName", { length: 255 }),
  actorRole: varchar("actorRole", { length: 32 }),
  beforeData: jsonb("beforeData").$type<Record<string, unknown> | null>(),
  afterData: jsonb("afterData").$type<Record<string, unknown> | null>(),
  reason: text("reason"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

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

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const ENTITY_TYPES = {
  PARTICIPATION: "participation",
  CHALLENGE: "challenge",
  USER: "user",
  CHEER: "cheer",
  COMMENT: "comment",
  INVITATION: "invitation",
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];
