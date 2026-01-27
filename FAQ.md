# よくある質問（FAQ）

このドキュメントでは、「動員ちゃれんじ」プロジェクトに関するよくある質問とその回答をまとめています。

---

## 📋 目次

- [開発環境のセットアップ](#開発環境のセットアップ)
- [機能の使い方](#機能の使い方)
- [トラブルシューティング](#トラブルシューティング)
- [デプロイ](#デプロイ)
- [コントリビューション](#コントリビューション)

---

## 開発環境のセットアップ

### Q1: Node.jsのバージョンはどれを使えばいいですか？

**A:** Node.js 22.13.0を推奨します。`nvm`を使用している場合は、以下のコマンドでインストールできます：

```bash
nvm install 22.13.0
nvm use 22.13.0
```

### Q2: pnpmのインストール方法は？

**A:** npmを使用してpnpmをグローバルにインストールできます：

```bash
npm install -g pnpm@9.12.0
```

### Q3: MySQLのインストール方法は？

**A:** 以下の方法でMySQLをインストールできます：

**macOS（Homebrew）:**
```bash
brew install mysql@8.0
brew services start mysql@8.0
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**
[MySQL公式サイト](https://dev.mysql.com/downloads/installer/)からインストーラーをダウンロードしてインストールしてください。

### Q4: データベースの初期化方法は？

**A:** 以下のコマンドでデータベースを初期化できます：

```bash
# データベースの作成
mysql -u root -p -e "CREATE DATABASE doin_challenge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# マイグレーションの実行
pnpm db:push
```

### Q5: 環境変数の設定方法は？

**A:** `.env.example`をコピーして`.env`を作成し、必要な環境変数を設定してください：

```bash
cp .env.example .env
```

詳細は[環境変数ドキュメント](./docs/environment-variables.md)を参照してください。

---

## 機能の使い方

### Q6: イベントの作成方法は？

**A:** 現在、イベントの作成はデータベースから直接行う必要があります。将来的には管理画面を追加予定です。

```sql
INSERT INTO events (title, description, venue, event_date, target_attendance, created_at, updated_at)
VALUES ('イベント名', '説明', '会場名', '2026-02-01 19:00:00', 100, NOW(), NOW());
```

### Q7: 参加予定の表明方法は？

**A:** イベント詳細ページで「参加予定を表明」ボタンをクリックし、以下のいずれかを選択します：

- **会場参加**: 実際に会場に行く予定
- **配信視聴**: オンライン配信を視聴する予定
- **両方**: 会場参加と配信視聴の両方

### Q8: 応援メッセージの投稿方法は？

**A:** イベント詳細ページの「応援メッセージを投稿」フォームにメッセージを入力し、「投稿」ボタンをクリックします。

### Q9: マイページの使い方は？

**A:** ヘッダーのユーザーアイコンをクリックして「マイページ」を選択すると、以下の情報を確認できます：

- 参加予定のイベント一覧
- 投稿した応援メッセージ一覧

---

## トラブルシューティング

### Q10: `pnpm install`が失敗します

**A:** 以下の手順を試してください：

1. **Node.jsのバージョンを確認**:
   ```bash
   node -v  # v22.13.0であることを確認
   ```

2. **pnpmのキャッシュをクリア**:
   ```bash
   pnpm store prune
   ```

3. **node_modulesを削除して再インストール**:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

### Q11: データベース接続エラーが発生します

**A:** 以下の点を確認してください：

1. **MySQLが起動しているか確認**:
   ```bash
   # macOS
   brew services list | grep mysql
   
   # Linux
   sudo systemctl status mysql
   ```

2. **環境変数`DATABASE_URL`が正しいか確認**:
   ```bash
   echo $DATABASE_URL
   ```

3. **データベースが存在するか確認**:
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'doin_challenge';"
   ```

詳細は[トラブルシューティングガイド](./docs/troubleshooting.md)を参照してください。

### Q12: OAuth認証が失敗します

**A:** 以下の点を確認してください：

1. **Twitter Developer Portalで設定を確認**:
   - Callback URL: `http://localhost:8081/oauth/callback`（開発環境）
   - Website URL: `http://localhost:8081`

2. **環境変数を確認**:
   ```bash
   echo $TWITTER_CLIENT_ID
   echo $TWITTER_CLIENT_SECRET
   ```

3. **セッションシークレットを確認**:
   ```bash
   echo $SESSION_SECRET
   ```

### Q13: 開発サーバーが起動しません

**A:** 以下の手順を試してください：

1. **ポートが使用されていないか確認**:
   ```bash
   lsof -i :8081  # Metro Bundler
   lsof -i :3000  # API Server
   ```

2. **プロセスを終了**:
   ```bash
   kill -9 <PID>
   ```

3. **開発サーバーを再起動**:
   ```bash
   pnpm dev
   ```

### Q14: 型エラーが発生します

**A:** 以下の手順を試してください：

1. **型チェックを実行**:
   ```bash
   pnpm check
   ```

2. **型定義を再生成**:
   ```bash
   pnpm db:push
   ```

3. **IDEを再起動**: VSCodeなどのIDEを再起動すると、型定義が更新されます。

---

## デプロイ

### Q15: Vercelへのデプロイ方法は？

**A:** 詳細は[デプロイガイド](./docs/deployment-guide.md)を参照してください。基本的な手順は以下の通りです：

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. デプロイを実行

### Q16: 本番環境の環境変数はどこで設定しますか？

**A:** Vercelのプロジェクト設定で環境変数を設定します：

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Environment Variables」を開く
3. 必要な環境変数を追加

詳細は[環境変数セットアップガイド](./docs/environment-setup.md)を参照してください。

### Q17: デプロイ後にエラーが発生します

**A:** 以下の点を確認してください：

1. **環境変数が正しく設定されているか確認**
2. **データベースマイグレーションが実行されているか確認**
3. **Vercelのログを確認**: Vercelダッシュボードで「Deployments」→「Logs」を確認

詳細は[トラブルシューティングガイド](./docs/troubleshooting.md#本番環境のトラブルシューティング)を参照してください。

### Q18: ロールバック方法は？

**A:** Vercelダッシュボードで以前のデプロイに戻すことができます：

1. 「Deployments」タブを開く
2. ロールバックしたいデプロイを選択
3. 「Promote to Production」をクリック

詳細は[ロールバック手順](./docs/rollback-procedure.md)を参照してください。

---

## コントリビューション

### Q19: コントリビューション方法は？

**A:** 詳細は[コントリビューションガイド](./CONTRIBUTING.md)を参照してください。基本的な手順は以下の通りです：

1. リポジトリをフォーク
2. 新しいブランチを作成
3. 変更をコミット
4. プルリクエストを作成

### Q20: コーディング規約は？

**A:** 以下のコーディング規約に従ってください：

- **TypeScript**: `@typescript-eslint/recommended`
- **React**: `eslint-plugin-react-hooks`
- **命名規則**: camelCase（変数・関数）、PascalCase（コンポーネント・型）、UPPER_SNAKE_CASE（定数）

詳細は[コントリビューションガイド](./CONTRIBUTING.md#コーディング規約)を参照してください。

### Q21: コミットメッセージの規約は？

**A:** Conventional Commitsに従ってください：

```
<type>(<scope>): <subject>

<body>

<footer>
```

例：
```
feat(events): イベント一覧ページを追加

- イベント一覧の表示機能を実装
- 日付でソート機能を追加

Closes #123
```

詳細は[コントリビューションガイド](./CONTRIBUTING.md#コミットメッセージ規約)を参照してください。

### Q22: プルリクエストのレビュープロセスは？

**A:** 以下のプロセスに従います：

1. **自動チェック**: GitHub ActionsでCI/CDが実行されます
2. **コードレビュー**: メンテナーがコードをレビューします
3. **修正**: フィードバックに基づいて修正します
4. **承認**: メンテナーが承認します
5. **マージ**: mainブランチにマージされます

詳細は[コントリビューションガイド](./CONTRIBUTING.md#レビュープロセス)を参照してください。

---

## その他の質問

### Q23: このプロジェクトのライセンスは？

**A:** MITライセンスです。詳細は[LICENSE.md](./LICENSE.md)を参照してください。

### Q24: セキュリティ脆弱性を発見しました

**A:** [セキュリティポリシー](./SECURITY.md)に従って報告してください：

- **GitHub Security Advisories**: [https://github.com/kimito-link/doin-challenge.com/security/advisories/new](https://github.com/kimito-link/doin-challenge.com/security/advisories/new)
- **Email**: security@kimito.link（仮）

### Q25: 行動規範は？

**A:** [行動規範](./CODE_OF_CONDUCT.md)を参照してください。私たちは、すべての人にとって歓迎的で包括的な環境を作ることに尽力しています。

---

## さらに質問がある場合

このFAQで解決できない質問がある場合は、以下の方法でお問い合わせください：

- **GitHub Issues**: [https://github.com/kimito-link/doin-challenge.com/issues](https://github.com/kimito-link/doin-challenge.com/issues)
- **GitHub Discussions**: [https://github.com/kimito-link/doin-challenge.com/discussions](https://github.com/kimito-link/doin-challenge.com/discussions)（Q&Aカテゴリ）

---

**最終更新**: 2026-01-27
