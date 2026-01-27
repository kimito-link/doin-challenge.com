# Gate 1セットアップガイド

このドキュメントは、「壊れない運用」を実現するためのGate 1要件のセットアップ手順を説明します。

## 目的

**「CIが緑＝本番にそのコードが確実に出ている」状態**を実現し、手動確認を前提としない運用を確立します。

---

## 実装内容

### 1. Vercel明示的デプロイ（GitHub Actions）

**問題**: Vercel Git Integration（自動デプロイ）に依存すると、設定ミスでデプロイが発火しない場合、「CIは緑なのに本番が古いコード」という最悪の状態が発生する。

**解決策**: GitHub ActionsからVercelへ明示的にデプロイを実行し、デプロイ失敗時はCIを赤にする。

**実装ファイル**: `.github/workflows/deploy-vercel.yml`

**フロー**:
1. TypeScriptチェック
2. テスト実行
3. Vercelへデプロイ（`amondnet/vercel-action@v25`）
4. デプロイ完了待機（30秒）
5. デプロイ反映確認（commitSha照合）
6. スモークチェック（`/api/readyz`）

---

### 2. デプロイ反映確認機構

**目的**: デプロイが本番に反映されたことを機械的に確認する。

**実装内容**:
- `/api/health`エンドポイントに`commitSha`を追加
- GitHub Actionsでデプロイ後に`commitSha`を照合
- 不一致の場合はCI失敗

**実装ファイル**:
- `server/_core/index.ts`: `/api/health`エンドポイント
- `server/_core/systemRouter.ts`: tRPC `health`プロシージャ
- `.github/workflows/deploy-vercel.yml`: 照合スクリプト

**環境変数**:
- `COMMIT_SHA`: GitHub Actionsから`${{ github.sha }}`を設定

---

### 3. 必要なGitHub Secrets

以下のSecretsをGitHubリポジトリに設定してください：

| Secret名 | 説明 | 取得方法 |
|---------|------|---------|
| `VERCEL_TOKEN` | Vercelアクセストークン | Vercel Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel組織ID | Vercel Project Settings → General → Project ID の上部 |
| `VERCEL_PROJECT_ID` | VercelプロジェクトID | Vercel Project Settings → General → Project ID |

**取得手順**:

1. **VERCEL_TOKEN**:
   - https://vercel.com/account/tokens にアクセス
   - 「Create Token」をクリック
   - Token名を入力（例: `github-actions`）
   - Scopeは「Full Account」を選択
   - 生成されたトークンをコピー

2. **VERCEL_ORG_ID / VERCEL_PROJECT_ID**:
   - Vercelプロジェクトの Settings → General にアクセス
   - 「Project ID」セクションに両方のIDが表示されている
   - `VERCEL_ORG_ID`: 上部の「Team ID」または「User ID」
   - `VERCEL_PROJECT_ID`: 下部の「Project ID」

3. **GitHubへの設定**:
   - GitHubリポジトリの Settings → Secrets and variables → Actions
   - 「New repository secret」をクリック
   - 各Secretを追加

---

## セットアップ手順

### Step 1: GitHub Secretsの設定

上記の3つのSecretsをGitHubリポジトリに設定します。

### Step 2: Vercel Git Integrationの無効化（推奨）

Vercel Git Integrationを無効化して、GitHub Actionsからの明示的デプロイのみを使用します。

1. Vercelプロジェクトの Settings → Git にアクセス
2. 「Disconnect」をクリックしてGit Integrationを切断

**理由**: 両方が有効だと、2重デプロイが発生する可能性があります。

### Step 3: 初回デプロイの実行

1. 変更をmainブランチにpush
2. GitHub Actionsが自動的に実行される
3. Actionsタブで「Deploy to Vercel」ワークフローの実行を確認
4. すべてのステップが緑（成功）になることを確認

### Step 4: デプロイ反映確認

ブラウザで https://doin-challenge.com/api/health にアクセスし、以下を確認：

```json
{
  "ok": true,
  "commitSha": "a6046f4b...",
  "version": "v6.122",
  ...
}
```

`commitSha`がGitHubの最新コミットSHAと一致していることを確認します。

---

## 監視・検知体制（今後の実装）

### UptimeRobotの設定

**監視対象エンドポイント**:
- `/api/readyz`: サーバーの生存確認（最優先）
- `/api/health`: 詳細なヘルスチェック

**設定内容**:
- 監視間隔: 5分
- タイムアウト: 30秒
- アラート: メール + Slack通知

### Sentryの導入

**監視対象イベント**:
- ログイン失敗率（5分間で10回以上）
- API 5xxエラー急増（5分間で5回以上）
- クライアント側エラー（React Error Boundary）

**設定内容**:
- 環境変数: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`
- サンプリングレート: 100%（本番環境）

---

## トラブルシューティング

### デプロイが失敗する

**症状**: GitHub Actionsの「Deploy to Vercel」ステップが失敗する

**原因**:
1. GitHub Secretsが正しく設定されていない
2. Vercelトークンの権限が不足している
3. Vercelプロジェクトが存在しない

**解決策**:
1. GitHub Secretsを再確認
2. Vercelトークンを再生成（Scopeは「Full Account」）
3. Vercelプロジェクトが存在することを確認

### commitSha照合が失敗する

**症状**: 「Verify deployment (commitSha check)」ステップが失敗する

**原因**:
1. `/api/health`エンドポイントが`commitSha`を返していない
2. 環境変数`COMMIT_SHA`が設定されていない
3. デプロイが完了していない（30秒待機が不十分）

**解決策**:
1. `/api/health`にアクセスして`commitSha`が含まれていることを確認
2. `deploy-vercel.yml`の`env: COMMIT_SHA`が設定されていることを確認
3. 待機時間を60秒に延長

---

## 次のステップ

1. **UptimeRobotの設定**: `/api/readyz`の監視を開始
2. **Sentryの導入**: エラー監視を有効化
3. **ロールバック手順の確立**: デプロイ失敗時の即座のロールバック

---

## 参考資料

- [Vercel Deployment API](https://vercel.com/docs/rest-api/endpoints#deployments)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [amondnet/vercel-action](https://github.com/amondnet/vercel-action)
