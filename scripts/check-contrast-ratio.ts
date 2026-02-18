/**
 * 色のコントラスト比を検証するスクリプト
 * WCAG 2.1 AA基準に準拠しているかをチェック
 */

/**
 * 相対輝度を計算
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(hexColor: string): number {
  // HEX色をRGBに変換
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // sRGB値を線形化
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // 相対輝度を計算
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * コントラスト比を計算
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG 2.1 AA基準を満たしているかチェック
 */
function meetsWCAG_AA(
  foreground: string,
  background: string,
  fontSize: 'normal' | 'large' = 'normal'
): { passes: boolean; ratio: number; required: number } {
  const ratio = getContrastRatio(foreground, background);
  const required = fontSize === 'large' ? 3.0 : 4.5;
  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
}

// テーマカラーのインポート
import { palette } from '../theme/tokens/palette';

// チェックする色の組み合わせ
const colorCombinations = [
  // テキストと背景
  {
    name: 'Primary Text on Background',
    foreground: palette.gray100, // textPrimary
    background: palette.gray900, // bg
    fontSize: 'normal' as const,
  },
  {
    name: 'Muted Text on Background',
    foreground: palette.gray300, // textMuted
    background: palette.gray900, // bg
    fontSize: 'normal' as const,
  },
  {
    name: 'Secondary Text on Background',
    foreground: palette.gray200, // textSecondary
    background: palette.gray900, // bg
    fontSize: 'normal' as const,
  },
  {
    name: 'Hint Text on Background',
    foreground: palette.gray300, // textHint
    background: palette.gray900, // bg
    fontSize: 'normal' as const,
  },
  
  // サーフェス上のテキスト
  {
    name: 'Primary Text on Surface',
    foreground: palette.gray100,
    background: palette.gray800, // surface
    fontSize: 'normal' as const,
  },
  {
    name: 'Muted Text on Surface',
    foreground: palette.gray300,
    background: palette.gray800,
    fontSize: 'normal' as const,
  },
  
  // アクセントカラー (Light版: 背景に表示する用)
  {
    name: 'Primary Accent (Light) on Background',
    foreground: palette.primary400,
    background: palette.gray900,
    fontSize: 'normal' as const,
  },
  {
    name: 'Purple Accent (Light) on Background',
    foreground: palette.accent400,
    background: palette.gray900,
    fontSize: 'normal' as const,
  },
  {
    name: 'Teal Accent on Background',
    foreground: palette.teal500,
    background: palette.gray900,
    fontSize: 'normal' as const,
  },
  
  // ステータスカラー (Light版: 背景に表示する用)
  {
    name: 'Success (Light) on Background',
    foreground: palette.green400,
    background: palette.gray900,
    fontSize: 'normal' as const,
  },
  {
    name: 'Danger (Light) on Background',
    foreground: palette.red400,
    background: palette.gray900,
    fontSize: 'normal' as const,
  },
  {
    name: 'Info on Background',
    foreground: palette.blue500,
    background: palette.gray900,
    fontSize: 'normal' as const,
  },
  
  // ボタン（白テキスト on アクセントカラー）
  {
    name: 'White Text on Primary Button',
    foreground: palette.white,
    background: palette.primary500,
    fontSize: 'normal' as const,
  },
  {
    name: 'White Text on Purple Button',
    foreground: palette.white,
    background: palette.accent500,
    fontSize: 'normal' as const,
  },
  {
    name: 'White Text on Success Button',
    foreground: palette.white,
    background: palette.green500,
    fontSize: 'normal' as const,
  },
  {
    name: 'White Text on Danger Button',
    foreground: palette.white,
    background: palette.red500,
    fontSize: 'normal' as const,
  },
  
  // ボーダー
  {
    name: 'Border on Background',
    foreground: palette.gray700, // border
    background: palette.gray900,
    fontSize: 'large' as const, // UIコンポーネントは3:1
  },
  {
    name: 'Border Alt on Background',
    foreground: palette.gray600, // borderAlt
    background: palette.gray900,
    fontSize: 'large' as const,
  },
];

console.log('=== WCAG 2.1 AA Contrast Ratio Check ===\n');

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

colorCombinations.forEach((combo) => {
  const result = meetsWCAG_AA(combo.foreground, combo.background, combo.fontSize);
  const status = result.passes ? '✅ PASS' : '❌ FAIL';
  const message = `${status} ${combo.name}: ${result.ratio}:1 (required: ${result.required}:1)`;
  
  console.log(message);
  
  if (result.passes) {
    passCount++;
  } else {
    failCount++;
    failures.push(combo.name);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total: ${colorCombinations.length}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failures.length > 0) {
  console.log(`\n=== Failed Combinations ===`);
  failures.forEach((name) => {
    console.log(`  - ${name}`);
  });
}
