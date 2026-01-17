/** @type {const} */
const themeColors = {
  // KimitoLink ブランドカラー
  primary: { light: '#00427B', dark: '#4A90D9' },      // ブルー（メイン）
  secondary: { light: '#B85400', dark: '#FF8C33' },   // オレンジ（アクセント）- ライトモードでWCAG AA準拠
  background: { light: '#ffffff', dark: '#0D1117' },
  surface: { light: '#F8F9FA', dark: '#161B22' },
  foreground: { light: '#1F2937', dark: '#E6EDF3' },
  muted: { light: '#6B7280', dark: '#B0B8C1' },  // v5.37: ダークモードで見やすく明るく
  border: { light: '#E5E7EB', dark: '#30363D' },
  success: { light: '#22C55E', dark: '#4ADE80' },
  warning: { light: '#F59E0B', dark: '#FBBF24' },
  error: { light: '#EF4444', dark: '#F87171' },
  accent: { light: '#DD6500', dark: '#FF8C33' },       // オレンジ（アクセント）
};

module.exports = { themeColors };
