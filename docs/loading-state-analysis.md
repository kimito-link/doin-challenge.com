# Loading State Analysis

## 概要

アプリ内の全画面を調査し、ローディング状態設計（`isInitialLoading`, `isRefreshing`, `isLoadingMore`）の適用状況を分析しました。

## 画面分類

### ✅ 既に最適化済み（v6.59-v6.61）

| 画面 | ファイル | ローディング状態 | 備考 |
|------|---------|----------------|------|
| **ホーム** | `app/(tabs)/index.tsx` | `isInitialLoading`, `isRefreshing`, `isLoadingMore` | 完全実装 |
| **イベント詳細** | `app/event/[id].tsx` | `isInitialLoading`, `isRefreshing` | 完全実装 |
| **ランキング** | `app/rankings.tsx` | `isInitialLoading`, `isRefreshing` | 完全実装 |
| **マイページ** | `app/(tabs)/mypage.tsx` | 認証状態のみ | 既に最適 |

### 🔍 データ取得が重い画面（優先度: 高）

| 画面 | ファイル | 現状 | 推奨改善 |
|------|---------|------|---------|
| **プロフィール** | `app/profile/[userId].tsx` | 未調査 | `isInitialLoading`, `isRefreshing`を追加 |
| **ダッシュボード** | `app/dashboard/[id].tsx` | 未調査 | `isInitialLoading`, `isRefreshing`を追加 |
| **通知** | `app/notifications.tsx` | 未調査 | `isInitialLoading`, `isRefreshing`を追加 |
| **メッセージ一覧** | `app/messages/index.tsx` | 未調査 | `isInitialLoading`, `isRefreshing`を追加 |
| **実績一覧** | `app/achievements.tsx` | 未調査 | `isInitialLoading`, `isRefreshing`を追加 |

### 📝 フォーム画面（優先度: 中）

| 画面 | ファイル | 現状 | 推奨改善 |
|------|---------|------|---------|
| **イベント作成** | `app/(tabs)/create.tsx` | 未調査 | 送信中状態の管理 |
| **イベント編集** | `app/edit-challenge/[id].tsx` | 未調査 | `isInitialLoading`（データ取得）+ 送信中状態 |
| **参加編集** | `app/edit-participation/[id].tsx` | 未調査 | `isInitialLoading`（データ取得）+ 送信中状態 |
| **設定** | `app/settings.tsx` | 未調査 | 軽微なデータ取得のみ |

### 🔗 リンク・招待画面（優先度: 中）

| 画面 | ファイル | 現状 | 推奨改善 |
|------|---------|------|---------|
| **招待** | `app/invite/[id].tsx` | 未調査 | `isInitialLoading`（イベント情報取得） |
| **参加コード** | `app/join/[code].tsx` | 未調査 | `isInitialLoading`（コード検証） |
| **コラボレーター** | `app/collaborators/[id].tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |

### 📱 メッセージ・通知画面（優先度: 中）

| 画面 | ファイル | 現状 | 推奨改善 |
|------|---------|------|---------|
| **メッセージ詳細** | `app/messages/[partnerId].tsx` | 未調査 | `isInitialLoading`, `isRefreshing`, `isLoadingMore` |
| **通知設定** | `app/notification-settings.tsx` | 未調査 | 軽微なデータ取得のみ |
| **リマインダー** | `app/reminders/[id].tsx` | 未調査 | `isInitialLoading`（リマインダー情報取得） |

### 👥 ソーシャル画面（優先度: 低）

| 画面 | ファイル | 現状 | 推奨改善 |
|------|---------|------|---------|
| **フォロワー** | `app/followers.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **フォロー中** | `app/following.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |

### 🛠️ 管理画面（優先度: 低）

| 画面 | ファイル | 現状 | 推奨改善 |
|------|---------|------|---------|
| **管理ダッシュボード** | `app/admin/index.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **API使用状況** | `app/admin/api-usage.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **データ整合性** | `app/admin/data-integrity.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **エラーログ** | `app/admin/errors.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **システム情報** | `app/admin/system.tsx` | 未調査 | 軽微なデータ取得のみ |
| **ユーザー管理** | `app/admin/users.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **イベント管理** | `app/admin/challenges.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **参加管理** | `app/admin/participations.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **カテゴリ管理** | `app/admin/categories.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |

### 🔧 その他（優先度: 最低）

| 画面 | ファイル | 現状 | 推奨改善 |
|------|---------|------|---------|
| **ヘルプ** | `app/help.tsx` | 未調査 | 静的コンテンツのみ |
| **リリースノート** | `app/release-notes.tsx` | 未調査 | 静的コンテンツのみ |
| **テンプレート** | `app/templates/index.tsx` | 未調査 | `isInitialLoading`, `isRefreshing` |
| **デモ** | `app/demo/index.tsx` | 未調査 | デモ用画面 |
| **テーマラボ** | `app/dev/theme-lab.tsx` | 未調査 | 開発用画面 |

### ⚙️ システム画面（対象外）

| 画面 | ファイル | 理由 |
|------|---------|------|
| **OAuth コールバック** | `app/oauth/callback.tsx` | 自動リダイレクト |
| **Twitter コールバック** | `app/oauth/twitter-callback.tsx` | 自動リダイレクト |
| **ログアウト** | `app/logout.tsx` | 自動リダイレクト |
| **404** | `app/+not-found.tsx` | エラー画面 |

## 優先度別実装計画

### Phase 3-1: 高優先度画面（5画面）
1. **プロフィール** - ユーザー情報、投稿履歴、フォロー情報
2. **ダッシュボード** - イベント統計、参加者情報
3. **通知** - 通知一覧、既読管理
4. **メッセージ一覧** - 会話一覧、未読カウント
5. **実績一覧** - バッジ一覧、達成条件

### Phase 3-2: 中優先度画面（10画面）
- フォーム画面（3画面）
- リンク・招待画面（3画面）
- メッセージ・通知画面（3画面）
- ソーシャル画面（2画面）

### Phase 3-3: 低優先度画面（管理画面等）
- 管理画面（9画面）
- その他（5画面）

## 実装ガイドライン

### 標準パターン

```typescript
// 1. クエリにisFetchingを追加
const { data, isLoading, isFetching } = trpc.xxx.useQuery(...);

// 2. ローディング状態を計算
const hasData = !!data;
const isInitialLoading = isLoading && !hasData;
const isRefreshing = isFetching && hasData;

// 3. スケルトン表示
if (isInitialLoading) {
  return <XxxSkeleton />;
}

// 4. 更新中インジケータ
{isRefreshing && <RefreshingIndicator />}
```

### 無限スクロールパターン（メッセージ詳細等）

```typescript
const { 
  data, 
  isLoading, 
  isFetching, 
  isFetchingNextPage 
} = trpc.xxx.useInfiniteQuery(...);

const isInitialLoading = isLoading && !hasData;
const isRefreshing = isFetching && hasData && !isFetchingNextPage;
const isLoadingMore = isFetchingNextPage;
```

## パフォーマンス目標

| 状態 | 目標時間 | 説明 |
|------|---------|------|
| **初回ロード** | < 1秒 | ネットワークからのデータ取得 |
| **キャッシュあり** | < 100ms | React Queryキャッシュからの表示 |
| **裏更新** | 非同期 | 小インジケータで通知、スケルトンなし |

## 次のステップ

1. **Phase 3-1の実装**: 高優先度5画面にローディング状態設計を適用
2. **パフォーマンス計測**: 各画面のローディング時間を計測
3. **Phase 3-2の実装**: 中優先度10画面に拡大
4. **Phase 3-3の実装**: 低優先度画面（必要に応じて）

## 参考資料

- [performance-monitoring.md](./performance-monitoring.md) - パフォーマンス計測の詳細
- [useHomeData.ts](../features/home/hooks/useHomeData.ts) - 標準実装の参考例
- [useEventDetail.ts](../features/event-detail/hooks/useEventDetail.ts) - 詳細画面の参考例
