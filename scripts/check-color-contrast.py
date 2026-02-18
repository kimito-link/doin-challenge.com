#!/usr/bin/env python3
"""
カラーコントラスト比を計算し、WCAG 2.1 AA基準（4.5:1以上）を満たしているか検証するスクリプト
"""

import math

def hex_to_rgb(hex_color):
    """16進数カラーコードをRGBに変換"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

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

def check_wcag_aa(ratio, is_large_text=False):
    """WCAG 2.1 AA基準を満たしているか確認"""
    threshold = 3.0 if is_large_text else 4.5
    return ratio >= threshold

# ダークテーマのカラー定義 (調整後)
DARK_COLORS = {
    "background": "#0D1117",
    "surface": "#151718",
    "surfaceAlt": "#1E2022",
    "foreground": "#E6EDF3",
    "muted": "#D1D5DB",
    "border": "#2D3139",
    "primary": "#FF7A1A",
    "primaryHover": "#E66A0A",
    "success": "#16A34A",
    "warning": "#EA580C",
    "error": "#DC2626",
    "white": "#FFFFFF",
    "black": "#000000",
}

# ライトテーマのカラー定義 (調整後)
LIGHT_COLORS = {
    "background": "#FFFFFF",
    "surface": "#F5F5F5",
    "surfaceAlt": "#E5E7EB",
    "foreground": "#11181C",
    "muted": "#687076",
    "border": "#E5E7EB",
    "primary": "#B85400",
    "primaryHover": "#A34A00",
    "success": "#16A34A",
    "warning": "#EA580C",
    "error": "#DC2626",
    "white": "#FFFFFF",
    "black": "#000000",
}

# テキストと背景の組み合わせ
TEXT_BACKGROUND_COMBINATIONS = [
    # ダークテーマ
    ("foreground", "background", "Dark: 通常テキスト on 背景"),
    ("foreground", "surface", "Dark: 通常テキスト on サーフェス"),
    ("foreground", "surfaceAlt", "Dark: 通常テキスト on サーフェスAlt"),
    ("muted", "background", "Dark: ミュートテキスト on 背景"),
    ("muted", "surface", "Dark: ミュートテキスト on サーフェス"),
    ("primary", "background", "Dark: プライマリ on 背景"),
    ("white", "primary", "Dark: 白テキスト on プライマリ"),
    ("white", "success", "Dark: 白テキスト on 成功"),
    ("white", "warning", "Dark: 白テキスト on 警告"),
    ("white", "error", "Dark: 白テキスト on エラー"),
]

print("=" * 80)
print("カラーコントラスト比検証レポート")
print("WCAG 2.1 AA基準: 通常テキスト 4.5:1以上、大きいテキスト 3.0:1以上")
print("=" * 80)
print()

print("【ダークテーマ】")
print("-" * 80)
failed_combinations = []

for text_key, bg_key, description in TEXT_BACKGROUND_COMBINATIONS:
    text_color = DARK_COLORS[text_key]
    bg_color = DARK_COLORS[bg_key]
    ratio = contrast_ratio(text_color, bg_color)
    
    # 通常テキストとして評価
    passes_normal = check_wcag_aa(ratio, is_large_text=False)
    passes_large = check_wcag_aa(ratio, is_large_text=True)
    
    status = "✅ PASS" if passes_normal else ("⚠️  LARGE ONLY" if passes_large else "❌ FAIL")
    
    print(f"{description}")
    print(f"  {text_key} ({text_color}) on {bg_key} ({bg_color})")
    print(f"  コントラスト比: {ratio:.2f}:1 {status}")
    print()
    
    if not passes_normal:
        failed_combinations.append((description, text_color, bg_color, ratio))

print()
print("【ライトテーマ】")
print("-" * 80)

# ライトテーマの組み合わせ
LIGHT_TEXT_BACKGROUND_COMBINATIONS = [
    ("foreground", "background", "Light: 通常テキスト on 背景"),
    ("foreground", "surface", "Light: 通常テキスト on サーフェス"),
    ("foreground", "surfaceAlt", "Light: 通常テキスト on サーフェスAlt"),
    ("muted", "background", "Light: ミュートテキスト on 背景"),
    ("muted", "surface", "Light: ミュートテキスト on サーフェス"),
    ("primary", "background", "Light: プライマリ on 背景"),
    ("white", "primary", "Light: 白テキスト on プライマリ"),
    ("white", "success", "Light: 白テキスト on 成功"),
    ("white", "warning", "Light: 白テキスト on 警告"),
    ("white", "error", "Light: 白テキスト on エラー"),
]

for text_key, bg_key, description in LIGHT_TEXT_BACKGROUND_COMBINATIONS:
    text_color = LIGHT_COLORS[text_key]
    bg_color = LIGHT_COLORS[bg_key]
    ratio = contrast_ratio(text_color, bg_color)
    
    # 通常テキストとして評価
    passes_normal = check_wcag_aa(ratio, is_large_text=False)
    passes_large = check_wcag_aa(ratio, is_large_text=True)
    
    status = "✅ PASS" if passes_normal else ("⚠️  LARGE ONLY" if passes_large else "❌ FAIL")
    
    print(f"{description}")
    print(f"  {text_key} ({text_color}) on {bg_key} ({bg_color})")
    print(f"  コントラスト比: {ratio:.2f}:1 {status}")
    print()
    
    if not passes_normal:
        failed_combinations.append((description, text_color, bg_color, ratio))

print()
print("=" * 80)
print("検証結果サマリー")
print("=" * 80)

if failed_combinations:
    print(f"❌ {len(failed_combinations)}個の組み合わせがWCAG 2.1 AA基準を満たしていません:")
    print()
    for description, text_color, bg_color, ratio in failed_combinations:
        print(f"  • {description}")
        print(f"    {text_color} on {bg_color} - {ratio:.2f}:1")
        # 推奨される調整を計算
        target_ratio = 4.5
        current_ratio = ratio
        adjustment_factor = target_ratio / current_ratio
        print(f"    推奨: テキスト色を{adjustment_factor:.2f}倍明るく（または暗く）調整")
        print()
else:
    print("✅ すべての組み合わせがWCAG 2.1 AA基準を満たしています！")

print()
print("=" * 80)
