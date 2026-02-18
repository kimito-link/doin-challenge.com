/**
 * Navigation Dashboard
 * アプリ内ナビゲーション分析ダッシュボード
 */

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";

import { ScreenContainer } from "@/components/organisms/screen-container";
import { color } from "@/theme/tokens";
import {
  getNavigationLog,
  getNavigationStats,
  clearNavigationLog,
  type NavigationEvent,
  type NavigationStats,
} from "@/hooks/use-navigation-tracking";
import { navigateBack } from "@/lib/navigation";

export default function NavigationDashboard() {
  const [stats, setStats] = useState<NavigationStats | null>(null);
  const [log, setLog] = useState<NavigationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, logData] = await Promise.all([getNavigationStats(), getNavigationLog()]);
      setStats(statsData);
      setLog(logData.slice(-20).reverse()); // 最新20件を表示
    } catch (error) {
      console.error("ナビゲーションデータ読み込みエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearLog = async () => {
    try {
      await clearNavigationLog();
      await loadData();
    } catch (error) {
      console.error("ログクリアエラー:", error);
    }
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return "-";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatScreenName = (path: string) => {
    // パスから画面名を抽出
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "ホーム";
    return segments[segments.length - 1];
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <ActivityIndicator size="large" color={color.accentPrimary} />
        <Text className="mt-4 text-base text-foreground">読み込み中...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={{ opacity: 0.8 }}
            activeOpacity={0.6}
          >
            <Text className="text-primary text-base">← 戻る</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">ナビゲーション分析</Text>
          <View style={{ width: 50 }} />
        </View>

        {stats && (
          <>
            {/* 統計サマリー */}
            <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">統計サマリー</Text>
              <View className="flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[120px] bg-background rounded-xl p-3">
                  <Text className="text-sm text-muted mb-1">総遷移数</Text>
                  <Text className="text-2xl font-bold text-foreground">{stats.totalTransitions}</Text>
                </View>
                <View className="flex-1 min-w-[120px] bg-background rounded-xl p-3">
                  <Text className="text-sm text-muted mb-1">ユニーク画面数</Text>
                  <Text className="text-2xl font-bold text-foreground">{stats.uniqueScreens}</Text>
                </View>
                <View className="flex-1 min-w-[120px] bg-background rounded-xl p-3">
                  <Text className="text-sm text-muted mb-1">平均滞在時間</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {formatDuration(stats.averageDuration)}
                  </Text>
                </View>
              </View>
            </View>

            {/* 最も訪問された画面 */}
            <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">最も訪問された画面</Text>
              {stats.mostVisitedScreens.slice(0, 5).map((screen, index) => (
                <View key={screen.screen} className="flex-row items-center justify-between py-2 border-b border-border">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-sm font-semibold text-primary mr-2">#{index + 1}</Text>
                    <Text className="text-sm text-foreground flex-1" numberOfLines={1}>
                      {formatScreenName(screen.screen)}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">{screen.count}回</Text>
                </View>
              ))}
            </View>

            {/* 遷移マトリックス */}
            <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">主要な画面遷移</Text>
              {Object.entries(stats.transitionMatrix)
                .flatMap(([from, toScreens]) =>
                  Object.entries(toScreens).map(([to, count]) => ({ from, to, count }))
                )
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map((transition, index) => (
                  <View key={`${transition.from}-${transition.to}-${index}`} className="py-2 border-b border-border">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-xs text-muted">
                          {formatScreenName(transition.from)} →{" "}
                          {formatScreenName(transition.to)}
                        </Text>
                      </View>
                      <Text className="text-sm font-semibold text-foreground ml-2">
                        {transition.count}回
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          </>
        )}

        {/* 最近の遷移履歴 */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-foreground">最近の遷移履歴</Text>
            <TouchableOpacity
              onPress={handleClearLog}
              style={{ backgroundColor: color.danger, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
              activeOpacity={0.7}
            >
              <Text className="text-white text-xs font-semibold">ログクリア</Text>
            </TouchableOpacity>
          </View>
          {log.map((event) => (
            <View key={event.id} className="py-2 border-b border-border">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-muted">{formatTimestamp(event.timestamp)}</Text>
                <Text className="text-xs text-muted">{formatDuration(event.duration)}</Text>
              </View>
              <Text className="text-sm text-foreground">
                {event.from ? `${formatScreenName(event.from)} → ` : ""}
                {formatScreenName(event.to)}
              </Text>
            </View>
          ))}
          {log.length === 0 && (
            <Text className="text-sm text-muted text-center py-4">遷移履歴がありません</Text>
          )}
        </View>

        {/* 説明 */}
        <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
          <Text className="text-sm text-muted leading-relaxed">
            このダッシュボードは、アプリ内の画面遷移を分析し、ユーザーフローを可視化します。最も訪問された画面や主要な遷移パターンを確認して、UX改善に役立ててください。
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
