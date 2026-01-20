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

  // Japan Map - Region Colors
  regionHokkaido: palette.regionHokkaido,
  regionTohoku: palette.regionTohoku,
  regionKanto: palette.regionKanto,
  regionChubu: palette.regionChubu,
  regionKansai: palette.regionKansai,
  regionChugokuShikoku: palette.regionChugokuShikoku,
  regionChugoku: palette.regionChugoku,
  regionShikoku: palette.regionShikoku,
  regionKyushuOkinawa: palette.regionKyushuOkinawa,
  regionKyushu: palette.regionKyushu,
  regionOkinawa: palette.regionOkinawa,

  // Japan Map - Region Border Colors
  borderHokkaido: palette.borderHokkaido,
  borderTohoku: palette.borderTohoku,
  borderKanto: palette.borderKanto,
  borderChubu: palette.borderChubu,
  borderKansai: palette.borderKansai,
  borderChugoku: palette.borderChugoku,
  borderShikoku: palette.borderShikoku,
  borderKyushu: palette.borderKyushu,
  borderOkinawa: palette.borderOkinawa,

  // Heatmap Colors
  heatmapNone: palette.heatmapNone,
  heatmapLevel1: palette.heatmapLevel1,
  heatmapLevel2: palette.heatmapLevel2,
  heatmapLevel3: palette.heatmapLevel3,
  heatmapLevel4: palette.heatmapLevel4,
  heatmapLevel5: palette.heatmapLevel5,
  heatmapLevel6: palette.heatmapLevel6,
  heatmapLevel7: palette.heatmapLevel7,

  // Heatmap Intensity Colors
  heatIntense1: palette.heatIntense1,
  heatIntense2: palette.heatIntense2,
  heatIntense3: palette.heatIntense3,
  heatIntense4: palette.heatIntense4,
  heatIntense5: palette.heatIntense5,
  heatIntenseBorder1: palette.heatIntenseBorder1,
  heatIntenseBorder2: palette.heatIntenseBorder2,
  heatIntenseBorder3: palette.heatIntenseBorder3,
  heatIntenseBorder4: palette.heatIntenseBorder4,
  heatIntenseBorder5: palette.heatIntenseBorder5,

  // Map UI
  mapWater: palette.mapWater,
  mapStroke: palette.mapStroke,
  mapText: palette.mapText,
  mapInactive: palette.mapInactive,
  mapHighlight: palette.mapHighlight,

  // Rarity Colors (Achievements)
  rarityCommon: palette.rarityCommon,
  rarityRare: palette.rarityRare,
  rarityEpic: palette.rarityEpic,
  rarityLegendary: palette.rarityLegendary,

  // Rarity Card Colors
  rarityCommonBorder: palette.rarityCommonBorder,
  rarityCommonText: palette.rarityCommonText,
  rarityCommonBadgeBg: palette.rarityCommonBadgeBg,
  rarityUncommonBg: palette.rarityUncommonBg,
  rarityUncommonBorder: palette.rarityUncommonBorder,
  rarityUncommonText: palette.rarityUncommonText,
  rarityUncommonBadgeBg: palette.rarityUncommonBadgeBg,
  rarityRareBg: palette.rarityRareBg,
  rarityRareBorder: palette.rarityRareBorder,
  rarityRareText: palette.rarityRareText,
  rarityRareBadgeBg: palette.rarityRareBadgeBg,
  rarityEpicBg: palette.rarityEpicBg,
  rarityEpicBorder: palette.rarityEpicBorder,
  rarityEpicText: palette.rarityEpicText,
  rarityEpicBadgeBg: palette.rarityEpicBadgeBg,
  rarityLegendaryBg: palette.rarityLegendaryBg,
  rarityLegendaryBorder: palette.rarityLegendaryBorder,
  rarityLegendaryText: palette.rarityLegendaryText,
  rarityLegendaryBadgeBg: palette.rarityLegendaryBadgeBg,
  rarityLegendaryBadgeText: palette.rarityLegendaryBadgeText,

  // Tutorial / Overlay
  overlayDark: palette.overlayDark,
  overlayText: palette.overlayText,

  // Confetti / Celebration Colors
  confettiTeal: palette.confettiTeal,
  confettiYellow: palette.confettiYellow,
  confettiMint: palette.confettiMint,
  confettiCoral: palette.confettiCoral,

  // Tutorial Balloon Colors
  balloonLight: palette.balloonLight,
  balloonLighter: palette.balloonLighter,
  balloonRed: palette.balloonRed,
  balloonPink: palette.balloonPink,
  balloonMedium: palette.balloonMedium,
  balloonPale: palette.balloonPale,

  // Tutorial UI
  tutorialBlue: palette.tutorialBlue,
  tutorialText: palette.tutorialText,
  shadowBlack: palette.shadowBlack,
} as const;

export type SemanticColor = typeof color;
