#!/usr/bin/env python3
"""
JSX属性内の色置換による構文エラーを修正するスクリプト
color=color.xxx を color={color.xxx} に修正
"""

import os
import re
from pathlib import Path

def fix_jsx_color_attributes(content: str) -> str:
    """JSX属性内の色を正しい形式に修正"""
    # パターン: color=color.xxx または color=palette.xxx
    # 修正後: color={color.xxx} または color={palette.xxx}
    
    # color=color.xxx → color={color.xxx}
    content = re.sub(
        r'(\s)color=color\.(\w+)',
        r'\1color={color.\2}',
        content
    )
    
    # color=palette.xxx → color={palette.xxx}
    content = re.sub(
        r'(\s)color=palette\.(\w+)',
        r'\1color={palette.\2}',
        content
    )
    
    # tintColor=color.xxx → tintColor={color.xxx}
    content = re.sub(
        r'(\s)tintColor=color\.(\w+)',
        r'\1tintColor={color.\2}',
        content
    )
    
    # colors={[color.xxx]} の配列形式を修正
    content = re.sub(
        r'colors=\{\[color\.(\w+)\]\}',
        r'colors={[color.\1]}',
        content
    )
    
    # progressBackgroundColor=color.xxx → progressBackgroundColor={color.xxx}
    content = re.sub(
        r'(\s)progressBackgroundColor=color\.(\w+)',
        r'\1progressBackgroundColor={color.\2}',
        content
    )
    
    # fallbackColor=color.xxx → fallbackColor={color.xxx}
    content = re.sub(
        r'(\s)fallbackColor=color\.(\w+)',
        r'\1fallbackColor={color.\2}',
        content
    )
    
    return content

def process_file(filepath: Path) -> int:
    """ファイルを処理して修正数を返す"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    content = fix_jsx_color_attributes(content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        # 修正数をカウント（大まかな推定）
        return original_content.count('color=color.') + original_content.count('color=palette.')
    
    return 0

def main():
    molecules_dir = Path('/home/ubuntu/birthday-celebration/components/molecules')
    
    total_fixes = 0
    fixed_files = []
    
    for filepath in molecules_dir.glob('*.tsx'):
        count = process_file(filepath)
        if count > 0:
            fixed_files.append((filepath.name, count))
            total_fixes += count
    
    print(f"\n=== JSX属性修正完了 ===")
    print(f"修正ファイル数: {len(fixed_files)}")
    print(f"総修正数: {total_fixes}")
    if fixed_files:
        print(f"\n--- 詳細 ---")
        for name, count in sorted(fixed_files, key=lambda x: -x[1]):
            print(f"  {name}: {count}箇所")

if __name__ == '__main__':
    main()
