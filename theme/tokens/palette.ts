// theme/tokens/palette.ts
// #RRGGBB を置く唯一の場所（原則ここ以外禁止）

export const palette = {
  // Brand / Accent
  pink500: "#EC4899",
  pink600: "#DB2777",
  purple500: "#8B5CF6",
  purple600: "#7C3AED",
  indigo500: "#6366F1",
  amber400: "#FBBF24", // 旧 #DD6500 を統一する先（推奨）
  orange500: "#DD6500", // レガシー（段階的に amber400 へ移行）

  // Neutral (dark UI)
  gray900: "#0D1117", // 背景のさらに奥
  gray850: "#111317", // 画像プレースホルダ等
  gray800: "#1A1D21", // surface（カード背景）
  gray750: "#161B22", // surface alt
  gray700: "#2D3139", // border
  gray600: "#374151", // border alt

  // Neutral (text)
  gray500: "#6B7280", // hint text
  gray400: "#9CA3AF", // secondary text / placeholder
  gray300: "#D1D5DB", // muted text
  gray200: "#CBD5E0", // subtle text
  gray100: "#E5E7EB", // primary text
  white: "#FFFFFF",

  // Semantic statuses
  green500: "#22C55E",
  green400: "#4ADE80",
  green600: "#10B981",
  red500: "#EF4444",
  red400: "#F87171",
  red600: "#DC2626",
  yellow500: "#F59E0B",
  yellow400: "#FBBF24",
  blue500: "#3B82F6",
  blue400: "#60A5FA",
  blue600: "#2563EB",

  // Rank / Special
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",

  // Social
  twitter: "#1DA1F2",
  line: "#06C755",
} as const;

export type Palette = typeof palette;
