# Railway Custom Build Command

## 最新版（v6.140 - GPT推奨）

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

## 重要な変更点（v6.137 → v6.140）

### 1. `|| true`を削除
- **問題**: エラーを握り潰していたため、`cp`が失敗しても気づかなかった
- **解決**: すべての`|| true`を削除し、失敗したらビルドを停止

### 2. `cat > server/_core/build-info.json <<EOF`を使用
- **問題**: `echo "{...}" > file`は複雑なJSONで引用符エスケープが難しい
- **解決**: ヒアドキュメントで安全に書き込み

### 3. `pnpm build`に詳細ログを追加
- **package.json**の`build`スクリプトに以下を追加：
  - `mkdir -p dist`（保険）
  - `cp -v`（コピーログを表示）
  - `ls -la dist`（ファイル一覧を表示）
  - `cat dist/build-info.json`（内容を確認）

### 4. `set -euxo pipefail` → `set -eux`
- **問題**: Railwayのビルド環境は`sh`を使用し、`pipefail`は`bash`固有
- **解決**: `pipefail`を削除

## 期待される出力

```
=== build-info (server/_core) ===
-rw-r--r-- 1 root root 230 Jan 28 10:00 build-info.json
{"commitSha":"abc123...","gitSha":"abc123...","builtAt":"2026-01-28T10:00:00Z","version":"abc123...","buildTime":"2026-01-28T10:00:00Z"}

[pnpm build実行]

'server/_core/build-info.json' -> 'dist/build-info.json'
total 300
-rw-r--r-- 1 root root    230 Jan 28 10:00 build-info.json
-rw-r--r-- 1 root root 290429 Jan 28 10:00 index.js

=== build-info (dist) ==="
total 300
-rw-r--r-- 1 root root    230 Jan 28 10:00 build-info.json
-rw-r--r-- 1 root root 290429 Jan 28 10:00 index.js
{"commitSha":"abc123...","gitSha":"abc123...","builtAt":"2026-01-28T10:00:00Z","version":"abc123...","buildTime":"2026-01-28T10:00:00Z"}
```

## トラブルシューティング

### `cp: cannot stat 'server/_core/build-info.json': No such file or directory`

**原因**: `server/_core/build-info.json`が作成されていない

**確認**:
1. `echo "=== build-info (server/_core) ==="` の後のログを確認
2. `cat server/_core/build-info.json`の出力があるか確認

### `cat: dist/build-info.json: No such file or directory`

**原因**: `cp`が失敗している、または`dist/`ディレクトリが別の場所に作成されている

**確認**:
1. `cp -v`の出力があるか確認（`'server/_core/build-info.json' -> 'dist/build-info.json'`）
2. `ls -la dist`の出力で`build-info.json`があるか確認
3. `PWD=$(pwd)`の出力で作業ディレクトリを確認

## 参考

- GPT分析: `pasted_content_8.txt`
- 関連コミット: v6.140
