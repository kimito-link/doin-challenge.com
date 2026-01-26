/**
 * チャレンジ作成画面用カラートークン
 * 
 * 直書き色を一元管理し、テーマ変更を容易にする
 */

// UI要素色
export const createUI = {
  // 入力フィールド
  inputBg: "#1A1D21",           // 入力フィールド背景
  inputBorder: "#2D3139",       // 入力フィールドボーダー
  
  // チェックボックス・トグル
  checkboxBorder: "#6B7280",    // 非選択時のボーダー
  checkboxActiveBorder: "#4B5563", // アクティブ時のボーダー（暗め）
  
  // アクセント色
  activeAccent: "#D91C81",      // ピンク（選択状態）- WCAG AA準拠
  purpleAccent: "#7C3AED",      // 紫（テンプレート保存）- WCAG AA準拠
  successAccent: "#22C55E",     // 緑（公開設定）
} as const;

// テキスト色
export const createText = {
  placeholder: "#9CA3AF",       // プレースホルダー
  muted: "#9CA3AF",             // 補足テキスト
  accent: "#D91C81",            // アクセントテキスト（選択状態）- WCAG AA準拠
  purple: "#7C3AED",            // 紫テキスト - WCAG AA準拠
  success: "#22C55E",           // 成功テキスト
} as const;
