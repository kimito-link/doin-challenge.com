# データベース最適化ガイド

## 概要

このドキュメントでは、birthday-celebrationアプリのデータベースパフォーマンスを最適化するための戦略と実装方法を説明します。

## 現在のデータベース構造

### 主要テーブル
- **users**: ユーザー情報
- **events**: イベント情報
- **challenges**: チャレンジ情報
- **participations**: チャレンジ参加情報
- **achievements**: 達成情報
- **badges**: バッジ情報
- **categories**: カテゴリ情報
- **follows**: フォロー関係
- **invitations**: 招待情報
- **audit_logs**: 監査ログ

## 最適化戦略

### 1. インデックス最適化

#### 既存のインデックス
現在のデータベーススキーマには、主キーとユニーク制約に基づく自動インデックスが存在します。

#### 推奨される追加インデックス

**usersテーブル**
```sql
-- メールアドレスでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ログイン方法での検索を高速化
CREATE INDEX IF NOT EXISTS idx_users_login_method ON users(loginMethod);

-- 作成日時でのソートを高速化
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);
```

**eventsテーブル**
```sql
-- イベント日時での検索とソートを高速化
CREATE INDEX IF NOT EXISTS idx_events_date ON events(eventDate);

-- ステータスでのフィルタリングを高速化
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 複合インデックス: ステータスとイベント日時
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, eventDate);
```

**challengesテーブル**
```sql
-- カテゴリでのフィルタリングを高速化
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(categoryId);

-- イベントIDでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_challenges_event ON challenges(eventId);

-- 複合インデックス: イベントとカテゴリ
CREATE INDEX IF NOT EXISTS idx_challenges_event_category ON challenges(eventId, categoryId);
```

**participationsテーブル**
```sql
-- ユーザーIDでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_participations_user ON participations(userId);

-- チャレンジIDでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_participations_challenge ON participations(challengeId);

-- 複合インデックス: ユーザーとチャレンジ
CREATE INDEX IF NOT EXISTS idx_participations_user_challenge ON participations(userId, challengeId);

-- ステータスでのフィルタリングを高速化
CREATE INDEX IF NOT EXISTS idx_participations_status ON participations(status);
```

**achievementsテーブル**
```sql
-- ユーザーIDでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(userId);

-- 達成日時でのソートを高速化
CREATE INDEX IF NOT EXISTS idx_achievements_achieved_at ON achievements(achievedAt);

-- 複合インデックス: ユーザーと達成日時
CREATE INDEX IF NOT EXISTS idx_achievements_user_date ON achievements(userId, achievedAt);
```

**followsテーブル**
```sql
-- フォロワーでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(followerId);

-- フォロイーでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followeeId);

-- 複合インデックス: フォロワーとフォロイー
CREATE INDEX IF NOT EXISTS idx_follows_follower_followee ON follows(followerId, followeeId);
```

**audit_logsテーブル**
```sql
-- ユーザーIDでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(userId);

-- アクションでのフィルタリングを高速化
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- タイムスタンプでのソートを高速化
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- 複合インデックス: ユーザーとタイムスタンプ
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(userId, timestamp);
```

### 2. クエリ最適化

#### N+1問題の解決

**問題のあるクエリ例**
```typescript
// ❌ N+1問題: 各チャレンジごとにカテゴリを取得
const challenges = await db.select().from(challengesTable);
for (const challenge of challenges) {
  const category = await db.select().from(categoriesTable).where(eq(categoriesTable.id, challenge.categoryId));
}
```

**最適化されたクエリ**
```typescript
// ✅ JOINを使用して1回のクエリで取得
const challengesWithCategories = await db
  .select()
  .from(challengesTable)
  .leftJoin(categoriesTable, eq(challengesTable.categoryId, categoriesTable.id));
```

#### ページネーション

**効率的なページネーション**
```typescript
// ✅ LIMITとOFFSETを使用
const page = 1;
const pageSize = 20;
const challenges = await db
  .select()
  .from(challengesTable)
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

#### 集計クエリの最適化

**カウントクエリ**
```typescript
// ✅ COUNT関数を使用
const count = await db
  .select({ count: sql<number>`count(*)` })
  .from(challengesTable)
  .where(eq(challengesTable.eventId, eventId));
```

### 3. キャッシング戦略

#### アプリケーションレベルのキャッシング

**Redis風のインメモリキャッシュ**
```typescript
const cache = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }
  return cached.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number = 60000) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

// 使用例
async function getEvent(id: number) {
  const cacheKey = `event:${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const event = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
  setCache(cacheKey, event, 300000); // 5分間キャッシュ
  return event;
}
```

#### クエリ結果のメモ化

**React Queryを使用したクライアントサイドキャッシング**
```typescript
// クライアント側で自動的にキャッシュされる
const { data: events } = useQuery({
  queryKey: ['events'],
  queryFn: () => trpc.events.list.query(),
  staleTime: 5 * 60 * 1000, // 5分間は再取得しない
});
```

### 4. データベース接続プーリング

**接続プールの設定**
```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // 最大接続数
  queueLimit: 0,
});

const db = drizzle(poolConnection);
```

### 5. パフォーマンス監視

#### スロークエリのログ記録

```typescript
import { logger } from '@/server/lib/logger';

async function executeQuery<T>(queryFn: () => Promise<T>, queryName: string): Promise<T> {
  const start = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      logger.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    logger.error(`Query failed: ${queryName}`, error);
    throw error;
  }
}

// 使用例
const events = await executeQuery(
  () => db.select().from(eventsTable),
  'events.list'
);
```

## 実装チェックリスト

- [ ] 主要テーブルにインデックスを追加
- [ ] N+1問題を解決
- [ ] ページネーションを実装
- [ ] キャッシング戦略を実装
- [ ] 接続プーリングを設定
- [ ] スロークエリ監視を実装
- [ ] パフォーマンステストを実行

## パフォーマンステスト

### ベンチマーク

```typescript
import { performance } from 'perf_hooks';

async function benchmarkQuery(queryFn: () => Promise<any>, iterations: number = 100) {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await queryFn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`Average: ${avg.toFixed(2)}ms`);
  console.log(`Min: ${min.toFixed(2)}ms`);
  console.log(`Max: ${max.toFixed(2)}ms`);
}

// 使用例
await benchmarkQuery(() => db.select().from(eventsTable));
```

## まとめ

データベース最適化は継続的なプロセスです。定期的にパフォーマンスを監視し、ボトルネックを特定して改善することが重要です。

**次のステップ:**
1. インデックスを追加してクエリ速度を測定
2. N+1問題を特定して修正
3. キャッシング戦略を実装してサーバー負荷を軽減
4. パフォーマンステストを自動化
