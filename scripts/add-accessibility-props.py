#!/usr/bin/env python3
"""
アクセシビリティプロパティを主要なコンポーネントに一括追加するスクリプト
"""

import os
import re
from pathlib import Path

# 対象ファイルのリスト（主要なインタラクティブコンポーネント）
TARGET_FILES = [
    "components/atoms/floating-action-button.tsx",
    "components/atoms/haptic-tab.tsx",
    "components/atoms/touchable.tsx",
    "components/common/LoginModal.tsx",
    "components/molecules/animated-pressable.tsx",
    "components/molecules/challenge-created-modal.tsx",
    "components/molecules/colorful-challenge-card.tsx",
    "components/molecules/filter-tabs.tsx",
    "components/molecules/interactive-character.tsx",
]

def add_accessibility_to_pressable(content: str, filename: str) -> str:
    """
    PressableまたはTouchableOpacityにaccessibilityRoleを追加
    """
    # 既にaccessibilityRoleがある場合はスキップ
    if "accessibilityRole" in content:
        return content
    
    # Pressable/TouchableOpacityのパターン
    pattern = r'(<(?:Pressable|TouchableOpacity)\s+)'
    
    # accessibilityRole="button"を追加
    replacement = r'\1accessibilityRole="button"\n      '
    
    modified = re.sub(pattern, replacement, content)
    
    return modified

def process_file(filepath: Path):
    """
    ファイルを処理してアクセシビリティプロパティを追加
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = add_accessibility_to_pressable(content, filepath.name)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated: {filepath}")
            return True
        else:
            print(f"⏭️  Skipped: {filepath} (already has accessibility props)")
            return False
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

def main():
    """
    メイン処理
    """
    project_root = Path("/home/ubuntu/birthday-celebration")
    updated_count = 0
    
    print("=== Adding Accessibility Props to Components ===\n")
    
    for file_path in TARGET_FILES:
        full_path = project_root / file_path
        if full_path.exists():
            if process_file(full_path):
                updated_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print(f"\n=== Summary ===")
    print(f"Updated: {updated_count} files")

if __name__ == "__main__":
    main()
