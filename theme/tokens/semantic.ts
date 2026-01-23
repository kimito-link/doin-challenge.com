// theme/tokens/semantic.ts
// アプリ全体の意味（semantic）
// ここが "components/ 置換の受け皿" になります
//
// v6.65: 仕様確定メモ準拠 - 全体カラー方針
// - ベースカラー: 黒
// - 黄色: 完全廃止
// - アクセント色: ピンク#EC4899、紫#8B5CF6、ティール#0F766Eのみ

import { palette } from "./palette";

export const color = {
  // Surfaces - 黒ベース
  bg: palette.gray900,           // #0a0a0a
  surface: palette.gray800,      // #171717
  surfaceAlt: palette.gray750,   // #1f1f1f
  surfaceDark: palette.gray850,  // #111111

  // Borders / dividers
  border: palette.gray700,       // #262626
  borderAlt: palette.gray600,    // #333333

  // Text - 視認性確保（グレー系）
  textPrimary: palette.gray100,  // #e5e5e5
  textMuted: palette.gray300,    // #a3a3a3
  textSubtle: palette.gray200,   // #d4d4d4
  textSecondary: palette.gray400, // #737373
  textHint: palette.gray500,     // #525252
  textWhite: palette.white,

  // Accents - ピンク・紫・ティールのみ
  accentPrimary: palette.primary500,  // #EC4899（ピンク）
  accentAlt: palette.accent500,       // #8B5CF6（紫）
  accentIndigo: palette.teal500,      // #0F766E（ティール）
  hostAccent: palette.primary500,     // #EC4899（ピンク）- 黄色廃止
  hostAccentLegacy: palette.primary500, // #EC4899（ピンク）

  // Status - 仕様準拠
  success: palette.green500,     // #22C55E
  successLight: palette.green400,
  successDark: palette.green600,
  danger: palette.red500,        // #EF4444（危険/警告のみ赤）
  dangerLight: palette.red400,
  dangerDark: palette.red600,
  warning: palette.primary500,   // #EC4899（黄色廃止→ピンク）
  warningLight: palette.primary600,
  info: palette.teal500,         // #0F766E（ティール）
  infoLight: palette.blue400,
  infoDark: palette.blue600,

  // Special / Rank - 黄色廃止
  rankGold: palette.primary500,  // #EC4899（ピンク）
  rankSilver: palette.silver,    // #a3a3a3
  rankBronze: palette.accent500, // #8B5CF6（紫）

  // Toast backgrounds (dark variants)
  toastSuccessBg: "#1a2e1a",
  toastErrorBg: "#2e1a1a",
  toastWarningBg: "#2e1a2e",     // ピンク系
  toastInfoBg: "#1a2e2e",

  // Additional colors for molecules - 黄色廃止
  orange500: palette.primary500, // ピンクに
  orange400: palette.primary600,
  yellow500: palette.primary500, // ピンクに（黄色廃止）
  yellow400: palette.primary600,
  teal500: palette.teal500,
  teal400: palette.teal600,
  green400: palette.green400,
  purple400: palette.accent500,
  blue400: palette.blue400,
  pink400: palette.primary500,
  red400: palette.red400,
  cyan500: palette.teal500,
  slate300: palette.gray300,
  slate400: palette.gray400,
  slate200: palette.gray200,
  slate500: palette.gray500,

  // Social
  twitter: palette.twitter,
  line: palette.line,

  // Additional colors for charts/maps
  coral: palette.red500,
  hotPink: palette.primary500,
  emerald400: palette.green400,
  textDisabled: palette.gray600,

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

  // 性別表示用（応援コメントカードのみ）
  genderMale: palette.genderMale,
  genderFemale: palette.genderFemale,
  genderNeutral: palette.genderNeutral,
} as const;

export type SemanticColor = typeof color;
