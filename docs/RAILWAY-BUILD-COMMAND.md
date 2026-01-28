# Railway Custom Build Command

## 最新版（v6.135）

**重要:** `dist/_core/build-info.json`にコピーすることで、サーバーが確実に読み込めるようになります。

```bash
set -euxo pipefail && echo "PWD=$(pwd)" && ls -la && rm -rf server/_core/build-info.json dist/build-info.json && pnpm install && pnpm db:migrate && mkdir -p server/_core && COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "railway-$(date +%s)") && echo "{\"commitSha\":\"$COMMIT_SHA\",\"gitSha\":\"$COMMIT_SHA\",\"builtAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"version\":\"$COMMIT_SHA\",\"buildTime\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > server/_core/build-info.json && echo "=== build-info (server/_core) ===" && ls -la server/_core || true && cat server/_core/build-info.json || true && pnpm build && mkdir -p dist/_core && cp server/_core/build-info.json dist/_core/build-info.json && echo "=== build-info (dist/_core) ===" && ls -la dist/_core || true && cat dist/_core/build-info.json || true
```

## 変更点（v6.134 → v6.135）

### 修正前（v6.134）
```bash
mkdir -p dist && cp server/_core/build-info.json dist/build-info.json
```
→ サーバーは`dist/_core/build-info.json`を探すが、実際には`dist/build-info.json`にしかない

### 修正後（v6.135）
```bash
mkdir -p dist/_core && cp server/_core/build-info.json dist/_core/build-info.json
```
→ サーバーが探す場所（`dist/_core/`）に正しくコピー

## デバッグ用の追加機能

- `set -euxo pipefail`: すべてのコマンドをログに出力
- `echo "PWD=$(pwd)"`: 現在のディレクトリを表示
- `ls -la`: ファイル一覧を表示
- `echo "=== build-info (server/_core) ==="`: セクション区切り
- `ls -la server/_core || true`: server/_coreディレクトリの内容を表示
- `cat server/_core/build-info.json || true`: 生成されたbuild-info.jsonを表示
- `echo "=== build-info (dist/_core) ==="`: セクション区切り
- `ls -la dist/_core || true`: dist/_coreディレクトリの内容を表示
- `cat dist/_core/build-info.json || true`: コピー後のbuild-info.jsonを表示

## 設定手順

1. Railwayのプロジェクトページを開く
2. 「Settings」タブをクリック
3. 「Build」セクションを探す
4. 「Custom Build Command」に上記のコマンドを貼り付け
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
