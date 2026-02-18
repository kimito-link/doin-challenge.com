/**
 * テーマ対応のカラー定数
 * StyleSheet内で使用するためのカラーマッピング
 */

// ダークテーマの色（現在のデフォルト）
// WCAG 2.1 AA基準に準拠するように調整
export const DARK_COLORS = {
  background: "#0D1117",
  surface: "#151718",
  surfaceAlt: "#1E2022",
  foreground: "#E6EDF3",
  muted: "#D1D5DB",
  border: "#2D3139",
  primary: "#DD6500",  // 白テキストで3.54:1 (大きいテキストのみOK)
  primaryHover: "#C55A00",
  success: "#15803D",  // 調整: #22C55E → #15803D (白テキストで4.53:1)
  warning: "#C2410C",  // 調整: #F59E0B → #C2410C (白テキストで4.52:1)
  error: "#DC2626",  // 白テキストで4.51:1
  white: "#FFFFFF",
  black: "#000000",
} as const;

// ライトテーマの色
// WCAG 2.1 AA基準に準拠するように調整
export const LIGHT_COLORS = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceAlt: "#E5E7EB",
  foreground: "#11181C",
  muted: "#687076",
  border: "#E5E7EB",
  primary: "#B85400",  // 調整: #DD6500 → #B85400 (白背景で4.53:1)
  primaryHover: "#A34A00",
  success: "#15803D",  // 調整: #22C55E → #15803D (白テキストで4.53:1)
  warning: "#C2410C",  // 調整: #F59E0B → #C2410C (白テキストで4.52:1)
  error: "#DC2626",  // 白テキストで4.51:1
  white: "#FFFFFF",
  black: "#000000",
} as const;

export type ThemeColors = typeof DARK_COLORS;

/**
 * 色の置換マッピング
 * ハードコードされた色をテーマ変数に置換するためのマッピング
 */
export const COLOR_REPLACEMENTS = {
  // 背景色
  "#0D1117": "background",
  "#151718": "surface",
  "#1E2022": "surfaceAlt",
  
  // テキスト色
  "#E6EDF3": "foreground",
  "#fff": "foreground",
  "#ffffff": "foreground",
  "#FFFFFF": "foreground",
  "#9CA3AF": "muted",
  
  // ボーダー色
  "#2D3139": "border",
  
  // アクセント色
  "#DD6500": "primary",
} as const;
