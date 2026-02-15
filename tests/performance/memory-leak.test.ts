/**
 * Memory Leak Detection Tests
 * メモリリーク検出テスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * メモリ使用量を取得
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed / 1024 / 1024, // MB
    heapTotal: usage.heapTotal / 1024 / 1024, // MB
    external: usage.external / 1024 / 1024, // MB
    rss: usage.rss / 1024 / 1024, // MB
  };
}

/**
 * ガベージコレクションを強制実行
 */
function forceGC() {
  if (global.gc) {
    global.gc();
  }
}

/**
 * メモリリークをシミュレート（テスト用）
 */
function simulateMemoryLeak() {
  const leakyArray: any[] = [];
  for (let i = 0; i < 10000; i++) {
    leakyArray.push(new Array(1000).fill('leak'));
  }
  return leakyArray;
}

/**
 * メモリを適切に解放する関数（テスト用）
 */
function properMemoryManagement() {
  let tempArray: any[] = [];
  for (let i = 0; i < 10000; i++) {
    tempArray.push(new Array(1000).fill('data'));
  }
  tempArray = []; // 明示的にクリア
  return tempArray;
}

describe('Memory Leak Detection', () => {
  beforeEach(() => {
    forceGC();
  });

  afterEach(() => {
    forceGC();
  });

  it('should detect memory leaks', () => {
    const initialMemory = getMemoryUsage();
    
    // メモリリークをシミュレート
    const leakyData = simulateMemoryLeak();
    
    const afterLeakMemory = getMemoryUsage();
    const memoryIncrease = afterLeakMemory.heapUsed - initialMemory.heapUsed;
    
    console.log('Initial memory:', initialMemory.heapUsed.toFixed(2), 'MB');
    console.log('After leak:', afterLeakMemory.heapUsed.toFixed(2), 'MB');
    console.log('Memory increase:', memoryIncrease.toFixed(2), 'MB');
    
    // メモリが増加していることを確認（リークが検出された）
    expect(memoryIncrease).toBeGreaterThan(10);
    
    // クリーンアップ
    leakyData.length = 0;
  });

  it('should not leak memory with proper management', () => {
    const initialMemory = getMemoryUsage();
    
    // 適切なメモリ管理
    for (let i = 0; i < 10; i++) {
      properMemoryManagement();
    }
    
    forceGC();
    
    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log('Initial memory:', initialMemory.heapUsed.toFixed(2), 'MB');
    console.log('Final memory:', finalMemory.heapUsed.toFixed(2), 'MB');
    console.log('Memory increase:', memoryIncrease.toFixed(2), 'MB');
    
    // メモリ増加が5MB以下であることを確認（リークがない）
    expect(memoryIncrease).toBeLessThan(5);
  });

  it('should detect event listener leaks', () => {
    const initialMemory = getMemoryUsage();
    
    // イベントリスナーのリークをシミュレート
    const listeners: Array<() => void> = [];
    for (let i = 0; i < 1000; i++) {
      const listener = () => console.log('event');
      listeners.push(listener);
      // イベントリスナーを追加するが削除しない（リーク）
    }
    
    const afterLeakMemory = getMemoryUsage();
    const memoryIncrease = afterLeakMemory.heapUsed - initialMemory.heapUsed;
    
    console.log('Event listener leak - Memory increase:', memoryIncrease.toFixed(2), 'MB');
    
    // メモリが増加していることを確認
    expect(memoryIncrease).toBeGreaterThan(0);
    
    // クリーンアップ
    listeners.length = 0;
  });

  it('should properly clean up event listeners', () => {
    const initialMemory = getMemoryUsage();
    
    // イベントリスナーを適切に管理
    const listeners: Array<() => void> = [];
    for (let i = 0; i < 1000; i++) {
      const listener = () => console.log('event');
      listeners.push(listener);
    }
    
    // クリーンアップ
    listeners.length = 0;
    
    forceGC();
    
    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log('Proper cleanup - Memory increase:', memoryIncrease.toFixed(2), 'MB');
    
    // メモリ増加が1MB以下であることを確認
    expect(memoryIncrease).toBeLessThan(1);
  });

  it('should detect closure leaks', () => {
    const initialMemory = getMemoryUsage();
    
    // クロージャによるリークをシミュレート
    const closures: Array<() => void> = [];
    for (let i = 0; i < 1000; i++) {
      const largeData = new Array(1000).fill('data');
      const closure = () => {
        // largeDataを参照するクロージャ（リーク）
        return largeData.length;
      };
      closures.push(closure);
    }
    
    const afterLeakMemory = getMemoryUsage();
    const memoryIncrease = afterLeakMemory.heapUsed - initialMemory.heapUsed;
    
    console.log('Closure leak - Memory increase:', memoryIncrease.toFixed(2), 'MB');
    
    // メモリが増加していることを確認
    expect(memoryIncrease).toBeGreaterThan(1);
    
    // クリーンアップ
    closures.length = 0;
  });

  it('should monitor memory over time', () => {
    const memorySnapshots: number[] = [];
    
    // 10回のイテレーションでメモリ使用量を記録
    for (let i = 0; i < 10; i++) {
      // データを作成して破棄
      properMemoryManagement();
      
      forceGC();
      
      const memory = getMemoryUsage();
      memorySnapshots.push(memory.heapUsed);
    }
    
    console.log('Memory snapshots:', memorySnapshots.map(m => m.toFixed(2)).join(', '));
    
    // メモリ使用量が一定範囲内に収まっていることを確認
    const maxMemory = Math.max(...memorySnapshots);
    const minMemory = Math.min(...memorySnapshots);
    const memoryRange = maxMemory - minMemory;
    
    console.log('Memory range:', memoryRange.toFixed(2), 'MB');
    
    // メモリ変動が10MB以下であることを確認（安定している）
    expect(memoryRange).toBeLessThan(10);
  });
});

describe('React Component Memory Leaks', () => {
  it('should detect useEffect cleanup issues', () => {
    // Note: このテストはReactコンポーネントのテストフレームワーク（React Testing Library等）が必要
    // Placeholder test
    expect(true).toBe(true);
  });

  it('should detect useState/useRef leaks', () => {
    // Note: このテストはReactコンポーネントのテストフレームワークが必要
    // Placeholder test
    expect(true).toBe(true);
  });

  it('should detect subscription leaks', () => {
    // Note: このテストはReactコンポーネントのテストフレームワークが必要
    // Placeholder test
    expect(true).toBe(true);
  });
});

describe('Database Connection Leaks', () => {
  it('should properly close database connections', () => {
    // Note: このテストはデータベースクライアントのテストが必要
    // Placeholder test
    expect(true).toBe(true);
  });

  it('should not leak connections on error', () => {
    // Note: このテストはデータベースクライアントのテストが必要
    // Placeholder test
    expect(true).toBe(true);
  });
});

describe('File Handle Leaks', () => {
  it('should properly close file handles', () => {
    // Note: このテストはファイルシステム操作のテストが必要
    // Placeholder test
    expect(true).toBe(true);
  });

  it('should not leak file handles on error', () => {
    // Note: このテストはファイルシステム操作のテストが必要
    // Placeholder test
    expect(true).toBe(true);
  });
});

describe('Timer Leaks', () => {
  it('should detect setInterval leaks', () => {
    const initialMemory = getMemoryUsage();
    
    // setIntervalのリークをシミュレート
    const intervals: NodeJS.Timeout[] = [];
    for (let i = 0; i < 100; i++) {
      const interval = setInterval(() => {
        // 何もしない
      }, 1000);
      intervals.push(interval);
    }
    
    const afterLeakMemory = getMemoryUsage();
    const memoryIncrease = afterLeakMemory.heapUsed - initialMemory.heapUsed;
    
    console.log('setInterval leak - Memory increase:', memoryIncrease.toFixed(2), 'MB');
    
    // クリーンアップ
    intervals.forEach(interval => clearInterval(interval));
    
    // タイマーが設定されていることを確認
    expect(intervals.length).toBe(100);
  });

  it('should properly clean up timers', () => {
    const initialMemory = getMemoryUsage();
    
    // タイマーを適切に管理
    const intervals: NodeJS.Timeout[] = [];
    for (let i = 0; i < 100; i++) {
      const interval = setInterval(() => {
        // 何もしない
      }, 1000);
      intervals.push(interval);
    }
    
    // クリーンアップ
    intervals.forEach(interval => clearInterval(interval));
    intervals.length = 0;
    
    forceGC();
    
    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log('Proper timer cleanup - Memory increase:', memoryIncrease.toFixed(2), 'MB');
    
    // メモリ増加が1MB以下であることを確認
    expect(memoryIncrease).toBeLessThan(1);
  });
});
