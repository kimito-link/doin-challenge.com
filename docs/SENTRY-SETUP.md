# Sentry導入ガイド

このドキュメントは、Sentryを使用したエラー監視の設定手順を説明します。

---

## 目的

**「エラーが発生したら即座に検知する」**体制を確立し、ログイン失敗率やAPI 5xxエラー急増などを監視します。

---

## Sentryアカウントの作成

### Step 1: アカウント登録

1. https://sentry.io にアクセス
2. 「Get Started」をクリック
3. メールアドレスとパスワードを入力（またはGitHubでサインアップ）
4. メール認証を完了

**無料プラン**で十分です（5,000エラー/月、1ユーザー）。

---

## Sentryプロジェクトの作成

### Step 1: 新しいプロジェクトを作成

1. Sentryダッシュボードで「Create Project」をクリック
2. 以下の設定を入力：

| 項目 | 設定値 |
|------|--------|
| Platform | React |
| Project Name | `birthday-celebration` |
| Team | 自分のチーム |
| Alert Frequency | `On every new issue` |

3. 「Create Project」をクリック

### Step 2: DSNをコピー

プロジェクト作成後、以下の情報が表示されます：

```
DSN: https://1a2b3c4d5e6f7g8h9i0j@o123456.ingest.sentry.io/1234567
```

→ このDSNをコピーしてください。

---

## 環境変数の設定

### Step 1: `.env`ファイルに追加

プロジェクトルートの`.env`ファイルに以下を追加：

```bash
# Sentry設定
EXPO_PUBLIC_SENTRY_DSN=https://1a2b3c4d5e6f7g8h9i0j@o123456.ingest.sentry.io/1234567
EXPO_PUBLIC_SENTRY_ENVIRONMENT=production
EXPO_PUBLIC_COMMIT_SHA=${GITHUB_SHA}
```

### Step 2: GitHub Secretsに追加

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」を開く
2. 「New repository secret」をクリック
3. 以下のSecretsを追加：

#### EXPO_PUBLIC_SENTRY_DSN

- Name: `EXPO_PUBLIC_SENTRY_DSN`
- Secret: Step 2でコピーしたDSN

#### EXPO_PUBLIC_SENTRY_ENVIRONMENT

- Name: `EXPO_PUBLIC_SENTRY_ENVIRONMENT`
- Secret: `production`

---

## Vercelへの環境変数設定

### Step 1: Vercelプロジェクトの環境変数を設定

1. https://vercel.com にアクセス
2. 「birthday-celebration」プロジェクトを選択
3. 「Settings」→「Environment Variables」を開く
4. 以下の環境変数を追加：

| Key | Value | Environment |
|-----|-------|-------------|
| `EXPO_PUBLIC_SENTRY_DSN` | `https://1a2b3c4d5e6f7g8h9i0j@o123456.ingest.sentry.io/1234567` | Production, Preview, Development |
| `EXPO_PUBLIC_SENTRY_ENVIRONMENT` | `production` | Production |
| `EXPO_PUBLIC_SENTRY_ENVIRONMENT` | `preview` | Preview |
| `EXPO_PUBLIC_SENTRY_ENVIRONMENT` | `development` | Development |

---

## Sentryの動作確認

### Step 1: テストエラーを送信

開発環境で以下のコードを実行して、Sentryにエラーが送信されることを確認します：

```typescript
import { captureError } from "@/lib/sentry";

// テストエラーを送信
captureError(new Error("Test error from Sentry setup"));
```

### Step 2: Sentryダッシュボードで確認

1. Sentryダッシュボードで「Issues」タブを開く
2. 「Test error from Sentry setup」というエラーが表示されることを確認

---

## アラート設定

### Step 1: アラートルールを作成

1. Sentryプロジェクトで「Alerts」タブを開く
2. 「Create Alert」をクリック
3. 以下のアラートルールを作成：

#### アラート1: 新しいエラーの即時通知

| 項目 | 設定値 |
|------|--------|
| Alert Name | `New Error Alert` |
| When | `A new issue is created` |
| Then | `Send a notification to...` |
| Action | メールまたはSlack |

#### アラート2: エラー急増の検知

| 項目 | 設定値 |
|------|--------|
| Alert Name | `Error Spike Alert` |
| When | `The issue count increases by more than 100% in 1 hour` |
| Then | `Send a notification to...` |
| Action | メールまたはSlack |

#### アラート3: API 5xxエラーの検知

| 項目 | 設定値 |
|------|--------|
| Alert Name | `API 5xx Error Alert` |
| When | `An event is captured` |
| If | `event.tags.status_code` `equals` `5xx` |
| Then | `Send a notification to...` |
| Action | メールまたはSlack |

---

## Slack通知の設定（推奨）

### Step 1: Slack Integrationを有効化

1. Sentryプロジェクトで「Settings」→「Integrations」を開く
2. 「Slack」を検索して「Install」をクリック
3. Slackワークスペースを選択して認証
4. 通知先チャンネルを選択（例: `#alerts`）

### Step 2: アラートルールにSlack通知を追加

1. 「Alerts」タブで各アラートルールを編集
2. 「Action」で「Send a notification to Slack」を選択
3. 通知先チャンネルを選択

---

## エラー監視のベストプラクティス

### 1. ユーザー情報の設定

ログイン後に、ユーザー情報をSentryに設定します：

```typescript
import { setSentryUser } from "@/lib/sentry";

// ログイン成功時
setSentryUser(user.id, user.username);
```

ログアウト時には、ユーザー情報をクリアします：

```typescript
import { clearSentryUser } from "@/lib/sentry";

// ログアウト時
clearSentryUser();
```

### 2. カスタムエラーの送信

特定のエラーを明示的にSentryに送信する場合：

```typescript
import { captureError } from "@/lib/sentry";

try {
  // エラーが発生する可能性のある処理
  await riskyOperation();
} catch (error) {
  // エラーをSentryに送信
  captureError(error as Error, {
    context: "riskyOperation",
    userId: user.id,
  });
  
  // ユーザーにエラーメッセージを表示
  showToast("エラーが発生しました", "error");
}
```

### 3. カスタムメッセージの送信

重要なイベントをSentryに記録する場合：

```typescript
import { captureMessage } from "@/lib/sentry";

// ログイン失敗時
captureMessage(`Login failed for user: ${username}`, "warning");

// API 5xxエラー時
captureMessage(`API 5xx error: ${error.message}`, "error");
```

---

## エラー対応フロー

### 新しいエラーが検知された場合

1. **即座に確認**: Sentryダッシュボードでエラーの詳細を確認
2. **影響範囲の特定**: エラーが発生しているユーザー数、環境、ブラウザを確認
3. **優先度の判断**: エラーの重大度と影響範囲から優先度を判断
4. **修正**: エラーを修正してデプロイ
5. **検証**: Sentryでエラーが解消されたことを確認

### エラー急増が検知された場合

1. **即座に確認**: Sentryダッシュボードでエラーの急増を確認
2. **原因の特定**: 最近のデプロイやコード変更を確認
3. **ロールバック**: 必要に応じて、前のチェックポイントにロールバック
4. **復旧確認**: Sentryでエラー数が正常に戻ったことを確認

---

## 次のステップ

Sentryの設定が完了したら、以下を実施してください：

1. **定期的な確認**: 週1回、Sentryダッシュボードでエラー数を確認
2. **エラー対応訓練**: 新しいエラーが検知された際の対応フローを確認
3. **パフォーマンス監視**: Sentryのパフォーマンス監視機能を有効化（オプション）

---

## 参考資料

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Alerts](https://docs.sentry.io/product/alerts/)
