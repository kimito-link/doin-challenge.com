# UptimeRobot監視設定ガイド

このドキュメントは、UptimeRobotを使用したサーバー監視の設定手順を説明します。

---

## 目的

**「サーバーがダウンしたら即座に検知する」**体制を確立し、手動確認を前提としない運用を実現します。

---

## 監視対象エンドポイント

### 優先度1: `/api/readyz`（最優先）

**URL**: https://doin-challenge.com/api/readyz

**理由**: サーバーの生存確認に特化したエンドポイント。DB接続確認も含む。

**期待するレスポンス**:
```json
{
  "ok": true
}
```

**HTTP Status**: 200

---

### 優先度2: `/api/health`（詳細確認）

**URL**: https://doin-challenge.com/api/health

**理由**: 詳細なヘルスチェック情報を提供。commitSha、version、DB接続状態などを含む。

**期待するレスポンス**:
```json
{
  "ok": true,
  "commitSha": "bdcba8d6...",
  "version": "v6.122",
  "dbStatus": {
    "connected": true,
    "latency": 10
  }
}
```

**HTTP Status**: 200

---

## UptimeRobotアカウントの作成

### Step 1: アカウント登録

1. https://uptimerobot.com にアクセス
2. 「Sign Up Free」をクリック
3. メールアドレスとパスワードを入力
4. メール認証を完了

**無料プラン**で十分です（50モニター、5分間隔監視）。

---

## モニターの設定

### Monitor 1: `/api/readyz`（最優先）

#### Step 1: 新しいモニターを作成

1. ダッシュボードで「+ Add New Monitor」をクリック
2. 以下の設定を入力：

| 項目 | 設定値 |
|------|--------|
| Monitor Type | HTTP(s) |
| Friendly Name | `birthday-celebration - readyz` |
| URL (or IP) | `https://doin-challenge.com/api/readyz` |
| Monitoring Interval | 5 minutes |

#### Step 2: アラート設定

「Alert Contacts」セクションで、通知先を設定します：

- **Email**: 自分のメールアドレス
- **Slack** (推奨): Slack Webhookを設定

#### Step 3: 詳細設定

「Advanced Settings」を展開し、以下を設定：

| 項目 | 設定値 |
|------|--------|
| Timeout | 30 seconds |
| HTTP Method | GET |
| Expected Status Code | 200 |
| Keyword Exists | `"ok":true` |

#### Step 4: モニターを作成

「Create Monitor」をクリックして、モニターを作成します。

---

### Monitor 2: `/api/health`（詳細確認）

#### Step 1: 新しいモニターを作成

1. ダッシュボードで「+ Add New Monitor」をクリック
2. 以下の設定を入力：

| 項目 | 設定値 |
|------|--------|
| Monitor Type | HTTP(s) |
| Friendly Name | `birthday-celebration - health` |
| URL (or IP) | `https://doin-challenge.com/api/health` |
| Monitoring Interval | 5 minutes |

#### Step 2: アラート設定

「Alert Contacts」セクションで、通知先を設定します（Monitor 1と同じ）。

#### Step 3: 詳細設定

「Advanced Settings」を展開し、以下を設定：

| 項目 | 設定値 |
|------|--------|
| Timeout | 30 seconds |
| HTTP Method | GET |
| Expected Status Code | 200 |
| Keyword Exists | `"ok":true` |

#### Step 4: モニターを作成

「Create Monitor」をクリックして、モニターを作成します。

---

## Slack通知の設定（推奨）

### Step 1: Slack Incoming Webhookを作成

1. https://api.slack.com/apps にアクセス
2. 「Create New App」→「From scratch」を選択
3. App名を入力（例: `UptimeRobot`）、Workspaceを選択
4. 「Incoming Webhooks」を有効化
5. 「Add New Webhook to Workspace」をクリック
6. 通知先チャンネルを選択（例: `#alerts`）
7. Webhook URLをコピー

### Step 2: UptimeRobotにSlack Webhookを設定

1. UptimeRobotダッシュボードで「My Settings」をクリック
2. 「Alert Contacts」タブを選択
3. 「Add Alert Contact」をクリック
4. 以下を設定：

| 項目 | 設定値 |
|------|--------|
| Alert Contact Type | Webhook |
| Friendly Name | `Slack - #alerts` |
| URL to Notify | Step 1でコピーしたWebhook URL |
| POST Value (JSON Format) | 以下を貼り付け |

```json
{
  "text": "*monitorFriendlyName* is *alertTypeFriendlyName*\n*alertDetails*"
}
```

5. 「Create Alert Contact」をクリック

### Step 3: モニターにSlack通知を追加

1. 各モニターの「Edit」をクリック
2. 「Alert Contacts」セクションで、作成したSlack通知を選択
3. 「Save Changes」をクリック

---

## 監視の確認

### Step 1: モニターが正常に動作しているか確認

UptimeRobotダッシュボードで、以下を確認します：

- **Status**: 両方のモニターが「Up」（緑）になっている
- **Response Time**: 100ms以下が理想（300ms以下なら許容範囲）
- **Uptime**: 100%が理想

### Step 2: テストアラートを送信

1. モニターの「Edit」をクリック
2. 「Send Test Alert」をクリック
3. メールまたはSlackに通知が届くことを確認

---

## アラート対応フロー

### ダウンアラートが届いた場合

1. **即座に確認**: https://doin-challenge.com/api/readyz にアクセスして、サーバーがダウンしているか確認
2. **ログ確認**: Railwayのログを確認して、エラーメッセージを特定
3. **ロールバック**: 必要に応じて、前のチェックポイントにロールバック
4. **復旧確認**: UptimeRobotで「Up」になることを確認

### レスポンス時間が遅い場合

1. **パフォーマンス確認**: `/api/health`にアクセスして、DB接続レイテンシを確認
2. **データベース確認**: Railwayでデータベースの負荷を確認
3. **最適化**: 必要に応じて、クエリの最適化やインデックスの追加

---

## 次のステップ

UptimeRobotの設定が完了したら、以下を実施してください：

1. **Sentryの導入**: エラー監視を有効化（`docs/SENTRY-SETUP.md`参照）
2. **定期的な確認**: 週1回、UptimeRobotダッシュボードでUptime率を確認
3. **アラート対応訓練**: ダウンアラートが届いた際の対応フローを確認

---

## 参考資料

- [UptimeRobot Documentation](https://uptimerobot.com/help/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
