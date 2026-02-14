# X API コスト管理機能の改善 - タスクリスト

## Phase 1: キャッシュ期間の調整
- [ ] `server/twitter-oauth2.ts` - キャッシュ期間を48時間に延長
- [ ] 環境変数`FOLLOW_STATUS_CACHE_TTL_HOURS`で設定可能にする
- [ ] 動作確認

## Phase 2: エンドポイント別コスト表示
- [ ] `server/api-usage-tracker.ts` - `getDashboardSummary`にエンドポイント別コストを追加
- [ ] `app/admin/api-usage.tsx` - エンドポイント別コストを表示
- [ ] UIの動作確認

## Phase 3: 日次レポート機能
- [ ] `server/api-daily-report.ts` - 日次レポート生成・送信関数を作成
- [ ] `server/_core/cron.ts` - 日次レポート関数を追加
- [ ] Vercel Cron JobsまたはGitHub Actionsの設定
- [ ] 動作確認

## Phase 4: ドキュメント更新
- [ ] `docs/API_COST_MANAGEMENT.md`を更新
- [ ] 作業履歴を`docs/refactoring/PROGRESS.md`に記録
