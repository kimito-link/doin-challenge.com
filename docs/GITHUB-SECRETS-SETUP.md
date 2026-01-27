# GitHub Secrets設定ガイド

このドキュメントは、Vercel明示的デプロイに必要なGitHub Secretsの設定手順を説明します。

---

## 必要なSecrets

| Secret名 | 説明 |
|---------|------|
| `VERCEL_TOKEN` | Vercelアクセストークン |
| `VERCEL_ORG_ID` | Vercel組織ID（Team IDまたはUser ID） |
| `VERCEL_PROJECT_ID` | VercelプロジェクトID |

---

## Step 1: VERCEL_TOKENの取得

### 1-1. Vercel Tokensページにアクセス

https://vercel.com/account/tokens にアクセスします。

### 1-2. トークンを作成

1. 「Create Token」ボタンをクリック
2. Token名を入力（例: `github-actions-birthday-celebration`）
3. Scopeは「Full Account」を選択
4. Expiration（有効期限）は「No Expiration」を推奨
5. 「Create Token」をクリック

### 1-3. トークンをコピー

生成されたトークンをコピーします。**このトークンは一度しか表示されません**ので、必ずコピーしてください。

**トークン例**: `vercel_1a2b3c4d5e6f7g8h9i0j`

---

## Step 2: VERCEL_ORG_ID / VERCEL_PROJECT_IDの取得

### 2-1. Vercelプロジェクトの設定ページにアクセス

1. https://vercel.com にアクセス
2. 「birthday-celebration」プロジェクトを選択
3. 「Settings」タブをクリック
4. 左サイドバーの「General」をクリック

### 2-2. IDをコピー

「Project ID」セクションに以下の情報が表示されています：

**上部（Team IDまたはUser ID）**:
```
Team ID: team_1a2b3c4d5e6f7g8h9i0j
```
または
```
User ID: user_1a2b3c4d5e6f7g8h9i0j
```

→ これが`VERCEL_ORG_ID`です。`team_`または`user_`を含む文字列全体をコピーしてください。

**下部（Project ID）**:
```
Project ID: prj_1a2b3c4d5e6f7g8h9i0j
```

→ これが`VERCEL_PROJECT_ID`です。`prj_`を含む文字列全体をコピーしてください。

---

## Step 3: GitHubリポジトリにSecretsを設定

### 3-1. GitHubリポジトリの設定ページにアクセス

1. GitHubで「birthday-celebration」リポジトリを開く
2. 「Settings」タブをクリック
3. 左サイドバーの「Secrets and variables」→「Actions」をクリック

### 3-2. Secretsを追加

以下の3つのSecretsを追加します：

#### VERCEL_TOKEN

1. 「New repository secret」ボタンをクリック
2. Name: `VERCEL_TOKEN`
3. Secret: Step 1-3でコピーしたトークンを貼り付け
4. 「Add secret」をクリック

#### VERCEL_ORG_ID

1. 「New repository secret」ボタンをクリック
2. Name: `VERCEL_ORG_ID`
3. Secret: Step 2-2でコピーしたTeam IDまたはUser IDを貼り付け
4. 「Add secret」をクリック

#### VERCEL_PROJECT_ID

1. 「New repository secret」ボタンをクリック
2. Name: `VERCEL_PROJECT_ID`
3. Secret: Step 2-2でコピーしたProject IDを貼り付け
4. 「Add secret」をクリック

---

## Step 4: 設定の確認

### 4-1. Secretsが正しく設定されているか確認

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」で、以下の3つのSecretsが表示されていることを確認します：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 4-2. 初回デプロイの実行

1. mainブランチに変更をpush（または手動でワークフローを実行）
2. GitHubの「Actions」タブで「Deploy to Vercel」ワークフローの実行を確認
3. すべてのステップが緑（成功）になることを確認

---

## トラブルシューティング

### デプロイが失敗する（401 Unauthorized）

**原因**: `VERCEL_TOKEN`が無効または権限が不足している

**解決策**:
1. Vercelで新しいトークンを生成（Scopeは「Full Account」）
2. GitHubで`VERCEL_TOKEN`を更新

### デプロイが失敗する（404 Not Found）

**原因**: `VERCEL_ORG_ID`または`VERCEL_PROJECT_ID`が間違っている

**解決策**:
1. Vercelプロジェクトの「Settings」→「General」で正しいIDを確認
2. GitHubで`VERCEL_ORG_ID`と`VERCEL_PROJECT_ID`を更新

### デプロイが失敗する（403 Forbidden）

**原因**: Vercelトークンの権限が不足している

**解決策**:
1. Vercelで新しいトークンを生成（Scopeは「Full Account」）
2. GitHubで`VERCEL_TOKEN`を更新

---

## 次のステップ

GitHub Secretsの設定が完了したら、以下を実施してください：

1. **初回デプロイの実行**: mainブランチにpushして、GitHub Actionsが正常に動作することを確認
2. **デプロイ反映確認**: https://doin-challenge.com/api/health にアクセスして、`commitSha`が最新のコミットSHAと一致することを確認
3. **UptimeRobotの設定**: `/api/readyz`の監視を開始（`docs/UPTIMEROBOT-SETUP.md`参照）
4. **Sentryの導入**: エラー監視を有効化（`docs/SENTRY-SETUP.md`参照）

---

## 参考資料

- [Vercel API Tokens](https://vercel.com/docs/rest-api#authentication/api-tokens)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [amondnet/vercel-action](https://github.com/amondnet/vercel-action)
