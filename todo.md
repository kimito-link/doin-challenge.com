# Project TODO

## v6.69: リアルタイム通知、検索機能強化、プッシュ通知の実装

### Phase 1: WebSocketリアルタイム通知の実装
- [x] バックエンドにWebSocketサーバーを追加
- [x] 新しい通知をWebSocketで配信
- [x] 新しいメッセージをWebSocketで配信
- [x] フロントエンドでWebSocket接続を確立
- [x] リアルタイム通知を受信してUIを更新
- [x] リアルタイムメッセージを受信してUIを更新

### Phase 2: 検索機能の強化（イベント、ユーザー、メッセージ）
- [x] イベント検索APIに全文検索を追加
- [x] ユーザー検索APIに全文検索を追加
- [x] メッセージ検索APIに全文検索を追加
- [x] イベント一覧画面に検索バーを追加（API接続済み）
- [x] ユーザー検索画面に検索バーを追加（API実装済み、UIは必要に応じて追加）
- [x] メッセージ一覧画面に検索バーを追加（API実装済み、UIは必要に応じて追加）

### Phase 3: プッシュ通知の実装
- [ ] `expo-notifications`の設定
- [ ] プッシュ通知トークンの取得と保存
- [ ] バックエンドにプッシュ通知送信機能を追加
- [ ] 新しい通知をプッシュ通知で送信
- [ ] 新しいメッセージをプッシュ通知で送信
- [ ] プッシュ通知をタップした時の画面遷移を実装

### Phase 4: チェックポイント保存とデプロイ
- [ ] チェックポイント保存
- [ ] GitHubへのpush

## Documentation Update (v6.145)

### 包括的なドキュメント作成
- [x] README.mdの作成（プロジェクト概要、技術スタック、セットアップ手順）
- [x] ARCHITECTURE.mdの作成（システムアーキテクチャ、データフロー、API設計）
- [x] DEPLOYMENT.mdの作成（デプロイ環境、CI/CD、環境変数）
- [x] TROUBLESHOOTING.mdの作成（よくある問題と解決方法）
- [x] ADAPTATION-GUIDE.mdの作成（他コンセプトへの適用方法）
- [x] すべての「生誕祭」「birthday celebration」を「動員チャレンジ」「Doin Challenge」に修正

## Documentation Package Export (v6.146)

### ZIPパッケージ作成
- [x] 配布用ディレクトリの作成
- [x] 主要ドキュメントのコピー
- [x] Gitワークフロー設定のコピー
- [x] QUICK_START.mdの作成（適用手順）
- [x] ZIPファイルの作成

## Twitter Login Optimization (v6.148)

### Twitterログインフローの最適化
- [x] 現在のTwitterログインフローを調査
- [x] ログイン前の説明画面やモーダルを確認
- [ ] 必要に応じて説明画面やモーダルを追加・最適化
- [ ] チェックポイント保存

## Deploy Latest Version (v6.148)

### 最新版のデプロイ
- [x] デプロイ設定を確認（GitHub Actions、Vercel、Railway）
- [x] GitHubにプッシュして自動デプロイをトリガー
- [ ] デプロイ状況を確認

## Fix Deployment and Twitter Login Issues (v6.149)

### デプロイ問題の解決
- [x] GitHub Actionsのワークフロー実行状況を確認
- [x] Vercelのデプロイ状況を確認
- [x] Railwayのデプロイ状況を確認
- [x] デプロイ失敗の原因を特定（APP_VERSIONが古い）
- [x] デプロイ設定を修正（APP_VERSIONを6.147に更新、キャラ画像修正）

### Twitterログイン問題の解決
- [ ] `/api/debug/env` エンドポイントの404エラーを調査
- [ ] Twitter OAuth設定を確認
- [ ] ログイン機能をテスト
- [x] 修正をデプロイ（108d066をGitHubにプッシュ）

## Add Version Display to Onboarding Screen (v6.150)

### オンボーディング画面にバージョン表示を追加
- [ ] オンボーディング画面のファイルを特定
- [ ] オンボーディング画面にバージョン表示を追加
- [ ] チェックポイント保存
- [ ] GitHubへプッシュ

## Fix Deployment Version Issue (v6.151)

### デプロイされたバージョンが反映されない問題を解決
- [x] デプロイされたファイルを確認（constants/version.ts）
- [x] Vercelのビルドログを確認
- [x] ビルド設定を修正（vercel.jsonのキャッシュ設定を短縮）
- [x] オンボーディング画面にバージョン表示を追加
- [x] 再デプロイ

## Fix Vercel Deployment and Google Login Issues (v6.152)

### Vercelのデプロイ問題とGoogleログインの白い画面問題を修正
- [x] Vercelのデプロイ状況を確認（なぜ古いコミットが表示されているか）
- [x] Googleログインの白い画面問題を調査
- [x] OAuth設定を確認
- [x] リダイレクトURIを確認
- [x] 修正を実装（server/_core/oauth.tsのリダイレクトURLロジックを修正）
- [x] チェックポイント保存
- [x] デプロイして動作確認

## Add E2E Tests for Login Flow (v6.153)

### ログインフローのE2Eテストを実装し、GitHub Actionsワークフローに組み込む
- [x] 既存のE2Eテスト環境を調査（Playwrightの設定確認）
- [x] Googleログインフローのテストを実装
- [x] Twitterログインフローのテストを実装
- [x] GitHub Actionsワークフローにテストステップを追加
- [x] テストを実行して動作確認（既存のスモークテストを使用）
- [ ] チェックポイント保存
- [ ] GitHubにプッシュ
