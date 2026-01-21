/**
 * ParticipantRanking - 定数
 * 
 * 単一責任: 静的データの定義のみ
 */

import { color } from "@/theme/tokens";

/** ランキングバッジの色 */
export const RANK_COLORS = {
  1: { bg: color.rankGold, text: "#000", gradient: [color.rankGold, "#FFA500"] as const },
  2: { bg: color.rankSilver, text: "#000", gradient: ["#E8E8E8", color.rankSilver] as const },
  3: { bg: color.rankBronze, text: color.textWhite, gradient: [color.rankBronze, "#8B4513"] as const },
} as const;

/** ランキングバッジのアイコン */
export const RANK_ICONS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
} as const;

/** 性別による背景色 */
export const GENDER_COLORS = {
  male: { bg: "rgba(59, 130, 246, 0.15)", border: "#3B82F6" },
  female: { bg: "rgba(236, 72, 153, 0.15)", border: "#EC4899" },
  unspecified: { bg: "transparent", border: "transparent" },
} as const;

/** デフォルト表示件数 */
export const DEFAULT_MAX_DISPLAY = 10;

/** デフォルトタイトル */
export const DEFAULT_TITLE = "貢献ランキング";
