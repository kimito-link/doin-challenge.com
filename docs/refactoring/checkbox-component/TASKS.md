# Checkbox コンポーネント統一 - タスクリスト

## Phase 1: コンポーネント作成（TDD）

### Task 1.1: テストファイル作成
- [ ] `__tests__/ui/checkbox.test.tsx` を作成
- [ ] 基本機能のテストケースを記述
  - checked/unchecked表示
  - onChange呼び出し
  - disabled状態
  - サイズバリエーション
  - 説明文の表示

### Task 1.2: Checkboxコンポーネント実装
- [ ] `components/ui/checkbox.tsx` を作成
- [ ] Props interface定義
- [ ] 基本レイアウト実装
- [ ] スタイル実装（sm/mdサイズ）
- [ ] チェックアイコン表示ロジック
- [ ] Pressableハンドラ実装

### Task 1.3: エクスポート設定
- [ ] `components/ui/index.ts` にCheckboxを追加
- [ ] 型定義もエクスポート

### Task 1.4: テスト実行・修正
- [ ] テストを実行
- [ ] 失敗するテストを修正
- [ ] 全てのテストが通ることを確認

## Phase 2: 既存コードの置き換え

### Task 2.1: TermsAndPermissions.tsx
- [ ] VideoPermissionCheckboxをCheckboxに置き換え
- [ ] スタイル調整
- [ ] 動作確認

### Task 2.2: TemplateSaveSection.tsx
- [ ] 1つ目のcheckbox（テンプレート保存）を置き換え
- [ ] 2つ目のcheckbox（公開設定）を置き換え
- [ ] スタイル調整
- [ ] 動作確認

### Task 2.3: challenge-created-modal.tsx
- [ ] checkboxパターンをCheckboxに置き換え
- [ ] 動作確認

## Phase 3: クリーンアップ

### Task 3.1: 不要コード削除
- [ ] VideoPermissionCheckbox関数を削除
- [ ] その他のローカルcheckbox実装を削除

### Task 3.2: ドキュメント更新
- [ ] COMPONENT_REGISTRY.mdにCheckboxを追加
- [ ] 使用例を記載

### Task 3.3: 最終確認
- [ ] 全ファイルで型チェック
- [ ] ビルド確認
- [ ] 視覚的確認
