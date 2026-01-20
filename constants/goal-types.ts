/**
 * 目標タイプの共通定数
 * 
 * 使用箇所:
 * - app/event/[id].tsx
 * - app/(tabs)/index.tsx
 * - components/molecules/colorful-challenge-card.tsx
 * - components/molecules/memoized-challenge-card.tsx
 */

/** 目標タイプの設定 */
export const goalTypeConfig: Record<string, { label: string; icon: string; unit: string }> = {
  attendance: { label: "動員", icon: "people", unit: "人" },
  followers: { label: "フォロワー", icon: "person-add", unit: "人" },
  viewers: { label: "同時視聴", icon: "visibility", unit: "人" },
  points: { label: "ポイント", icon: "star", unit: "pt" },
  custom: { label: "カスタム", icon: "flag", unit: "" },
} as const;

/** 目標タイプのキー */
export type GoalType = keyof typeof goalTypeConfig;

/** 目標タイプの設定値 */
export type GoalTypeConfig = (typeof goalTypeConfig)[GoalType];

/**
 * 目標タイプの設定を取得（デフォルト値付き）
 */
export function getGoalTypeConfig(goalType: string | null | undefined): GoalTypeConfig {
  return goalTypeConfig[goalType || "attendance"] || goalTypeConfig.attendance;
}

/**
 * 目標タイプのラベルを取得
 */
export function getGoalTypeLabel(goalType: string | null | undefined): string {
  return getGoalTypeConfig(goalType).label;
}

/**
 * 目標タイプの単位を取得
 */
export function getGoalTypeUnit(goalType: string | null | undefined): string {
  return getGoalTypeConfig(goalType).unit;
}

/**
 * 目標タイプのアイコン名を取得
 */
export function getGoalTypeIcon(goalType: string | null | undefined): string {
  return getGoalTypeConfig(goalType).icon;
}
