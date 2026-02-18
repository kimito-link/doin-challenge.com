#!/bin/bash
# 小規模ファイル（1-2箇所のPressable）のaccessibilityRole一括追加スクリプト

cd /home/ubuntu/birthday-celebration

echo "小規模ファイルのPressable位置を確認中..."

# app/admin/api-usage.tsx - Line 213, 436
echo "=== app/admin/api-usage.tsx ==="
sed -n '211,220p' app/admin/api-usage.tsx
echo "---"
sed -n '434,443p' app/admin/api-usage.tsx

# app/admin/components/DataIntegrityChallengeCard.tsx - Line 53
echo "=== app/admin/components/DataIntegrityChallengeCard.tsx ==="
sed -n '51,60p' app/admin/components/DataIntegrityChallengeCard.tsx

# app/admin/data-integrity.tsx - Line 123
echo "=== app/admin/data-integrity.tsx ==="
sed -n '121,130p' app/admin/data-integrity.tsx

# app/admin/release-notes.tsx - Line 115
echo "=== app/admin/release-notes.tsx ==="
sed -n '113,122p' app/admin/release-notes.tsx

# app/admin/system.tsx - Line 379
echo "=== app/admin/system.tsx ==="
sed -n '377,386p' app/admin/system.tsx
