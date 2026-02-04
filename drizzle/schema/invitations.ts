/**
 * Invitation-related Schema Tables
 *
 * チャレンジ招待・コラボ招待関連のテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

const collaboratorRoleEnum = pgEnum("collaborator_role", ["owner", "co-host", "moderator"]);
const collaboratorStatusEnum = pgEnum("collaborator_status", ["pending", "accepted", "declined"]);
const collaboratorInviteRoleEnum = pgEnum("collaborator_invite_role", ["co-host", "moderator"]);
const collaboratorInviteStatusEnum = pgEnum("collaborator_invite_status", ["pending", "accepted", "declined", "expired"]);

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  inviterId: integer("inviterId").notNull(),
  inviterName: varchar("inviterName", { length: 255 }),
  code: varchar("code", { length: 32 }).notNull().unique(),
  customMessage: text("customMessage"),
  customTitle: varchar("customTitle", { length: 255 }),
  maxUses: integer("maxUses").default(0),
  useCount: integer("useCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

export const invitationUses = pgTable("invitation_uses", {
  id: serial("id").primaryKey(),
  invitationId: integer("invitationId").notNull(),
  userId: integer("userId"),
  displayName: varchar("displayName", { length: 255 }),
  twitterId: varchar("twitterId", { length: 64 }),
  twitterUsername: varchar("twitterUsername", { length: 255 }),
  participationId: integer("participationId"),
  isConfirmed: boolean("isConfirmed").default(false).notNull(),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvitationUse = typeof invitationUses.$inferSelect;
export type InsertInvitationUse = typeof invitationUses.$inferInsert;

export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  userId: integer("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userImage: text("userImage"),
  role: collaboratorRoleEnum("role").default("co-host").notNull(),
  canEdit: boolean("canEdit").default(true).notNull(),
  canManageParticipants: boolean("canManageParticipants").default(true).notNull(),
  canInvite: boolean("canInvite").default(true).notNull(),
  status: collaboratorStatusEnum("status").default("pending").notNull(),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = typeof collaborators.$inferInsert;

export const collaboratorInvitations = pgTable("collaborator_invitations", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  inviterId: integer("inviterId").notNull(),
  inviterName: varchar("inviterName", { length: 255 }),
  inviteeId: integer("inviteeId"),
  inviteeEmail: varchar("inviteeEmail", { length: 320 }),
  inviteeTwitterId: varchar("inviteeTwitterId", { length: 64 }),
  code: varchar("code", { length: 32 }).notNull().unique(),
  role: collaboratorInviteRoleEnum("role").default("co-host").notNull(),
  status: collaboratorInviteStatusEnum("status").default("pending").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollaboratorInvitation = typeof collaboratorInvitations.$inferSelect;
export type InsertCollaboratorInvitation = typeof collaboratorInvitations.$inferInsert;
