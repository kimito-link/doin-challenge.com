# PR: お気に入り機能の復旧（⭐→マイページ反映）

## 概要
マイページに「気になるイベントリスト」セクションを追加し、お気に入り登録したチャレンジを表示できるようにする。

## 問題
- ⭐ボタンでお気に入り登録はできるが、マイページに表示されない
- AsyncStorageには保存されているが、表示UIが実装されていなかった

## 修正内容

### 新規ファイル
- `features/mypage/components/sections/FavoriteSection.tsx`
  - お気に入りチャレンジを表示するセクションコンポーネント
  - `useFavorites()`でお気に入りIDリストを取得
  - `trpc.events.list`で全チャレンジを取得してフィルタリング
  - お気に入りが0件の場合は非表示

### 変更ファイル
- `features/mypage/components/sections/index.ts`
  - `FavoriteSection`のエクスポート追加

- `features/mypage/components/AuthenticatedContent.tsx`
  - `FavoriteSection`をインポート
  - バッジセクションと参加チャレンジセクションの間に配置

- `todo.md`
  - P0-1タスクを完了済みにマーク

## 影響範囲
- **マイページのみ**: 既存機能への影響なし
- **新規コンポーネント**: 他の画面に影響を与えない
- **データソース**: AsyncStorage（既存）+ tRPC（既存API）

## 確認手順

### 1. お気に入り登録
1. ホーム画面でチャレンジカードの⭐アイコンをタップ
2. アイコンが金色に変わることを確認

### 2. マイページで確認
1. マイページに移動
2. 「気になるイベントリスト」セクションが表示されることを確認
3. お気に入り登録したチャレンジが一覧表示されることを確認
4. チャレンジカードをタップして詳細画面に遷移できることを確認

### 3. お気に入り解除
1. ホーム画面で⭐アイコンを再度タップ
2. マイページに戻る
3. 「気になるイベントリスト」から削除されることを確認
4. お気に入りが0件になるとセクション自体が非表示になることを確認

## 復帰方法
```bash
# このコミットをrevert
git revert <commit-hash>

# または、特定ファイルのみ削除
git rm features/mypage/components/sections/FavoriteSection.tsx
git checkout HEAD~1 features/mypage/components/sections/index.ts
git checkout HEAD~1 features/mypage/components/AuthenticatedContent.tsx
```

## テスト結果
- TypeScript: ✅ 0 errors
- ESLint: ✅ 0 errors, 692 warnings（既存）
- 新規コンポーネントのみのため、既存テストへの影響なし

## 備考
- お気に入りデータはAsyncStorageに保存されるため、デバイスごとに管理される
- 将来的にサーバー同期が必要な場合は、tRPC APIの追加が必要
