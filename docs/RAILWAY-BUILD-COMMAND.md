# Railway Custom Build Command

## 最新版（v6.137）

**重要:** サーバーは`dist/build-info.json`を探すため、コピー先を`dist/`にします（`dist/_core/`ではない）。

### Custom Build Command（Railwayに設定）

```bash
set -eux && echo "PWD=$(pwd)" && ls -la && rm -rf server/_core/build-info.json dist/build-info.json && pnpm install && pnpm db:migrate && mkdir -p server/_core && COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "railway-$(date +%s)") && echo "{\"commitSha\":\"$COMMIT_SHA\",\"gitSha\":\"$COMMIT_SHA\",\"builtAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"version\":\"$COMMIT_SHA\",\"buildTime\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > server/_core/build-info.json && echo "=== build-info (server/_core) ===" && cat server/_core/build-info.json || true && pnpm build && echo "=== build-info (dist) ===" && cat dist/build-info.json || true
```

## 変更点（v6.136 → v6.137）

### 問題（v6.136）
`dist/_core/build-info.json`にコピーしていたが、サーバーは`dist/build-info.json`を探している。

### 解決策（v6.137）
`pnpm build`が既に`dist/build-info.json`にコピーしているため、Custom Build Commandから`cp`コマンドを削除。

**理由:**
- `server/_core/index.ts`がビルドされると`dist/index.js`になる
- `__dirname`は`/app/dist`を指す
- `path.join(__dirname, "build-info.json")`は`/app/dist/build-info.json`を探す
- `package.json`の`build`スクリプトが既に`dist/build-info.json`にコピーしている

## 設定手順

### Railwayの設定

1. Railwayのプロジェクトページを開く
2. 「Settings」タブをクリック
3. 「Build」セクションを探す
4. 「Custom Build Command」に以下を入力：
   ```bash
   set -eux && echo "PWD=$(pwd)" && ls -la && rm -rf server/_core/build-info.json dist/build-info.json && pnpm install && pnpm db:migrate && mkdir -p server/_core && COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "railway-$(date +%s)") && echo "{\"commitSha\":\"$COMMIT_SHA\",\"gitSha\":\"$COMMIT_SHA\",\"builtAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"version\":\"$COMMIT_SHA\",\"buildTime\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > server/_core/build-info.json && echo "=== build-info (server/_core) ===" && cat server/_core/build-info.json || true && pnpm build && echo "=== build-info (dist) ===" && cat dist/build-info.json || true
   ```
5. 「Save」をクリック
6. 「Deployments」タブで「Redeploy」をクリック

## 確認方法

デプロイ完了後、以下のエンドポイントにアクセス：

```
https://doin-challenge.com/api/health
```

**期待される結果:**
```json
{
  "ok": true,
  "timestamp": 1769591705630,
  "version": "railway-1769591040",
  "commitSha": "railway-1769591040",
  "gitSha": "railway-1769591040",
  "builtAt": "2026-01-28T09:04:00Z",
  "nodeEnv": "production"
}
```

`"version": "unknown"`ではなく、`"railway-1769591040"`のような値が表示されます。

## トラブルシューティング

### 1. `"version": "unknown"`が返る

**原因:** `dist/build-info.json`が存在しない、または読み込めない。

**確認方法:**
1. Build Logsで`=== build-info (dist) ===`の出力を確認
2. `{"commitSha":"...","gitSha":"...","builtAt":"..."}`が表示されているか確認

**解決策:**
- `pnpm build`が正常に完了しているか確認
- `package.json`の`build`スクリプトに`cp server/_core/build-info.json dist/build-info.json`が含まれているか確認

### 2. Build Logsに`=== build-info (dist) ===`が表示されない

**原因:** Custom Build Commandが実行されていない、またはログが途中で切れている。

**解決策:**
- Railwayの「Settings」→「Build」で「Custom Build Command」が正しく設定されているか確認
- 「Save」をクリックして変更を保存
- 「Redeploy」をクリックして再デプロイ

### 3. `git rev-parse HEAD`が失敗する

**原因:** Railwayのビルド環境でGitリポジトリが利用できない。

**フォールバック:** `railway-$(date +%s)`（Unixタイムスタンプ）が使用されます。

**期待される動作:** これは正常な動作です。本番環境では`railway-1769591040`のような値が表示されます。
