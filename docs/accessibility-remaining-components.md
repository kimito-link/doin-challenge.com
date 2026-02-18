# 残りのインタラクティブコンポーネント - アクセシビリティ対応

## 現状

- **accessibilityRole追加済み**: 14コンポーネント
- **未対応**: 36コンポーネント（インタラクティブな要素を持つもの）

## 優先順位付け

### 高優先度（第1グループ）: 12コンポーネント
ユーザーが頻繁に使用する主要な機能コンポーネント

1. `components/atoms/button.tsx` - 基本ボタン（既に対応済み）
2. `components/atoms/loading-button.tsx` - ローディング付きボタン
3. `components/ui/input.tsx` - UI入力フィールド
4. `components/atoms/input.tsx` - 基本入力フィールド
5. `components/ui/modal.tsx` - UIモーダル
6. `components/molecules/confirm-modal.tsx` - 確認モーダル
7. `components/molecules/card.tsx` - 基本カード
8. `components/molecules/pressable-card.tsx` - プレス可能なカード
9. `components/ui/gender-selector.tsx` - 性別セレクター
10. `components/ui/prefecture-selector.tsx` - 都道府県セレクター
11. `components/molecules/share-button.tsx` - シェアボタン
12. `components/molecules/reminder-button.tsx` - リマインダーボタン

### 中優先度（第2グループ）: 14コンポーネント
認証・プロフィール・設定などの重要な機能コンポーネント

1. `components/organisms/login-prompt-modal.tsx` - ログインプロンプト
2. `components/molecules/login-success-modal.tsx` - ログイン成功モーダル
3. `components/molecules/logout-confirm-modal.tsx` - ログアウト確認モーダル
4. `components/organisms/account-switcher.tsx` - アカウント切り替え
5. `components/organisms/user-type-selector.tsx` - ユーザータイプセレクター
6. `components/organisms/fan-profile-modal.tsx` - ファンプロフィールモーダル
7. `components/organisms/host-profile-modal.tsx` - ホストプロフィールモーダル
8. `components/molecules/welcome-modal.tsx` - ウェルカムモーダル
9. `components/molecules/encouragement-modal.tsx` - 励ましモーダル
10. `components/molecules/share-prompt-modal.tsx` - シェアプロンプトモーダル
11. `components/molecules/notification-item-card.tsx` - 通知アイテムカード
12. `components/molecules/date-picker.tsx` - 日付ピッカー
13. `components/molecules/preset-selector.tsx` - プリセットセレクター
14. `components/ui/retry-button.tsx` - リトライボタン

### 低優先度（第3グループ）: 10コンポーネント
チュートリアル・特殊機能・テストコンポーネント

1. `components/molecules/memoized-challenge-card.tsx` - メモ化されたチャレンジカード
2. `components/molecules/twitter-user-card.tsx` - Twitterユーザーカード
3. `components/molecules/prefecture-participants-modal.tsx` - 都道府県参加者モーダル
4. `components/molecules/region-participants-modal.tsx` - 地域参加者モーダル
5. `components/molecules/follow-success-modal.tsx` - フォロー成功モーダル
6. `components/molecules/tutorial-reset-button.tsx` - チュートリアルリセットボタン
7. `components/atoms/tutorial-tab-button.tsx` - チュートリアルタブボタン
8. `components/ui/character-detail-modal.tsx` - キャラクター詳細モーダル
9. `components/organisms/ticket-transfer-section/modals.tsx` - チケット譲渡モーダル
10. `components/ui/pressable-feedback.tsx` - プレスフィードバック

## 対応方針

1. **第1グループ**: 主要な機能コンポーネントに集中し、ユーザー体験を最大限向上
2. **第2グループ**: 認証・プロフィール関連の重要機能をカバー
3. **第3グループ**: 特殊機能とチュートリアル関連を段階的に対応

## 実装ガイドライン

各コンポーネントには以下のアクセシビリティプロパティを追加:

- `accessibilityRole`: コンポーネントの役割（button, text, image, etc.）
- `accessibilityLabel`: スクリーンリーダーが読み上げるラベル
- `accessibilityHint`: 操作のヒント（オプション）
- `accessibilityState`: 状態（disabled, selected, checked, etc.）

詳細は `docs/ACCESSIBILITY_SCREEN_READER_GUIDE.md` を参照。
