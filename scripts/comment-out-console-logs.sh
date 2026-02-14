#!/bin/bash
# Comment out console.log statements instead of removing them
# This preserves code structure and prevents syntax errors

echo "Commenting out console.log statements..."

# Find all .ts and .tsx files and comment out console.log lines
find app features components lib -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" | while read file; do
  # Comment out lines containing console.log (but not console.error or console.warn)
  sed -i 's/^\(\s*\)console\.log(/\1\/\/ console.log(/' "$file"
done

echo "Done! Commented out console.log statements."
echo "Note: console.error and console.warn are preserved."
