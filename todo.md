# Birthday Celebration App TODO

## 🔴 Critical Production Issues (Reported 2026-01-29)

### 1. Login & Authentication (最優先)
- [x] ログインを何度も繰り返すと "Invalid or expired state parameter" エラーが発生
- [x] OAuth state parameter の有効期限管理を調査・修正（10分→30分に延長）

### 2. Statistics Dashboard (高優先度)
- [x] 統計ダッシュボードで「統計データを読み込めませんでした」エラー
- [x] /stats エンドポイントのエラー原因を調査・修正（ログインチェック既に実装済み）

### 3. Image & Thumbnail Display (高優先度)
- [ ] チャレンジのAPIサムネイル画像が表示されない
- [ ] サムネイル取得・表示ロジックを調査・修正

### 4. Version Display Issues (中優先度)
- [ ] オンボーディング画面とホーム画面でバージョン表示が異なる（v6.147 vs v6.53）
- [ ] バージョン表示を統一して中央に配置

### 5. User Profile & Character Display (中優先度)
- [ ] マイページでオリジナルキャラが表示されない（デフォルトアイコンのまま）
- [ ] ログイン後のキャラクター表示ロジックを修正

### 6. UI Text & Display Issues (低優先度)
- [x] ログイン画面の表記ミス: 「たぬ姉」→「たぬね」を「たぬ姉」に修正
- [x] チャレンジ作成画面でプロフィール文章が表示されない（showDescription=trueに変更）

### 7. Responsive Design (低優先度)
- [x] 地図がレスポンシブになっていない（モバイル表示）（既に実装済み）
- [x] モバイル環境での視認性改善（既に実装済み）

---

## Previously Completed (v6.160 - Not Yet Deployed)

### Version Management
- [x] オンボーディング画面のバージョン表示実装を調査
- [x] ホーム画面のバージョン表示実装を調査
- [x] 両画面で同じバージョンソースを使用するように修正
- [x] shared/version.tsに統一
- [x] constants/version.tsへの参照を削除

### Update History Feature
- [x] グローバルメニューに「アップデート履歴」メニュー項目を追加
- [x] 既存のrelease-notes.tsxを一般ユーザー向けに改善
- [x] バージョン表示を中央またはわかりやすい場所に移動（リリースノート画面のヘッダーに大きく表示）
- [x] アップデート履歴画面のデザインを改善（一般人にもわかりやすく）
- [ ] ローカルでテストして動作確認（問題発見のため保留）
- [ ] チェックポイント保存（問題修正後）
- [ ] GitHubにプッシュ（問題修正後）

---

## 🆕 New Features (2026-01-29)

### md準拠チェックシステム
- [x] md準拠チェックスクリプトの実装（scripts/check-md-compliance.sh）
- [x] GitHub Actionsワークフローへの統合
- [ ] 本番環境でのテスト

### Documentation
- [x] md監査結果の作成（docs/md-audit-results.md）
- [x] 本番環境の問題調査完了
