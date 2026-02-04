/**
 * Release Notes Schema
 *
 * リリースノート（アップデート履歴）のテーブル定義
 */

import { pgTable, serial, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const releaseNotes = pgTable("release_notes", {
  id: serial("id").primaryKey(),
  version: varchar("version", { length: 32 }).notNull(),
  date: varchar("date", { length: 32 }).notNull(),
  title: text("title").notNull(),
  changes: jsonb("changes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ReleaseNote = typeof releaseNotes.$inferSelect;
export type InsertReleaseNote = typeof releaseNotes.$inferInsert;
