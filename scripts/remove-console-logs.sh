#!/bin/bash
# Remove console.log statements from TypeScript/TSX files
# Keeps console.error and console.warn

echo "Removing console.log statements..."

# Find all .ts and .tsx files and remove console.log lines
find app features components lib -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" | while read file; do
  # Remove lines containing console.log (but not console.error or console.warn)
  sed -i '/console\.log/d' "$file"
done

echo "Done! Removed console.log statements."
echo "Note: console.error and console.warn are preserved."
