## 変更概要
- 何を直したか（1〜3行で）

## 変更種別（該当するものにチェック）
- [ ] UI/表示
- [ ] API/サーバー
- [ ] DB/スキーマ or マイグレーション
- [ ] OAuth/ログイン/セッション
- [ ] デプロイ/ルーティング（Vercel/Railway/vercel.json）
- [ ] 設定/環境変数

---

## Gate 1: 手動1分儀式（マージ前必須）

- [ ] **1分**でできる手動確認を実施した（該当画面を開く・主要操作1回）
- [ ] 変更した画面を **3サイズ** で表示確認した（スマホ幅 / タブレット幅 / PC幅）
- [ ] `bash scripts/diff-check.sh origin/main HEAD` を実行し、**変更ファイル一覧・サマリー・危険フラグ**を確認した

## Gate 1: 危険な変更の確認（必須）

diff-check で危険ファイル（oauth/auth/vercel.json/env/schema/health/routing 等）に触れている場合、CI が fail します。該当する必須アクションを実施してください。

- [ ] **認証関連**に変更がある場合 → ログイン機能のテストを実施した
- [ ] **Deploy/CI**に変更がある場合 → Deploy後ヘルス照合を実施した
- [ ] **環境変数**に変更がある場合 → 環境変数の設定確認を実施した
- [ ] **データベース**に変更がある場合 → マイグレーション実行確認を実施した
- [ ] **ヘルスチェック**に変更がある場合 → Deploy後ヘルス照合を実施した
- [ ] **Routing/Redirect/Proxy**に変更がある場合 → リダイレクトのテストを実施した
- [ ] **ワークフロー**（`.github/workflows/`）に変更がある場合 → デプロイ・CIの動作確認を実施した

## Gate 1: こまめなバージョン管理（推奨）

- [ ] このPRは**1つの変更のみ**を含む
- [ ] テストを実施した（ユニットテスト or 統合テスト or 手動確認）
- [ ] バージョン番号を更新した（`shared/version.ts`）

## Gate 1: Deploy/Health確認
- [ ] OAuth/ログイン動作確認
- [ ] ロールバック手順確認

### Deploy/Health確認のメモ（貼ってOK）
- `/api/health` のレスポンス（commitSha / version / ok）
- `/version.json` の commitSha
- 期待値と一致しているか

---

## テスト
- [ ] `pnpm test` OK
- [ ] `pnpm lint` OK
- [ ] `pnpm check` OK

## リスク
- 影響範囲 / 戻し方 / Feature Flag（あれば）
