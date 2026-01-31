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

## Gate 1（壊れない運用）
- [ ] Gate 1: Deploy/Health確認
- [ ] OAuth/ログイン動作確認
- [ ] ロールバック手順確認

### Deploy/Health確認のメモ（貼ってOK）
- `/api/health` のレスポンス（commitSha / version）
- 期待値と一致しているか

---

## テスト
- [ ] `pnpm test` OK
- [ ] `pnpm lint` OK
- [ ] `pnpm check` OK

## リスク
- 影響範囲 / 戻し方 / Feature Flag（あれば）
