import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { color } from "@/theme/tokens";
import { useCallback, useEffect, useState } from "react";
import {
  getPerformanceSnapshots,
  calculatePerformanceStats,
  clearPerformanceSnapshots,
  type PerformanceSnapshot,
  type PerformanceStats,
} from "@/lib/performance-metrics-store";
import { navigateBack } from "@/lib/navigation";
import * as Haptics from "expo-haptics";
import { PerformanceChart, PerformanceTrendChart } from "@/components/performance/performance-chart";

/**
 * パフォーマンスダッシュボード画面
 * Web VitalsとstartupPerformanceのメトリクスを可視化
 */
export default function PerformanceDashboardScreen() {
  const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [snapshotsData, statsData] = await Promise.all([
        getPerformanceSnapshots(),
        calculatePerformanceStats(),
      ]);
      setSnapshots(snapshotsData);
      setStats(statsData);
    } catch (error) {
      console.error("[Performance Dashboard] Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClearData = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearPerformanceSnapshots();
    await loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={color.accentPrimary} />
        <Text className="mt-4 text-muted">読み込み中...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-surface border-b border-border">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">パフォーマンスダッシュボード</Text>
              <Text className="text-sm text-muted mt-1">
                {stats?.totalSnapshots || 0}件のスナップショット
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigateBack();
              }}
              className="bg-primary px-4 py-2 rounded-lg"
              style={{ transform: [{ scale: 1 }] }}
            >
              <Text className="text-background font-semibold">戻る</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View className="p-4 flex-row gap-3">
          <TouchableOpacity
            onPress={handleRefresh}
            className="flex-1 bg-primary px-4 py-3 rounded-lg"
            style={{ transform: [{ scale: 1 }] }}
          >
            <Text className="text-background font-semibold text-center">更新</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearData}
            className="flex-1 bg-error px-4 py-3 rounded-lg"
            style={{ transform: [{ scale: 1 }] }}
          >
            <Text className="text-background font-semibold text-center">データクリア</Text>
          </TouchableOpacity>
        </View>

        {stats && stats.totalSnapshots > 0 ? (
          <>
            {/* Startup Performance Chart */}
            <View className="p-4">
              <PerformanceChart
                title="起動パフォーマンス"
                data={[
                  {
                    label: "JS読込",
                    value: stats.startup.avgJsLoaded,
                    color: getRatingColor(getRatingForStartup(stats.startup.avgJsLoaded)),
                  },
                  {
                    label: "初回描画",
                    value: stats.startup.avgFirstRender,
                    color: getRatingColor(getRatingForStartup(stats.startup.avgFirstRender)),
                  },
                  {
                    label: "操作可能",
                    value: stats.startup.avgInteractive,
                    color: getRatingColor(getRatingForStartup(stats.startup.avgInteractive)),
                  },
                ]}
                type="bar"
                height={220}
                unit="ms"
              />
            </View>

            {/* Startup Performance Trend */}
            {snapshots.filter((s) => s.startup).length > 1 && (
              <View className="p-4">
                <PerformanceTrendChart
                  title="起動時間の推移"
                  data={snapshots
                    .filter((s) => s.startup)
                    .slice(0, 20)
                    .reverse()
                    .map((s) => ({
                      timestamp: s.timestamp,
                      value: s.startup!.interactive,
                    }))}
                  height={220}
                  unit="ms"
                  goodThreshold={1000}
                  poorThreshold={2000}
                />
              </View>
            )}

            {/* Web Vitals Charts */}
            {(stats.webVitals.lcp.avg > 0 ||
              stats.webVitals.fid.avg > 0 ||
              stats.webVitals.cls.avg > 0) && (
              <>
                <View className="p-4">
                  <Text className="text-xl font-bold text-foreground mb-4">Web Vitals</Text>

                  {/* Web Vitals Overview */}
                  <PerformanceChart
                    title="Web Vitals 概要"
                    data={[
                      {
                        label: "LCP",
                        value: stats.webVitals.lcp.avg,
                        color: getRatingColor(getRatingForLCP(stats.webVitals.lcp.avg)),
                      },
                      {
                        label: "FID",
                        value: stats.webVitals.fid.avg,
                        color: getRatingColor(getRatingForFID(stats.webVitals.fid.avg)),
                      },
                      {
                        label: "CLS×1000",
                        value: stats.webVitals.cls.avg * 1000,
                        color: getRatingColor(getRatingForCLS(stats.webVitals.cls.avg)),
                      },
                    ]}
                    type="bar"
                    height={220}
                    unit="ms"
                  />
                </View>

                {/* Web Vitals Rating Distribution */}
                <View className="p-4">
                  <View className="bg-surface rounded-lg p-4 border border-border mb-4">
                    <Text className="text-lg font-semibold text-foreground mb-4">評価分布</Text>

                    {/* LCP */}
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-foreground mb-2">LCP</Text>
                      <View className="flex-row h-8 rounded overflow-hidden">
                        <View
                          style={{
                            flex: stats.webVitals.lcp.good,
                            backgroundColor: color.successDark,
                          }}
                        />
                        <View
                          style={{
                            flex: stats.webVitals.lcp.needsImprovement,
                            backgroundColor: color.warning,
                          }}
                        />
                        <View
                          style={{
                            flex: stats.webVitals.lcp.poor,
                            backgroundColor: color.dangerDark,
                          }}
                        />
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-xs text-muted">Good: {stats.webVitals.lcp.good}</Text>
                        <Text className="text-xs text-muted">
                          Needs Improvement: {stats.webVitals.lcp.needsImprovement}
                        </Text>
                        <Text className="text-xs text-muted">Poor: {stats.webVitals.lcp.poor}</Text>
                      </View>
                    </View>

                    {/* FID */}
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-foreground mb-2">FID</Text>
                      <View className="flex-row h-8 rounded overflow-hidden">
                        <View
                          style={{
                            flex: stats.webVitals.fid.good,
                            backgroundColor: color.successDark,
                          }}
                        />
                        <View
                          style={{
                            flex: stats.webVitals.fid.needsImprovement,
                            backgroundColor: color.warning,
                          }}
                        />
                        <View
                          style={{
                            flex: stats.webVitals.fid.poor,
                            backgroundColor: color.dangerDark,
                          }}
                        />
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-xs text-muted">Good: {stats.webVitals.fid.good}</Text>
                        <Text className="text-xs text-muted">
                          Needs Improvement: {stats.webVitals.fid.needsImprovement}
                        </Text>
                        <Text className="text-xs text-muted">Poor: {stats.webVitals.fid.poor}</Text>
                      </View>
                    </View>

                    {/* CLS */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">CLS</Text>
                      <View className="flex-row h-8 rounded overflow-hidden">
                        <View
                          style={{
                            flex: stats.webVitals.cls.good,
                            backgroundColor: color.successDark,
                          }}
                        />
                        <View
                          style={{
                            flex: stats.webVitals.cls.needsImprovement,
                            backgroundColor: color.warning,
                          }}
                        />
                        <View
                          style={{
                            flex: stats.webVitals.cls.poor,
                            backgroundColor: color.dangerDark,
                          }}
                        />
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-xs text-muted">Good: {stats.webVitals.cls.good}</Text>
                        <Text className="text-xs text-muted">
                          Needs Improvement: {stats.webVitals.cls.needsImprovement}
                        </Text>
                        <Text className="text-xs text-muted">Poor: {stats.webVitals.cls.poor}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Detailed Stats */}
            <View className="p-4">
              <Text className="text-xl font-bold text-foreground mb-4">詳細統計</Text>
              <View className="bg-surface rounded-lg p-4 border border-border">
                <MetricRow
                  label="平均JS読み込み時間"
                  value={`${stats.startup.avgJsLoaded.toFixed(0)}ms`}
                  rating={getRatingForStartup(stats.startup.avgJsLoaded)}
                />
                <MetricRow
                  label="平均初回レンダリング時間"
                  value={`${stats.startup.avgFirstRender.toFixed(0)}ms`}
                  rating={getRatingForStartup(stats.startup.avgFirstRender)}
                />
                <MetricRow
                  label="平均インタラクティブ時間"
                  value={`${stats.startup.avgInteractive.toFixed(0)}ms`}
                  rating={getRatingForStartup(stats.startup.avgInteractive)}
                />
                <MetricRow
                  label="最速インタラクティブ時間"
                  value={`${stats.startup.minInteractive.toFixed(0)}ms`}
                  rating="good"
                />
                <MetricRow
                  label="最遅インタラクティブ時間"
                  value={`${stats.startup.maxInteractive.toFixed(0)}ms`}
                  rating="poor"
                />
                {stats.webVitals.lcp.avg > 0 && (
                  <MetricRow
                    label="平均LCP"
                    value={`${stats.webVitals.lcp.avg.toFixed(0)}ms`}
                    rating={getRatingForLCP(stats.webVitals.lcp.avg)}
                  />
                )}
                {stats.webVitals.fid.avg > 0 && (
                  <MetricRow
                    label="平均FID"
                    value={`${stats.webVitals.fid.avg.toFixed(0)}ms`}
                    rating={getRatingForFID(stats.webVitals.fid.avg)}
                  />
                )}
                {stats.webVitals.cls.avg > 0 && (
                  <MetricRow
                    label="平均CLS"
                    value={stats.webVitals.cls.avg.toFixed(3)}
                    rating={getRatingForCLS(stats.webVitals.cls.avg)}
                    isLast
                  />
                )}
              </View>
            </View>

            {/* Recent Snapshots */}
            <View className="p-4">
              <Text className="text-xl font-bold text-foreground mb-4">最近のスナップショット</Text>
              {snapshots.slice(0, 10).map((snapshot, index) => (
                <View
                  key={snapshot.id}
                  className="bg-surface rounded-lg p-4 mb-3 border border-border"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-semibold text-foreground">
                      #{snapshots.length - index}
                    </Text>
                    <Text className="text-xs text-muted">
                      {new Date(snapshot.timestamp).toLocaleString("ja-JP")}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted mb-2">
                    Platform: {snapshot.platform} | {snapshot.userAgent.substring(0, 50)}...
                  </Text>
                  {snapshot.startup && (
                    <View className="mt-2">
                      <Text className="text-xs text-muted">
                        Interactive: {snapshot.startup.interactive}ms | First Render:{" "}
                        {snapshot.startup.firstRender}ms | JS Loaded: {snapshot.startup.jsLoaded}ms
                      </Text>
                    </View>
                  )}
                  {snapshot.webVitals.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-xs text-muted">
                        Web Vitals:{" "}
                        {snapshot.webVitals.map((v) => `${v.name}=${v.value.toFixed(1)}`).join(", ")}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="p-6 items-center justify-center">
            <Text className="text-lg text-muted text-center">
              パフォーマンスデータがまだ収集されていません。
            </Text>
            <Text className="text-sm text-muted text-center mt-2">
              アプリを使用すると、自動的にデータが収集されます。
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * メトリクス行コンポーネント
 */
function MetricRow({
  label,
  value,
  rating,
  isLast = false,
}: {
  label: string;
  value: string;
  rating: "good" | "needs-improvement" | "poor";
  isLast?: boolean;
}) {
  const ratingColor =
    rating === "good" ? "text-success" : rating === "needs-improvement" ? "text-warning" : "text-error";

  return (
    <View className={`flex-row justify-between items-center py-2 ${!isLast ? "border-b border-border" : ""}`}>
      <Text className="text-sm text-muted">{label}</Text>
      <Text className={`text-sm font-semibold ${ratingColor}`}>{value}</Text>
    </View>
  );
}

/**
 * 起動パフォーマンスの評価
 */
function getRatingForStartup(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 1000) return "good";
  if (value <= 2000) return "needs-improvement";
  return "poor";
}

/**
 * LCPの評価
 */
function getRatingForLCP(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 2500) return "good";
  if (value <= 4000) return "needs-improvement";
  return "poor";
}

/**
 * FIDの評価
 */
function getRatingForFID(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 100) return "good";
  if (value <= 300) return "needs-improvement";
  return "poor";
}

/**
 * CLSの評価
 */
function getRatingForCLS(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 0.1) return "good";
  if (value <= 0.25) return "needs-improvement";
  return "poor";
}

/**
 * 評価に基づいて色を取得
 */
function getRatingColor(rating: "good" | "needs-improvement" | "poor"): string {
  switch (rating) {
    case "good":
      return color.successDark;
    case "needs-improvement":
      return color.warning;
    case "poor":
      return color.dangerDark;
  }
}
