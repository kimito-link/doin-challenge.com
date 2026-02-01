# ローカル開発への移行手順

このドキュメントは、Manusで構築したプロジェクトをローカル環境に移行し、ローカルで開発を継続するための手順を説明します。

---

## プロジェクト情報

- **プロジェクト名**: birthday-celebration（君斗りんくの動員ちゃれんじ）
- **GitHubリポジトリ**: https://github.com/kimito-link/doin-challenge.com
- **最新チェックポイント**: 1250b7ec

---

## ステップ1: ローカルにクローン

```bash
# GitHubからクローン
git clone https://github.com/kimito-link/doin-challenge.com.git

# プロジェクトディレクトリに移動
cd doin-challenge.com
```

---

## ステップ2: 依存関係のインストール

```bash
# pnpmをインストール（まだの場合）
npm install -g pnpm

# 依存関係をインストール
pnpm install
```

---

## ステップ3: 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定します：

```bash
# .env.local

# データベース（ManusのPostgreSQLを使用）
DATABASE_URL="postgresql://..."  # Management UI → Database → Connection Info から取得

# APIサーバー
API_URL="https://3000-ischcidk3e9x9vkhc5qu8-003906b7.sg1.manus.computer"

# Twitter OAuth（Management UI → Settings → Secrets から取得）
TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."

# その他の環境変数
# Management UI → Settings → Secrets から取得
```

**注意**: `.env.local`は`.gitignore`に含まれているため、Gitにコミットされません。

---

## ステップ4: 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev

# ブラウザで開く
# Metro: http://localhost:8081
# API: http://localhost:3000
```

---

## ステップ5: テストの実行

```bash
# 全テストを実行
pnpm test

# 特定のテストを実行
pnpm test <ファイル名>

# ウォッチモードで実行
pnpm test --watch
```

---

## ステップ6: Git作法に従った開発

### 6-1: ブランチを作成

```bash
# 新しいブランチを作成
git checkout -b feature/new-feature
```

### 6-2: 実装

```bash
# コードを編集
# ...

# テストを実行
pnpm test

# テストに通ったら、commit
git add .
git commit -m "新機能を追加"
```

### 6-3: GitHubにpush

```bash
# GitHubにpush
git push origin feature/new-feature
```

### 6-4: プルリクエストを作成

```bash
# GitHub上でプルリクエストを作成
# レビュー → マージ
```

---

## ステップ7: Manusでデプロイ（必要時のみ）

### 7-1: 最新版をpull

```bash
# ローカルの変更をpush
git push origin main

# Management UI → Code → Pull latest
```

### 7-2: デプロイ

```bash
# Management UI → Publish → iOS IPA / Android APK生成
```

---

## 開発ワークフロー

### フェーズ1: ローカルで開発
```bash
# 1. ブランチを作成
git checkout -b feature/new-feature

# 2. 実装
# ...

# 3. テスト
pnpm test

# 4. commit
git add .
git commit -m "新機能を追加"

# 5. push
git push origin feature/new-feature

# 6. プルリクエスト → レビュー → マージ
```

### フェーズ2: Manusでデプロイ
```bash
# 1. Management UI → Code → Pull latest
# 2. Management UI → Publish → iOS IPA / Android APK生成
```

---

## トラブルシューティング

### 問題1: データベースに接続できない

**原因**: `DATABASE_URL`が正しく設定されていない

**解決策**:
```bash
# Management UI → Database → Connection Info から取得
# .env.localに設定
DATABASE_URL="postgresql://..."
```

### 問題2: Twitter OAuthが動作しない

**原因**: `TWITTER_CLIENT_ID`または`TWITTER_CLIENT_SECRET`が正しく設定されていない

**解決策**:
```bash
# Management UI → Settings → Secrets から取得
# .env.localに設定
TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."
```

### 問題3: テストが失敗する

**原因**: データベースが起動していない、または環境変数が正しく設定されていない

**解決策**:
```bash
# 1. データベースの接続情報を確認
# 2. 環境変数を確認
# 3. テストを再実行
pnpm test
```

---

## 参考資料

- **プロジェクトドキュメント**:
  - `docs/REQUIREMENTS.md`: 要件定義
  - `docs/DESIGN.md`: 設計書
  - `docs/PROGRESS.md`: 作業履歴
  - `docs/DATA_DESIGN_TEMPLATE.md`: データ設計テンプレート
  - `todo.md`: タスク管理

- **テンプレートREADME**: プロジェクトルートの`README.md`

- **Manus公式ドキュメント**: https://help.manus.im

---

## 注意事項

### 1. データベースはManusを使う
ローカルでPostgreSQLを立てる必要はありません。Manusのデータベースをそのまま使用します。

### 2. 環境変数は`.env.local`に保存
`.env.local`は`.gitignore`に含まれているため、Gitにコミットされません。

### 3. Manusとの同期
ローカルで開発した後、Manusで確認する場合は、`git push`してから`Management UI → Code → Pull latest`を実行してください。

### 4. デプロイはManusで
iOS/Androidのビルドは、Manusの`Publish`ボタンで実行します。ローカルでビルドする必要はありません。

---

## まとめ

**Manusで初期構築 → ローカルで開発 → Manusでデプロイ**

このワークフローにより、Git作法に従った開発が可能になり、Manusの強み（iOS/Androidビルド、インフラ管理）だけを活用できます。
