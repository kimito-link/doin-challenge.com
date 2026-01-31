# GPTへの相談: Gate 1 + こまめなバージョン管理の統合ワークフロー

## 📋 背景

私は、チャレンジ参加Webアプリ（doin-challenge.com）を開発しています。
技術スタックは、Next.js、tRPC、Drizzle ORM、PostgreSQL、Vercelです。

最近、**「5歩進んだら7歩下がる」問題** に直面しました。
具体的には、v6.172で性別統計表示機能を実装したところ、サムネイル画像とログイン機能が壊れてしまいました。

この問題を根本的に解決するため、以下の2つの原則を導入しました：

1. **Gate 1**: 危険な変更を自動検知し、影響範囲を明確にする
2. **こまめなバージョン管理**: 各バージョンが1つの小さな変更のみを含み、問題の特定とロールバックを容易にする

---

## 🎯 Gate 1の概要

Gate 1は、以下の7つの危険な変更を自動検知するスクリプト（`diff-check.sh`）です：

1. **OAuth / 認証**: `auth|oauth|login|session|callback`
2. **Deploy / CI**: `vercel.json|railway.json|Dockerfile|.github/workflows`
3. **Env**: `.env|env.ts|config.ts`
4. **DB**: `drizzle|schema|migration|db`
5. **Health**: `health|version|build-info`
6. **Routing / Redirect / Proxy**: `middleware|router|redirect|proxy|vercel.json`
7. **Build / Bundler / Toolchain**: `esbuild|webpack|vite|next.config|tsconfig|package.json|pnpm-lock.yaml|yarn.lock|package-lock.json`（GPTの追加提案 - build-info問題対策）

警告が表示された場合、影響範囲を確認し、追加テストを実施します。

### Gate 1のテスト結果

- ✅ `diff-check.sh`が正しく動作することを確認（OAuth関連ファイルを変更してテスト）
- ✅ GitHub Actions CIの設計完了
- ✅ PR契約テンプレートの作成完了

---

## 🔄 こまめなバージョン管理の概要

こまめなバージョン管理は、以下の原則に基づいています：

### 原則1: 1バージョン = 1変更

各バージョンは、以下のいずれか**1つ**の変更のみを含む：

- データベース層の変更（SQLクエリの追加・修正）
- API層の変更（関数の追加・修正）
- UI層の変更（コンポーネントの追加・修正）
- 設定ファイルの変更（env, config, etc.）
- ドキュメントの変更

### 原則2: 各バージョンで必ずテスト

各バージョンで以下のテストを実施：

1. **ユニットテスト**: 変更した関数・コンポーネントが正しく動作するか
2. **統合テスト**: 既存の機能が壊れていないか
3. **diff-check**: 危険な変更が含まれていないか

### 原則3: 各バージョンでcommit + checkpoint

各バージョンで以下を実施：

1. `git add .`
2. `git commit -m "v6.XXX: 変更内容の要約"`
3. `webdev_save_checkpoint`（チェックポイント作成）
4. `bash scripts/diff-check.sh`（diff-check実行）

---

## 🚀 統合ワークフロー

Gate 1とこまめなバージョン管理を統合したワークフローは以下の通りです：

```
Phase 1: 変更の実装
  ↓
Phase 2: テスト（ユニットテスト + 統合テスト）
  ↓
Phase 3: commit
  ↓
Phase 4: バージョン番号を更新（shared/version.ts）
  ↓
Phase 5: checkpoint（webdev_save_checkpoint）
  ↓
Phase 6: diff-check（bash scripts/diff-check.sh）
  ↓
Phase 7: 警告が表示された場合、追加テストを実施
  ↓
Phase 8: 次のバージョンへ
```

---

## 📊 実装例: 性別統計表示機能

v6.172で失敗した性別統計表示機能を、こまめなバージョン管理で再実装する例です：

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

**commit**: `git commit -m "v6.174: データベース層: 性別統計SQL実装"`

**checkpoint**: `webdev_save_checkpoint`

**diff-check**: `bash scripts/diff-check.sh` → **⚠️ DB に変更があります** → データベースのマイグレーションを確認

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

**commit**: `git commit -m "v6.175: API層: challenge-db.ts実装"`

**checkpoint**: `webdev_save_checkpoint`

**diff-check**: `bash scripts/diff-check.sh` → **✅ 警告なし**

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

**commit**: `git commit -m "v6.176: API層: events.ts統合"`

**checkpoint**: `webdev_save_checkpoint`

**diff-check**: `bash scripts/diff-check.sh` → **✅ 警告なし**

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

**commit**: `git commit -m "v6.177: UI層: GenderStatsコンポーネント統合"`

**checkpoint**: `webdev_save_checkpoint`

**diff-check**: `bash scripts/diff-check.sh` → **✅ 警告なし**

---

### v6.178: 統合テスト完了

**テスト**:
1. ホーム画面でサムネイル・性別統計が両方表示されることを確認
2. ログイン機能が正しく動作することを確認
3. チャレンジ詳細画面が正しく動作することを確認

**commit**: `git commit -m "v6.178: 統合テスト完了"`

**checkpoint**: `webdev_save_checkpoint`

**diff-check**: `bash scripts/diff-check.sh` → **✅ 警告なし**

---

## 🎯 期待されるメリット

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

## ❓ GPTへの質問

### 1. ワークフローの妥当性

このワークフロー（Gate 1 + こまめなバージョン管理）は、「5歩進んだら7歩下がる」問題を解決するのに十分ですか？

改善点や追加すべき要素があれば教えてください。

---

### 2. バージョンの粒度

各バージョンが1つの変更のみを含む、という粒度は適切ですか？

例えば、v6.174（データベース層）、v6.175（API層）、v6.176（API層統合）、v6.177（UI層）という分け方は適切ですか？

もっと細かく分けるべきでしょうか？それとも、もっと粗く分けるべきでしょうか？

---

### 3. テストの範囲

各バージョンで実施すべきテストの範囲は適切ですか？

- ユニットテスト: 変更した関数・コンポーネントが正しく動作するか
- 統合テスト: 既存の機能が壊れていないか
- diff-check: 危険な変更が含まれていないか

他に追加すべきテストがあれば教えてください。

---

### 4. diff-checkの検知パターン

diff-checkの検知パターンは適切ですか？

1. **OAuth / 認証**: `auth|oauth|login|session|callback`
2. **Deploy / CI**: `vercel.json|railway.json|Dockerfile|.github/workflows`
3. **Env**: `.env|env.ts|config.ts`
4. **DB**: `drizzle|schema|migration|db`
5. **Health**: `health|version|build-info`
6. **Routing / Redirect / Proxy**: `middleware|router|redirect|proxy|vercel.json`
7. **Build / Bundler / Toolchain**: `esbuild|webpack|vite|next.config|tsconfig|package.json|pnpm-lock.yaml|yarn.lock|package-lock.json`（GPTの追加提案 - build-info問題対策）

追加すべきパターンや、削除すべきパターンがあれば教えてください。

---

### 5. チェックポイントのタイミング

各バージョンでチェックポイントを作成する、というタイミングは適切ですか？

もっと頻繁にチェックポイントを作成すべきでしょうか？それとも、もっと少なくすべきでしょうか？

---

### 6. 他のプロジェクトへの適用

このワークフローは、他のプロジェクトにも適用可能ですか？

例えば、以下のようなプロジェクトにも適用できますか？

- React + Express + MongoDB
- Vue.js + Django + PostgreSQL
- Angular + Spring Boot + MySQL

適用する際の注意点があれば教えてください。

---

### 7. 潜在的な問題点

このワークフローには、潜在的な問題点がありますか？

例えば、以下のような問題が発生する可能性はありますか？

- バージョン数が多すぎて管理が大変になる
- テストの時間が長すぎて開発速度が遅くなる
- diff-checkの警告が多すぎて無視されるようになる

問題が発生する可能性がある場合、どのように対処すべきか教えてください。

---

### 8. ベストプラクティス

このワークフローを実践する際のベストプラクティスがあれば教えてください。

例えば、以下のようなベストプラクティスはありますか？

- バージョン番号の付け方
- commitメッセージの書き方
- テストの自動化
- CI/CDとの統合

---

### 9. 既存のツールとの比較

このワークフローは、既存のツール（例: Git Flow, GitHub Flow, GitLab Flow）と比較してどうですか？

既存のツールを使った方が良い場合はありますか？

---

### 10. 総合評価

このワークフロー（Gate 1 + こまめなバージョン管理）の総合評価を教えてください。

- **良い点**: 何が優れているか
- **悪い点**: 何が不足しているか
- **改善点**: どのように改善すべきか

---

## 📄 添付ドキュメント

以下のドキュメントを添付しますので、参考にしてください：

1. **docs/gate1-design.md**: Gate 1の詳細設計書
2. **docs/frequent-version-management-design.md**: こまめなバージョン管理の詳細設計書
3. **docs/TEMPLATE-gate1-with-version-management.md**: Gate 1 + こまめなバージョン管理の統合テンプレート

---

## 🙏 お願い

このワークフローは、私が「5歩進んだら7歩下がる」問題に直面した経験から生まれました。

同じ問題に直面している開発者の方々の参考になれば幸いです。

GPTの皆様、ぜひフィードバックをお願いします！
