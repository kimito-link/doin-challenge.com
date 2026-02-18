#!/bin/bash
# 中優先度コンポーネントにaccessibilityRoleを一括追加するスクリプト

# 対象ファイルリスト
FILES=(
  "components/organisms/account-switcher.tsx"
  "components/organisms/user-type-selector.tsx"
  "components/organisms/fan-profile-modal.tsx"
  "components/organisms/host-profile-modal.tsx"
  "components/molecules/welcome-modal.tsx"
  "components/molecules/encouragement-modal.tsx"
  "components/molecules/share-prompt-modal.tsx"
  "components/molecules/notification-item-card.tsx"
  "components/molecules/date-picker.tsx"
  "components/molecules/preset-selector.tsx"
  "components/ui/retry-button.tsx"
)

echo "中優先度コンポーネントのaccessibilityRole追加状況を確認中..."
echo ""

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    count=$(grep -c "accessibilityRole" "$file" 2>/dev/null || echo "0")
    pressable_count=$(grep -c "<Pressable" "$file" 2>/dev/null || echo "0")
    echo "✓ $file"
    echo "  - accessibilityRole: $count 箇所"
    echo "  - Pressable: $pressable_count 箇所"
    
    if [ "$count" -eq "0" ] && [ "$pressable_count" -gt "0" ]; then
      echo "  ⚠️ accessibilityRoleが未追加です"
    elif [ "$count" -lt "$pressable_count" ]; then
      echo "  ⚠️ 一部のPressableにaccessibilityRoleが未追加です"
    else
      echo "  ✅ すべてのPressableにaccessibilityRoleが追加済みです"
    fi
    echo ""
  else
    echo "✗ $file (ファイルが見つかりません)"
    echo ""
  fi
done

echo "確認完了"
