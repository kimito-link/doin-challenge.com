# デプロイフロー（本番反映手順）

## 概要

このプロジェクトは以下の構成でデプロイされています：

| 環境 | ブランチ | URL |
|------|----------|-----|
| 開発 | `main` | Manus開発サーバー |
| 本番 | `production/main` | doin-challenge-com.vercel.app |

---

## 重要：Manusの作業ルール

### チェックポイント保存時は必ず本番反映まで行う

```
1. webdev_save_checkpoint を実行
2. GitHub APIで production/main を更新（下記コマンド）
3. ユーザーに「本番に反映しました」と報告
```

**この3ステップを毎回必ず実行すること。**

### 本番反映コマンド（Manusが実行）

```bash
# 1. 最新のコミットSHAを取得
LATEST_SHA=$(git rev-parse HEAD)

# 2. production/mainを更新（%2Fでエスケープ必須）
gh api repos/kimito-link/doin-challenge.com/git/refs/heads/production%2Fmain \
  -X PATCH \
  --input - <<EOF
{
  "sha": "$LATEST_SHA",
  "force": true
}
EOF
```

---

## デプロイの流れ

```
開発作業 → テスト → チェックポイント保存 → 本番反映 → 報告
                                          ↑
                                    ここを忘れない！
```

### 1. 開発作業
- Manusで機能実装・バグ修正を行う

### 2. テスト
- `pnpm test` で全テストを実行

### 3. チェックポイント保存
- `webdev_save_checkpoint` を実行
- `main` ブランチにコミット・プッシュされる

### 4. 本番反映（必須）
- GitHub APIで `production/main` を更新
- Vercelが自動的にデプロイを開始

### 5. 報告
- ユーザーに「v6.XX を本番に反映しました」と報告

---

## ユーザーが手動で確認・反映する方法

### GitHubアプリ（スマホ）から確認

1. リポジトリを開く（kimito-link/doin-challenge.com）
2. 「コミット」をタップ
3. 最新コミットのメッセージを確認

### GitHubアプリ（スマホ）から手動マージ

1. 「Pull Request」をタップ
2. 「New」で新規PR作成
3. base: `production/main` ← compare: `main`
4. 「Create Pull Request」
5. 「Merge」をタップ

### PC（Manus UI）から公開

1. チェックポイントカードをクリック
2. 右上の「公開」ボタンをクリック

---

## トラブルシューティング

### 本番に反映されていない場合

**原因**: チェックポイント保存後に本番反映を忘れている

**確認方法**:
```bash
# mainのコミット
git log --oneline main -1

# production/mainのコミット（GitHub上）
gh api repos/kimito-link/doin-challenge.com/commits/production/main --jq '.sha[:7]'
```

両方が同じなら反映済み。異なる場合は本番反映が必要。

### 「Reference does not exist」エラー

ブランチ名の `/` をURLエンコード（`%2F`）する：

```bash
# ❌ 間違い
.../git/refs/heads/production/main

# ✅ 正しい
.../git/refs/heads/production%2Fmain
```

### 「Object does not exist」エラー

ローカルのコミットがGitHubにプッシュされていない。
`webdev_save_checkpoint` を再実行してから本番反映を行う。

---

## バージョン履歴

| バージョン | コミット | 内容 | 本番反映 |
|------------|----------|------|----------|
| v6.62 | ec61e7e7 | キャラクターローディング | 未 |
| v6.61 | 43dc4488 | プリセット機能・言語簡素化 | 未 |
| v6.60 | b81db5d | 作成完了モーダル | 未 |
| v6.52 | b115d42 | E2Eテスト修正 | 済（現在の本番） |

---

## 更新履歴

- 2026-01-23: 初版作成（PC/スマホ両対応）
