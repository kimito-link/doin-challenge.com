# Gate 1 + こまめなバージョン管理の統合テンプレート

## 📋 概要

このテンプレートは、**Gate 1（構造化された開発プロセス）** と **こまめなバージョン管理** を統合した、汎用的な開発ワークフローです。

「5歩進んだら7歩下がる」「どこか直したら他が壊れる」問題を根本的に解決するため、以下の2つの原則を組み合わせます：

1. **Gate 1**: 危険な変更を自動検知し、影響範囲を明確にする
2. **こまめなバージョン管理**: 各バージョンが1つの小さな変更のみを含み、問題の特定とロールバックを容易にする

---

## 🎯 原則

### 1. 1バージョン = 1変更 + 1テスト + 1commit

各バージョンは、以下のサイクルを1回だけ実行：

```
変更 → テスト → commit → checkpoint → diff-check → 次のバージョンへ
```

### 2. Gate 1のチェックポイントを通過

各バージョンで`diff-check.sh`を実行し、以下の7つの危険な変更を検知：

1. **OAuth / 認証**
2. **Deploy / CI**
3. **Env**
4. **DB**
5. **Health**
6. **Routing / Redirect / Proxy**
7. **Build / Bundler / Toolchain**（GPTの追加提案 - build-info問題対策）

### 3. 警告が表示された場合、追加テストを実施

diff-checkで警告が表示された場合、影響範囲を確認し、追加テストを実施。

---

## 📦 ファイル構成

プロジェクトに以下のファイルを追加：

```
project/
├── scripts/
│   └── diff-check.sh          # Gate 1の自動検知スクリプト
├── .github/
│   ├── workflows/
│   │   └── gate1.yml          # GitHub Actions CI
│   └── pull_request_template.md  # PR契約テンプレート
├── docs/
│   ├── contract.md            # 命令の「4点セット」テンプレート
│   ├── gate1-design.md        # Gate 1の詳細設計書
│   └── frequent-version-management-design.md  # こまめなバージョン管理の詳細設計書
└── shared/
    └── version.ts             # バージョン番号管理
```

---

## 🚀 ワークフロー

### Phase 1: 変更の実装

1つの変更のみを実装（データベース / API / UI / 設定 / ドキュメント）

```bash
# 例: データベース層の変更
# SQLクエリを実装
```

### Phase 2: テスト

変更した部分のテストを実施：

- **ユニットテスト**: 変更した関数・コンポーネントが正しく動作するか
- **統合テスト**: 既存の機能が壊れていないか
- **視覚的確認**: ブラウザで確認

```bash
# 例: SQLクエリのテスト
webdev_execute_sql "SELECT ..."
```

### Phase 3: commit

変更をcommit：

```bash
git add .
git commit -m "v6.XXX: 変更内容の要約"
```

### Phase 4: バージョン番号を更新

`shared/version.ts`のバージョン番号を更新：

```typescript
export const APP_VERSION = "6.XXX";
```

### Phase 5: checkpoint

チェックポイントを作成：

```bash
webdev_save_checkpoint
```

### Phase 6: diff-check

diff-checkを実行：

```bash
bash scripts/diff-check.sh
```

警告が表示された場合：

| 警告 | 追加テスト |
|------|-----------|
| OAuth / 認証 | ログイン機能のテスト |
| Deploy / CI | Deploy後ヘルス照合 |
| Env | 環境変数の変更を確認 |
| DB | データベースのマイグレーションを確認 |
| Health | ヘルスチェックエンドポイントを確認 |
| Routing / Redirect / Proxy | リダイレクトのテストを実施 |
| Build / Bundler / Toolchain | ビルド確認とDeploy後ヘルス照合 |

### Phase 7: 次のバージョンへ

todo.mdに次のバージョンのタスクを追加し、Phase 1に戻る。

---

## 📄 テンプレートファイル

### 1. scripts/diff-check.sh

```bash
#!/bin/bash

# Gate 1: 危険な変更を自動検知

# 前回のcommitとの差分を取得
DIFF=$(git diff HEAD~1 HEAD --name-only)

# 検知対象のファイルパターン
OAUTH_PATTERNS="auth|oauth|login|session|callback"
DEPLOY_PATTERNS="vercel.json|railway.json|Dockerfile|.github/workflows"
ENV_PATTERNS=".env|env.ts|config.ts"
DB_PATTERNS="drizzle|schema|migration|db"
HEALTH_PATTERNS="health|version|build-info"
ROUTING_PATTERNS="middleware|router|redirect|proxy|vercel.json"
BUILD_PATTERNS="esbuild|webpack|vite|next.config|tsconfig|package.json|pnpm-lock.yaml|yarn.lock|package-lock.json"

# 警告フラグ
HAS_WARNING=false

echo "🔍 Gate 1: 危険な変更を検知中..."

# OAuth / 認証
if echo "$DIFF" | grep -iE "$OAUTH_PATTERNS" > /dev/null; then
  echo "⚠️  OAuth / 認証 に変更があります"
  HAS_WARNING=true
fi

# Deploy / CI
if echo "$DIFF" | grep -iE "$DEPLOY_PATTERNS" > /dev/null; then
  echo "⚠️  Deploy / CI に変更があります"
  HAS_WARNING=true
fi

# Env
if echo "$DIFF" | grep -iE "$ENV_PATTERNS" > /dev/null; then
  echo "⚠️  Env に変更があります"
  HAS_WARNING=true
fi

# DB
if echo "$DIFF" | grep -iE "$DB_PATTERNS" > /dev/null; then
  echo "⚠️  DB に変更があります"
  HAS_WARNING=true
fi

# Health
if echo "$DIFF" | grep -iE "$HEALTH_PATTERNS" > /dev/null; then
  echo "⚠️  Health に変更があります"
  HAS_WARNING=true
fi

# Routing / Redirect / Proxy
if echo "$DIFF" | grep -iE "$ROUTING_PATTERNS" > /dev/null; then
  echo "⚠️  Routing / Redirect / Proxy に変更があります"
  HAS_WARNING=true
fi

# Build / Bundler / Toolchain
if echo "$DIFF" | grep -iE "$BUILD_PATTERNS" > /dev/null; then
  echo "⚠️  Build / Bundler / Toolchain に変更があります"
  HAS_WARNING=true
fi

if [ "$HAS_WARNING" = true ]; then
  echo ""
  echo "🚨 Gate 1: 危険な変更が検知されました"
  echo "   影響範囲を確認し、追加テストを実施してください。"
else
  echo "✅ Gate 1: 危険な変更は検知されませんでした"
fi
```

### 2. .github/workflows/gate1.yml

```yaml
name: Gate 1

on:
  pull_request:
    branches: [ main ]

jobs:
  diff-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2
      
      - name: Run diff-check
        run: bash scripts/diff-check.sh
      
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const output = require('fs').readFileSync('diff-check-output.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Gate 1: diff-check結果\n\n\`\`\`\n${output}\n\`\`\``
            });
```

### 3. .github/pull_request_template.md

```markdown
## 変更内容

<!-- 変更内容を簡潔に説明してください -->

## Gate 1: 必須チェックリスト

### 危険な変更の確認

- [ ] OAuth / 認証 に変更がある場合、ログイン機能のテストを実施した
- [ ] Deploy / CI に変更がある場合、Deploy後ヘルス照合を実施した
- [ ] Env に変更がある場合、環境変数の変更を確認した
- [ ] DB に変更がある場合、データベースのマイグレーションを確認した
- [ ] Health に変更がある場合、ヘルスチェックエンドポイントを確認した
- [ ] Routing / Redirect / Proxy に変更がある場合、リダイレクトのテストを実施した
- [ ] Build / Bundler / Toolchain に変更がある場合、ビルド確認とDeploy後ヘルス照合を実施した

### こまめなバージョン管理

- [ ] このPRは1つの変更のみを含む
- [ ] テストを実施した（ユニットテスト + 統合テスト）
- [ ] バージョン番号を更新した（`shared/version.ts`）
- [ ] チェックポイントを作成した
- [ ] diff-checkを実行した

## テスト結果

<!-- テスト結果を記載してください -->

## スクリーンショット

<!-- 必要に応じてスクリーンショットを添付してください -->
```

### 4. docs/contract.md

```markdown
# 命令の「4点セット」テンプレート

## 目的（Why）

<!-- なぜこの変更が必要なのか？ -->

## やること（What）

<!-- 何を実装するのか？ -->

## やってはいけないこと（NG）

<!-- 何を壊してはいけないのか？ -->

## Done条件（チェック可能）

<!-- どうなったら完了なのか？ -->

- [ ] 
- [ ] 
- [ ] 
```

### 5. shared/version.ts

```typescript
/**
 * アプリケーションのバージョン情報
 * 
 * バージョン更新手順:
 * 1. このファイルのAPP_VERSIONを更新
 * 2. git commit
 * 3. webdev_save_checkpoint
 * 4. bash scripts/diff-check.sh
 */

export const APP_VERSION = "6.XXX";
```

---

## 📊 実装例: 性別統計表示機能

### v6.174: データベース層

**変更**: 性別統計を集計するSQLクエリを実装

```sql
SELECT 
  c.id,
  c.title,
  COUNT(CASE WHEN p.gender = 'male' THEN 1 END) as male_count,
  COUNT(CASE WHEN p.gender = 'female' THEN 1 END) as female_count,
  COUNT(CASE WHEN p.gender = 'unspecified' THEN 1 END) as unspecified_count
FROM challenges c
LEFT JOIN participations p ON c.id = p.challengeId
GROUP BY c.id, c.title
ORDER BY c.id;
```

**テスト**: SQLクエリを実行して結果を確認

```bash
webdev_execute_sql "SELECT ..."
```

**commit**: 

```bash
git add .
git commit -m "v6.174: データベース層: 性別統計SQL実装"
```

**バージョン更新**: `shared/version.ts`を`6.174`に更新

**checkpoint**: 

```bash
webdev_save_checkpoint
```

**diff-check**: 

```bash
bash scripts/diff-check.sh
# ⚠️  DB に変更があります
# → データベースのマイグレーションを確認
```

---

### v6.175: API層（challenge-db.ts）

**変更**: `getAllEventsWithGenderStats()`関数を実装

```typescript
export async function getAllEventsWithGenderStats() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute(sql`
    SELECT 
      c.*,
      COUNT(CASE WHEN p.gender = 'male' THEN 1 END) as maleCount,
      COUNT(CASE WHEN p.gender = 'female' THEN 1 END) as femaleCount,
      COUNT(CASE WHEN p.gender = 'unspecified' THEN 1 END) as unspecifiedCount
    FROM challenges c
    LEFT JOIN participations p ON c.id = p.challengeId
    WHERE c.isPublic = true
    GROUP BY c.id
    ORDER BY c.eventDate DESC
  `);
  
  return result[0];
}
```

**テスト**: APIを呼び出して結果を確認（curl or Postman）

```bash
curl http://localhost:3000/api/trpc/events.listPaginated
```

**commit**: 

```bash
git add .
git commit -m "v6.175: API層: challenge-db.ts実装"
```

**バージョン更新**: `shared/version.ts`を`6.175`に更新

**checkpoint**: 

```bash
webdev_save_checkpoint
```

**diff-check**: 

```bash
bash scripts/diff-check.sh
# ✅ Gate 1: 危険な変更は検知されませんでした
```

---

### v6.176: API層（events.ts統合）

**変更**: `listPaginated`プロシージャを`getAllEventsWithGenderStats()`に変更

```typescript
listPaginated: publicProcedure
  .input(z.object({ page: z.number().min(1), limit: z.number().min(1).max(100) }))
  .query(async ({ input }) => {
    const events = await getAllEventsWithGenderStats(); // 変更
    const start = (input.page - 1) * input.limit;
    const end = start + input.limit;
    return {
      events: events.slice(start, end),
      total: events.length,
    };
  }),
```

**テスト**: フロントエンドからAPIを呼び出して結果を確認

**commit**: 

```bash
git add .
git commit -m "v6.176: API層: events.ts統合"
```

**バージョン更新**: `shared/version.ts`を`6.176`に更新

**checkpoint**: 

```bash
webdev_save_checkpoint
```

**diff-check**: 

```bash
bash scripts/diff-check.sh
# ✅ Gate 1: 危険な変更は検知されませんでした
```

---

### v6.177: UI層（GenderStatsコンポーネント統合）

**変更**: `ColorfulChallengeCard`に性別統計を表示

```tsx
<ColorfulChallengeCard
  challenge={{
    ...challenge,
    genderStats: {
      maleCount: challenge.maleCount,
      femaleCount: challenge.femaleCount,
      unspecifiedCount: challenge.unspecifiedCount,
    },
  }}
/>
```

**テスト**: ブラウザで確認（サムネイル画像と性別統計が両方表示されることを確認）

**commit**: 

```bash
git add .
git commit -m "v6.177: UI層: GenderStatsコンポーネント統合"
```

**バージョン更新**: `shared/version.ts`を`6.177`に更新

**checkpoint**: 

```bash
webdev_save_checkpoint
```

**diff-check**: 

```bash
bash scripts/diff-check.sh
# ✅ Gate 1: 危険な変更は検知されませんでした
```

---

### v6.178: 統合テスト完了

**テスト**:
1. ホーム画面でサムネイル・性別統計が両方表示されることを確認
2. ログイン機能が正しく動作することを確認
3. チャレンジ詳細画面が正しく動作することを確認

**commit**: 

```bash
git add .
git commit -m "v6.178: 統合テスト完了"
```

**バージョン更新**: `shared/version.ts`を`6.178`に更新

**checkpoint**: 

```bash
webdev_save_checkpoint
```

**diff-check**: 

```bash
bash scripts/diff-check.sh
# ✅ Gate 1: 危険な変更は検知されませんでした
```

---

## 🎯 メリット

### 1. 問題の特定が容易

各バージョンが1つの小さな変更のみを含むため、問題が発生した場合、原因を特定しやすい。

**例**:
- v6.177でサムネイル画像が消えた → v6.177の変更（GenderStatsコンポーネント統合）が原因

### 2. ロールバックが安全

1つ前のバージョンに戻れば、確実に動作する状態に戻れる。

**例**:
- v6.177で問題が発生 → v6.176にロールバック → 問題が解決

### 3. 変更履歴が明確

各バージョンのcommitメッセージを見れば、何をいつ変更したかが一目瞭然。

**例**:
```
v6.174: データベース層: 性別統計SQL実装
v6.175: API層: challenge-db.ts実装
v6.176: API層: events.ts統合
v6.177: UI層: GenderStatsコンポーネント統合
```

### 4. diff-checkが効果的

小さな変更なので、影響範囲が明確。diff-checkの警告も理解しやすい。

### 5. Gate 1との統合

各バージョンでdiff-checkを実行することで、Gate 1のチェックポイントを通過。
危険な変更を早期に検知し、追加テストを実施できる。

---

## 📋 チェックリスト

### 導入時

- [ ] `scripts/diff-check.sh`を作成
- [ ] `.github/workflows/gate1.yml`を作成
- [ ] `.github/pull_request_template.md`を作成
- [ ] `docs/contract.md`を作成
- [ ] `shared/version.ts`を作成

### 各バージョンで

- [ ] 1つの変更のみを実装
- [ ] テストを実施（ユニットテスト + 統合テスト）
- [ ] commit
- [ ] バージョン番号を更新（`shared/version.ts`）
- [ ] checkpoint
- [ ] diff-checkを実行
- [ ] 警告が表示された場合、追加テストを実施
- [ ] todo.mdに次のバージョンのタスクを追加

---

## 🚀 他のプロジェクトへの適用

このテンプレートは、どのプロジェクトにも適用可能です。

### 手順

1. **ファイルをコピー**: 上記のテンプレートファイルをプロジェクトにコピー
2. **diff-check.shをカスタマイズ**: プロジェクト固有のファイルパターンを追加
3. **バージョン番号の形式を決定**: `v1.XXX`, `v2.XXX`, etc.
4. **ワークフローを開始**: Phase 1から開始

---

## 🎯 まとめ

**Gate 1 + こまめなバージョン管理** を統合することで、以下のメリットが得られる：

1. **問題の特定が容易**: 各バージョンが1つの小さな変更のみを含む
2. **ロールバックが安全**: 1つ前のバージョンに戻れば確実に動く
3. **変更履歴が明確**: 何をいつ変更したかが一目瞭然
4. **diff-checkが効果的**: 小さな変更なので影響範囲が明確
5. **Gate 1との統合**: 危険な変更を早期に検知し、追加テストを実施

「5歩進んだら7歩下がる」「どこか直したら他が壊れる」問題を根本的に解決できる。
