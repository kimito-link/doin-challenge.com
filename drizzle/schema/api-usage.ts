/**
 * API Usage Tracking Schema
 *
 * X API（旧Twitter API）の使用量とコストを追跡するテーブル
 */

import { pgTable, serial, integer, varchar, timestamp, numeric, jsonb, index } from "drizzle-orm/pg-core";

// =============================================================================
// API Usage Table
// =============================================================================

/**
 * API呼び出し記録テーブル
 */
export const apiUsage = pgTable(
  "api_usage",
  {
    id: serial("id").primaryKey(),
    endpoint: varchar("endpoint", { length: 255 }).notNull(),
    method: varchar("method", { length: 10 }).default("GET").notNull(),
    success: integer("success").default(1).notNull(),
    cost: numeric("cost", { precision: 10, scale: 4 }).default("0").notNull(),
    rateLimitInfo: jsonb("rateLimitInfo"),
    month: varchar("month", { length: 7 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    monthIdx: index("month_idx").on(table.month),
    endpointIdx: index("endpoint_idx").on(table.endpoint),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;

// =============================================================================
// API Cost Settings Table
// =============================================================================

export const apiCostSettings = pgTable("api_cost_settings", {
  id: serial("id").primaryKey(),
  monthlyLimit: numeric("monthlyLimit", { precision: 10, scale: 2 }).default("10.00").notNull(),
  alertThreshold: numeric("alertThreshold", { precision: 10, scale: 2 }).default("8.00").notNull(),
  alertEmail: varchar("alertEmail", { length: 320 }),
  autoStop: integer("autoStop").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ApiCostSettings = typeof apiCostSettings.$inferSelect;
export type InsertApiCostSettings = typeof apiCostSettings.$inferInsert;
