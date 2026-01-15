/**
 * Twitter API 使用量追跡ユーティリティ
 * 
 * レート制限の使用状況を記録・集計し、管理者向けダッシュボードに表示
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";

// メモリ内キャッシュ（サーバー再起動でリセット）
interface ApiUsageEntry {
  endpoint: string;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  timestamp: number;
}

interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  endpoints: Record<string, EndpointStats>;
  lastUpdated: number;
}

interface EndpointStats {
  requests: number;
  limit: number;
  remaining: number;
  resetAt: string;
  usagePercent: number;
}

// メモリ内ストレージ
let usageHistory: ApiUsageEntry[] = [];
let stats: ApiUsageStats = {
  totalRequests: 0,
  successfulRequests: 0,
  rateLimitedRequests: 0,
  endpoints: {},
  lastUpdated: Date.now(),
};

// 履歴の最大保持数
const MAX_HISTORY_SIZE = 1000;

/**
 * API使用量を記録
 */
export function recordApiUsage(
  endpoint: string,
  rateLimitInfo: {
    limit: number;
    remaining: number;
    reset: number;
  } | null,
  success: boolean = true
): void {
  const now = Date.now();
  
  // 統計を更新
  stats.totalRequests++;
  if (success) {
    stats.successfulRequests++;
  } else {
    stats.rateLimitedRequests++;
  }
  stats.lastUpdated = now;
  
  // エンドポイント別の統計を更新
  if (rateLimitInfo) {
    const entry: ApiUsageEntry = {
      endpoint,
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      reset: rateLimitInfo.reset,
      timestamp: now,
    };
    
    // 履歴に追加
    usageHistory.push(entry);
    
    // 履歴サイズを制限
    if (usageHistory.length > MAX_HISTORY_SIZE) {
      usageHistory = usageHistory.slice(-MAX_HISTORY_SIZE);
    }
    
    // エンドポイント統計を更新
    const usagePercent = ((rateLimitInfo.limit - rateLimitInfo.remaining) / rateLimitInfo.limit) * 100;
    stats.endpoints[endpoint] = {
      requests: (stats.endpoints[endpoint]?.requests || 0) + 1,
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      resetAt: new Date(rateLimitInfo.reset * 1000).toISOString(),
      usagePercent: Math.round(usagePercent * 10) / 10,
    };
  }
}

/**
 * レート制限エラーを記録
 */
export function recordRateLimitError(endpoint: string): void {
  recordApiUsage(endpoint, null, false);
}

/**
 * 現在のAPI使用量統計を取得
 */
export function getApiUsageStats(): ApiUsageStats {
  return { ...stats };
}

/**
 * エンドポイント別の詳細統計を取得
 */
export function getEndpointStats(endpoint: string): EndpointStats | null {
  return stats.endpoints[endpoint] || null;
}

/**
 * 直近N件の使用履歴を取得
 */
export function getRecentUsageHistory(count: number = 100): ApiUsageEntry[] {
  return usageHistory.slice(-count);
}

/**
 * 統計をリセット
 */
export function resetApiUsageStats(): void {
  usageHistory = [];
  stats = {
    totalRequests: 0,
    successfulRequests: 0,
    rateLimitedRequests: 0,
    endpoints: {},
    lastUpdated: Date.now(),
  };
}

/**
 * レート制限の警告レベルを判定
 */
export function getRateLimitWarningLevel(endpoint: string): "safe" | "warning" | "critical" {
  const endpointStats = stats.endpoints[endpoint];
  
  if (!endpointStats) {
    return "safe";
  }
  
  if (endpointStats.remaining <= 5) {
    return "critical";
  }
  
  if (endpointStats.usagePercent >= 80) {
    return "warning";
  }
  
  return "safe";
}

/**
 * 全エンドポイントの警告サマリーを取得
 */
export function getWarningsSummary(): {
  endpoint: string;
  level: "warning" | "critical";
  remaining: number;
  resetAt: string;
}[] {
  const warnings: {
    endpoint: string;
    level: "warning" | "critical";
    remaining: number;
    resetAt: string;
  }[] = [];
  
  for (const [endpoint, endpointStats] of Object.entries(stats.endpoints)) {
    const level = getRateLimitWarningLevel(endpoint);
    if (level !== "safe") {
      warnings.push({
        endpoint,
        level,
        remaining: endpointStats.remaining,
        resetAt: endpointStats.resetAt,
      });
    }
  }
  
  return warnings;
}

/**
 * ダッシュボード用のサマリーデータを取得
 */
export function getDashboardSummary(): {
  stats: ApiUsageStats;
  warnings: ReturnType<typeof getWarningsSummary>;
  recentHistory: ApiUsageEntry[];
} {
  return {
    stats: getApiUsageStats(),
    warnings: getWarningsSummary(),
    recentHistory: getRecentUsageHistory(20),
  };
}
