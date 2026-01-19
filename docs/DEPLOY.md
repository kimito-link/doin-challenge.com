# デプロイ構成仕様書

**プロジェクト**: 君斗りんくの動員ちゃれんじ  
**ドメイン**: doin-challenge.com  
**最終更新**: 2026年1月19日  
**作成者**: Manus AI

---

## 概要

本プロジェクトは、フロントエンドとバックエンドを分離したアーキテクチャを採用しており、それぞれ異なるホスティングサービスにデプロイされています。

| 役割 | サービス | ドメイン | リポジトリ |
|------|----------|----------|------------|
| フロントエンド | Vercel | doin-challenge.com | kimito-link/doin-challenge.com |
| バックエンド（API） | Railway | api.doin-challenge.com | Manus内部（S3） |

---

## フロントエンド（Vercel）

### 基本情報

| 項目 | 値 |
|------|-----|
| プロジェクト名 | doin-challenge-c |
| ホスティング | Vercel |
| ドメイン | doin-challenge.com |
| GitHubリポジトリ | kimito-link/doin-challenge.com |
| ブランチ | main |
| 自動デプロイ | 有効（mainブランチへのプッシュで自動実行） |

### デプロイトリガー

Vercelは`kimito-link/doin-challenge.com`リポジトリの`main`ブランチを監視しています。このリポジトリにコードがプッシュされると、自動的にビルドとデプロイが開始されます。

### 手動デプロイ方法

ManusのPublishボタンはRailway（バックエンド）のみを更新するため、フロントエンドを更新するには以下の手順でGitHubにプッシュする必要があります。

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

プッシュ後、Vercelが自動的にデプロイを開始します（通常2-3分で完了）。

---

## バックエンド（Railway）

### 基本情報

| 項目 | 値 |
|------|-----|
| プロジェクト名 | reasonable-abundance |
| ホスティング | Railway |
| ドメイン | api.doin-challenge.com |
| ソース | Manus内部S3ストレージ |
| 自動デプロイ | 有効（ManusのPublishで自動実行） |

### デプロイトリガー

ManusのUIで「Publish」ボタンをクリックすると、Railwayへのデプロイが自動的に実行されます。

### 環境変数

Railwayの環境変数は、Railway管理画面の「Variables」タブで設定します。主要な環境変数は以下の通りです。

| 変数名 | 説明 |
|--------|------|
| DATABASE_URL | PostgreSQLデータベース接続URL |
| TWITTER_CLIENT_ID | Twitter OAuth 2.0 クライアントID |
| TWITTER_CLIENT_SECRET | Twitter OAuth 2.0 クライアントシークレット |
| SESSION_SECRET | セッション暗号化キー |

---

## デプロイフロー

### 通常のデプロイ手順

1. **Manusでコード変更を完了**
2. **Manusで「チェックポイント保存」を実行**（webdev_save_checkpoint）
3. **ManusのUIで「Publish」ボタンをクリック**
   - これによりRailway（バックエンド）が更新される
4. **GitHubにプッシュしてVercel（フロントエンド）を更新**
   - 上記「手動デプロイ方法」の手順を実行

### 重要な注意事項

| 注意点 | 説明 |
|--------|------|
| Publishボタンの範囲 | ManusのPublishはRailwayのみを更新。Vercelは別途GitHubプッシュが必要 |
| バージョン管理 | `shared/version.ts`でバージョンを一元管理。フロントエンド・バックエンド両方で参照 |
| キャッシュ | ブラウザキャッシュにより古いバージョンが表示される場合あり。Ctrl+Shift+Rで強制リロード |

---

## トラブルシューティング

### ブラウザで古いバージョンが表示される

1. **ブラウザキャッシュをクリア**: Ctrl+Shift+R（Mac: Cmd+Shift+R）
2. **シークレットウィンドウで確認**: Ctrl+Shift+N
3. **Vercelのデプロイ状況を確認**: https://vercel.com/kimito-link/doin-challenge-c/deployments

### Vercelにデプロイされない

1. **GitHubリポジトリを確認**: 最新コミットがプッシュされているか
2. **Vercelの接続を確認**: Settings → Git で正しいリポジトリが接続されているか
3. **手動でRedeploy**: Vercelダッシュボードで最新デプロイの「...」→「Redeploy」

### Railwayにデプロイされない

1. **ManusのPublishを再実行**
2. **Railwayのログを確認**: View logs ボタンでエラーを確認
3. **環境変数を確認**: Variables タブで必要な変数が設定されているか

---

## 関連ドキュメント

| ドキュメント | パス | 説明 |
|--------------|------|------|
| サーバーREADME | server/README.md | バックエンドAPIの仕様 |
| デザインガイド | docs/design.md | UIデザインの仕様 |
| TODO | todo.md | 機能実装状況 |
| バージョン | shared/version.ts | アプリバージョン管理 |

---

## 更新履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-01-19 | v5.88 | 初版作成。デプロイ構成を文書化 |
