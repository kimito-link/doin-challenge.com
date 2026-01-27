# API仕様書

## 概要

このドキュメントは、動員ちゃれんじアプリケーションのAPI仕様を記述しています。APIはtRPCを使用して実装されており、型安全な通信を提供します。

## ベースURL

- **開発環境**: `http://localhost:3000/trpc`
- **本番環境**: `https://doin-challenge.com/trpc`

## 認証

認証はOAuth（Twitter/X）を使用しています。認証が必要なエンドポイントは、リクエストヘッダーに`Authorization`トークンを含める必要があります。

```typescript
// tRPCクライアントの設定例
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: async () => {
        const token = await getAuthToken();
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
});
```

## エンドポイント一覧

### 1. 認証 (auth)

#### `auth.me`

現在のログインユーザー情報を取得します。

**認証**: 必須

**リクエスト**: なし

**レスポンス**:

```typescript
{
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  twitterId: string;
  followersCount: number;
  createdAt: Date;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合

---

### 2. イベント (events)

#### `events.list`

イベント一覧を取得します。

**認証**: 不要

**リクエスト**:

```typescript
{
  limit?: number; // デフォルト: 20
  cursor?: string; // ページネーション用カーソル
  status?: 'upcoming' | 'ongoing' | 'past'; // フィルター
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    id: string;
    title: string;
    description: string;
    eventDate: Date;
    eventType: string;
    venue: string | null;
    streamingUrl: string | null;
    targetParticipants: number;
    currentParticipants: number;
    progressPercentage: number;
    createdBy: {
      id: string;
      name: string;
      username: string;
      avatarUrl: string | null;
    };
  }>;
  nextCursor?: string;
}
```

#### `events.get`

イベント詳細を取得します。

**認証**: 不要

**リクエスト**:

```typescript
{
  id: string;
}
```

**レスポンス**:

```typescript
{
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  eventType: string;
  venue: string | null;
  streamingUrl: string | null;
  targetParticipants: number;
  currentParticipants: number;
  progressPercentage: number;
  createdBy: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  participations: Array<{
    id: string;
    participationType: 'venue' | 'streaming' | 'both';
    message: string | null;
    gender: 'male' | 'female' | 'other' | null;
    user: {
      id: string;
      name: string;
      username: string;
      avatarUrl: string | null;
    };
    createdAt: Date;
  }>;
}
```

**エラー**:

- `NOT_FOUND`: イベントが見つからない場合

#### `events.create`

新しいイベントを作成します。

**認証**: 必須

**リクエスト**:

```typescript
{
  title: string;
  description: string;
  eventDate: Date;
  eventType: string;
  venue?: string;
  streamingUrl?: string;
  targetParticipants: number;
}
```

**レスポンス**:

```typescript
{
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  eventType: string;
  venue: string | null;
  streamingUrl: string | null;
  targetParticipants: number;
  createdAt: Date;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `BAD_REQUEST`: 入力値が不正な場合

#### `events.update`

イベントを更新します。

**認証**: 必須（作成者のみ）

**リクエスト**:

```typescript
{
  id: string;
  title?: string;
  description?: string;
  eventDate?: Date;
  eventType?: string;
  venue?: string;
  streamingUrl?: string;
  targetParticipants?: number;
}
```

**レスポンス**:

```typescript
{
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  eventType: string;
  venue: string | null;
  streamingUrl: string | null;
  targetParticipants: number;
  updatedAt: Date;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `FORBIDDEN`: 作成者以外がアクセスした場合
- `NOT_FOUND`: イベントが見つからない場合

#### `events.delete`

イベントを削除します。

**認証**: 必須（作成者のみ）

**リクエスト**:

```typescript
{
  id: string;
}
```

**レスポンス**:

```typescript
{
  success: boolean;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `FORBIDDEN`: 作成者以外がアクセスした場合
- `NOT_FOUND`: イベントが見つからない場合

---

### 3. 参加表明 (participations)

#### `participations.create`

イベントへの参加表明を作成します。

**認証**: 必須

**リクエスト**:

```typescript
{
  eventId: string;
  participationType: 'venue' | 'streaming' | 'both';
  message?: string;
  gender?: 'male' | 'female' | 'other';
}
```

**レスポンス**:

```typescript
{
  id: string;
  eventId: string;
  participationType: 'venue' | 'streaming' | 'both';
  message: string | null;
  gender: 'male' | 'female' | 'other' | null;
  createdAt: Date;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `BAD_REQUEST`: 既に参加表明している場合

#### `participations.update`

参加表明を更新します。

**認証**: 必須（参加者のみ）

**リクエスト**:

```typescript
{
  id: string;
  participationType?: 'venue' | 'streaming' | 'both';
  message?: string;
  gender?: 'male' | 'female' | 'other';
}
```

**レスポンス**:

```typescript
{
  id: string;
  participationType: 'venue' | 'streaming' | 'both';
  message: string | null;
  gender: 'male' | 'female' | 'other' | null;
  updatedAt: Date;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `FORBIDDEN`: 参加者以外がアクセスした場合
- `NOT_FOUND`: 参加表明が見つからない場合

#### `participations.delete`

参加表明を削除します。

**認証**: 必須（参加者のみ）

**リクエスト**:

```typescript
{
  id: string;
}
```

**レスポンス**:

```typescript
{
  success: boolean;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `FORBIDDEN`: 参加者以外がアクセスした場合
- `NOT_FOUND`: 参加表明が見つからない場合

#### `participations.likeMessage`

応援メッセージに「いいね」します。

**認証**: 必須

**リクエスト**:

```typescript
{
  participationId: string;
}
```

**レスポンス**:

```typescript
{
  success: boolean;
  likeCount: number;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `BAD_REQUEST`: 既に「いいね」している場合

#### `participations.unlikeMessage`

応援メッセージの「いいね」を取り消します。

**認証**: 必須

**リクエスト**:

```typescript
{
  participationId: string;
}
```

**レスポンス**:

```typescript
{
  success: boolean;
  likeCount: number;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `NOT_FOUND`: 「いいね」が見つからない場合

---

### 4. 通知 (notifications)

#### `notifications.list`

通知一覧を取得します。

**認証**: 必須

**リクエスト**:

```typescript
{
  limit?: number; // デフォルト: 20
  cursor?: string; // ページネーション用カーソル
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    id: string;
    type: 'goal' | 'milestone' | 'participant' | 'challenge';
    title: string;
    body: string;
    read: boolean;
    createdAt: Date;
  }>;
  nextCursor?: string;
}
```

#### `notifications.markAsRead`

通知を既読にします。

**認証**: 必須

**リクエスト**:

```typescript
{
  id: string;
}
```

**レスポンス**:

```typescript
{
  success: boolean;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `NOT_FOUND`: 通知が見つからない場合

#### `notifications.sendTestNotification`

テスト通知を送信します（管理者のみ）。

**認証**: 必須（管理者のみ）

**リクエスト**:

```typescript
{
  type: 'goal' | 'milestone' | 'participant';
}
```

**レスポンス**:

```typescript
{
  success: boolean;
  sentCount: number;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `FORBIDDEN`: 管理者以外がアクセスした場合

---

### 5. プロフィール (profiles)

#### `profiles.get`

ユーザープロフィールを取得します。

**認証**: 不要

**リクエスト**:

```typescript
{
  userId: string;
}
```

**レスポンス**:

```typescript
{
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  participationsCount: number;
  createdAt: Date;
}
```

**エラー**:

- `NOT_FOUND`: ユーザーが見つからない場合

#### `profiles.update`

自分のプロフィールを更新します。

**認証**: 必須

**リクエスト**:

```typescript
{
  name?: string;
  bio?: string;
  avatarUrl?: string;
}
```

**レスポンス**:

```typescript
{
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  updatedAt: Date;
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合

---

### 6. 検索 (search)

#### `search.events`

イベントを検索します。

**認証**: 不要

**リクエスト**:

```typescript
{
  query: string;
  limit?: number; // デフォルト: 20
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    id: string;
    title: string;
    description: string;
    eventDate: Date;
    eventType: string;
    currentParticipants: number;
    targetParticipants: number;
  }>;
}
```

#### `search.users`

ユーザーを検索します。

**認証**: 不要

**リクエスト**:

```typescript
{
  query: string;
  limit?: number; // デフォルト: 20
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    followersCount: number;
  }>;
}
```

---

### 7. ランキング (rankings)

#### `rankings.topEvents`

参加者数の多いイベントランキングを取得します。

**認証**: 不要

**リクエスト**:

```typescript
{
  limit?: number; // デフォルト: 10
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    rank: number;
    id: string;
    title: string;
    currentParticipants: number;
    targetParticipants: number;
    progressPercentage: number;
  }>;
}
```

#### `rankings.topUsers`

参加表明数の多いユーザーランキングを取得します。

**認証**: 不要

**リクエスト**:

```typescript
{
  limit?: number; // デフォルト: 10
}
```

**レスポンス**:

```typescript
{
  items: Array<{
    rank: number;
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    participationsCount: number;
  }>;
}
```

---

### 8. 管理 (admin)

#### `admin.getStats`

管理者向け統計情報を取得します。

**認証**: 必須（管理者のみ）

**リクエスト**: なし

**レスポンス**:

```typescript
{
  totalUsers: number;
  totalEvents: number;
  totalParticipations: number;
  activeUsers: number; // 過去30日間
}
```

**エラー**:

- `UNAUTHORIZED`: 認証されていない場合
- `FORBIDDEN`: 管理者以外がアクセスした場合

---

## エラーコード一覧

| コード | 説明 |
|--------|------|
| `UNAUTHORIZED` | 認証されていない、またはトークンが無効 |
| `FORBIDDEN` | アクセス権限がない |
| `NOT_FOUND` | リソースが見つからない |
| `BAD_REQUEST` | リクエストが不正（バリデーションエラー） |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |

## エラーレスポンス例

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

---

## レート制限

現在、レート制限は実装されていませんが、将来的に以下の制限を導入する予定です：

- **認証済みユーザー**: 1分間に100リクエスト
- **未認証ユーザー**: 1分間に30リクエスト

---

## 監視エンドポイント

### `/api/healthz`

サーバーの生存確認用エンドポイント。常に200を返します。

**リクエスト**: なし

**レスポンス**:

```json
{
  "status": "ok"
}
```

### `/api/readyz`

サーバーの準備状態確認用エンドポイント。DB疎通を確認します。

**リクエスト**: なし

**レスポンス**:

```json
{
  "status": "ok",
  "database": "connected"
}
```

**エラー**:

- `503 Service Unavailable`: DBに接続できない場合

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| v1.0.0 | 2026-01-27 | 初版作成 |

---

## サポート

API仕様に関する質問や問題がある場合は、[GitHub Issues](https://github.com/kimito-link/doin-challenge.com/issues)で報告してください。
