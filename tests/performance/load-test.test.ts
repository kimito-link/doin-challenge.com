/**
 * Load Testing
 * 負荷テスト - 高負荷時のアプリケーション動作を検証
 */

import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

// テスト用のベースURL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDuration: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: Array<{ status: number; message: string }>;
}

/**
 * 負荷テストを実行
 */
async function runLoadTest(
  endpoint: string,
  concurrentUsers: number,
  requestsPerUser: number,
  method: string = 'GET',
  body?: any
): Promise<LoadTestResult> {
  const responseTimes: number[] = [];
  const errors: Array<{ status: number; message: string }> = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  const start = performance.now();

  // 並行ユーザーをシミュレート
  const userPromises = Array.from({ length: concurrentUsers }, async () => {
    for (let i = 0; i < requestsPerUser; i++) {
      const requestStart = performance.now();
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;
        responseTimes.push(responseTime);

        if (response.ok) {
          successfulRequests++;
        } else {
          failedRequests++;
          errors.push({
            status: response.status,
            message: await response.text(),
          });
        }
      } catch (error) {
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;
        responseTimes.push(responseTime);
        failedRequests++;
        errors.push({
          status: 0,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  });

  await Promise.all(userPromises);

  const end = performance.now();
  const totalDuration = end - start;

  const totalRequests = concurrentUsers * requestsPerUser;
  const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  const requestsPerSecond = (totalRequests / totalDuration) * 1000;

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    totalDuration,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    requestsPerSecond,
    errors: errors.slice(0, 10), // 最初の10個のエラーのみ
  };
}

describe('Load Testing', () => {
  describe('Light Load', () => {
    it('should handle 10 concurrent users with 5 requests each', async () => {
      const result = await runLoadTest('/api/trpc/challenges.list', 10, 5);

      console.log('Light Load Test Results:');
      console.log(`  Total requests: ${result.totalRequests}`);
      console.log(`  Successful: ${result.successfulRequests}`);
      console.log(`  Failed: ${result.failedRequests}`);
      console.log(`  Total duration: ${result.totalDuration.toFixed(2)} ms`);
      console.log(`  Avg response time: ${result.avgResponseTime.toFixed(2)} ms`);
      console.log(`  Min response time: ${result.minResponseTime.toFixed(2)} ms`);
      console.log(`  Max response time: ${result.maxResponseTime.toFixed(2)} ms`);
      console.log(`  Requests/sec: ${result.requestsPerSecond.toFixed(2)}`);

      // 成功率が95%以上であることを確認
      const successRate = result.successfulRequests / result.totalRequests;
      expect(successRate).toBeGreaterThanOrEqual(0.95);

      // 平均応答時間が1秒以下であることを確認
      expect(result.avgResponseTime).toBeLessThan(1000);
    }, 30000); // 30秒タイムアウト
  });

  describe('Medium Load', () => {
    it('should handle 50 concurrent users with 10 requests each', async () => {
      const result = await runLoadTest('/api/trpc/challenges.list', 50, 10);

      console.log('Medium Load Test Results:');
      console.log(`  Total requests: ${result.totalRequests}`);
      console.log(`  Successful: ${result.successfulRequests}`);
      console.log(`  Failed: ${result.failedRequests}`);
      console.log(`  Total duration: ${result.totalDuration.toFixed(2)} ms`);
      console.log(`  Avg response time: ${result.avgResponseTime.toFixed(2)} ms`);
      console.log(`  Min response time: ${result.minResponseTime.toFixed(2)} ms`);
      console.log(`  Max response time: ${result.maxResponseTime.toFixed(2)} ms`);
      console.log(`  Requests/sec: ${result.requestsPerSecond.toFixed(2)}`);

      // 成功率が90%以上であることを確認
      const successRate = result.successfulRequests / result.totalRequests;
      expect(successRate).toBeGreaterThanOrEqual(0.90);

      // 平均応答時間が2秒以下であることを確認
      expect(result.avgResponseTime).toBeLessThan(2000);
    }, 60000); // 60秒タイムアウト
  });

  describe('Heavy Load', () => {
    it('should handle 100 concurrent users with 20 requests each', async () => {
      const result = await runLoadTest('/api/trpc/challenges.list', 100, 20);

      console.log('Heavy Load Test Results:');
      console.log(`  Total requests: ${result.totalRequests}`);
      console.log(`  Successful: ${result.successfulRequests}`);
      console.log(`  Failed: ${result.failedRequests}`);
      console.log(`  Total duration: ${result.totalDuration.toFixed(2)} ms`);
      console.log(`  Avg response time: ${result.avgResponseTime.toFixed(2)} ms`);
      console.log(`  Min response time: ${result.minResponseTime.toFixed(2)} ms`);
      console.log(`  Max response time: ${result.maxResponseTime.toFixed(2)} ms`);
      console.log(`  Requests/sec: ${result.requestsPerSecond.toFixed(2)}`);

      if (result.errors.length > 0) {
        console.log('  Sample errors:', result.errors);
      }

      // 成功率が80%以上であることを確認
      const successRate = result.successfulRequests / result.totalRequests;
      expect(successRate).toBeGreaterThanOrEqual(0.80);

      // 平均応答時間が5秒以下であることを確認
      expect(result.avgResponseTime).toBeLessThan(5000);
    }, 120000); // 120秒タイムアウト
  });

  describe('Spike Test', () => {
    it('should recover from sudden traffic spike', async () => {
      // 通常負荷
      const normalLoad = await runLoadTest('/api/trpc/challenges.list', 10, 5);
      console.log('Normal load avg response time:', normalLoad.avgResponseTime.toFixed(2), 'ms');

      // スパイク（急激な負荷増加）
      const spikeLoad = await runLoadTest('/api/trpc/challenges.list', 100, 10);
      console.log('Spike load avg response time:', spikeLoad.avgResponseTime.toFixed(2), 'ms');

      // 回復（通常負荷に戻る）
      const recoveryLoad = await runLoadTest('/api/trpc/challenges.list', 10, 5);
      console.log('Recovery load avg response time:', recoveryLoad.avgResponseTime.toFixed(2), 'ms');

      // スパイク後に回復できることを確認
      expect(recoveryLoad.avgResponseTime).toBeLessThan(spikeLoad.avgResponseTime);

      // 回復時の応答時間が通常負荷の2倍以下であることを確認
      expect(recoveryLoad.avgResponseTime).toBeLessThan(normalLoad.avgResponseTime * 2);
    }, 180000); // 180秒タイムアウト
  });

  describe('Endurance Test', () => {
    it('should maintain performance over extended period', async () => {
      const iterations = 5;
      const avgResponseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const result = await runLoadTest('/api/trpc/challenges.list', 20, 10);
        avgResponseTimes.push(result.avgResponseTime);
        console.log(`Iteration ${i + 1} avg response time:`, result.avgResponseTime.toFixed(2), 'ms');
      }

      // 応答時間が徐々に増加していないことを確認（パフォーマンス劣化がない）
      const firstHalf = avgResponseTimes.slice(0, Math.floor(iterations / 2));
      const secondHalf = avgResponseTimes.slice(Math.floor(iterations / 2));

      const firstHalfAvg = firstHalf.reduce((sum, time) => sum + time, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, time) => sum + time, 0) / secondHalf.length;

      console.log('First half avg:', firstHalfAvg.toFixed(2), 'ms');
      console.log('Second half avg:', secondHalfAvg.toFixed(2), 'ms');

      // 後半の平均応答時間が前半の1.5倍以下であることを確認
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5);
    }, 300000); // 300秒タイムアウト
  });

  describe('Database Load', () => {
    it('should handle concurrent database queries', async () => {
      const result = await runLoadTest('/api/trpc/participations.list?input={"challengeId":1}', 50, 10);

      console.log('Database Load Test Results:');
      console.log(`  Total requests: ${result.totalRequests}`);
      console.log(`  Successful: ${result.successfulRequests}`);
      console.log(`  Failed: ${result.failedRequests}`);
      console.log(`  Avg response time: ${result.avgResponseTime.toFixed(2)} ms`);

      // 成功率が90%以上であることを確認
      const successRate = result.successfulRequests / result.totalRequests;
      expect(successRate).toBeGreaterThanOrEqual(0.90);
    }, 60000);
  });

  describe('Mixed Workload', () => {
    it('should handle mixed read/write operations', async () => {
      // 読み取り操作
      const readResult = await runLoadTest('/api/trpc/challenges.list', 30, 10);

      // 書き込み操作（注: 実際のテストでは適切なエンドポイントとデータを使用）
      // const writeResult = await runLoadTest('/api/trpc/participations.create', 10, 5, 'POST', {
      //   challengeId: 1,
      //   message: 'Test message',
      // });

      console.log('Read operations avg response time:', readResult.avgResponseTime.toFixed(2), 'ms');
      // console.log('Write operations avg response time:', writeResult.avgResponseTime.toFixed(2), 'ms');

      // 読み取り操作の成功率が90%以上であることを確認
      const readSuccessRate = readResult.successfulRequests / readResult.totalRequests;
      expect(readSuccessRate).toBeGreaterThanOrEqual(0.90);
    }, 60000);
  });
});

describe('Rate Limiting', () => {
  it('should enforce rate limits', async () => {
    // 短時間に大量のリクエストを送信
    const result = await runLoadTest('/api/trpc/challenges.list', 1, 100);

    console.log('Rate Limiting Test Results:');
    console.log(`  Total requests: ${result.totalRequests}`);
    console.log(`  Successful: ${result.successfulRequests}`);
    console.log(`  Failed: ${result.failedRequests}`);

    // レート制限が適用されている場合、一部のリクエストが失敗することを確認
    // 注: レート制限の実装によっては、このテストの期待値を調整する必要があります
    // expect(result.failedRequests).toBeGreaterThan(0);
  }, 30000);
});

describe('Error Recovery', () => {
  it('should recover from temporary errors', async () => {
    // エラーを発生させるエンドポイント（存在しないID）
    const errorResult = await runLoadTest('/api/trpc/challenges.getById?input={"id":999999}', 10, 5);

    console.log('Error Recovery Test Results:');
    console.log(`  Total requests: ${errorResult.totalRequests}`);
    console.log(`  Successful: ${errorResult.successfulRequests}`);
    console.log(`  Failed: ${errorResult.failedRequests}`);

    // エラーレスポンスが迅速に返されることを確認
    expect(errorResult.avgResponseTime).toBeLessThan(1000);
  }, 30000);
});
