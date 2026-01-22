// theme/tokens/semantic.ts
// アプリ全体の意味（semantic）
// ここが "components/ 置換の受け皿" になります
//
// v6.55: Refreshing Summer Fun パレット適用
// - 視認性改善（WCAG AA準拠）
// - ダークティール背景で目に優しく

import { palette } from "./palette";

export const color = {
  // Surfaces - ダークティール背景
  bg: palette.gray900,           // #023047
  surface: palette.gray800,      // #034063
  surfaceAlt: palette.gray750,   // #034A73
  surfaceDark: palette.gray850,  // #02374F

  // Borders / dividers
  border: palette.gray700,       // #0A5578
  borderAlt: palette.gray600,    // #0D6A8A

  // Text - 視認性改善（ライトブルー系）
  textPrimary: palette.gray100,  // #C5E5F5
  textMuted: palette.gray300,    // #8ECAE6
  textSubtle: palette.gray200,   // #A8D8EF
  textSecondary: palette.gray400, // #7AB8D4
  textHint: palette.gray500,     // #5BA3C4
  textWhite: palette.white,

  // Accents - オレンジ×イエロー
  accentPrimary: palette.primary500,  // #FB8500（オレンジ）
  accentAlt: palette.accent500,       // #FFB703（イエロー）
  accentIndigo: palette.teal500,      // #219EBC（ティール）
  hostAccent: palette.accent500,      // #FFB703（イエロー）
  hostAccentLegacy: palette.primary500, // #FB8500（オレンジ）

  // Status - 統一感のあるカラー
  success: palette.green500,     // #2A9D8F（ティール）
  successLight: palette.green400,
  successDark: palette.green600,
  danger: palette.red500,        // #E76F51（コーラル）
  dangerLight: palette.red400,
  dangerDark: palette.red600,
  warning: palette.yellow500,    // #FFB703（イエロー）
  warningLight: palette.yellow400,
  info: palette.blue500,         // #219EBC（ティール）
  infoLight: palette.blue400,
  infoDark: palette.blue600,

  // Special / Rank
  rankGold: palette.gold,        // #FFB703
  rankSilver: palette.silver,    // #8ECAE6
  rankBronze: palette.bronze,    // #E76F51

  // Toast backgrounds (dark variants)
  toastSuccessBg: "#034A73",
  toastErrorBg: "#5A2020",
  toastWarningBg: "#5A4010",
  toastInfoBg: "#023047",

  // Additional colors for molecules
  orange500: palette.primary500,
  orange400: palette.primary600,
  yellow500: palette.accent500,
  yellow400: palette.accent600,
  teal500: palette.teal500,
  teal400: palette.teal600,
  green400: palette.green400,
  purple400: palette.accent500,
  blue400: palette.blue400,
  pink400: palette.primary500,
  red400: palette.red400,
  cyan500: palette.blue400,
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
} as const;

export type SemanticColor = typeof color;
