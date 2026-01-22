// theme/tokens/palette.ts
// #RRGGBB を置く唯一の場所（原則ここ以外禁止）
// 
// v6.55: Refreshing Summer Fun パレット適用
// - 視認性改善（WCAG AA準拠）
// - ダークティール背景で目に優しく
// - オレンジ×イエローで動員・応援のエネルギーを表現

export const palette = {
  // Brand / Accent - Refreshing Summer Fun
  primary500: "#FB8500",      // オレンジ（メインアクション）
  primary600: "#E07800",      // オレンジ（ホバー）
  accent500: "#FFB703",       // イエロー（アクセント）
  accent600: "#E5A503",       // イエロー（ホバー）
  teal500: "#219EBC",         // ティール（セカンダリ）
  teal600: "#1A7A94",         // ティール（ホバー）
  
  // Legacy Brand Colors (後方互換性)
  pink500: "#FB8500",         // → primary500 に統一
  pink600: "#E07800",         // → primary600 に統一
  purple500: "#FFB703",       // → accent500 に統一
  purple600: "#E5A503",       // → accent600 に統一
  indigo500: "#219EBC",       // → teal500 に統一
  amber400: "#FFB703",        // → accent500 に統一
  orange500: "#FB8500",       // → primary500 に統一

  // Neutral (dark UI) - Refreshing Summer Fun
  gray900: "#023047",         // 背景（ダークティール）
  gray850: "#02374F",         // 画像プレースホルダ等
  gray800: "#034063",         // surface（カード背景）
  gray750: "#034A73",         // surface alt
  gray700: "#0A5578",         // border
  gray600: "#0D6A8A",         // border alt

  // Neutral (text) - 視認性改善
  gray500: "#5BA3C4",         // hint text
  gray400: "#7AB8D4",         // secondary text / placeholder
  gray300: "#8ECAE6",         // muted text（メインテキスト）
  gray200: "#A8D8EF",         // subtle text
  gray100: "#C5E5F5",         // primary text（最も明るい）
  white: "#FFFFFF",

  // Semantic statuses
  green500: "#2A9D8F",        // success（ティール系）
  green400: "#3DB8A9",        // success light
  green600: "#1F7A6E",        // success dark
  red500: "#EC8B73",          // error（コーラル）- 視認性改善で明るく
  red400: "#F4A89A",          // error light
  red600: "#D45A3C",          // error dark
  yellow500: "#FFB703",       // warning（イエロー）
  yellow400: "#FFC733",       // warning light
  blue500: "#219EBC",         // info（ティール）
  blue400: "#48CAE4",         // info light
  blue600: "#1A7A94",         // info dark

  // Rank / Special
  gold: "#FFB703",            // ゴールド（アクセントと統一）
  silver: "#8ECAE6",          // シルバー（ライトブルー）
  bronze: "#E76F51",          // ブロンズ（コーラル）

  // Social
  twitter: "#1DA1F2",
  line: "#06C755",

  // Japan Map - Region Colors（既存維持）
  regionHokkaido: "#48CAE4",
  regionTohoku: "#8ECAE6",
  regionKanto: "#2A9D8F",
  regionChubu: "#FFB703",
  regionKansai: "#FB8500",
  regionChugokuShikoku: "#E76F51",
  regionChugoku: "#E76F51",
  regionShikoku: "#F4A261",
  regionKyushuOkinawa: "#E76F51",
  regionKyushu: "#E76F51",
  regionOkinawa: "#F4A261",

  // Japan Map - Region Border Colors
  borderHokkaido: "#0096C7",
  borderTohoku: "#0077B6",
  borderKanto: "#1F7A6E",
  borderChubu: "#E5A503",
  borderKansai: "#E07800",
  borderChugoku: "#D45A3C",
  borderShikoku: "#E08A4D",
  borderKyushu: "#D45A3C",
  borderOkinawa: "#E08A4D",

  // Heatmap Colors (Yellow → Orange → Red)
  heatmapNone: "#034063",
  heatmapLevel1: "#FFB703",
  heatmapLevel2: "#FFA500",
  heatmapLevel3: "#FB8500",
  heatmapLevel4: "#F4A261",
  heatmapLevel5: "#E76F51",
  heatmapLevel6: "#D45A3C",
  heatmapLevel7: "#C04030",

  // Heatmap Intensity Colors (for deformed map)
  heatIntense1: "#FB8500",
  heatIntense2: "#F4A261",
  heatIntense3: "#E76F51",
  heatIntense4: "#D45A3C",
  heatIntense5: "#C04030",
  heatIntenseBorder1: "#E07800",
  heatIntenseBorder2: "#E08A4D",
  heatIntenseBorder3: "#D45A3C",
  heatIntenseBorder4: "#C04030",
  heatIntenseBorder5: "#A03020",

  // Map UI
  mapWater: "#023047",
  mapStroke: "#0A5578",
  mapText: "#8ECAE6",
  mapInactive: "#034063",
  mapHighlight: "#FB8500",

  // Rarity Colors (Achievements)
  rarityCommon: "#5BA3C4",
  rarityRare: "#219EBC",
  rarityEpic: "#FFB703",
  rarityLegendary: "#FB8500",

  // Rarity Card Colors
  rarityCommonBorder: "#7AB8D4",
  rarityCommonText: "#8ECAE6",
  rarityCommonBadgeBg: "#5BA3C4",
  rarityUncommonBg: "#034A73",
  rarityUncommonBorder: "#2A9D8F",
  rarityUncommonText: "#3DB8A9",
  rarityUncommonBadgeBg: "#2A9D8F",
  rarityRareBg: "#034063",
  rarityRareBorder: "#48CAE4",
  rarityRareText: "#8ECAE6",
  rarityRareBadgeBg: "#219EBC",
  rarityEpicBg: "#0A5578",
  rarityEpicBorder: "#FFB703",
  rarityEpicText: "#FFC733",
  rarityEpicBadgeBg: "#FFB703",
  rarityLegendaryBg: "#0D6A8A",
  rarityLegendaryBorder: "#FB8500",
  rarityLegendaryText: "#FFA500",
  rarityLegendaryBadgeBg: "#FB8500",
  rarityLegendaryBadgeText: "#023047",

  // Tutorial / Overlay
  overlayDark: "#023047",
  overlayText: "#023047",

  // Confetti / Celebration Colors
  confettiTeal: "#2A9D8F",
  confettiYellow: "#FFB703",
  confettiMint: "#48CAE4",
  confettiCoral: "#E76F51",

  // Tutorial Balloon Colors
  balloonLight: "#8ECAE6",
  balloonLighter: "#C5E5F5",
  balloonRed: "#E76F51",
  balloonPink: "#F4A261",
  balloonMedium: "#FB8500",
  balloonPale: "#FFB703",

  // Tutorial UI
  tutorialBlue: "#219EBC",
  tutorialText: "#8ECAE6",
  shadowBlack: "#000",
} as const;

export type Palette = typeof palette;
