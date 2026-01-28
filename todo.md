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
