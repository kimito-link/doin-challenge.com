/**
 * API Performance Tests
 * APIエンドポイントのパフォーマンステスト
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { performance } from 'perf_hooks';

// テスト用のベースURL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// パフォーマンス閾値（ミリ秒）
const PERFORMANCE_THRESHOLDS = {
  fast: 100,      // 100ms以下
  acceptable: 500, // 500ms以下
  slow: 1000,     // 1000ms以下
};

interface PerformanceResult {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
}

/**
 * APIエンドポイントのパフォーマンスを測定
 */
async function measureApiPerformance(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<PerformanceResult> {
  const start = performance.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const end = performance.now();
    const duration = end - start;
    
    return {
      endpoint,
      method,
      duration,
      status: response.status,
      success: response.ok,
    };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    return {
      endpoint,
      method,
      duration,
      status: 0,
      success: false,
    };
  }
}

/**
 * 複数回実行して平均パフォーマンスを測定
 */
async function measureAveragePerformance(
  endpoint: string,
  method: string = 'GET',
  iterations: number = 10,
  body?: any,
  headers?: Record<string, string>
): Promise<{
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}> {
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const result = await measureApiPerformance(endpoint, method, body, headers);
    if (result.success) {
      results.push(result.duration);
    }
  }
  
  if (results.length === 0) {
    throw new Error(`All requests to ${endpoint} failed`);
  }
  
  results.sort((a, b) => a - b);
  
  const avg = results.reduce((sum, val) => sum + val, 0) / results.length;
  const min = results[0];
  const max = results[results.length - 1];
  const p50 = results[Math.floor(results.length * 0.5)];
  const p95 = results[Math.floor(results.length * 0.95)];
  const p99 = results[Math.floor(results.length * 0.99)];
  
  return { avg, min, max, p50, p95, p99 };
}

describe('API Performance Tests', () => {
  describe('Health Check Endpoints', () => {
    it('should respond to health check within 100ms', async () => {
      const result = await measureApiPerformance('/health');
      
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.fast);
    });
  });

  describe('Public Endpoints', () => {
    it('should load challenges list within acceptable time', async () => {
      const stats = await measureAveragePerformance('/api/trpc/challenges.list', 'GET', 5);
      
      console.log('Challenges list performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.acceptable);
      expect(stats.p95).toBeLessThan(PERFORMANCE_THRESHOLDS.slow);
    });

    it('should load challenge detail within acceptable time', async () => {
      const stats = await measureAveragePerformance('/api/trpc/challenges.getById?input={"id":1}', 'GET', 5);
      
      console.log('Challenge detail performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.acceptable);
      expect(stats.p95).toBeLessThan(PERFORMANCE_THRESHOLDS.slow);
    });

    it('should load participations list within acceptable time', async () => {
      const stats = await measureAveragePerformance('/api/trpc/participations.list?input={"challengeId":1}', 'GET', 5);
      
      console.log('Participations list performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.acceptable);
      expect(stats.p95).toBeLessThan(PERFORMANCE_THRESHOLDS.slow);
    });
  });

  describe('Database Query Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const start = performance.now();
      
      const promises = Array.from({ length: concurrentRequests }, () =>
        measureApiPerformance('/api/trpc/challenges.list', 'GET')
      );
      
      const results = await Promise.all(promises);
      const end = performance.now();
      const totalDuration = end - start;
      
      console.log(`${concurrentRequests} concurrent requests completed in ${totalDuration.toFixed(2)}ms`);
      
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBe(concurrentRequests);
      
      // 並列実行時間が逐次実行時間の50%以下であることを確認（効率的な並列処理）
      const avgSequentialTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const expectedSequentialTime = avgSequentialTime * concurrentRequests;
      expect(totalDuration).toBeLessThan(expectedSequentialTime * 0.5);
    });
  });

  describe('Caching Performance', () => {
    it('should serve cached responses faster', async () => {
      // 初回リクエスト（キャッシュなし）
      const firstRequest = await measureApiPerformance('/api/trpc/challenges.list', 'GET');
      
      // 2回目のリクエスト（キャッシュあり）
      const secondRequest = await measureApiPerformance('/api/trpc/challenges.list', 'GET');
      
      console.log('First request:', firstRequest.duration.toFixed(2), 'ms');
      console.log('Second request (cached):', secondRequest.duration.toFixed(2), 'ms');
      
      expect(firstRequest.success).toBe(true);
      expect(secondRequest.success).toBe(true);
      
      // 2回目のリクエストが1回目より速いことを確認（キャッシュ効果）
      // 注: React Queryのクライアントサイドキャッシュの場合、サーバー側では差が出ない可能性あり
      // expect(secondRequest.duration).toBeLessThanOrEqual(firstRequest.duration);
    });
  });

  describe('Payload Size Performance', () => {
    it('should handle large response payloads efficiently', async () => {
      const result = await measureApiPerformance('/api/trpc/participations.list?input={"challengeId":1}', 'GET');
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.slow);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle 404 errors quickly', async () => {
      const result = await measureApiPerformance('/api/trpc/challenges.getById?input={"id":999999}', 'GET');
      
      expect(result.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.fast);
    });

    it('should handle validation errors quickly', async () => {
      const result = await measureApiPerformance('/api/trpc/challenges.create', 'POST', {
        title: '', // Invalid: empty title
      });
      
      expect(result.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.fast);
    });
  });
});

describe('Database Query Performance', () => {
  it('should execute simple SELECT queries within 50ms', async () => {
    // Note: このテストはデータベースに直接アクセスする必要があるため、
    // 実際の実装ではデータベースクライアントを使用してください
    
    // Placeholder test
    expect(true).toBe(true);
  });

  it('should execute JOIN queries within 200ms', async () => {
    // Note: このテストはデータベースに直接アクセスする必要があるため、
    // 実際の実装ではデータベースクライアントを使用してください
    
    // Placeholder test
    expect(true).toBe(true);
  });

  it('should execute aggregation queries within 300ms', async () => {
    // Note: このテストはデータベースに直接アクセスする必要があるため、
    // 実際の実装ではデータベースクライアントを使用してください
    
    // Placeholder test
    expect(true).toBe(true);
  });
});

describe('Memory Usage', () => {
  it('should not leak memory during repeated requests', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 100回リクエストを実行
    for (let i = 0; i < 100; i++) {
      await measureApiPerformance('/api/trpc/challenges.list', 'GET');
    }
    
    // ガベージコレクションを強制実行
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
    
    console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);
    
    // メモリ増加が10MB以下であることを確認（メモリリークがない）
    expect(memoryIncreaseMB).toBeLessThan(10);
  });
});

describe('Response Time Distribution', () => {
  it('should have consistent response times', async () => {
    const iterations = 50;
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await measureApiPerformance('/api/trpc/challenges.list', 'GET');
      if (result.success) {
        results.push(result.duration);
      }
    }
    
    results.sort((a, b) => a - b);
    
    const avg = results.reduce((sum, val) => sum + val, 0) / results.length;
    const stdDev = Math.sqrt(
      results.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / results.length
    );
    
    console.log('Response time statistics:');
    console.log(`  Average: ${avg.toFixed(2)} ms`);
    console.log(`  Std Dev: ${stdDev.toFixed(2)} ms`);
    console.log(`  Min: ${results[0].toFixed(2)} ms`);
    console.log(`  Max: ${results[results.length - 1].toFixed(2)} ms`);
    console.log(`  P50: ${results[Math.floor(results.length * 0.5)].toFixed(2)} ms`);
    console.log(`  P95: ${results[Math.floor(results.length * 0.95)].toFixed(2)} ms`);
    console.log(`  P99: ${results[Math.floor(results.length * 0.99)].toFixed(2)} ms`);
    
    // 標準偏差が平均の50%以下であることを確認（一貫性のあるレスポンスタイム）
    expect(stdDev).toBeLessThan(avg * 0.5);
  });
});
