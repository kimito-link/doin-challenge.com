# APIキャッシング戦略ガイド

## 概要

このドキュメントでは、birthday-celebrationアプリのAPI応答速度を改善するためのキャッシング戦略を説明します。

## キャッシング階層

### 1. クライアントサイドキャッシング（React Query）

**実装済み**: React Queryによる自動キャッシング

**設定:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分間は再取得しない
      cacheTime: 10 * 60 * 1000, // 10分間キャッシュを保持
      retry: 3, // 失敗時に3回リトライ
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

**キャッシュキーの設計:**
```typescript
// 良い例: 階層的なキャッシュキー
const challengeKeys = {
  all: ['challenges'] as const,
  lists: () => [...challengeKeys.all, 'list'] as const,
  list: (filters: string) => [...challengeKeys.lists(), { filters }] as const,
  details: () => [...challengeKeys.all, 'detail'] as const,
  detail: (id: number) => [...challengeKeys.details(), id] as const,
};

// 使用例
const { data: challenges } = useQuery({
  queryKey: challengeKeys.lists(),
  queryFn: () => trpc.challenges.list.query(),
});

const { data: challenge } = useQuery({
  queryKey: challengeKeys.detail(challengeId),
  queryFn: () => trpc.challenges.getById.query({ id: challengeId }),
});
```

**キャッシュの無効化:**
```typescript
import { useQueryClient } from '@tanstack/react-query';

function useInvalidateChallenge() {
  const queryClient = useQueryClient();

  const invalidateChallenge = (challengeId: number) => {
    // 特定のチャレンジのキャッシュを無効化
    queryClient.invalidateQueries({ queryKey: challengeKeys.detail(challengeId) });
    
    // チャレンジリストのキャッシュも無効化
    queryClient.invalidateQueries({ queryKey: challengeKeys.lists() });
  };

  return { invalidateChallenge };
}
```

### 2. サーバーサイドキャッシング（インメモリ）

**実装例:**
```typescript
// server/lib/cache.ts
class MemoryCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = 60000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // パターンマッチングで複数のキーを削除
  deletePattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();
```

**使用例:**
```typescript
import { cache } from '@/server/lib/cache';

// tRPCルーター
export const challengesRouter = router({
  list: publicProcedure.query(async () => {
    const cacheKey = 'challenges:list';
    
    // キャッシュから取得
    const cached = cache.get<Challenge[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // データベースから取得
    const challenges = await db.select().from(challengesTable);

    // キャッシュに保存（5分間）
    cache.set(cacheKey, challenges, 5 * 60 * 1000);

    return challenges;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const cacheKey = `challenges:${input.id}`;
      
      // キャッシュから取得
      const cached = cache.get<Challenge>(cacheKey);
      if (cached) {
        return cached;
      }

      // データベースから取得
      const challenge = await db
        .select()
        .from(challengesTable)
        .where(eq(challengesTable.id, input.id))
        .limit(1);

      if (!challenge[0]) {
        throw new Error('Challenge not found');
      }

      // キャッシュに保存（10分間）
      cache.set(cacheKey, challenge[0], 10 * 60 * 1000);

      return challenge[0];
    }),

  create: protectedProcedure
    .input(challengeSchema)
    .mutation(async ({ input }) => {
      const challenge = await db.insert(challengesTable).values(input);

      // キャッシュを無効化
      cache.deletePattern('challenges:');

      return challenge;
    }),
});
```

### 3. HTTPキャッシング（Cache-Control ヘッダー）

**実装例:**
```typescript
// server/middleware/cache-control.ts
export function setCacheControl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 静的リソース（画像、CSS、JS）
  if (req.path.match(/\.(jpg|jpeg|png|gif|css|js|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // API レスポンス（短期間キャッシュ）
  else if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  }
  // HTMLページ（キャッシュしない）
  else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  next();
}
```

**Cache-Controlディレクティブ:**
- `public`: すべてのキャッシュ（ブラウザ、CDN）でキャッシュ可能
- `private`: ブラウザのみでキャッシュ可能
- `max-age=60`: ブラウザで60秒間キャッシュ
- `s-maxage=300`: CDNで300秒間キャッシュ
- `no-cache`: 再検証が必要
- `no-store`: キャッシュしない
- `must-revalidate`: 期限切れ後は必ず再検証
- `immutable`: 変更されないリソース（永続キャッシュ）

### 4. ETagによる条件付きリクエスト

**実装例:**
```typescript
import crypto from 'crypto';

export function generateETag(data: any): string {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
}

export function handleETag(
  req: Request,
  res: Response,
  data: any
) {
  const etag = generateETag(data);
  const clientETag = req.headers['if-none-match'];

  res.setHeader('ETag', etag);

  if (clientETag === etag) {
    // データが変更されていない場合は304を返す
    res.status(304).end();
    return true;
  }

  return false;
}

// 使用例
app.get('/api/challenges', async (req, res) => {
  const challenges = await db.select().from(challengesTable);

  if (handleETag(req, res, challenges)) {
    return; // 304 Not Modified
  }

  res.json(challenges);
});
```

## キャッシング戦略

### 1. データの種類別キャッシング

**静的データ（変更頻度が低い）:**
- カテゴリ、タグ、都道府県リスト
- TTL: 1時間〜1日
- キャッシュ階層: クライアント + サーバー + HTTP

**準静的データ（定期的に変更）:**
- チャレンジリスト、イベント情報
- TTL: 5分〜30分
- キャッシュ階層: クライアント + サーバー

**動的データ（頻繁に変更）:**
- 参加者数、進捗状況、ランキング
- TTL: 1分〜5分
- キャッシュ階層: クライアント

**リアルタイムデータ（即座に反映が必要）:**
- メッセージ、通知
- TTL: なし（キャッシュしない）
- 代替: WebSocket、Server-Sent Events

### 2. キャッシュ無効化戦略

**即座に無効化:**
```typescript
// データ作成/更新時に関連キャッシュを即座に無効化
async function createChallenge(data: ChallengeInput) {
  const challenge = await db.insert(challengesTable).values(data);

  // サーバーサイドキャッシュを無効化
  cache.delete('challenges:list');
  cache.deletePattern(`challenges:user:${data.userId}`);

  // クライアントサイドキャッシュを無効化（WebSocketで通知）
  io.emit('challenge:created', { challengeId: challenge.id });

  return challenge;
}
```

**バックグラウンドで無効化:**
```typescript
// 定期的にキャッシュを更新
setInterval(() => {
  cache.deletePattern('challenges:list');
  cache.deletePattern('participations:count:*');
}, 5 * 60 * 1000); // 5分ごと
```

**TTLベースの無効化:**
```typescript
// TTLが切れたら自動的に無効化（既に実装済み）
cache.set('challenges:list', challenges, 5 * 60 * 1000);
```

### 3. キャッシュウォーミング

**アプリケーション起動時:**
```typescript
// server/index.ts
async function warmupCache() {
  console.log('Warming up cache...');

  // 頻繁にアクセスされるデータをプリロード
  const challenges = await db.select().from(challengesTable);
  cache.set('challenges:list', challenges, 10 * 60 * 1000);

  const categories = await db.select().from(categoriesTable);
  cache.set('categories:list', categories, 60 * 60 * 1000);

  console.log('Cache warmed up');
}

// アプリケーション起動時に実行
warmupCache();
```

**定期的なウォームアップ:**
```typescript
// 5分ごとにキャッシュをウォームアップ
setInterval(warmupCache, 5 * 60 * 1000);
```

## パフォーマンス最適化

### 1. データベースクエリの最適化

**N+1問題の解決:**
```typescript
// ❌ 悪い例: N+1問題
const challenges = await db.select().from(challengesTable);
for (const challenge of challenges) {
  const category = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, challenge.categoryId));
}

// ✅ 良い例: JOINを使用
const challengesWithCategories = await db
  .select()
  .from(challengesTable)
  .leftJoin(categoriesTable, eq(challengesTable.categoryId, categoriesTable.id));
```

**インデックスの活用:**
```sql
-- 頻繁に検索されるカラムにインデックスを作成
CREATE INDEX idx_challenges_event_date ON challenges(eventDate);
CREATE INDEX idx_participations_challenge_id ON participations(challengeId);
CREATE INDEX idx_participations_user_id ON participations(userId);
```

### 2. ペイロードサイズの削減

**必要なフィールドのみ選択:**
```typescript
// ❌ 悪い例: 全フィールドを取得
const users = await db.select().from(usersTable);

// ✅ 良い例: 必要なフィールドのみ取得
const users = await db
  .select({
    id: usersTable.id,
    name: usersTable.name,
    profileImage: usersTable.profileImage,
  })
  .from(usersTable);
```

**ページネーション:**
```typescript
const page = 1;
const pageSize = 20;

const challenges = await db
  .select()
  .from(challengesTable)
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

**圧縮:**
```typescript
import compression from 'compression';

// gzip圧縮を有効化
app.use(compression());
```

### 3. 並列処理

**Promise.allを使用:**
```typescript
// ❌ 悪い例: 逐次実行
const challenges = await db.select().from(challengesTable);
const participations = await db.select().from(participationsTable);
const users = await db.select().from(usersTable);

// ✅ 良い例: 並列実行
const [challenges, participations, users] = await Promise.all([
  db.select().from(challengesTable),
  db.select().from(participationsTable),
  db.select().from(usersTable),
]);
```

## 監視とデバッグ

### 1. キャッシュヒット率の監視

```typescript
class MonitoredCache extends MemoryCache {
  private hits = 0;
  private misses = 0;

  get<T>(key: string): T | null {
    const result = super.get<T>(key);
    
    if (result !== null) {
      this.hits++;
    } else {
      this.misses++;
    }

    return result;
  }

  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  resetStats() {
    this.hits = 0;
    this.misses = 0;
  }
}
```

### 2. キャッシュサイズの監視

```typescript
class SizeMonitoredCache extends MonitoredCache {
  getCacheSize(): number {
    let size = 0;
    for (const [key, value] of this.cache.entries()) {
      size += JSON.stringify(value).length;
    }
    return size;
  }

  getCacheSizeMB(): string {
    return (this.getCacheSize() / 1024 / 1024).toFixed(2) + ' MB';
  }
}
```

### 3. デバッグエンドポイント

```typescript
// 開発環境のみ
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/cache/stats', (req, res) => {
    res.json(cache.getStats());
  });

  app.post('/api/debug/cache/clear', (req, res) => {
    cache.clear();
    res.json({ message: 'Cache cleared' });
  });
}
```

## まとめ

効果的なキャッシング戦略により、API応答速度を大幅に改善できます。

**ベストプラクティス:**
1. データの種類に応じて適切なTTLを設定
2. キャッシュキーを階層的に設計
3. データ更新時にキャッシュを無効化
4. キャッシュヒット率を監視
5. パフォーマンステストで効果を検証

**次のステップ:**
1. サーバーサイドキャッシュを実装
2. キャッシュヒット率を監視
3. パフォーマンステストで効果を測定
4. 必要に応じてRedis等の外部キャッシュを検討
