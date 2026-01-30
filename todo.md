# Birthday Celebration App TODO

## 🔴 Critical Production Issues (Reported 2026-01-29)

### 0. Onboarding & UX Issues (最優先 - 2026-01-29 追加)
- [x] オンボード画面が初回訪問時に表示されない（直接ホーム画面に飛ぶ） - ローディング画面を追加、AsyncStorageの初期化を待つように修正
- [x] 視認性が最悪（テキストとボタンのコントラスト比が低い） - 既にv6.161で修正済み（WCAG 2.1 AA/AAA基準達成）
- [x] ホーム画面のキャラクターアイコンで男女の区別がつかない - キャラクター詳細に性別バッジを追加（男性：青、女性：ピンク）
- [x] ログインモーダルのキャラクターがオリジナルキャラクターではない（汎用キャラが表示される） - 既にオリジナルキャラクター（りんく）が表示されている

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


---

## 🔧 md全体監視システム (2026-01-29)

### 汎用的なmd監視スクリプト
- [ ] check-all-md.sh の実装（すべてのmdファイルをスキャン）
- [ ] 未実装項目の自動検出
- [ ] GitHub Actionsワークフローへの統合
- [ ] デプロイ前の自動チェック


---

## 🎯 md実装タスク (2026-01-29)

### 実装対象（優先度順）
- [ ] UptimeRobotで `/api/health` を監視（30分）
- [x] Sentry導入（通知は最小3種類だけ）（1時間）
- [x] visibility-issues.md: コントラスト比確認（15分）（すべてAA以上、2つはAAA達成）
- [ ] visibility-issues.md: 実機確認（15分）

### テスト対象（本番環境デプロイ後）
- [ ] workflow-diff-check.md: デプロイ前差分チェック（30分）
- [ ] critical-features-checklist.md: 本番環境機能テスト（2-3時間）

### Onboarding Screen Not Showing (2026-01-29 追加)
- [x] オンボード画面が本番環境で表示されない（v6.164デプロイ済みだが機能していない） - ストレージキーを`@onboarding_completed_v2`に変更
- [x] useOnboardingフックのAsyncStorageロジックをデバッグ - 旧キーが`true`に設定されていたため、新キーに変更
- [x] 代替のオンボード検出方法を実装（例：URLパラメータ、セッションストレージ） - ストレージキーのバージョン管理で対応

### Deployment Pipeline Issues (2026-01-29 追加)
- [ ] webdev_save_checkpointがGitHubに同期されない根本原因を調査
- [ ] Vercel直接デプロイの実装（GitHub経由ではなく）
- [ ] 自動デプロイパイプラインのテスト
- [ ] v6.165の本番環境デプロイ確認

---

## 📚 Documentation Reorganization (2026-01-30)

### ドキュメント整理
- [x] README.mdを整理し、デプロイ方法を最優先で表示
- [x] docs/development-guide.mdを作成（開発環境のセットアップ）
- [x] docs/architecture.mdを作成（アーキテクチャの説明）
- [x] chatlog-20260130.mdを作成（今回のセッションの作業ログ）
- [ ] v6.166のチェックポイント作成
- [ ] GitHubにプッシュ
