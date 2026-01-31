# Gate 1: 構造化された開発プロセスの詳細設計書

## 📋 概要

### 問題の本質
「5歩進んだら7歩下がる」問題の根本原因は**構造の欠落**。技術ミスではなく、「命令」「危険変更」「影響範囲」を機械で固定していなかったことが原因。

### 対策の核
1. **diff-check**: 危険な変更を自動検知
2. **Gate制**: PRチェックボックス必須化
3. **PR契約**: 自然言語の命令を「チェックリスト契約」に変換

### Gate 1の目標
- OAuth触ったらCIが止まる
- Deploy後に本番環境が正しく更新されたことを自動確認
- 危険な変更を事前に検知

---

## 1. diff-check.sh の詳細仕様

### 目的
危険な変更を自動検知し、影響範囲を明示する。

### 検知対象（必須7項目）

#### 1-1. OAuth関連
```bash
# 検知対象ファイル
server/_core/oauth.ts
server/routers/auth.ts
app/oauth/callback.tsx

# 影響範囲
- ログイン
- セッション
- callback
- フロントの認証UI

# 必須アクション
- OAuthスモークテスト（curl）
- 本番ログイン手動確認
```

#### 1-2. Deploy関連
```bash
# 検知対象ファイル
vercel.json
.github/workflows/deploy.yml
package.json (scripts.build)

# 影響範囲
- デプロイパイプライン
- ビルド設定
- 環境変数

# 必須アクション
- Deploy後ヘルス照合（commit SHA比較）
- 本番環境の動作確認
```

#### 1-3. 環境変数関連
```bash
# 検知対象ファイル
.env.example
server/_core/env.ts
app.config.ts

# 影響範囲
- 環境変数の追加・削除・変更
- 本番環境の設定

# 必須アクション
- 環境変数の設定確認（Vercel）
- 本番環境での動作確認
```

#### 1-4. データベース関連
```bash
# 検知対象ファイル
drizzle/schema/*.ts
server/db/*.ts

# 影響範囲
- データベーススキーマ
- マイグレーション
- データ整合性

# 必須アクション
- マイグレーションの実行確認
- データベースの整合性確認
```

#### 1-5. ヘルスチェック関連
```bash
# 検知対象ファイル
server/routers/health.ts
app/api/health/route.ts
build-info.json

# 影響範囲
- ヘルスチェックエンドポイント
- バージョン情報
- 監視システム（UptimeRobot）

# 必須アクション
- Deploy後ヘルス照合（commit SHA比較）
- UptimeRobotの監視確認
```

#### 1-6. Routing / Redirect / Proxy関連（GPTの追加提案）
```bash
# 検知対象ファイル
middleware.ts
server/routers/*.ts
vercel.json (redirects, rewrites)
app/**/layout.tsx

# 影響範囲
- ルーティング
- リダイレクト
- プロキシ
- URL構造

# 必須アクション
- ルーティングのテスト
- リダイレクトの動作確認
- 404エラーが発生していないか確認
```

#### 1-7. Build / Bundler / Toolchain関連（GPTの追加提案 - build-info問題対策）
```bash
# 検知対象ファイル
esbuild.config.js
webpack.config.js
vite.config.js
next.config.js
next.config.mjs
tsconfig.json
package.json
pnpm-lock.yaml
yarn.lock
package-lock.json

# 影響範囲
- ビルドプロセス
- バンドラ設定
- 依存関係
- TypeScript設定
- 「見えない破壊」の原因

# 必須アクション
- ビルドが成功することを確認
- build-info.jsonが正しく生成されることを確認
- Deploy後ヘルス照合（commit SHA比較）
- フロントエンドが正しく表示されることを確認
```

### diff-check.sh の実装例

```bash
#!/bin/bash
# scripts/diff-check.sh

set -e

echo "🔍 Checking diff for dangerous changes..."

# 前回のコミットとの差分を取得
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD)

# 危険な変更を検知
OAUTH_CHANGED=false
DEPLOY_CHANGED=false
ENV_CHANGED=false
DB_CHANGED=false
HEALTH_CHANGED=false

for file in $CHANGED_FILES; do
  case $file in
    server/_core/oauth.ts|server/routers/auth.ts|app/oauth/callback.tsx)
      OAUTH_CHANGED=true
      ;;
    vercel.json|.github/workflows/deploy.yml|package.json)
      DEPLOY_CHANGED=true
      ;;
    .env.example|server/_core/env.ts|app.config.ts)
      ENV_CHANGED=true
      ;;
    drizzle/schema/*.ts|server/db/*.ts)
      DB_CHANGED=true
      ;;
    server/routers/health.ts|app/api/health/route.ts)
      HEALTH_CHANGED=true
      ;;
  esac
done

# 警告を表示
if [ "$OAUTH_CHANGED" = true ]; then
  echo "⚠️  OAuth関連ファイルが変更されました"
  echo "   影響範囲: ログイン、セッション、callback、認証UI"
  echo "   必須アクション:"
  echo "   - OAuthスモークテスト（curl）"
  echo "   - 本番ログイン手動確認"
  echo ""
fi

if [ "$DEPLOY_CHANGED" = true ]; then
  echo "⚠️  Deploy関連ファイルが変更されました"
  echo "   影響範囲: デプロイパイプライン、ビルド設定、環境変数"
  echo "   必須アクション:"
  echo "   - Deploy後ヘルス照合（commit SHA比較）"
  echo "   - 本番環境の動作確認"
  echo ""
fi

if [ "$ENV_CHANGED" = true ]; then
  echo "⚠️  環境変数関連ファイルが変更されました"
  echo "   影響範囲: 環境変数の追加・削除・変更、本番環境の設定"
  echo "   必須アクション:"
  echo "   - 環境変数の設定確認（Vercel）"
  echo "   - 本番環境での動作確認"
  echo ""
fi

if [ "$DB_CHANGED" = true ]; then
  echo "⚠️  データベース関連ファイルが変更されました"
  echo "   影響範囲: データベーススキーマ、マイグレーション、データ整合性"
  echo "   必須アクション:"
  echo "   - マイグレーションの実行確認"
  echo "   - データベースの整合性確認"
  echo ""
fi

if [ "$HEALTH_CHANGED" = true ]; then
  echo "⚠️  ヘルスチェック関連ファイルが変更されました"
  echo "   影響範囲: ヘルスチェックエンドポイント、バージョン情報、監視システム"
  echo "   必須アクション:"
  echo "   - Deploy後ヘルス照合（commit SHA比較）"
  echo "   - UptimeRobotの監視確認"
  echo ""
fi

# 危険な変更がある場合は終了コード1を返す
if [ "$OAUTH_CHANGED" = true ] || [ "$DEPLOY_CHANGED" = true ] || [ "$ENV_CHANGED" = true ] || [ "$DB_CHANGED" = true ] || [ "$HEALTH_CHANGED" = true ]; then
  echo "❌ 危険な変更が検出されました。上記の必須アクションを実行してください。"
  exit 1
fi

echo "✅ 危険な変更は検出されませんでした。"
```

---

## 2. GitHub Actions CI の設計

### 目的
- diff-checkを自動実行
- Deploy後にヘルス照合
- OAuthスモークテスト

### ワークフロー

#### 2-1. diff-check job

```yaml
name: Gate 1 Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  diff-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2  # 前回のコミットも取得
      
      - name: Run diff-check
        run: bash scripts/diff-check.sh
```

#### 2-2. Deploy後ヘルス照合

```yaml
  health-check:
    runs-on: ubuntu-latest
    needs: [deploy]  # デプロイ後に実行
    steps:
      - uses: actions/checkout@v3
      
      - name: Wait for deployment
        run: sleep 30  # デプロイが完了するまで待機
      
      - name: Check deployed commit SHA
        run: |
          EXPECTED_SHA=$(git rev-parse HEAD)
          ACTUAL_SHA=$(curl -s https://doin-challenge.com/api/health | jq -r .commitSha)
          
          if [ "$EXPECTED_SHA" != "$ACTUAL_SHA" ]; then
            echo "❌ Deployed commit mismatch"
            echo "Expected: $EXPECTED_SHA"
            echo "Actual: $ACTUAL_SHA"
            exit 1
          fi
          
          echo "✅ Deployed commit matches: $EXPECTED_SHA"
```

#### 2-3. OAuthスモークテスト

```yaml
  oauth-smoke-test:
    runs-on: ubuntu-latest
    needs: [deploy]  # デプロイ後に実行
    steps:
      - name: Check OAuth endpoint
        run: |
          HTTP_CODE=$(curl -I -s -o /dev/null -w "%{http_code}" https://doin-challenge.com/api/auth/twitter)
          
          if [ "$HTTP_CODE" != "302" ]; then
            echo "❌ OAuth endpoint returned unexpected status: $HTTP_CODE"
            exit 1
          fi
          
          echo "✅ OAuth endpoint is working (302 redirect)"
```

---

## 3. PR契約テンプレートの設計

### 目的
- PRチェックボックスを必須化
- 危険な変更を明示
- Done条件を明確化

### PRテンプレート（.github/pull_request_template.md）

```markdown
## 変更内容

<!-- 何を変更したか、なぜ変更したかを簡潔に説明してください -->

## Gate 1 チェックリスト（必須）

### 危険な変更の確認

- [ ] OAuth関連ファイルを変更していない（または、OAuthスモークテストと本番ログイン確認を実施済み）
- [ ] Deploy関連ファイルを変更していない（または、Deploy後ヘルス照合を実施済み）
- [ ] 環境変数関連ファイルを変更していない（または、環境変数の設定確認を実施済み）
- [ ] データベース関連ファイルを変更していない（または、マイグレーション実行確認を実施済み）
- [ ] ヘルスチェック関連ファイルを変更していない（または、Deploy後ヘルス照合を実施済み）
- [ ] Routing / Redirect / Proxy関連ファイルを変更していない（または、ルーティングのテストを実施済み）
- [ ] Build / Bundler / Toolchain関連ファイルを変更していない（または、ビルド確認とDeploy後ヘルス照合を実施済み）

### Done条件

- [ ] diff-check.shを実行し、警告がないことを確認した
- [ ] ローカル環境でテストし、動作を確認した
- [ ] 影響範囲を把握し、関連する機能が壊れていないことを確認した

### 追加の確認事項

- [ ] コミットメッセージが明確である
- [ ] 不要なファイルが含まれていない
- [ ] ドキュメント（README.md、docs/）を更新した（必要に応じて）

## テスト結果

<!-- テスト結果を記載してください -->

## スクリーンショット（任意）

<!-- 変更内容を視覚的に示すスクリーンショットがあれば添付してください -->
```

---

## 4. Deploy後ヘルス照合の設計

### 目的
- デプロイしたコミットが本番環境に反映されていることを確認
- "synced"メッセージを信用しない

### 実装方法

#### 4-1. ヘルスエンドポイントにcommitShaを追加

```typescript
// server/routers/health.ts
export const healthRouter = router({
  check: publicProcedure.query(async () => {
    return {
      status: "ok",
      version: APP_VERSION,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
      timestamp: new Date().toISOString(),
    };
  }),
});
```

#### 4-2. GitHub ActionsでSHA比較

```bash
EXPECTED_SHA=$(git rev-parse HEAD)
ACTUAL_SHA=$(curl -s https://doin-challenge.com/api/health | jq -r .commitSha)

if [ "$EXPECTED_SHA" != "$ACTUAL_SHA" ]; then
  echo "❌ Deployed commit mismatch"
  exit 1
fi

echo "✅ Deployed commit matches: $EXPECTED_SHA"
```

---

## 5. OAuthスモークテストの設計

### 目的
- OAuth認証エンドポイントが正常に動作していることを確認
- Playwright不要、curlで十分

### 実装方法

```bash
# /api/auth/twitterにアクセスし、302リダイレクトを確認
HTTP_CODE=$(curl -I -s -o /dev/null -w "%{http_code}" https://doin-challenge.com/api/auth/twitter)

if [ "$HTTP_CODE" != "302" ]; then
  echo "❌ OAuth endpoint returned unexpected status: $HTTP_CODE"
  exit 1
fi

echo "✅ OAuth endpoint is working (302 redirect)"
```

---

## 6. 命令の「4点セット」テンプレート

### 目的
- AIに命令を渡す際、曖昧さを排除
- Done条件を明確化

### テンプレート（docs/contract.md）

```markdown
## Contract: [機能名]

### 1. 目的（Why）
<!-- なぜこの機能を実装するのか -->

### 2. やること（What）
<!-- 何を実装するのか -->
- [ ] タスク1
- [ ] タスク2
- [ ] タスク3

### 3. やってはいけないこと（NG）
<!-- 絶対に変更してはいけないファイル、機能 -->
- OAuth関連ファイルを変更しない
- Deploy関連ファイルを変更しない
- 既存の機能を壊さない

### 4. Done条件（チェック可能）
<!-- どうなったら完了とみなすか -->
- [ ] diff-check.shを実行し、警告がない
- [ ] ローカル環境でテストし、動作を確認
- [ ] 影響範囲を把握し、関連する機能が壊れていないことを確認
- [ ] PRを作成し、Gate 1チェックリストを全てチェック
```

---

## 7. 実装の優先順位

### Phase 1: diff-check.shの実装（最優先）
1. scripts/diff-check.shを作成
2. 7つの検知対象を実装（OAuth, Deploy, Env, DB, Health, Routing, Build）
3. ローカルで実行し、動作確認

### Phase 2: GitHub Actions CI
1. .github/workflows/gate1.ymlを作成
2. diff-check jobを追加
3. Deploy後ヘルス照合を追加
4. OAuthスモークテストを追加

### Phase 3: PR契約テンプレート
1. .github/pull_request_template.mdを作成
2. Gate 1チェックリストを追加
3. Done条件を追加

### Phase 4: テストと調整
1. 実際にOAuth関連ファイルを変更してPRを作成
2. CIが止まることを確認
3. 必要に応じて調整

---

## 8. 期待される効果

### Before（現在）
- 新機能を追加 → 既存機能が壊れる
- 修正を試みる → 別の箇所が壊れる
- ロールバック → 時間を浪費
- 同じ問題が再発 → 根本的に解決していない

### After（Gate 1導入後）
- 新機能を追加 → diff-checkが危険な変更を検知
- CIが警告を表示 → 影響範囲を把握
- 必須アクションを実行 → 既存機能が壊れない
- Deploy後ヘルス照合 → 本番環境が正しく更新されたことを確認

---

## 9. 次のステップ

### Gate 1の実装
1. diff-check.shを実装
2. GitHub Actions CIを実装
3. PR契約テンプレートを実装
4. 実際に使ってみて、調整

### Gate 2の設計（将来）
- 主要フロー保証（E2Eテスト）
- Visual Regression Test
- パフォーマンステスト

---

## 10. 補足: React Native / Expo特有の注意点

### 10-1. Expo Router
- app/ディレクトリ配下のファイル構造がルーティングに影響
- ファイル名の変更やディレクトリ構造の変更は慎重に

### 10-2. Native Modules
- expo-audio, expo-video, expo-notificationsなどのネイティブモジュールの変更は、ビルドに影響
- app.config.tsのpluginsセクションの変更は慎重に

### 10-3. Environment Variables
- Expo環境変数はビルド時に埋め込まれる
- 環境変数の変更後は、必ずリビルドが必要

---

## まとめ

Gate 1は、「5歩進んだら7歩下がる」問題を解決するための**最小限の構造**です。

- **diff-check**: 危険な変更を自動検知
- **Gate制**: PRチェックボックス必須化
- **PR契約**: 自然言語の命令を「チェックリスト契約」に変換

これにより、新機能を追加しても、既存機能が壊れないことを保証します。

次は、この設計書をGPTに見せて、フィードバックを得ます。
