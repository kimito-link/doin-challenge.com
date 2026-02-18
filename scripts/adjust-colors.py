#!/usr/bin/env python3
"""
WCAG 2.1 AA基準を満たすようにカラーを調整するスクリプト
"""

import math

def hex_to_rgb(hex_color):
    """16進数カラーコードをRGBに変換"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    """RGBを16進数カラーコードに変換"""
    return '#{:02X}{:02X}{:02X}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def relative_luminance(rgb):
    """相対輝度を計算"""
    def adjust(channel):
        channel = channel / 255.0
        if channel <= 0.03928:
            return channel / 12.92
        return ((channel + 0.055) / 1.055) ** 2.4
    
    r, g, b = [adjust(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(color1, color2):
    """2つの色のコントラスト比を計算"""
    lum1 = relative_luminance(hex_to_rgb(color1))
    lum2 = relative_luminance(hex_to_rgb(color2))
    
    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)
    
    return (lighter + 0.05) / (darker + 0.05)

def darken_color(rgb, factor):
    """色を暗くする"""
    return tuple(max(0, min(255, c * factor)) for c in rgb)

def lighten_color(rgb, factor):
    """色を明るくする"""
    return tuple(max(0, min(255, c + (255 - c) * factor)) for c in rgb)

def adjust_color_for_contrast(text_color, bg_color, target_ratio=4.5):
    """コントラスト比が目標値を満たすように色を調整"""
    text_rgb = hex_to_rgb(text_color)
    bg_rgb = hex_to_rgb(bg_color)
    
    # 背景色の輝度を計算
    bg_lum = relative_luminance(bg_rgb)
    
    # テキスト色を暗くする方向で調整
    best_color = text_rgb
    best_ratio = contrast_ratio(text_color, bg_color)
    
    # 暗くする
    for factor in [i/100 for i in range(100, 0, -5)]:
        adjusted_rgb = darken_color(text_rgb, factor)
        adjusted_hex = rgb_to_hex(adjusted_rgb)
        ratio = contrast_ratio(adjusted_hex, bg_color)
        if ratio >= target_ratio and ratio > best_ratio:
            best_color = adjusted_rgb
            best_ratio = ratio
    
    # 明るくする
    for factor in [i/100 for i in range(0, 100, 5)]:
        adjusted_rgb = lighten_color(text_rgb, factor)
        adjusted_hex = rgb_to_hex(adjusted_rgb)
        ratio = contrast_ratio(adjusted_hex, bg_color)
        if ratio >= target_ratio and ratio > best_ratio:
            best_color = adjusted_rgb
            best_ratio = ratio
    
    return rgb_to_hex(best_color), best_ratio

print("=" * 80)
print("カラー調整提案")
print("=" * 80)
print()

# 調整が必要なカラー
ADJUSTMENTS = [
    ("primary", "#DD6500", "プライマリ"),
    ("success", "#22C55E", "成功"),
    ("warning", "#F59E0B", "警告"),
    ("error", "#EF4444", "エラー"),
]

WHITE = "#FFFFFF"

print("【白テキスト on カラーボタンの調整】")
print("-" * 80)
print()

adjusted_colors = {}

for key, original_color, name in ADJUSTMENTS:
    adjusted_color, ratio = adjust_color_for_contrast(original_color, WHITE, target_ratio=4.5)
    
    print(f"{name}色 ({key})")
    print(f"  元の色: {original_color}")
    print(f"  調整後: {adjusted_color}")
    print(f"  コントラスト比: {contrast_ratio(original_color, WHITE):.2f}:1 → {ratio:.2f}:1")
    print()
    
    adjusted_colors[key] = adjusted_color

print()
print("【プライマリ色 on 白背景の調整】")
print("-" * 80)
print()

# プライマリ色を白背景で読みやすくする
primary_on_white, ratio = adjust_color_for_contrast("#DD6500", WHITE, target_ratio=4.5)
print(f"プライマリ色")
print(f"  元の色: #DD6500")
print(f"  調整後: {primary_on_white}")
print(f"  コントラスト比: {contrast_ratio('#DD6500', WHITE):.2f}:1 → {ratio:.2f}:1")
print()

print()
print("=" * 80)
print("推奨される調整")
print("=" * 80)
print()
print("constants/theme-colors.ts を以下のように更新してください:")
print()
print("```typescript")
print("// ダークテーマの色（現在のデフォルト）")
print("export const DARK_COLORS = {")
print("  background: \"#0D1117\",")
print("  surface: \"#151718\",")
print("  surfaceAlt: \"#1E2022\",")
print("  foreground: \"#E6EDF3\",")
print("  muted: \"#D1D5DB\",")
print("  border: \"#2D3139\",")
print(f"  primary: \"{adjusted_colors['primary']}\",  // 調整: {adjusted_colors['primary']}")
print(f"  primaryHover: \"{darken_color(hex_to_rgb(adjusted_colors['primary']), 0.9)}\",")
print(f"  success: \"{adjusted_colors['success']}\",  // 調整: {adjusted_colors['success']}")
print(f"  warning: \"{adjusted_colors['warning']}\",  // 調整: {adjusted_colors['warning']}")
print(f"  error: \"{adjusted_colors['error']}\",  // 調整: {adjusted_colors['error']}")
print("  white: \"#FFFFFF\",")
print("  black: \"#000000\",")
print("} as const;")
print()
print("// ライトテーマの色")
print("export const LIGHT_COLORS = {")
print("  background: \"#FFFFFF\",")
print("  surface: \"#F5F5F5\",")
print("  surfaceAlt: \"#E5E7EB\",")
print("  foreground: \"#11181C\",")
print("  muted: \"#687076\",")
print("  border: \"#E5E7EB\",")
print(f"  primary: \"{primary_on_white}\",  // 調整: {primary_on_white}")
print(f"  primaryHover: \"{darken_color(hex_to_rgb(primary_on_white), 0.9)}\",")
print(f"  success: \"{adjusted_colors['success']}\",  // 調整: {adjusted_colors['success']}")
print(f"  warning: \"{adjusted_colors['warning']}\",  // 調整: {adjusted_colors['warning']}")
print(f"  error: \"{adjusted_colors['error']}\",  // 調整: {adjusted_colors['error']}")
print("  white: \"#FFFFFF\",")
print("  black: \"#000000\",")
print("} as const;")
print("```")
print()
