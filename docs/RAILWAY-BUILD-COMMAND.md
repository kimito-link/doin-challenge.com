# Railway Custom Build Command

## 最新版（v6.136）

**重要:** Custom Build Commandの文字数制限を回避するため、`railway-build.sh`スクリプトを使用します。

### Custom Build Command（Railwayに設定）

```bash
bash railway-build.sh
```

### railway-build.sh（プロジェクトルートに配置）

このスクリプトは既にプロジェクトに含まれています（`railway-build.sh`）。

**スクリプトの内容:**
- `dist/_core/build-info.json`にコピー
- Git commit SHAを自動取得
- ビルドログに詳細な出力

## 変更点（v6.135 → v6.136）

### 問題（v6.135）
Custom Build Commandが長すぎてRailwayのフィールドに入りきらない（文字数制限）。

### 解決策（v6.136）
`railway-build.sh`スクリプトファイルを作成し、Custom Build Commandを`bash railway-build.sh`だけにする。

**メリット:**
- 文字数制限を回避
- スクリプトの可読性向上
- バージョン管理が容易
- デバッグが簡単

## railway-build.shの機能

1. **依存関係のインストール**: `pnpm install`
2. **データベースマイグレーション**: `pnpm db:migrate`
3. **build-info.json生成**: Git commit SHAを自動取得
4. **アプリケーションビルド**: `pnpm build`
5. **build-info.jsonコピー**: `dist/_core/`に正しくコピー
6. **詳細なログ出力**: 各ステップの状況を確認可能

## 設定手順

### 1. GitHubにpush

`railway-build.sh`ファイルがプロジェクトに含まれていることを確認してください。

```bash
git add railway-build.sh
git commit -m "Add railway-build.sh for Railway deployment"
git push
```

### 2. Railwayの設定

1. Railwayのプロジェクトページを開く
2. 「Settings」タブをクリック
3. 「Build」セクションを探す
4. 「Custom Build Command」に以下を入力：
   ```bash
   bash railway-build.sh
   ```
5. 「Save」をクリック
6. 「Deployments」タブで「Redeploy」をクリック

## 確認方法

デプロイ完了後、以下のエンドポイントにアクセス：

```
https://doin-challenge.com/api/health
```

期待される出力：

```json
{
  "ok": true,
  "timestamp": 1769588915268,
  "version": "a1b2c3d4...",
  "commitSha": "a1b2c3d4...",
  "gitSha": "a1b2c3d4...",
  "builtAt": "2026-01-28T...",
  "resolvedPath": "/app/dist/_core/build-info.json",
  "nodeEnv": "production"
}
```

**重要:** `resolvedPath`が`"env"`の場合、ファイルが読み込めていません。ビルドログを確認してください。

## トラブルシューティング

### 1. `cat`の出力がログに表示されない

**原因:** Custom Build Commandが実行されていない可能性があります。

**対処法:**
- Railwayの「Settings」→「Build」で「Custom Build Command」が正しく設定されているか確認
- 「Deployments」タブで「Redeploy」をクリック
- ビルドログで`set -euxo pipefail`の出力を確認

### 2. `resolvedPath: "env"`が返ってくる

**原因:** `build-info.json`が正しい場所にコピーされていません。

**対処法:**
- ビルドログで`ls -la dist/_core`の出力を確認
- `build-info.json`が存在するか確認
- 存在しない場合は、Custom Build Commandを再確認

### 3. `commitSha: "unknown"`が返ってくる

**原因:** `git rev-parse HEAD`が失敗しています。

**対処法:**
- Railwayのビルド環境に`.git`ディレクトリが存在するか確認
- フォールバック値`railway-$(date +%s)`が使用されているか確認
- ビルドログで`COMMIT_SHA`の値を確認

## 関連ドキュメント

- `docs/GATE1-SETUP.md`: Gate 1セットアップガイド
- `server/_core/index.ts`: `/api/health`エンドポイントの実装
