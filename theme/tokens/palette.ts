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

  // Japan Map - Region Colors
  regionHokkaido: "#4FC3F7",      // 水色
  regionTohoku: "#B39DDB",        // 紫
  regionKanto: "#81C784",         // 緑
  regionChubu: "#FFF176",         // 黄色
  regionKansai: "#FFB74D",        // オレンジ
  regionChugokuShikoku: "#F48FB1", // ピンク
  regionChugoku: "#F48FB1",       // ピンク（中国）
  regionShikoku: "#CE93D8",       // 紫（四国）
  regionKyushuOkinawa: "#EF5350", // 赤
  regionKyushu: "#EF5350",        // 赤（九州）
  regionOkinawa: "#FF8A65",       // オレンジ（沖縄）

  // Japan Map - Region Border Colors
  borderHokkaido: "#0288D1",
  borderTohoku: "#7B1FA2",
  borderKanto: "#388E3C",
  borderChubu: "#FBC02D",
  borderKansai: "#F57C00",
  borderChugoku: "#C2185B",
  borderShikoku: "#8E24AA",
  borderKyushu: "#C62828",
  borderOkinawa: "#E64A19",

  // Heatmap Colors (Yellow → Orange → Red)
  heatmapNone: "#E8D4D4",         // 参加者なし
  heatmapLevel1: "#FFF9C4",       // 1-2人
  heatmapLevel2: "#FFEB3B",       // 3-5人
  heatmapLevel3: "#FFCC80",       // 6-10人
  heatmapLevel4: "#FF9800",       // 11-20人
  heatmapLevel5: "#F57C00",       // 21-50人
  heatmapLevel6: "#E53935",       // 51-100人
  heatmapLevel7: "#B71C1C",       // 100人以上

  // Heatmap Intensity Colors (for deformed map)
  heatIntense1: "#FF7043",
  heatIntense2: "#FF5722",
  heatIntense3: "#F44336",
  heatIntense4: "#D32F2F",
  heatIntense5: "#B71C1C",
  heatIntenseBorder1: "#F4511E",
  heatIntenseBorder2: "#E64A19",
  heatIntenseBorder3: "#D32F2F",
  heatIntenseBorder4: "#B71C1C",
  heatIntenseBorder5: "#7F0000",

  // Map UI
  mapWater: "#A8D5E5",            // 海の色
  mapStroke: "#666666",           // 境界線
  mapText: "#333333",             // 地図上のテキスト
  mapInactive: "#3A3F47",         // 参加者なしの都道府県
  mapHighlight: "#FF6B6B",        // ハイライト

  // Rarity Colors (Achievements)
  rarityCommon: "#9CA3AF",        // コモン（灰色）
  rarityRare: "#3B82F6",          // レア（青）
  rarityEpic: "#8B5CF6",          // エピック（紫）
  rarityLegendary: "#F59E0B",     // レジェンダリー（オレンジ）

  // Rarity Card Colors
  rarityCommonBorder: "#A0AEC0",
  rarityCommonText: "#E2E8F0",
  rarityCommonBadgeBg: "#718096",
  rarityUncommonBg: "#1A4731",
  rarityUncommonBorder: "#48BB78",
  rarityUncommonText: "#9AE6B4",
  rarityUncommonBadgeBg: "#38A169",
  rarityRareBg: "#1A365D",
  rarityRareBorder: "#63B3ED",
  rarityRareText: "#90CDF4",
  rarityRareBadgeBg: "#4299E1",
  rarityEpicBg: "#44337A",
  rarityEpicBorder: "#B794F4",
  rarityEpicText: "#D6BCFA",
  rarityEpicBadgeBg: "#9F7AEA",
  rarityLegendaryBg: "#744210",
  rarityLegendaryBorder: "#F6E05E",
  rarityLegendaryText: "#FAF089",
  rarityLegendaryBadgeBg: "#ECC94B",
  rarityLegendaryBadgeText: "#1A202C",

  // Tutorial / Overlay
  overlayDark: "#1a1a2e",         // オーバーレイ背景
  overlayText: "#1a1a2e",         // オーバーレイテキスト

  // Confetti / Celebration Colors
  confettiTeal: "#4ECDC4",
  confettiYellow: "#FFE66D",
  confettiMint: "#95E1D3",
  confettiCoral: "#F38181",

  // Tutorial Balloon Colors
  balloonLight: "#FFB3B3",
  balloonLighter: "#FFD9D9",
  balloonRed: "#FF4444",
  balloonPink: "#FFCCCC",
  balloonMedium: "#FF8888",
  balloonPale: "#FFE0E0",

  // Tutorial UI
  tutorialBlue: "#4A90D9",
  tutorialText: "#333333",
  shadowBlack: "#000",
} as const;

export type Palette = typeof palette;
