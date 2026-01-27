# Sentry 設定手順

## 概要

Sentryを使用して、API 5xx / エラー急増 / ログイン失敗率を監視します。

## 設定手順

### 1. Sentryにサインアップ

https://sentry.io/ にアクセスして、無料アカウントを作成します。

### 2. 新しいプロジェクトを作成

1. ダッシュボードで「Create Project」をクリック
2. プラットフォームを選択：
   - **React Native**（クライアント側）
   - **Node.js**（サーバー側）
3. プロジェクト名を入力：`doin-challenge`
4. 「Create Project」をクリック

### 3. DSNを取得

プロジェクト作成後、DSN（Data Source Name）が表示されます。これをコピーします。

例: `https://examplePublicKey@o0.ingest.sentry.io/0`

### 4. 環境変数を設定

#### ローカル開発環境

`.env`ファイルに以下を追加：

```bash
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=development
```

#### 本番環境（Vercel）

Vercelの Project Settings → Environment Variables に以下を追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `SENTRY_DSN` | `https://examplePublicKey@o0.ingest.sentry.io/0` | Production, Preview, Development |
| `SENTRY_ENVIRONMENT` | `production` | Production |
| `SENTRY_ENVIRONMENT` | `preview` | Preview |
| `SENTRY_ENVIRONMENT` | `development` | Development |

### 5. クライアント側の設定（React Native）

`app/_layout.tsx`にSentryの初期化コードを追加：

```typescript
import * as Sentry from "@sentry/react-native";

// Sentryを初期化
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ?? "development",
    tracesSampleRate: 0.02,
  });
}
```

### 6. 認証フローにトラッキングを追加

認証フローの適切な箇所に、以下のトラッキング関数を追加：

```typescript
import {
  trackAuthLoginStart,
  trackAuthLoginSuccess,
  trackAuthLoginFailed,
  trackAuthCallbackFailed,
} from "@/lib/telemetry/authEvents";

// ログイン開始時
trackAuthLoginStart();

// ログイン成功時
trackAuthLoginSuccess();

// ログイン失敗時
trackAuthLoginFailed("reason");

// OAuthコールバック失敗時
trackAuthCallbackFailed("reason");
```

## 監視内容

### 1. API 5xx / エラー急増

- **自動**: tRPCのエラーハンドラで自動的にSentryに送信
- **確認**: Sentry Dashboard → Issues

### 2. ログイン失敗率

- **手動**: `trackAuthLoginFailed()`を呼び出す
- **確認**: Sentry Dashboard → Events → `auth_login_failed`

### 3. フロント例外

- **自動**: React Nativeの例外を自動的にSentryに送信
- **確認**: Sentry Dashboard → Issues

## 確認

1. Sentryで例外が1件でも見える（テストでOK）
2. `auth_login_failed`を1回投げて、Sentryの Events に出る

## トラブルシューティング

### Sentryにエラーが送信されない場合

1. `SENTRY_DSN`が正しく設定されているか確認
2. ネットワーク接続を確認
3. Sentryのコンソールでエラーログを確認

### ログイン失敗率が表示されない場合

1. `trackAuthLoginFailed()`が正しく呼び出されているか確認
2. Sentry Dashboard → Events → Filters で`auth_login_failed`を検索
