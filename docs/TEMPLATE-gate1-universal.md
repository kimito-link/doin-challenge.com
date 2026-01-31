# Gate 1: 汎用テンプレート（どのプロジェクトにも適用可能）

## 📋 このテンプレートについて

このテンプレートは、「5歩進んだら7歩下がる」問題を解決するための**構造化された開発プロセス**を、どのプロジェクトにも適用できるようにしたものです。

### 対象プロジェクト
- Webアプリケーション（React, Vue, Angular, Next.js, Nuxt.js, SvelteKit など）
- モバイルアプリ（React Native, Flutter, Swift, Kotlin など）
- バックエンドAPI（Node.js, Python, Go, Ruby など）
- フルスタックプロジェクト

### 前提条件
- Gitを使用している
- GitHub, GitLab, Bitbucket などのGitホスティングサービスを使用している
- CI/CDパイプラインを構築できる（GitHub Actions, GitLab CI, CircleCI など）

---

## 問題の本質

### 「5歩進んだら7歩下がる」とは？

新しい機能を追加するたびに、既存の機能が壊れる悪循環。

**症状**:
1. 新機能を追加 → 既存機能が壊れる
2. 修正を試みる → 別の箇所が壊れる
3. ロールバック → 時間を浪費
4. 同じ問題が再発 → 根本的に解決していない

### 根本原因

**技術ミスではなく「構造の欠落」**

- 「命令」「危険変更」「影響範囲」を**機械で固定していなかった**
- 人間の記憶や注意力に依存していた
- テストがない、または不十分

---

## Gate 1の対策

### 対策の核

1. **diff-check**: 危険な変更を自動検知
2. **Gate制**: PRチェックボックス必須化
3. **PR契約**: 自然言語の命令を「チェックリスト契約」に変換

### Gate 1の目標

- 危険な変更を事前に検知
- Deploy後に本番環境が正しく更新されたことを自動確認
- 影響範囲を明示

---

## 1. diff-check.sh の実装

### 目的
危険な変更を自動検知し、影響範囲を明示する。

### 検知対象の定義

**プロジェクトごとに、以下の5つのカテゴリーを定義してください**:

1. **認証関連** (OAuth, JWT, Session など)
2. **Deploy関連** (CI/CD設定, ビルド設定, 環境変数 など)
3. **環境変数関連** (.env, 設定ファイル など)
4. **データベース関連** (スキーマ, マイグレーション など)
5. **ヘルスチェック関連** (監視エンドポイント, バージョン情報 など)

### テンプレート（scripts/diff-check.sh）

```bash
#!/bin/bash
# scripts/diff-check.sh

set -e

echo "🔍 Checking diff for dangerous changes..."

# 前回のコミットとの差分を取得
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD)

# 危険な変更を検知
AUTH_CHANGED=false
DEPLOY_CHANGED=false
ENV_CHANGED=false
DB_CHANGED=false
HEALTH_CHANGED=false

for file in $CHANGED_FILES; do
  case $file in
    # 🔧 ここをプロジェクトに合わせて変更してください
    # 例: OAuth関連ファイル
    server/_core/oauth.ts|server/routers/auth.ts|app/oauth/callback.tsx)
      AUTH_CHANGED=true
      ;;
    # 例: Deploy関連ファイル
    vercel.json|.github/workflows/deploy.yml|package.json)
      DEPLOY_CHANGED=true
      ;;
    # 例: 環境変数関連ファイル
    .env.example|server/_core/env.ts|app.config.ts)
      ENV_CHANGED=true
      ;;
    # 例: データベース関連ファイル
    drizzle/schema/*.ts|server/db/*.ts)
      DB_CHANGED=true
      ;;
    # 例: ヘルスチェック関連ファイル
    server/routers/health.ts|app/api/health/route.ts)
      HEALTH_CHANGED=true
      ;;
  esac
done

# 警告を表示
if [ "$AUTH_CHANGED" = true ]; then
  echo "⚠️  認証関連ファイルが変更されました"
  echo "   影響範囲: ログイン、セッション、認証UI"
  echo "   必須アクション:"
  echo "   - 認証スモークテスト"
  echo "   - 本番ログイン手動確認"
  echo ""
fi

if [ "$DEPLOY_CHANGED" = true ]; then
  echo "⚠️  Deploy関連ファイルが変更されました"
  echo "   影響範囲: デプロイパイプライン、ビルド設定、環境変数"
  echo "   必須アクション:"
  echo "   - Deploy後ヘルス照合"
  echo "   - 本番環境の動作確認"
  echo ""
fi

if [ "$ENV_CHANGED" = true ]; then
  echo "⚠️  環境変数関連ファイルが変更されました"
  echo "   影響範囲: 環境変数の追加・削除・変更、本番環境の設定"
  echo "   必須アクション:"
  echo "   - 環境変数の設定確認"
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
  echo "   - Deploy後ヘルス照合"
  echo "   - 監視システムの確認"
  echo ""
fi

# 危険な変更がある場合は終了コード1を返す
if [ "$AUTH_CHANGED" = true ] || [ "$DEPLOY_CHANGED" = true ] || [ "$ENV_CHANGED" = true ] || [ "$DB_CHANGED" = true ] || [ "$HEALTH_CHANGED" = true ]; then
  echo "❌ 危険な変更が検出されました。上記の必須アクションを実行してください。"
  exit 1
fi

echo "✅ 危険な変更は検出されませんでした。"
```

### 使い方

1. `scripts/diff-check.sh`を作成
2. プロジェクトに合わせて、検知対象ファイルを変更
3. 実行権限を付与: `chmod +x scripts/diff-check.sh`
4. ローカルで実行: `bash scripts/diff-check.sh`

---

## 2. GitHub Actions CI の実装

### テンプレート（.github/workflows/gate1.yml）

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

  health-check:
    runs-on: ubuntu-latest
    needs: [deploy]  # デプロイ後に実行
    if: github.ref == 'refs/heads/main'  # mainブランチのみ
    steps:
      - uses: actions/checkout@v3
      
      - name: Wait for deployment
        run: sleep 30  # デプロイが完了するまで待機
      
      - name: Check deployed commit SHA
        run: |
          EXPECTED_SHA=$(git rev-parse HEAD)
          # 🔧 ここをプロジェクトのヘルスチェックエンドポイントに変更してください
          ACTUAL_SHA=$(curl -s https://your-app.com/api/health | jq -r .commitSha)
          
          if [ "$EXPECTED_SHA" != "$ACTUAL_SHA" ]; then
            echo "❌ Deployed commit mismatch"
            echo "Expected: $EXPECTED_SHA"
            echo "Actual: $ACTUAL_SHA"
            exit 1
          fi
          
          echo "✅ Deployed commit matches: $EXPECTED_SHA"

  auth-smoke-test:
    runs-on: ubuntu-latest
    needs: [deploy]  # デプロイ後に実行
    if: github.ref == 'refs/heads/main'  # mainブランチのみ
    steps:
      - name: Check auth endpoint
        run: |
          # 🔧 ここをプロジェクトの認証エンドポイントに変更してください
          HTTP_CODE=$(curl -I -s -o /dev/null -w "%{http_code}" https://your-app.com/api/auth/login)
          
          # 🔧 期待するHTTPステータスコードを変更してください（例: 302, 200, 401）
          if [ "$HTTP_CODE" != "302" ]; then
            echo "❌ Auth endpoint returned unexpected status: $HTTP_CODE"
            exit 1
          fi
          
          echo "✅ Auth endpoint is working"
```

### 使い方

1. `.github/workflows/gate1.yml`を作成
2. プロジェクトに合わせて、ヘルスチェックエンドポイントと認証エンドポイントを変更
3. GitHubにプッシュすると、自動的にCIが実行される

---

## 3. PR契約テンプレートの実装

### テンプレート（.github/pull_request_template.md）

```markdown
## 変更内容

<!-- 何を変更したか、なぜ変更したかを簡潔に説明してください -->

## Gate 1 チェックリスト（必須）

### 危険な変更の確認

- [ ] 認証関連ファイルを変更していない（または、認証スモークテストと本番ログイン確認を実施済み）
- [ ] Deploy関連ファイルを変更していない（または、Deploy後ヘルス照合を実施済み）
- [ ] 環境変数関連ファイルを変更していない（または、環境変数の設定確認を実施済み）
- [ ] データベース関連ファイルを変更していない（または、マイグレーション実行確認を実施済み）
- [ ] ヘルスチェック関連ファイルを変更していない（または、Deploy後ヘルス照合を実施済み）

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

### 使い方

1. `.github/pull_request_template.md`を作成
2. PRを作成すると、自動的にこのテンプレートが表示される
3. チェックボックスを全てチェックしてからマージ

---

## 4. Deploy後ヘルス照合の実装

### 目的
デプロイしたコミットが本番環境に反映されていることを確認する。

### ヘルスエンドポイントの実装例

#### Node.js / Express

```javascript
// server/routes/health.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.APP_VERSION || 'unknown',
    commitSha: process.env.COMMIT_SHA || 'unknown',
    timestamp: new Date().toISOString(),
  });
});
```

#### Next.js

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    timestamp: new Date().toISOString(),
  });
}
```

#### Python / Flask

```python
# app/routes/health.py
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'ok',
        'version': os.getenv('APP_VERSION', 'unknown'),
        'commitSha': os.getenv('COMMIT_SHA', 'unknown'),
        'timestamp': datetime.now().isoformat(),
    })
```

### 環境変数の設定

#### Vercel
```bash
# vercel.json
{
  "env": {
    "COMMIT_SHA": "@vercel-git-commit-sha"
  }
}
```

#### GitHub Actions
```yaml
env:
  COMMIT_SHA: ${{ github.sha }}
```

---

## 5. 命令の「4点セット」テンプレート

### 目的
AIに命令を渡す際、曖昧さを排除し、Done条件を明確化する。

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
- 認証関連ファイルを変更しない
- Deploy関連ファイルを変更しない
- 既存の機能を壊さない

### 4. Done条件（チェック可能）
<!-- どうなったら完了とみなすか -->
- [ ] diff-check.shを実行し、警告がない
- [ ] ローカル環境でテストし、動作を確認
- [ ] 影響範囲を把握し、関連する機能が壊れていないことを確認
- [ ] PRを作成し、Gate 1チェックリストを全てチェック
```

### 使い方

1. 新しい機能を実装する前に、`docs/contract.md`を作成
2. 4点セット（Why, What, NG, Done）を記載
3. AIに渡す際、このcontractを参照させる

---

## 6. 実装の優先順位

### Phase 1: diff-check.shの実装（最優先）
1. `scripts/diff-check.sh`を作成
2. プロジェクトに合わせて、検知対象ファイルを定義
3. ローカルで実行し、動作確認

### Phase 2: GitHub Actions CI
1. `.github/workflows/gate1.yml`を作成
2. diff-check jobを追加
3. Deploy後ヘルス照合を追加
4. 認証スモークテストを追加

### Phase 3: PR契約テンプレート
1. `.github/pull_request_template.md`を作成
2. Gate 1チェックリストを追加
3. Done条件を追加

### Phase 4: テストと調整
1. 実際に危険な変更を含むPRを作成
2. CIが止まることを確認
3. 必要に応じて調整

---

## 7. 期待される効果

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

## 8. よくある質問

### Q1: diff-check.shはどのタイミングで実行すべきですか？

**A**: 以下のタイミングで実行してください。

1. **ローカル**: コミット前に実行（pre-commitフックを使うと便利）
2. **CI**: PR作成時、mainブランチへのpush時に自動実行
3. **手動**: 不安な変更をした後、念のため実行

### Q2: Gate 1だけで十分ですか？

**A**: Gate 1は**最小限の構造**です。以下の場合は、Gate 2（E2Eテスト、Visual Regression Testなど）も検討してください。

- プロジェクトが大規模（100ファイル以上）
- チームが複数人
- 本番環境で頻繁に問題が発生している

### Q3: 既存のプロジェクトに導入する場合、どうすればいいですか？

**A**: 段階的に導入してください。

1. **Phase 1**: diff-check.shを作成し、ローカルで実行
2. **Phase 2**: GitHub Actions CIに統合
3. **Phase 3**: PR契約テンプレートを追加
4. **Phase 4**: チーム全体に周知し、運用開始

### Q4: diff-check.shで検知するファイルは、どうやって決めればいいですか？

**A**: 過去に問題が発生したファイルを優先してください。

1. **過去の障害レポート**を確認し、問題が発生したファイルをリストアップ
2. **認証、Deploy、環境変数、データベース、ヘルスチェック**の5つのカテゴリーに分類
3. 各カテゴリーで最も重要なファイルを選定

---

## 9. まとめ

Gate 1は、「5歩進んだら7歩下がる」問題を解決するための**最小限の構造**です。

- **diff-check**: 危険な変更を自動検知
- **Gate制**: PRチェックボックス必須化
- **PR契約**: 自然言語の命令を「チェックリスト契約」に変換

これにより、新機能を追加しても、既存機能が壊れないことを保証します。

---

## 10. 次のステップ

### Gate 2の設計（将来）
- 主要フロー保証（E2Eテスト）
- Visual Regression Test
- パフォーマンステスト

### Gate 3の設計（将来）
- セキュリティテスト
- アクセシビリティテスト
- 国際化テスト

---

## ライセンス

このテンプレートは、MITライセンスで公開されています。自由に使用、改変、再配布してください。

---

## 貢献

このテンプレートの改善案があれば、GitHubでIssueやPRを作成してください。

---

## サポート

質問や問題がある場合は、GitHubのIssueで報告してください。
