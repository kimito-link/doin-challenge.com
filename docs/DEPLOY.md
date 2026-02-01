# デプロイ構成仕様書

**プロジェクト**: 君斗りんくの動員ちゃれんじ  
**ドメイン**: doin-challenge.com  
**最終更新**: 2026年2月1日  
**作成者**: Manus AI

---

## ⚠️ 重要：デプロイ方式が変わりました

| 項目 | 以前（〜v5.88） | 現在（v6.0〜） |
|------|----------------|----------------|
| フロントエンド | Vercel自動デプロイ | **GitHub Actions経由** |
| バックエンド | Manus Publish → Railway | **GitHub Actions経由** |
| トリガー | 手動コピー＆push | **`git push origin main`** |

**現在の手順は [DEPLOY_WORKFLOW.md](./DEPLOY_WORKFLOW.md) を参照してください。**

---

## GitHubパーソナルアクセストークン

**トークン**: `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`

**有効期限**: 2026年2月1日発行

**使用方法**:
```bash
# 1. GitHubリポジトリをクローン
cd /tmp
git clone https://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@github.com/kimito-link/doin-challenge.com.git doin-deploy

# 2. Manusの変更をコピー
cd doin-deploy
cp -r /home/ubuntu/birthday-celebration/app .
cp -r /home/ubuntu/birthday-celebration/components .
cp -r /home/ubuntu/birthday-celebration/server .
cp -r /home/ubuntu/birthday-celebration/shared .
cp -r /home/ubuntu/birthday-celebration/drizzle .
cp /home/ubuntu/birthday-celebration/todo.md .

# 3. コミットしてpush
git add -A
git commit -m "v6.xxx: 変更内容の説明"
git push origin main
```

---

## 概要

本プロジェクトは、フロントエンドとバックエンドを分離したアーキテクチャを採用しており、それぞれ異なるホスティングサービスにデプロイされています。

| 役割 | サービス | ドメイン | リポジトリ |
|------|----------|----------|------------|
| フロントエンド | Vercel | doin-challenge.com | kimito-link/doin-challenge.com |
| バックエンド（API） | Railway | api.doin-challenge.com | kimito-link/doin-challenge.com |

---

## フロントエンド（Vercel）

### 基本情報

| 項目 | 値 |
|------|-----|
| プロジェクト名 | doin-challenge-com |
| ホスティング | Vercel |
| ドメイン | doin-challenge.com |
| GitHubリポジトリ | kimito-link/doin-challenge.com |
| ブランチ | main |
| 自動デプロイ | **無効**（GitHub Actions経由でデプロイ） |

### デプロイトリガー（現在）

GitHub Actionsのパイプラインがデプロイを制御します。`main`ブランチへのpushでパイプラインが起動し、CIが成功した後にVercelへデプロイされます。

---

### 📜 以前の方法（参考・使用しない）

<details>
<summary>v5.88以前の手動デプロイ方法（クリックで展開）</summary>

以前はManusのPublishボタンはRailway（バックエンド）のみを更新していたため、フロントエンドを更新するには以下の手順でGitHubにプッシュする必要がありました。

```bash
# 1. GitHubリポジトリをクローン
cd /tmp
gh repo clone kimito-link/doin-challenge.com doin-challenge-deploy

# 2. Manusプロジェクトの変更をコピー
cd doin-challenge-deploy
cp -r /home/ubuntu/birthday-celebration/__tests__ .
cp -r /home/ubuntu/birthday-celebration/app .
cp -r /home/ubuntu/birthday-celebration/components .
cp -r /home/ubuntu/birthday-celebration/drizzle .
cp -r /home/ubuntu/birthday-celebration/server .
cp -r /home/ubuntu/birthday-celebration/shared .
cp /home/ubuntu/birthday-celebration/todo.md .

# 3. コミットしてプッシュ
git add -A
git commit -m "v5.xx: 変更内容の説明"
git push origin main
```

**この方法は現在使用しません。** GitHub Actionsパイプラインを使用してください。

</details>

---

## バックエンド（Railway）

### 基本情報

| 項目 | 値 |
|------|-----|
| プロジェクト名 | reasonable-abundance |
| ホスティング | Railway |
| ドメイン | api.doin-challenge.com |
| ソース | kimito-link/doin-challenge.com |
| 自動デプロイ | **無効**（GitHub Actions経由でデプロイ） |

### デプロイトリガー（現在）

GitHub Actionsのパイプラインがデプロイを制御します。`main`ブランチへのpushでパイプラインが起動し、CIが成功した後にRailwayへデプロイされます。

---

### 📜 以前の方法（参考・使用しない）

<details>
<summary>v5.88以前のデプロイ方法（クリックで展開）</summary>

以前はManusのUIで「Publish」ボタンをクリックすると、Railwayへのデプロイが自動的に実行されていました。

**この方法は現在使用しません。** GitHub Actionsパイプラインを使用してください。

</details>

### 環境変数

Railwayの環境変数は、Railway管理画面の「Variables」タブで設定します。主要な環境変数は以下の通りです。

| 変数名 | 説明 |
|--------|------|
| DATABASE_URL | PostgreSQLデータベース接続URL |
| TWITTER_CLIENT_ID | Twitter OAuth 2.0 クライアントID |
| TWITTER_CLIENT_SECRET | Twitter OAuth 2.0 クライアントシークレット |
| SESSION_SECRET | セッション暗号化キー |

---

## デプロイフロー（現在）

### デプロイ前チェックリスト

**必ず実行してください**（特にVercelデプロイエラーを防ぐため）：

```bash
# 1. 動的require()の検索（Vercelビルドエラーの主な原因）
grep -rn 'require(`' --include="*.ts" --include="*.tsx" app/ components/ hooks/ lib/ features/

# 2. TypeScriptエラーの確認
pnpm check

# 3. ローカルビルドの成功確認
pnpm build
```

詳細は **[VERCEL_DEPLOY_RULES.md](./VERCEL_DEPLOY_RULES.md)** を参照してください。

### 通常のデプロイ手順

1. **Manusでコード変更を完了**
2. **デプロイ前チェックリストを実行**（上記参照）
3. **Manusで「チェックポイント保存」を実行**（webdev_save_checkpoint）
4. **GitHubにpush**
   ```bash
   git push origin main  # ← これがデプロイトリガー
   ```
5. **GitHub Actionsが自動実行**
   - CI → Backend(Railway) → Migrate → Health Check → Frontend(Vercel) → E2E
6. **本番サイトで動作確認**

詳細は **[DEPLOY_WORKFLOW.md](./DEPLOY_WORKFLOW.md)** を参照。

### 重要な注意事項

| 注意点 | 説明 |
|--------|------|
| Vercel自動デプロイ | **無効**。GitHub Actions経由でのみデプロイ |
| Manus Publishボタン | **使用しない**。GitHub pushを使用 |
| バージョン管理 | `shared/version.ts`でバージョンを一元管理 |
| キャッシュ | ブラウザキャッシュにより古いバージョンが表示される場合あり。Ctrl+Shift+Rで強制リロード |

---

## トラブルシューティング

### Vercelビルドエラー（SyntaxError）

**最も頻繁に発生する問題**：動的require()の使用

#### 症状

- Vercelデプロイが「Build Failed」で失敗
- Build Logsに「SyntaxError: Invalid or unexpected token」が表示
- 特定のファイル（例：LoginModal.tsx、WelcomeMessage.tsx）でエラー

#### 原因

Vercelのビルド環境では、動的なrequire()（テンプレートリテラルを使用）が使えません。

```tsx
// ❌ NG: 動的require()
 const image = require(`@/assets/images/${filename}.png`);
```

#### 解決方法

1. **動的require()を検索**：
   ```bash
   grep -rn 'require(`' --include="*.ts" --include="*.tsx" app/ components/ hooks/ lib/ features/
   ```

2. **静的マッピングに変更**：
   ```tsx
   // ✅ OK: 静的マッピング
   const IMAGES = {
     image1: require("@/assets/images/image1.png"),
     image2: require("@/assets/images/image2.png"),
   };
   const image = IMAGES[filename];
   ```

3. **production/mainブランチにpush**：
   ```bash
   git push production main:main
   ```

詳細は **[VERCEL_DEPLOY_RULES.md](./VERCEL_DEPLOY_RULES.md)** を参照してください。

#### 過去のエラー事例

| 日付 | ファイル | 原因 | 解決コミット |
|------|--------|------|-------------|
| 2026-02-01 | LoginModal.tsx, WelcomeMessage.tsx | 動的require()でキャラクター画像を読み込み | 3955914f |
| 2026-02-01 | login-messages.ts | 動的require()でcharacterImageを読み込み | 8bcf7eb2 |

---

### ブラウザで古いバージョンが表示される

1. **ブラウザキャッシュをクリア**: Ctrl+Shift+R（Mac: Cmd+Shift+R）
2. **シークレットウィンドウで確認**: Ctrl+Shift+N
3. **Vercelのデプロイ状況を確認**: https://vercel.com/kimito-link/doin-challenge-c/deployments

### Vercelにデプロイされない

1. **production/mainブランチを確認**: `git log production/main --oneline -10` で最新コミットが含まれているか
2. **GitHub Actionsを確認**: https://github.com/kimito-link/doin-challenge.com/actions
3. **手動でRedeploy**: Vercelダッシュボードで最新デプロイの「...」→「Redeploy」

### Railwayにデプロイされない

1. **ManusのPublishを再実行**
2. **Railwayのログを確認**: View logs ボタンでエラーを確認
3. **環境変数を確認**: Variables タブで必要な変数が設定されているか

---

## 関連ドキュメント

| ドキュメント | パス | 説明 |
|--------------|------|------|
| **デプロイ手順** | docs/DEPLOY_WORKFLOW.md | **現在のデプロイ手順** |
| **開発ガイド** | docs/DEVELOPMENT_GUIDE.md | 開発環境・フロー |
| サーバーREADME | server/README.md | バックエンドAPIの仕様 |
| Railway設定 | docs/RAILWAY_DEPLOY_SETUP.md | Railway詳細設定 |
| TODO | todo.md | 機能実装状況 |
| バージョン | shared/version.ts | アプリバージョン管理 |

---

## 更新履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-01-22 | v6.53 | GitHub Actionsパイプラインに移行。以前の方法を「参考」として折りたたみ |
| 2026-01-19 | v5.88 | 初版作成。デプロイ構成を文書化 |
