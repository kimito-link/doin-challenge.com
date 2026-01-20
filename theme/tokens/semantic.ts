// theme/tokens/semantic.ts
// アプリ全体の意味（semantic）
// ここが "components/ 置換の受け皿" になります

import { palette } from "./palette";

export const color = {
  // Surfaces
  bg: palette.gray900,
  surface: palette.gray800,
  surfaceAlt: palette.gray750,
  surfaceDark: palette.gray850,

  // Borders / dividers
  border: palette.gray700,
  borderAlt: palette.gray600,

  // Text
  textPrimary: palette.gray100,
  textMuted: palette.gray300,
  textSubtle: palette.gray200,
  textSecondary: palette.gray400,
  textHint: palette.gray500,
  textWhite: palette.white,

  // Accents
  accentPrimary: palette.pink500, // メインアクセント（ピンク）
  accentAlt: palette.purple500,   // サブアクセント（紫）
  accentIndigo: palette.indigo500, // インディゴ
  hostAccent: palette.amber400,   // ホスト用アクセント（旧 #DD6500 の置き換え先）
  hostAccentLegacy: palette.orange500, // レガシー（段階的に hostAccent へ移行）

  // Status
  success: palette.green500,
  successLight: palette.green400,
  successDark: palette.green600,
  danger: palette.red500,
  dangerLight: palette.red400,
  dangerDark: palette.red600,
  warning: palette.yellow500,
  warningLight: palette.yellow400,
  info: palette.blue500,
  infoLight: palette.blue400,
  infoDark: palette.blue600,

  // Special / Rank
  rankGold: palette.gold,
  rankSilver: palette.silver,
  rankBronze: palette.bronze,

  // Toast backgrounds (dark variants)
  toastSuccessBg: "#065F46",
  toastErrorBg: "#7F1D1D",
  toastWarningBg: "#78350F",
  toastInfoBg: "#1E3A5F",

  // Additional colors for molecules
  orange500: "#F97316",
  orange400: "#FB923C",
  yellow500: "#EAB308",
  yellow400: "#FACC15",
  teal500: "#14B8A6",
  teal400: "#2DD4BF",
  green400: "#4ADE80",
  purple400: "#A78BFA",
  blue400: "#60A5FA",
  pink400: "#F472B6",
  red400: "#F87171",
  cyan500: "#06B6D4",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate200: "#E2E8F0",
  slate500: "#64748B",

  // Social
  twitter: palette.twitter,
  line: palette.line,

  // Additional colors for charts/maps
  coral: "#FF6B6B",
  hotPink: "#FF6B9D",
  emerald400: "#34D399",
  textDisabled: "#4B5563",
} as const;

export type SemanticColor = typeof color;
