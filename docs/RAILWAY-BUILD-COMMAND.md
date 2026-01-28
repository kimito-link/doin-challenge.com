# Railway Custom Build Command

## 最新版（v6.141）: prebuildスクリプト方式

### Custom Build Command

```bash
pnpm install && pnpm db:migrate && pnpm build
```

### 仕組み

1. **`pnpm install`**: 依存関係をインストール
2. **`pnpm db:migrate`**: データベースマイグレーションを実行
3. **`pnpm build`**: アプリケーションをビルド
   - **`prebuild`スクリプト**が自動実行され、`server/_core/build-info.json`を生成
   - **`build`スクリプト**がesbuildでバンドルし、`dist/build-info.json`にコピー

### prebuildスクリプト（scripts/generate-build-info.cjs）

```javascript
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const dir = path.join(__dirname, '..', 'server', '_core');
fs.mkdirSync(dir, { recursive: true });

let commitSha;
try {
  commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
} catch {
  commitSha = `railway-${Date.now()}`;
}

const buildInfo = {
  commitSha,
  gitSha: commitSha,
  version: commitSha,
  builtAt: new Date().toISOString(),
  buildTime: new Date().toISOString()
};

fs.writeFileSync(
  path.join(dir, 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

console.log('Generated build-info.json:', buildInfo);
```

### package.json

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-build-info.cjs",
    "build": "esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && cp -v server/_core/build-info.json dist/build-info.json"
  }
}
```

### メリット

- **シンプル**: Custom Build Commandが短く、読みやすい
- **改行問題を回避**: Railwayの改行削除問題を完全に回避
- **標準的**: npmの`prebuild`フックを使用（業界標準）
- **デバッグが容易**: ビルドログで`prebuild`の実行結果が確認できる

---

## 設定手順

1. **Railwayの「Settings」→「Build」を開く**
2. **「Custom Build Command」フィールドに以下を入力：**
   ```bash
   pnpm install && pnpm db:migrate && pnpm build
   ```
3. **「Save」をクリック**
4. **「Deployments」タブで「Redeploy」をクリック**

---

## トラブルシューティング

### Build Logsで確認すべき出力

```
> app-template@1.0.0 prebuild /app
> node scripts/generate-build-info.cjs

Generated build-info.json: {
  commitSha: 'abc123...',
  gitSha: 'abc123...',
  version: 'abc123...',
  builtAt: '2026-01-28T10:44:30.942Z',
  buildTime: '2026-01-28T10:44:30.942Z'
}

> app-template@1.0.0 build /app
> esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && cp -v server/_core/build-info.json dist/build-info.json

  dist/index.js  283.6kb
⚡ Done in 18ms
'server/_core/build-info.json' -> 'dist/build-info.json'
```

### エラーが発生した場合

1. **`prebuild`スクリプトが実行されていない**
   - `package.json`に`"prebuild": "node scripts/generate-build-info.cjs"`があることを確認
   - `scripts/generate-build-info.cjs`ファイルが存在することを確認

2. **`cp: cannot stat 'server/_core/build-info.json'`エラー**
   - `prebuild`スクリプトが失敗している可能性
   - Build Logsで`Generated build-info.json:`が表示されているか確認

3. **`/api/health`が`"version": "unknown"`を返す**
   - Build Logsで`'server/_core/build-info.json' -> 'dist/build-info.json'`が表示されているか確認
   - Deploy Logsで`[health] Failed to read build-info.json`エラーがないか確認

---

## 期待される結果

デプロイ後、https://doin-challenge.com/api/health が以下を返す：

```json
{
  "ok": true,
  "timestamp": 1769596416200,
  "version": "269e8805c8ad63ce3469f5bbf7f0e6f52fd0a501",
  "commitSha": "269e8805c8ad63ce3469f5bbf7f0e6f52fd0a501",
  "gitSha": "269e8805c8ad63ce3469f5bbf7f0e6f52fd0a501",
  "builtAt": "2026-01-28T10:44:30.942Z",
  "nodeEnv": "production",
  "db": {
    "connected": true,
    "latency": 1533,
    "error": ""
  }
}
```

`"version": "unknown"`ではなく、実際のGit commit SHAが表示される。

---

## 以前の方法（v6.140 - 非推奨）

以前は長いCustom Build Commandを使用していましたが、Railwayの改行削除問題により正しく動作しませんでした。

```bash
set -eux
echo "PWD=$(pwd)"
ls -la
rm -f server/_core/build-info.json dist/build-info.json
pnpm install
pnpm db:migrate
mkdir -p server/_core
COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "railway-$(date +%s)")
cat > server/_core/build-info.json <<EOF
{"commitSha":"$COMMIT_SHA","gitSha":"$COMMIT_SHA","builtAt":"$(date -u +%Y-%m-%dT%H:%M:%SZ)","version":"$COMMIT_SHA","buildTime":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF
echo "=== build-info (server/_core) ==="
ls -la server/_core
cat server/_core/build-info.json
pnpm build
echo "=== build-info (dist) ==="
ls -la dist
cat dist/build-info.json
```

**問題点**: Railwayが改行をスペースに置き換えてしまい、コマンドが正しく実行されない。

**解決策**: `prebuild`スクリプトを使用することで、Custom Build Commandをシンプルに保ち、改行問題を回避。
