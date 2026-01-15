/**
 * デザインシステム定数
 * 
 * UI/UXガイドに基づく統一されたデザイントークン
 * - 一貫性: 全画面で同じスタイルを使用
 * - アクセシビリティ: WCAG準拠のコントラスト比
 * - タッチターゲット: Apple HIG準拠の最小サイズ
 */

// カラーパレット
export const colors = {
  // プライマリカラー
  primary: {
    default: "#EC4899",
    hover: "#DB2777",
    light: "rgba(236, 72, 153, 0.15)",
  },
  // セカンダリカラー
  secondary: {
    default: "#8B5CF6",
    hover: "#7C3AED",
    light: "rgba(139, 92, 246, 0.15)",
  },
  // 背景色
  background: {
    primary: "#0D1117",
    secondary: "#1A1D21",
    tertiary: "#2D3139",
    elevated: "#252830",
  },
  // テキスト色
  text: {
    primary: "#FFFFFF",
    secondary: "#9CA3AF",
    tertiary: "#6B7280",
    disabled: "#4B5563",
  },
  // ボーダー色
  border: {
    default: "#374151",
    light: "#2D3139",
    focus: "#EC4899",
  },
  // ステータス色
  status: {
    success: "#10B981",
    successLight: "rgba(16, 185, 129, 0.15)",
    warning: "#F59E0B",
    warningLight: "rgba(245, 158, 11, 0.15)",
    error: "#EF4444",
    errorLight: "rgba(239, 68, 68, 0.15)",
    info: "#3B82F6",
    infoLight: "rgba(59, 130, 246, 0.15)",
  },
  // グラデーション
  gradient: {
    primary: ["#EC4899", "#8B5CF6"] as const,
    secondary: ["#3B82F6", "#8B5CF6"] as const,
    success: ["#10B981", "#059669"] as const,
  },
};

// スペーシング（8pxベース）
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
};

// タイポグラフィ
export const typography = {
  // フォントサイズ
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  // 行の高さ
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  // フォントウェイト
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
};

// ボーダー半径
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
};

// シャドウ
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// タッチターゲット（Apple HIG準拠）
export const touchTarget = {
  minSize: 44, // 最小タッチターゲットサイズ
  minSpacing: 8, // 最小間隔
};

// アニメーション
export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
};

// Zインデックス
export const zIndex = {
  base: 0,
  dropdown: 100,
  modal: 200,
  toast: 300,
  tooltip: 400,
};

// コンポーネント固有のスタイル
export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary.default,
      textColor: colors.text.primary,
      borderRadius: borderRadius.lg,
      minHeight: touchTarget.minSize,
    },
    secondary: {
      backgroundColor: colors.background.secondary,
      textColor: colors.text.primary,
      borderColor: colors.border.default,
      borderRadius: borderRadius.lg,
      minHeight: touchTarget.minSize,
    },
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    minHeight: touchTarget.minSize,
    paddingHorizontal: spacing.lg,
  },
};
