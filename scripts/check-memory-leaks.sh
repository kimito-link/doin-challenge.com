#!/bin/bash

# メモリリーク検出スクリプト
# useEffect、setInterval、setTimeoutのクリーンアップ漏れを検出

echo "🔍 メモリリーク検出を開始..."

echo ""
echo "=== setIntervalのクリーンアップ漏れ ==="
grep -rn "setInterval" --include="*.tsx" --include="*.ts" app/ components/ hooks/ | \
  while read line; do
    file=$(echo "$line" | cut -d: -f1)
    linenum=$(echo "$line" | cut -d: -f2)
    
    # 同じファイル内にclearIntervalがあるかチェック
    if ! grep -q "clearInterval" "$file"; then
      echo "⚠️  $line"
      echo "   → clearIntervalが見つかりません"
    fi
  done

echo ""
echo "=== setTimeoutのクリーンアップ漏れ ==="
grep -rn "setTimeout" --include="*.tsx" --include="*.ts" app/ components/ hooks/ | \
  grep -v "// " | \
  while read line; do
    file=$(echo "$line" | cut -d: -f1)
    linenum=$(echo "$line" | cut -d: -f2)
    
    # 同じファイル内にclearTimeoutがあるかチェック
    if ! grep -q "clearTimeout" "$file"; then
      echo "⚠️  $line"
      echo "   → clearTimeoutが見つかりません"
    fi
  done

echo ""
echo "=== イベントリスナーのクリーンアップ漏れ ==="
grep -rn "addEventListener" --include="*.tsx" --include="*.ts" app/ components/ hooks/ | \
  while read line; do
    file=$(echo "$line" | cut -d: -f1)
    linenum=$(echo "$line" | cut -d: -f2)
    
    # 同じファイル内にremoveEventListenerがあるかチェック
    if ! grep -q "removeEventListener" "$file"; then
      echo "⚠️  $line"
      echo "   → removeEventListenerが見つかりません"
    fi
  done

echo ""
echo "✅ メモリリーク検出が完了しました"
