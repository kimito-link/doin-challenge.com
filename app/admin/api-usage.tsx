/**
 * API使用量ダッシュボード
 * 
 * Twitter APIのレート制限使用状況を可視化
 * 管理者向け機能
 */

import { ScreenContainer } from "@/components/organisms/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getApiBaseUrl } from "@/constants/oauth";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

interface EndpointStats {
  requests: number;
  limit: number;
  remaining: number;
  resetAt: string;
  usagePercent: number;
}

interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  endpoints: Record<string, EndpointStats>;
  lastUpdated: number;
}

interface Warning {
  endpoint: string;
  level: "warning" | "critical";
  remaining: number;
  resetAt: string;
}

interface DashboardData {
  stats: ApiUsageStats;
  warnings: Warning[];
  recentHistory: Array<{
    endpoint: string;
    limit: number;
    remaining: number;
    reset: number;
    timestamp: number;
  }>;
}

export default function ApiUsageDashboard() {
  const colors = useColors();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/admin/api-usage`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch API usage data");
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch API usage:", err);
      setError(err instanceof Error ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // 30秒ごとに自動更新
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const getWarningColor = (level: "warning" | "critical") => {
    return level === "critical" ? colors.error : colors.warning;
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return colors.error;
    if (percent >= 70) return colors.warning;
    return colors.success;
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted">読み込み中...</Text>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center p-4">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text className="text-lg font-bold text-foreground mb-2">エラー</Text>
        <Text className="text-muted text-center mb-4">{error}</Text>
        <Pressable
          onPress={fetchData}
          style={({ pressed }) => [
            {
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text className="text-white font-semibold">再試行</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              API使用量ダッシュボード
            </Text>
            <Text className="text-sm text-muted mt-1">
              Twitter API レート制限の監視
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              {
                padding: 8,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text className="text-primary">閉じる</Text>
          </Pressable>
        </View>

        {/* 警告セクション */}
        {data?.warnings && data.warnings.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              ⚠️ 警告
            </Text>
            {data.warnings.map((warning, index) => (
              <View
                key={index}
                className="p-4 rounded-lg mb-2"
                style={{ backgroundColor: getWarningColor(warning.level) + "20" }}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="font-semibold"
                    style={{ color: getWarningColor(warning.level) }}
                  >
                    {warning.level === "critical" ? "🔴 危険" : "🟡 注意"}
                  </Text>
                  <Text className="text-sm text-muted">
                    残り {warning.remaining} 回
                  </Text>
                </View>
                <Text className="text-foreground mt-1">{warning.endpoint}</Text>
                <Text className="text-sm text-muted mt-1">
                  リセット: {new Date(warning.resetAt).toLocaleString("ja-JP")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 統計サマリー */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            📊 統計サマリー
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[140px] bg-surface p-4 rounded-lg">
              <Text className="text-3xl font-bold text-foreground">
                {data?.stats.totalRequests || 0}
              </Text>
              <Text className="text-sm text-muted">総リクエスト数</Text>
            </View>
            <View className="flex-1 min-w-[140px] bg-surface p-4 rounded-lg">
              <Text className="text-3xl font-bold text-success">
                {data?.stats.successfulRequests || 0}
              </Text>
              <Text className="text-sm text-muted">成功</Text>
            </View>
            <View className="flex-1 min-w-[140px] bg-surface p-4 rounded-lg">
              <Text className="text-3xl font-bold text-error">
                {data?.stats.rateLimitedRequests || 0}
              </Text>
              <Text className="text-sm text-muted">レート制限</Text>
            </View>
          </View>
        </View>

        {/* エンドポイント別統計 */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            🔗 エンドポイント別
          </Text>
          {data?.stats.endpoints && Object.keys(data.stats.endpoints).length > 0 ? (
            Object.entries(data.stats.endpoints).map(([endpoint, stats]) => (
              <View
                key={endpoint}
                className="bg-surface p-4 rounded-lg mb-3"
              >
                <Text className="font-semibold text-foreground mb-2">
                  {endpoint}
                </Text>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted">
                    リクエスト: {stats.requests}
                  </Text>
                  <Text className="text-sm text-muted">
                    残り: {stats.remaining}/{stats.limit}
                  </Text>
                </View>
                {/* プログレスバー */}
                <View className="h-2 bg-border rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${stats.usagePercent}%`,
                      backgroundColor: getUsageColor(stats.usagePercent),
                    }}
                  />
                </View>
                <Text className="text-xs text-muted mt-1">
                  使用率: {stats.usagePercent}% | リセット:{" "}
                  {new Date(stats.resetAt).toLocaleString("ja-JP")}
                </Text>
              </View>
            ))
          ) : (
            <View className="bg-surface p-4 rounded-lg">
              <Text className="text-muted text-center">
                まだAPIリクエストがありません
              </Text>
            </View>
          )}
        </View>

        {/* 最終更新時刻 */}
        <Text className="text-xs text-muted text-center">
          最終更新:{" "}
          {data?.stats.lastUpdated
            ? new Date(data.stats.lastUpdated).toLocaleString("ja-JP")
            : "-"}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
