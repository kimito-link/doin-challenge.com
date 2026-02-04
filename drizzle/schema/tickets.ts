/**
 * Ticket-related Schema Tables
 *
 * チケット譲渡・待機リスト関連のテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

const priceTypeEnum = pgEnum("priceType", ["face_value", "negotiable", "free"]);
const ticketStatusEnum = pgEnum("ticket_status", ["available", "reserved", "completed", "cancelled"]);

export const ticketTransfers = pgTable("ticket_transfers", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  userId: integer("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userUsername: varchar("userUsername", { length: 255 }),
  userImage: text("userImage"),
  ticketCount: integer("ticketCount").default(1).notNull(),
  priceType: priceTypeEnum("priceType").default("face_value").notNull(),
  comment: text("comment"),
  status: ticketStatusEnum("status").default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TicketTransfer = typeof ticketTransfers.$inferSelect;
export type InsertTicketTransfer = typeof ticketTransfers.$inferInsert;

export const ticketWaitlist = pgTable("ticket_waitlist", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  userId: integer("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userUsername: varchar("userUsername", { length: 255 }),
  userImage: text("userImage"),
  desiredCount: integer("desiredCount").default(1).notNull(),
  notifyOnNew: boolean("notifyOnNew").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TicketWaitlist = typeof ticketWaitlist.$inferSelect;
export type InsertTicketWaitlist = typeof ticketWaitlist.$inferInsert;
