// theme/tokens/palette.ts
// #RRGGBB を置く唯一の場所（原則ここ以外禁止）
// 
// v6.65: 仕様確定メモ準拠 - 全体カラー方針
// - ベースカラー: 黒
// - 黄色: 完全廃止
// - アクセント色: ピンク#EC4899、紫#8B5CF6、ティール#0F766Eのみ
// - アクセント色はアイコン・ボーダー・左線のみ（背景塗り・文字色には使わない）

export const palette = {
  // Brand / Accent - 仕様確定メモ準拠
  // 主アクセント：ピンク
  primary500: "#EC4899",
  primary600: "#DB2777",
  // 補助アクセント：紫
  accent500: "#8B5CF6",
  accent600: "#7C3AED",
  // 情報・中立強調：ティール
  teal500: "#0F766E",
  teal600: "#0D9488",
  
  // Legacy Brand Colors (後方互換性 - 全てピンクに統一)
  pink500: "#EC4899",
  pink600: "#DB2777",
  purple500: "#8B5CF6",
  purple600: "#7C3AED",
  indigo500: "#0F766E",
  amber400: "#EC4899",      // 黄色廃止 → ピンクに
  orange500: "#EC4899",     // オレンジ廃止 → ピンクに

  // Neutral (dark UI) - 黒ベース
  gray900: "#0a0a0a",       // 背景（純粋な黒に近い）
  gray850: "#111111",       // 画像プレースホルダ等
  gray800: "#171717",       // surface（カード背景）
  gray750: "#1f1f1f",       // surface alt
  gray700: "#262626",       // border
  gray600: "#333333",       // border alt

  // Neutral (text) - 視認性確保
  gray500: "#525252",       // hint text
  gray400: "#7a7a7a",       // secondary text / placeholder (4.61:1 contrast)
  gray300: "#a3a3a3",       // muted text
  gray200: "#d4d4d4",       // subtle text
  gray100: "#e5e5e5",       // primary text（最も明るい）
  white: "#FFFFFF",

  // Semantic statuses
  green500: "#22C55E",      // success
  green400: "#4ADE80",      // success light
  green600: "#16A34A",      // success dark
  red500: "#EF4444",        // error（危険/警告のみ赤）
  red400: "#F87171",        // error light
  red600: "#DC2626",        // error dark
  yellow500: "#EC4899",     // warning → ピンクに（黄色廃止）
  yellow400: "#F472B6",     // warning light → ピンクに
  blue500: "#0F766E",       // info（ティール）
  blue400: "#14B8A6",       // info light
  blue600: "#0D9488",       // info dark

  // Rank / Special
  gold: "#EC4899",          // ゴールド → ピンクに（黄色廃止）
  silver: "#a3a3a3",        // シルバー（グレー）
  bronze: "#EC4899",        // ブロンズ → ピンクに

  // Social
  twitter: "#1DA1F2",
  line: "#06C755",

  // Japan Map - Region Colors（ピンク・紫・ティール系に統一）
  regionHokkaido: "#14B8A6",    // ティール系
  regionTohoku: "#0F766E",      // ティール
  regionKanto: "#8B5CF6",       // 紫
  regionChubu: "#A78BFA",       // 紫系
  regionKansai: "#EC4899",      // ピンク
  regionChugokuShikoku: "#F472B6", // ピンク系
  regionChugoku: "#F472B6",
  regionShikoku: "#DB2777",
  regionKyushuOkinawa: "#BE185D",
  regionKyushu: "#BE185D",
  regionOkinawa: "#9D174D",

  // Japan Map - Region Border Colors
  borderHokkaido: "#0D9488",
  borderTohoku: "#0F766E",
  borderKanto: "#7C3AED",
  borderChubu: "#8B5CF6",
  borderKansai: "#DB2777",
  borderChugoku: "#BE185D",
  borderShikoku: "#9D174D",
  borderKyushu: "#831843",
  borderOkinawa: "#701A3A",

  // Heatmap Colors (ピンク系グラデーション)
  heatmapNone: "#171717",
  heatmapLevel1: "#FDF2F8",     // 最も薄いピンク
  heatmapLevel2: "#FCE7F3",
  heatmapLevel3: "#FBCFE8",
  heatmapLevel4: "#F9A8D4",
  heatmapLevel5: "#F472B6",
  heatmapLevel6: "#EC4899",
  heatmapLevel7: "#DB2777",     // 最も濃いピンク

  // Heatmap Intensity Colors (for deformed map)
  heatIntense1: "#F9A8D4",
  heatIntense2: "#F472B6",
  heatIntense3: "#EC4899",
  heatIntense4: "#DB2777",
  heatIntense5: "#BE185D",
  heatIntenseBorder1: "#F472B6",
  heatIntenseBorder2: "#EC4899",
  heatIntenseBorder3: "#DB2777",
  heatIntenseBorder4: "#BE185D",
  heatIntenseBorder5: "#9D174D",

  // Map UI
  mapWater: "#0a0a0a",
  mapStroke: "#333333",
  mapText: "#a3a3a3",
  mapInactive: "#171717",
  mapHighlight: "#EC4899",

  // Rarity Colors (Achievements) - ピンク・紫系
  rarityCommon: "#525252",
  rarityRare: "#0F766E",
  rarityEpic: "#8B5CF6",
  rarityLegendary: "#EC4899",

  // Rarity Card Colors
  rarityCommonBorder: "#737373",
  rarityCommonText: "#a3a3a3",
  rarityCommonBadgeBg: "#525252",
  rarityUncommonBg: "#1f1f1f",
  rarityUncommonBorder: "#0F766E",
  rarityUncommonText: "#14B8A6",
  rarityUncommonBadgeBg: "#0F766E",
  rarityRareBg: "#171717",
  rarityRareBorder: "#0D9488",
  rarityRareText: "#14B8A6",
  rarityRareBadgeBg: "#0F766E",
  rarityEpicBg: "#1f1f1f",
  rarityEpicBorder: "#8B5CF6",
  rarityEpicText: "#A78BFA",
  rarityEpicBadgeBg: "#8B5CF6",
  rarityLegendaryBg: "#262626",
  rarityLegendaryBorder: "#EC4899",
  rarityLegendaryText: "#F472B6",
  rarityLegendaryBadgeBg: "#EC4899",
  rarityLegendaryBadgeText: "#0a0a0a",

  // Tutorial / Overlay
  overlayDark: "#0a0a0a",
  overlayText: "#0a0a0a",

  // Confetti / Celebration Colors（ピンク・紫・ティール）
  confettiTeal: "#0F766E",
  confettiYellow: "#EC4899",    // 黄色廃止 → ピンク
  confettiMint: "#14B8A6",
  confettiCoral: "#F472B6",

  // Tutorial Balloon Colors
  balloonLight: "#a3a3a3",
  balloonLighter: "#d4d4d4",
  balloonRed: "#EF4444",
  balloonPink: "#EC4899",
  balloonMedium: "#8B5CF6",
  balloonPale: "#A78BFA",

  // Tutorial UI
  tutorialBlue: "#0F766E",
  tutorialText: "#a3a3a3",
  shadowBlack: "#000",

  // 性別表示用（応援コメントカードのみ）
  genderMale: "#3B82F6",        // 男性：青
  genderFemale: "#F472B6",      // 女性：ピンク（ブランド色と少しずらす）
  genderNeutral: "rgba(255,255,255,0.12)", // 未設定
} as const;

export type Palette = typeof palette;
