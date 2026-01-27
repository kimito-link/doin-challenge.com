/**
 * コラボレーター関連の型定義
 */

/** コラボレーターの役割 */
export type CollaboratorRole = "owner" | "co-host" | "moderator";

/** コラボレーターのステータス */
export type CollaboratorStatus = "pending" | "accepted" | "declined";

/** コラボレーター情報 */
export interface Collaborator {
  id: number;
  challengeId: number;
  userId: string;
  userName: string;
  userImage: string | null;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  invitedAt: Date | string;
  respondedAt?: Date | string | null;
  /** 編集権限 */
  canEdit?: boolean;
  /** 参加者管理権限 */
  canManageParticipants?: boolean;
  /** 招待権限 */
  canInvite?: boolean;
}
