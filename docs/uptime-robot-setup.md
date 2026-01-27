# UptimeRobot 設定手順

## 概要

UptimeRobotを使用して、`/api/readyz`エンドポイントを監視し、デプロイ直後の死を検知します。

## 設定手順

### 1. UptimeRobotにサインアップ

https://uptimerobot.com/ にアクセスして、無料アカウントを作成します。

### 2. 新しいモニターを作成

1. ダッシュボードで「Add New Monitor」をクリック
2. 以下の設定を入力：

| 項目 | 値 |
|------|-----|
| Monitor Type | HTTP(s) |
| Friendly Name | doin-challenge readyz |
| URL | https://doin-challenge.com/api/readyz |
| Monitoring Interval | 5 minutes（最初はこれでOK。慣れたら1分でも） |
| Alert Contacts | メールアドレスを設定 |

### 3. 失敗の扱い

- `readyz`が200以外（503含む）を返したら落ちた判定になる
- 「デプロイ直後にDB/依存が死んだ」を確実に拾えます

## 監視対象エンドポイント

### `/api/healthz`

- **役割**: 軽い（常に200を返す、プロセス生存確認）
- **監視**: 不要（UptimeRobotでは監視しない）

### `/api/readyz`

- **役割**: 重い（DB疎通・依存の確認。失敗時は503）
- **監視**: UptimeRobotで監視（5分間隔）

## 通知設定

- **メール**: 最小限の通知設定
- **失敗条件**: ステータスが200以外（503含む）

## 確認

1. https://doin-challenge.com/api/healthz → 200
2. https://doin-challenge.com/api/readyz → 200（DB接続OK時）
3. UptimeRobotで readyz 監視が緑になる

## トラブルシューティング

### readyzが503を返す場合

1. データベース接続を確認
2. `DATABASE_URL`環境変数が正しく設定されているか確認
3. データベースサーバーが起動しているか確認

### UptimeRobotが通知を送らない場合

1. Alert Contactsが正しく設定されているか確認
2. メールアドレスが正しいか確認
3. スパムフォルダを確認
