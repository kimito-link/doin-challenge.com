# 環境変数ガイド

## 概要

このドキュメントは、動員ちゃれんじアプリケーションで使用する環境変数の一覧と設定方法を記述しています。

---

## 必須環境変数

### データベース

#### `DATABASE_URL`

**説明**: MySQLデータベースの接続URL

**形式**: `mysql://user:password@host:port/database`

**例**:
```
DATABASE_URL=mysql://admin:password123@localhost:3306/doin_challenge
```

**取得方法**: データベースホスティングサービス（PlanetScale、AWS RDS等）で取得

---

### 認証（OAuth）

#### `TWITTER_CLIENT_ID`

**説明**: Twitter/X OAuth 2.0のクライアントID

**形式**: 文字列

**例**:
```
TWITTER_CLIENT_ID=your_twitter_client_id
```

**取得方法**: [Twitter Developer Portal](https://developer.twitter.com/)で取得

#### `TWITTER_CLIENT_SECRET`

**説明**: Twitter/X OAuth 2.0のクライアントシークレット

**形式**: 文字列

**例**:
```
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

**取得方法**: [Twitter Developer Portal](https://developer.twitter.com/)で取得

---

## 監視・エラートラッキング

### Sentry

#### `SENTRY_DSN`

**説明**: Sentryのデータソース名（エラー送信先）

**形式**: URL

**例**:
```
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

**取得方法**: [Sentry](https://sentry.io/)でプロジェクトを作成し、設定画面で取得

#### `SENTRY_ENVIRONMENT`

**説明**: Sentryの環境名（エラーの分類用）

**形式**: `development` | `staging` | `production`

**例**:
```
SENTRY_ENVIRONMENT=production
```

**デフォルト**: `development`

---

## Feature Flags

### リアルタイム更新

#### `EXPO_PUBLIC_ENABLE_REALTIME_UPDATES`

**説明**: リアルタイム更新（Polling）の有効/無効

**形式**: `true` | `false`

**例**:
```
EXPO_PUBLIC_ENABLE_REALTIME_UPDATES=true
```

**デフォルト**: `true`

**用途**: 
- `true`: 10秒ごとに自動更新（イベント詳細画面）
- `false`: 手動更新のみ（パフォーマンス問題時に無効化）

### プッシュ通知

#### `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS`

**説明**: プッシュ通知の有効/無効

**形式**: `true` | `false`

**例**:
```
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

**デフォルト**: `false`

**用途**:
- `true`: プッシュ通知を送信
- `false`: プッシュ通知を無効化（通知サーバー問題時に無効化）

### アニメーション

#### `EXPO_PUBLIC_ENABLE_ANIMATIONS`

**説明**: アニメーション（紙吹雪など）の有効/無効

**形式**: `true` | `false`

**例**:
```
EXPO_PUBLIC_ENABLE_ANIMATIONS=true
```

**デフォルト**: `true`

**用途**:
- `true`: アニメーションを表示（目標達成時の紙吹雪など）
- `false`: アニメーションを無効化（パフォーマンス問題時に無効化）

---

## オプション環境変数

### サーバー設定

#### `PORT`

**説明**: サーバーのポート番号

**形式**: 数値

**例**:
```
PORT=3000
```

**デフォルト**: `3000`

#### `EXPO_PORT`

**説明**: Expoのポート番号

**形式**: 数値

**例**:
```
EXPO_PORT=8081
```

**デフォルト**: `8081`

#### `NODE_ENV`

**説明**: Node.jsの実行環境

**形式**: `development` | `production`

**例**:
```
NODE_ENV=production
```

**デフォルト**: `development`

---

## 設定方法

### ローカル開発環境

1. プロジェクトルートに`.env`ファイルを作成

```bash
touch .env
```

2. 必須環境変数を追加

```env
DATABASE_URL=mysql://user:password@localhost:3306/doin_challenge
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=development
```

3. 開発サーバーを再起動

```bash
pnpm dev
```

### 本番環境（Vercel）

1. Vercelダッシュボードにアクセス

2. プロジェクトの「Settings」→「Environment Variables」を開く

3. 以下の環境変数を追加

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | 本番データベースのURL | Production |
| `TWITTER_CLIENT_ID` | 本番用Twitter Client ID | Production |
| `TWITTER_CLIENT_SECRET` | 本番用Twitter Client Secret | Production |
| `SENTRY_DSN` | Sentry DSN | Production |
| `SENTRY_ENVIRONMENT` | `production` | Production |
| `EXPO_PUBLIC_ENABLE_REALTIME_UPDATES` | `true` | Production |
| `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS` | `true` | Production |
| `EXPO_PUBLIC_ENABLE_ANIMATIONS` | `true` | Production |

4. デプロイを実行

```bash
git push origin main
```

---

## セキュリティ注意事項

### ⚠️ 重要

- **`.env`ファイルをGitにコミットしないでください**
- **本番環境の認証情報は絶対に公開しないでください**
- **`.env`ファイルは`.gitignore`に追加されています**

### 推奨事項

1. **環境変数の暗号化**: 本番環境の環境変数は必ず暗号化して保存
2. **アクセス制限**: 環境変数にアクセスできる人を最小限に制限
3. **定期的なローテーション**: 認証情報は定期的に更新
4. **監査ログ**: 環境変数の変更履歴を記録

---

## トラブルシューティング

### 環境変数が読み込まれない

**原因**: `.env`ファイルが正しく配置されていない、または開発サーバーが再起動されていない

**解決方法**:
1. `.env`ファイルがプロジェクトルートに配置されているか確認
2. 開発サーバーを再起動（`pnpm dev`）

### データベース接続エラー

**原因**: `DATABASE_URL`が正しく設定されていない

**解決方法**:
1. `DATABASE_URL`の形式を確認（`mysql://user:password@host:port/database`）
2. データベースサーバーが起動しているか確認
3. ファイアウォールでポートが開いているか確認

### OAuth認証エラー

**原因**: `TWITTER_CLIENT_ID`または`TWITTER_CLIENT_SECRET`が正しく設定されていない

**解決方法**:
1. Twitter Developer Portalで認証情報を確認
2. リダイレクトURLが正しく設定されているか確認
3. 環境変数を再設定して開発サーバーを再起動

### Sentryにエラーが送信されない

**原因**: `SENTRY_DSN`が正しく設定されていない、またはSentryが初期化されていない

**解決方法**:
1. `SENTRY_DSN`を確認
2. `server/_core/sentry.ts`が正しくインポートされているか確認
3. Sentryダッシュボードでプロジェクトが有効になっているか確認

---

## 参考リンク

- [Twitter Developer Portal](https://developer.twitter.com/)
- [Sentry](https://sentry.io/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js環境変数ガイド](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| v1.0.0 | 2026-01-27 | 初版作成 |

---

## サポート

環境変数に関する質問や問題がある場合は、[GitHub Issues](https://github.com/kimito-link/doin-challenge.com/issues)で報告してください。
