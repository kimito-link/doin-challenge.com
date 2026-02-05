## 変更概要
（1変更 = 1目的 で簡潔に）

## Gate 1（必須）

- [ ] Diff-check: CIで pass
- [ ] 本番照合: `/api/health` の commitSha がこのPRのmerge後SHAになる（deploy-verifyが pass）
- [ ] 危険変更（OAuth / deploy / auth）を触った場合、確認結果をここに記載

### 確認結果（貼る）
- `/api/health` レスポンス（commitShaが見える状態）:


## 影響範囲
- [ ] 認証 / OAuth
- [ ] API
- [ ] DB
- [ ] UI表示のみ
- [ ] 文言のみ

## 手動1分チェック（必須）
- [ ] ログインできる
- [ ] ホーム表示OK
- [ ] 詳細表示OK
- [ ] 参加表明OK
- [ ] メッセージ投稿OK
- [ ] /api/health の version が更新されている

## diff-check
- [ ] 危険ファイルを触っていない
- [ ] 禁止ワードを使っていない

## レスポンシブ
- [ ] モバイル
- [ ] タブレット
- [ ] デスクトップ
