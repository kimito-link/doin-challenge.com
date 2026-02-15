# コード品質向上ガイド

## 概要

このドキュメントでは、birthday-celebrationアプリのコード品質を向上させるためのベストプラクティスとリファクタリング戦略を説明します。

## コード品質の原則

### 1. SOLID原則

#### Single Responsibility Principle (単一責任の原則)
各モジュール、クラス、関数は1つの責任のみを持つべきです。

**❌ 悪い例**
```typescript
function handleUserLogin(email: string, password: string) {
  // 検証
  if (!email || !password) throw new Error("Invalid input");
  
  // 認証
  const user = authenticateUser(email, password);
  
  // ログ記録
  console.log(`User ${email} logged in`);
  
  // セッション作成
  createSession(user.id);
  
  // メール送信
  sendWelcomeEmail(user.email);
  
  return user;
}
```

**✅ 良い例**
```typescript
// 各責任を分離
function validateLoginInput(email: string, password: string) {
  if (!email || !password) throw new Error("Invalid input");
}

function authenticateUser(email: string, password: string) {
  // 認証ロジック
}

function logUserLogin(email: string) {
  logger.info(`User ${email} logged in`);
}

function createUserSession(userId: number) {
  // セッション作成ロジック
}

function sendWelcomeEmail(email: string) {
  // メール送信ロジック
}

// メイン関数は各責任を組み合わせる
async function handleUserLogin(email: string, password: string) {
  validateLoginInput(email, password);
  const user = await authenticateUser(email, password);
  logUserLogin(user.email);
  await createUserSession(user.id);
  await sendWelcomeEmail(user.email);
  return user;
}
```

#### Open/Closed Principle (開放/閉鎖の原則)
拡張に対して開いていて、修正に対して閉じているべきです。

**✅ 良い例**
```typescript
// 基底インターフェース
interface NotificationStrategy {
  send(message: string, recipient: string): Promise<void>;
}

// 各実装
class EmailNotification implements NotificationStrategy {
  async send(message: string, recipient: string) {
    // メール送信ロジック
  }
}

class PushNotification implements NotificationStrategy {
  async send(message: string, recipient: string) {
    // プッシュ通知ロジック
  }
}

class SMSNotification implements NotificationStrategy {
  async send(message: string, recipient: string) {
    // SMS送信ロジック
  }
}

// 新しい通知方法を追加する場合、既存コードを変更せずに拡張できる
class NotificationService {
  constructor(private strategy: NotificationStrategy) {}
  
  async notify(message: string, recipient: string) {
    await this.strategy.send(message, recipient);
  }
}
```

### 2. DRY原則 (Don't Repeat Yourself)

重複コードを避け、再利用可能な関数やコンポーネントを作成します。

**❌ 悪い例**
```typescript
// 重複したバリデーションロジック
function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function checkUserEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email");
  }
}
```

**✅ 良い例**
```typescript
// 共通のバリデーション関数
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateEmail(email: string) {
  return isValidEmail(email);
}

function checkUserEmail(email: string) {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email");
  }
}
```

### 3. KISS原則 (Keep It Simple, Stupid)

シンプルで理解しやすいコードを書きます。

**❌ 悪い例**
```typescript
const result = arr.reduce((acc, curr) => 
  acc.concat(curr.items.filter(item => 
    item.status === 'active' && item.priority > 5
  ).map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString()
  }))), []);
```

**✅ 良い例**
```typescript
const activeHighPriorityItems = arr.flatMap(group => 
  group.items
    .filter(item => item.status === 'active')
    .filter(item => item.priority > 5)
);

const formattedItems = activeHighPriorityItems.map(item => ({
  ...item,
  formattedDate: new Date(item.date).toLocaleDateString()
}));
```

## リファクタリング戦略

### 1. 長い関数の分割

**❌ 悪い例**
```typescript
async function processChallenge(challengeId: number, userId: number) {
  // 100行以上の処理...
}
```

**✅ 良い例**
```typescript
async function processChallenge(challengeId: number, userId: number) {
  const challenge = await fetchChallenge(challengeId);
  validateChallengeEligibility(challenge, userId);
  const participation = await createParticipation(challenge, userId);
  await notifyParticipation(participation);
  await updateUserStats(userId);
  return participation;
}

async function fetchChallenge(challengeId: number) {
  // チャレンジ取得ロジック
}

function validateChallengeEligibility(challenge: Challenge, userId: number) {
  // 資格確認ロジック
}

async function createParticipation(challenge: Challenge, userId: number) {
  // 参加作成ロジック
}

async function notifyParticipation(participation: Participation) {
  // 通知ロジック
}

async function updateUserStats(userId: number) {
  // 統計更新ロジック
}
```

### 2. マジックナンバーの定数化

**❌ 悪い例**
```typescript
if (user.age < 18) {
  throw new Error("Too young");
}

if (challenge.participants.length > 100) {
  throw new Error("Challenge full");
}
```

**✅ 良い例**
```typescript
const MIN_AGE = 18;
const MAX_PARTICIPANTS = 100;

if (user.age < MIN_AGE) {
  throw new Error("Too young");
}

if (challenge.participants.length > MAX_PARTICIPANTS) {
  throw new Error("Challenge full");
}
```

### 3. 条件式の簡略化

**❌ 悪い例**
```typescript
if (user.isActive === true && user.isVerified === true && user.isPremium === true) {
  // 処理
}
```

**✅ 良い例**
```typescript
const isEligibleUser = user.isActive && user.isVerified && user.isPremium;

if (isEligibleUser) {
  // 処理
}
```

### 4. 早期リターンの活用

**❌ 悪い例**
```typescript
function processUser(user: User) {
  if (user) {
    if (user.isActive) {
      if (user.isVerified) {
        // メイン処理
        return result;
      } else {
        throw new Error("Not verified");
      }
    } else {
      throw new Error("Not active");
    }
  } else {
    throw new Error("User not found");
  }
}
```

**✅ 良い例**
```typescript
function processUser(user: User) {
  if (!user) throw new Error("User not found");
  if (!user.isActive) throw new Error("Not active");
  if (!user.isVerified) throw new Error("Not verified");
  
  // メイン処理
  return result;
}
```

## コンポーネント設計

### 1. コンポーネントの分割

**原則:**
- 1つのコンポーネントは200行以下
- 1つの責任のみを持つ
- 再利用可能な設計

**❌ 悪い例**
```typescript
// 500行の巨大コンポーネント
export function EventDetailPage() {
  // ヘッダー、コンテンツ、フッター、モーダルなど全てが1つのコンポーネントに
}
```

**✅ 良い例**
```typescript
// 小さな責任単位で分割
export function EventDetailPage() {
  return (
    <ScreenContainer>
      <EventHeader event={event} />
      <EventContent event={event} />
      <ParticipantsList participants={participants} />
      <EventActions event={event} />
    </ScreenContainer>
  );
}

function EventHeader({ event }: { event: Event }) {
  // ヘッダーのみの責任
}

function EventContent({ event }: { event: Event }) {
  // コンテンツのみの責任
}

function ParticipantsList({ participants }: { participants: User[] }) {
  // 参加者リストのみの責任
}

function EventActions({ event }: { event: Event }) {
  // アクションボタンのみの責任
}
```

### 2. カスタムフックの活用

**原則:**
- ロジックとUIを分離
- 再利用可能なロジックを抽出

**✅ 良い例**
```typescript
// カスタムフック
function useEventDetail(eventId: number) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchEvent(eventId)
      .then(setEvent)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [eventId]);

  return { event, loading, error };
}

// コンポーネント
function EventDetailPage({ eventId }: { eventId: number }) {
  const { event, loading, error } = useEventDetail(eventId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!event) return <NotFound />;

  return <EventContent event={event} />;
}
```

## 型安全性の向上

### 1. anyの排除

**❌ 悪い例**
```typescript
function processData(data: any) {
  return data.map((item: any) => item.value);
}
```

**✅ 良い例**
```typescript
interface DataItem {
  value: string;
  id: number;
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}
```

### 2. ユニオン型の活用

**✅ 良い例**
```typescript
type Status = 'pending' | 'active' | 'completed' | 'cancelled';

interface Challenge {
  id: number;
  name: string;
  status: Status;
}

function updateChallengeStatus(challenge: Challenge, newStatus: Status) {
  // 型安全なステータス更新
}
```

### 3. ジェネリクスの活用

**✅ 良い例**
```typescript
interface ApiResponse<T> {
  data: T;
  error: string | null;
  loading: boolean;
}

function useApi<T>(url: string): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // API呼び出しロジック

  return { data: data!, error, loading };
}

// 使用例
const { data: events } = useApi<Event[]>('/api/events');
const { data: user } = useApi<User>('/api/user');
```

## エラーハンドリング

### 1. カスタムエラークラス

**✅ 良い例**
```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: number) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// 使用例
function validateEmail(email: string) {
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
}
```

### 2. エラーバウンダリ

**✅ 良い例**
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## テスタビリティの向上

### 1. 依存性注入

**✅ 良い例**
```typescript
// テスト可能な設計
interface UserRepository {
  findById(id: number): Promise<User | null>;
  save(user: User): Promise<User>;
}

class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: number): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User', id);
    return user;
  }
}

// テスト時にモックを注入できる
const mockRepo: UserRepository = {
  findById: jest.fn().mockResolvedValue(mockUser),
  save: jest.fn().mockResolvedValue(mockUser),
};

const service = new UserService(mockRepo);
```

### 2. 純粋関数の活用

**✅ 良い例**
```typescript
// 純粋関数（テストしやすい）
function calculatePoints(challenges: Challenge[]): number {
  return challenges.reduce((total, challenge) => total + challenge.points, 0);
}

// テスト
test('calculatePoints returns correct total', () => {
  const challenges = [
    { points: 10 },
    { points: 20 },
    { points: 30 },
  ];
  expect(calculatePoints(challenges)).toBe(60);
});
```

## パフォーマンス最適化

### 1. メモ化

**✅ 良い例**
```typescript
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data }: { data: Item[] }) {
  // 高コストな計算をメモ化
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransformation(item));
  }, [data]);

  // コールバックをメモ化
  const handleClick = useCallback((id: number) => {
    // 処理
  }, []);

  return <List data={processedData} onClick={handleClick} />;
}
```

### 2. 遅延ロード

**✅ 良い例**
```typescript
import { lazy, Suspense } from 'react';

// コンポーネントの遅延ロード
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## コードレビューチェックリスト

### 基本
- [ ] コードは理解しやすいか
- [ ] 適切な命名がされているか
- [ ] コメントは必要最小限か
- [ ] 重複コードはないか

### 設計
- [ ] 単一責任の原則に従っているか
- [ ] 適切に関数/コンポーネントが分割されているか
- [ ] 依存関係は明確か

### 型安全性
- [ ] anyを使用していないか
- [ ] 適切な型定義がされているか
- [ ] nullチェックが適切か

### パフォーマンス
- [ ] 不要な再レンダリングはないか
- [ ] メモ化が適切に使用されているか
- [ ] N+1問題はないか

### テスト
- [ ] テストが書かれているか
- [ ] エッジケースがカバーされているか
- [ ] テストは理解しやすいか

### セキュリティ
- [ ] 入力値の検証がされているか
- [ ] XSS対策がされているか
- [ ] 機密情報が適切に扱われているか

## まとめ

コード品質の向上は継続的なプロセスです。定期的にコードレビューを行い、リファクタリングを実施することで、保守性の高いコードベースを維持できます。

**次のステップ:**
1. 既存コードをレビューして改善箇所を特定
2. 優先度の高い箇所からリファクタリング
3. テストカバレッジを向上
4. コードレビュープロセスを確立
