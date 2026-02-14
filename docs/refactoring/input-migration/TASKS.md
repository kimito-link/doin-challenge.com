# TextInput → Input コンポーネント移行 - タスクリスト

## Phase 1: パイロット移行（2ファイル）

### Task 1.1: TitleInputSection.tsx
- [ ] `Input`コンポーネントをimport
- [ ] TextInputをInputに置き換え
- [ ] ラベルを`label` propに移動
- [ ] エラー表示を`error` propまたは`InlineValidationError`で処理
- [ ] `inputRef`の扱いを確認
- [ ] スタイル調整
- [ ] 動作確認

### Task 1.2: DescriptionSection.tsx
- [ ] `Input`コンポーネントをimport
- [ ] TextInputをInputに置き換え（multiline対応）
- [ ] ラベルを`label` propに移動
- [ ] `multiline`と`numberOfLines` propを設定
- [ ] スタイル調整
- [ ] 動作確認

### Task 1.3: パイロット確認
- [ ] 型チェック
- [ ] ビルド確認
- [ ] 視覚的確認
- [ ] 機能動作確認

## Phase 2: 残りファイルの移行（後続タスク）

### Task 2.1-2.10: 残り10ファイル
各ファイルで同様のパターンで移行

## 完了条件
- [ ] 全12ファイルでInput/SearchInputに移行完了
- [ ] 型チェック・ビルドが通る
- [ ] 既存機能が正常に動作
- [ ] ドキュメント更新
