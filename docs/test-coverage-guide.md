# テストカバレッジ向上ガイド

## 概要

このドキュメントでは、birthday-celebrationアプリのテストカバレッジを向上させるための戦略とベストプラクティスを説明します。

## カバレッジの目標

### 推奨カバレッジ率

| カテゴリ | 目標カバレッジ | 説明 |
|---------|--------------|------|
| ビジネスロジック | 90%以上 | tRPCルーター、サービス層、ユーティリティ関数 |
| UIコンポーネント | 70%以上 | React Nativeコンポーネント |
| インテグレーション | 80%以上 | API統合、データベースクエリ |
| E2Eテスト | 主要フロー | ユーザー登録、チャレンジ作成、参加表明 |

## カバレッジ測定

### 1. Vitestでカバレッジを測定

```bash
# カバレッジレポートを生成
pnpm vitest run --coverage

# カバレッジレポートをHTMLで表示
pnpm vitest run --coverage --reporter=html
```

### 2. vitest.config.tsの設定

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/__tests__/**',
        '**/tests/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

## テスト戦略

### 1. ユニットテスト

**対象:**
- ユーティリティ関数
- カスタムフック
- ビジネスロジック関数

**例: ユーティリティ関数のテスト**
```typescript
// lib/utils.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((current / goal) * 100), 100);
}

// tests/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, calculateProgress } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date in Japanese locale', () => {
    const date = new Date('2024-01-15');
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('1');
    expect(formatted).toContain('15');
  });
});

describe('calculateProgress', () => {
  it('should calculate progress percentage', () => {
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(75, 100)).toBe(75);
    expect(calculateProgress(100, 100)).toBe(100);
  });

  it('should not exceed 100%', () => {
    expect(calculateProgress(150, 100)).toBe(100);
  });

  it('should return 0 when goal is 0', () => {
    expect(calculateProgress(50, 0)).toBe(0);
  });
});
```

### 2. コンポーネントテスト

**対象:**
- UIコンポーネント
- カスタムフック
- 状態管理

**例: コンポーネントのテスト**
```typescript
// components/ui/button.tsx
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({ title, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: disabled ? '#ccc' : '#007AFF',
        padding: 12,
        borderRadius: 8,
      })}
    >
      <Text style={{ color: '#fff', textAlign: 'center' }}>{title}</Text>
    </Pressable>
  );
}

// tests/components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Click me" onPress={() => {}} />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = vi.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPress} />);
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = vi.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} disabled />
    );
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### 3. カスタムフックのテスト

**例: カスタムフックのテスト**
```typescript
// hooks/use-counter.ts
import { useState, useCallback } from 'react';

export function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

// tests/hooks/use-counter.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from '@/hooks/use-counter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
    });
    
    expect(result.current.count).toBe(12);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

### 4. APIテスト

**例: tRPCルーターのテスト**
```typescript
// server/routers/challenges.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const challengesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(challengesTable);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const challenge = await ctx.db
        .select()
        .from(challengesTable)
        .where(eq(challengesTable.id, input.id))
        .limit(1);

      if (!challenge[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Challenge not found',
        });
      }

      return challenge[0];
    }),
});

// tests/server/routers/challenges.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

describe('challengesRouter', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    const ctx = await createContext();
    caller = appRouter.createCaller(ctx);
  });

  describe('list', () => {
    it('should return list of challenges', async () => {
      const challenges = await caller.challenges.list();
      expect(Array.isArray(challenges)).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return challenge by id', async () => {
      const challenge = await caller.challenges.getById({ id: 1 });
      expect(challenge).toBeDefined();
      expect(challenge.id).toBe(1);
    });

    it('should throw error for non-existent id', async () => {
      await expect(
        caller.challenges.getById({ id: 999999 })
      ).rejects.toThrow('Challenge not found');
    });
  });
});
```

### 5. インテグレーションテスト

**例: データベースとAPIの統合テスト**
```typescript
// tests/integration/challenge-flow.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

describe('Challenge Flow Integration', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let challengeId: number;

  beforeAll(async () => {
    const ctx = await createContext();
    caller = appRouter.createCaller(ctx);
  });

  it('should create a new challenge', async () => {
    const challenge = await caller.challenges.create({
      title: 'Test Challenge',
      description: 'Test Description',
      goalValue: 100,
      unit: '人',
      eventDate: new Date('2024-12-31'),
    });

    expect(challenge).toBeDefined();
    expect(challenge.title).toBe('Test Challenge');
    challengeId = challenge.id;
  });

  it('should retrieve the created challenge', async () => {
    const challenge = await caller.challenges.getById({ id: challengeId });
    expect(challenge).toBeDefined();
    expect(challenge.title).toBe('Test Challenge');
  });

  it('should update the challenge', async () => {
    const updated = await caller.challenges.update({
      id: challengeId,
      title: 'Updated Challenge',
    });

    expect(updated.title).toBe('Updated Challenge');
  });

  it('should delete the challenge', async () => {
    await caller.challenges.delete({ id: challengeId });

    await expect(
      caller.challenges.getById({ id: challengeId })
    ).rejects.toThrow('Challenge not found');
  });
});
```

## カバレッジを向上させるための戦略

### 1. 未テストのファイルを特定

```bash
# カバレッジレポートから未テストのファイルを確認
pnpm vitest run --coverage | grep "0%"
```

### 2. 優先順位をつける

**高優先度:**
1. ビジネスロジック（tRPCルーター、サービス層）
2. ユーティリティ関数
3. カスタムフック

**中優先度:**
4. UIコンポーネント
5. 状態管理

**低優先度:**
6. 型定義
7. 設定ファイル

### 3. テストを段階的に追加

**ステップ1: ユニットテスト**
- ユーティリティ関数
- ビジネスロジック関数

**ステップ2: コンポーネントテスト**
- 基本的なUIコンポーネント
- カスタムフック

**ステップ3: インテグレーションテスト**
- APIエンドポイント
- データベースクエリ

**ステップ4: E2Eテスト**
- 主要なユーザーフロー

## ベストプラクティス

### 1. テストの構造

```typescript
describe('ComponentName', () => {
  // 初期化
  beforeEach(() => {
    // テストの前処理
  });

  // クリーンアップ
  afterEach(() => {
    // テストの後処理
  });

  describe('機能1', () => {
    it('should do something', () => {
      // Arrange（準備）
      const input = 'test';

      // Act（実行）
      const result = doSomething(input);

      // Assert（検証）
      expect(result).toBe('expected');
    });
  });

  describe('機能2', () => {
    it('should handle edge case', () => {
      // テストコード
    });
  });
});
```

### 2. テストの命名規則

```typescript
// ✅ 良い例: 明確で説明的
it('should return empty array when no challenges exist', () => {});
it('should throw error when user is not authenticated', () => {});
it('should update challenge title successfully', () => {});

// ❌ 悪い例: 曖昧
it('works', () => {});
it('test1', () => {});
it('should work correctly', () => {});
```

### 3. モックの使用

```typescript
import { vi } from 'vitest';

// 関数のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// モジュールのモック
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mocked' })),
}));

// タイマーのモック
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

### 4. テストデータの管理

```typescript
// tests/fixtures/challenges.ts
export const mockChallenge = {
  id: 1,
  title: 'Test Challenge',
  description: 'Test Description',
  goalValue: 100,
  unit: '人',
  eventDate: new Date('2024-12-31'),
};

export const mockChallenges = [
  mockChallenge,
  {
    id: 2,
    title: 'Another Challenge',
    description: 'Another Description',
    goalValue: 200,
    unit: '人',
    eventDate: new Date('2024-12-31'),
  },
];

// テストで使用
import { mockChallenge } from '@/tests/fixtures/challenges';

it('should process challenge', () => {
  const result = processChallenge(mockChallenge);
  expect(result).toBeDefined();
});
```

## CI/CDでのカバレッジチェック

### GitHub Actions設定例

```yaml
name: Test Coverage

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests with coverage
        run: pnpm vitest run --coverage
      
      - name: Check coverage thresholds
        run: |
          if [ $(jq '.total.lines.pct' coverage/coverage-summary.json | cut -d. -f1) -lt 70 ]; then
            echo "Coverage is below 70%"
            exit 1
          fi
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## まとめ

テストカバレッジを向上させるための重要なポイント：

1. **段階的にテストを追加** - 優先順位の高い部分から
2. **明確なテストを書く** - 何をテストしているか明確に
3. **モックを適切に使用** - 外部依存を排除
4. **テストデータを管理** - フィクスチャを活用
5. **CI/CDで自動化** - カバレッジを継続的に監視

これらのベストプラクティスに従うことで、高品質で保守性の高いテストスイートを構築できます。
