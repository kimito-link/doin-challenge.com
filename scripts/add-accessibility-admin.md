# 管理画面のaccessibilityRole追加ガイド

## 対応ファイルリスト

### 高優先度（ナビゲーション・主要操作）
1. app/admin/_layout.tsx - 7箇所
   - Line 177: ホームに戻るボタン
   - Line 221: メニュー項目
   - Line 258: メニュー項目
   - Line 283: メニュー項目
   - Line 293: メニュー項目
   - Line 307: メニュー項目
   - Line 332: メニュー項目

2. app/admin/index.tsx - 5箇所
   - 管理画面トップのカード型ボタン

### 中優先度（データ操作）
3. app/admin/participations.tsx - 8箇所
   - データ操作ボタン

4. app/admin/errors.tsx - 7箇所
   - エラー管理ボタン

5. app/admin/categories.tsx - 6箇所
   - カテゴリ管理ボタン

### 低優先度（その他）
6. app/admin/challenges.tsx - 4箇所
7. app/admin/component-gallery.tsx - 5箇所
8. app/admin/users.tsx - 3箇所
9. app/admin/api-usage.tsx - 2箇所
10. その他の管理画面ファイル

## 追加パターン

### ナビゲーションボタン
```tsx
<Pressable
  onPress={...}
  accessibilityRole="button"
  accessibilityLabel="ホームに戻る"
  style={...}
>
```

### メニュー項目
```tsx
<Pressable
  onPress={...}
  accessibilityRole="button"
  accessibilityLabel={title}
  accessibilityState={{ selected: isActive }}
  style={...}
>
```

### データ操作ボタン（編集・削除など）
```tsx
<Pressable
  onPress={...}
  accessibilityRole="button"
  accessibilityLabel="編集"
  accessibilityHint="タップして編集画面を開く"
  style={...}
>
```

### カード型ボタン
```tsx
<Pressable
  onPress={...}
  accessibilityRole="button"
  accessibilityLabel={`${title}: ${description}`}
  style={...}
>
```

## 実装順序

1. app/admin/_layout.tsx（ナビゲーション）
2. app/admin/index.tsx（トップ画面）
3. app/admin/participations.tsx（データ操作）
4. app/admin/errors.tsx（エラー管理）
5. app/admin/categories.tsx（カテゴリ管理）
6. 残りの管理画面ファイル
7. app/achievements.tsx, app/collaborators/[id].tsx, app/dashboard/[id].tsx
8. app/demo/index.tsx
