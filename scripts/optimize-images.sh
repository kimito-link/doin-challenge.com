#!/bin/bash

# 画像最適化スクリプト
# PNG画像を圧縮してファイルサイズを削減

echo "🖼️  画像最適化を開始..."

# PNGファイルを検索して圧縮
find assets/images -name "*.png" -type f | while read file; do
  echo "圧縮中: $file"
  # pngquantで圧縮（品質80-95%）
  pngquant --quality=80-95 --force --ext .png "$file" 2>/dev/null || echo "  スキップ: $file"
done

# JPGファイルを検索して圧縮
find assets/images -name "*.jpg" -o -name "*.jpeg" -type f | while read file; do
  echo "圧縮中: $file"
  # jpegoptimで圧縮（品質85%）
  jpegoptim --max=85 "$file" 2>/dev/null || echo "  スキップ: $file"
done

echo "✅ 画像最適化が完了しました"
