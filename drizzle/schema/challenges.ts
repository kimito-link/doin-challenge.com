/**
 * Challenge-related Schema Tables
 *
 * チャレンジ・イベント関連のテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, boolean, jsonb } from "drizzle-orm/pg-core";

const goalTypeEnum = pgEnum("goalType", ["attendance", "followers", "viewers", "points", "custom"]);
const eventTypeEnum = pgEnum("eventType", ["solo", "group"]);
const statusEnum = pgEnum("status", ["upcoming", "active", "ended"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  hostUserId: integer("hostUserId"),
  hostTwitterId: varchar("hostTwitterId", { length: 64 }),
  hostName: varchar("hostName", { length: 255 }).notNull(),
  hostUsername: varchar("hostUsername", { length: 255 }),
  hostProfileImage: text("hostProfileImage"),
  hostFollowersCount: integer("hostFollowersCount").default(0),
  hostDescription: text("hostDescription"),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  description: text("description"),
  goalType: goalTypeEnum("goalType").default("attendance").notNull(),
  goalValue: integer("goalValue").default(100).notNull(),
  goalUnit: varchar("goalUnit", { length: 32 }).default("人").notNull(),
  currentValue: integer("currentValue").default(0).notNull(),
  eventType: eventTypeEnum("eventType").default("solo").notNull(),
  categoryId: integer("categoryId"),
  eventDate: timestamp("eventDate").notNull(),
  venue: varchar("venue", { length: 255 }),
  prefecture: varchar("prefecture", { length: 32 }),
  ticketPresale: integer("ticketPresale"),
  ticketDoor: integer("ticketDoor"),
  ticketSaleStart: timestamp("ticketSaleStart"),
  ticketUrl: text("ticketUrl"),
  externalUrl: text("externalUrl"),
  status: statusEnum("status").default("active").notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  aiSummary: text("aiSummary"),
  intentTags: jsonb("intentTags").$type<string[]>(),
  regionSummary: jsonb("regionSummary").$type<Record<string, number>>(),
  participantSummary: jsonb("participantSummary").$type<{
    totalCount: number;
    topContributors: Array<{ name: string; contribution: number; message?: string }>;
    recentMessages: Array<{ name: string; message: string; createdAt: string }>;
    hotRegion?: string;
  }>(),
  aiSummaryUpdatedAt: timestamp("aiSummaryUpdatedAt"),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

export const events = challenges;
export type Event = Challenge;
export type InsertEvent = InsertChallenge;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  icon: varchar("icon", { length: 32 }).default("🎤").notNull(),
  color: varchar("color", { length: 16 }).default("#EC4899").notNull(),
  description: text("description"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const challengeTemplates = pgTable("challenge_templates", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  goalType: goalTypeEnum("goalType").default("attendance").notNull(),
  goalValue: integer("goalValue").default(100).notNull(),
  goalUnit: varchar("goalUnit", { length: 32 }).default("人").notNull(),
  eventType: eventTypeEnum("eventType").default("solo").notNull(),
  ticketPresale: integer("ticketPresale"),
  ticketDoor: integer("ticketDoor"),
  isPublic: boolean("isPublic").default(false).notNull(),
  useCount: integer("useCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ChallengeTemplate = typeof challengeTemplates.$inferSelect;
export type InsertChallengeTemplate = typeof challengeTemplates.$inferInsert;

export const challengeStats = pgTable("challenge_stats", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(),
  recordHour: integer("recordHour").default(0).notNull(),
  participantCount: integer("participantCount").default(0).notNull(),
  totalContribution: integer("totalContribution").default(0).notNull(),
  newParticipants: integer("newParticipants").default(0).notNull(),
  prefectureData: text("prefectureData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChallengeStat = typeof challengeStats.$inferSelect;
export type InsertChallengeStat = typeof challengeStats.$inferInsert;

export const challengeMembers = pgTable("challenge_members", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  twitterUsername: varchar("twitterUsername", { length: 255 }).notNull(),
  twitterId: varchar("twitterId", { length: 64 }),
  displayName: varchar("displayName", { length: 255 }),
  profileImage: text("profileImage"),
  followersCount: integer("followersCount").default(0),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ChallengeMember = typeof challengeMembers.$inferSelect;
export type InsertChallengeMember = typeof challengeMembers.$inferInsert;
