/**
 * エラーログ閲覧画面
 * 
 * アプリケーションで発生したエラーを確認・管理
 */

import { ScreenContainer } from "@/components/organisms/screen-container";
import { useColors } from "@/hooks/use-colors";
import { apiGet, apiPost, apiDelete, getErrorMessage } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorLog {
  id: string;
  timestamp: string;
  category: "database" | "api" | "auth" | "twitter" | "validation" | "unknown";
  message: string;
  stack?: string;
  context?: {
    endpoint?: string;
    method?: string;
    userId?: number;
    requestBody?: any;
    query?: any;
  };
  resolved: boolean;
}

interface ErrorStats {
  total: number;
  unresolved: number;
  byCategory: Record<string, number>;
  recentErrors: number;
}

const categoryLabels: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  database: { label: "データベース", icon: "server-outline", color: "#EF4444" },
  api: { label: "API", icon: "cloud-outline", color: "#F59E0B" },
  auth: { label: "認証", icon: "lock-closed-outline", color: "#8B5CF6" },
  twitter: { label: "Twitter", icon: "logo-twitter", color: "#1DA1F2" },
  validation: { label: "バリデーション", icon: "alert-circle-outline", color: "#EC4899" },
  unknown: { label: "その他", icon: "help-circle-outline", color: "#6B7280" },
};

export default function ErrorLogsScreen() {
  const colors = useColors();
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (!showResolved) params.append("resolved", "false");
      
      const result = await apiGet<{ logs: ErrorLog[]; stats: ErrorStats }>(
        `/api/admin/errors?${params.toString()}`
      );
      
      if (result.ok && result.data) {
        setLogs(result.data.logs);
        setStats(result.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch error logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, showResolved]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLogs();
  }, [fetchLogs]);

  const handleResolve = async (errorId: string) => {
    try {
      const result = await apiPost(`/api/admin/errors/${errorId}/resolve`, {});
      if (result.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error("Failed to resolve error:", err);
    }
  };

  const handleResolveAll = async () => {
    const confirm = Platform.OS === "web"
      ? window.confirm("すべてのエラーを解決済みにしますか？")
      : true; // Native uses Alert
    
    if (Platform.OS !== "web") {
      Alert.alert(
        "確認",
        "すべてのエラーを解決済みにしますか？",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "解決済みにする",
            onPress: async () => {
              const result = await apiPost("/api/admin/errors/resolve-all", {});
              if (result.ok) {
                fetchLogs();
              }
            },
          },
        ]
      );
      return;
    }
    
    if (confirm) {
      const result = await apiPost("/api/admin/errors/resolve-all", {});
      if (result.ok) {
        fetchLogs();
      }
    }
  };

  const handleClearAll = async () => {
    const confirm = Platform.OS === "web"
      ? window.confirm("すべてのエラーログを削除しますか？この操作は取り消せません。")
      : true;
    
    if (Platform.OS !== "web") {
      Alert.alert(
        "確認",
        "すべてのエラーログを削除しますか？この操作は取り消せません。",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "削除",
            style: "destructive",
            onPress: async () => {
              const result = await apiDelete("/api/admin/errors");
              if (result.ok) {
                fetchLogs();
              }
            },
          },
        ]
      );
      return;
    }
    
    if (confirm) {
      const result = await apiDelete("/api/admin/errors");
      if (result.ok) {
        fetchLogs();
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted">エラーログを読み込み中...</Text>
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
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">エラーログ</Text>
          <Text className="text-sm text-muted mt-1">
            アプリケーションで発生したエラーを確認
          </Text>
        </View>

        {/* 統計サマリー */}
        {stats && (
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View className="flex-1 min-w-[100px] bg-surface p-4 rounded-lg border border-border">
              <Text className="text-2xl font-bold text-foreground">{stats.total}</Text>
              <Text className="text-xs text-muted">総エラー数</Text>
            </View>
            <View className="flex-1 min-w-[100px] bg-surface p-4 rounded-lg border border-border">
              <Text className="text-2xl font-bold text-error">{stats.unresolved}</Text>
              <Text className="text-xs text-muted">未解決</Text>
            </View>
            <View className="flex-1 min-w-[100px] bg-surface p-4 rounded-lg border border-border">
              <Text className="text-2xl font-bold text-warning">{stats.recentErrors}</Text>
              <Text className="text-xs text-muted">直近1時間</Text>
            </View>
          </View>
        )}

        {/* カテゴリフィルター */}
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setSelectedCategory(null)}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: !selectedCategory ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: !selectedCategory ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: !selectedCategory ? "#fff" : colors.foreground }}>
                  すべて
                </Text>
              </Pressable>
              {Object.entries(categoryLabels).map(([key, { label, color }]) => (
                <Pressable
                  key={key}
                  onPress={() => setSelectedCategory(key)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: selectedCategory === key ? color : colors.surface,
                    borderWidth: 1,
                    borderColor: selectedCategory === key ? color : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: selectedCategory === key ? "#fff" : colors.foreground }}>
                    {label} {stats?.byCategory[key] ? `(${stats.byCategory[key]})` : ""}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* オプション */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => setShowResolved(!showResolved)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons
              name={showResolved ? "checkbox" : "square-outline"}
              size={20}
              color={colors.primary}
            />
            <Text className="ml-2 text-foreground">解決済みも表示</Text>
          </Pressable>
          
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleResolveAll}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: colors.success + "20",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: colors.success, fontSize: 12 }}>すべて解決</Text>
            </Pressable>
            <Pressable
              onPress={handleClearAll}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: colors.error + "20",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: colors.error, fontSize: 12 }}>すべて削除</Text>
            </Pressable>
          </View>
        </View>

        {/* エラーリスト */}
        {logs.length === 0 ? (
          <View className="bg-surface rounded-xl p-8 items-center border border-border">
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text className="text-lg font-semibold text-foreground mt-4">
              エラーはありません
            </Text>
            <Text className="text-muted text-center mt-2">
              システムは正常に動作しています
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {logs.map((log) => {
              const category = categoryLabels[log.category] || categoryLabels.unknown;
              const isExpanded = expandedId === log.id;
              
              return (
                <Pressable
                  key={log.id}
                  onPress={() => setExpandedId(isExpanded ? null : log.id)}
                  style={({ pressed }) => ({
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: log.resolved ? colors.border : category.color + "40",
                    borderLeftWidth: 4,
                    borderLeftColor: category.color,
                    opacity: pressed ? 0.95 : log.resolved ? 0.7 : 1,
                  })}
                >
                  <View className="p-4">
                    {/* ヘッダー */}
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <Ionicons name={category.icon} size={16} color={category.color} />
                        <Text
                          className="ml-2 text-xs font-medium"
                          style={{ color: category.color }}
                        >
                          {category.label}
                        </Text>
                        {log.resolved && (
                          <View
                            className="ml-2 px-2 py-0.5 rounded"
                            style={{ backgroundColor: colors.success + "20" }}
                          >
                            <Text className="text-xs" style={{ color: colors.success }}>
                              解決済み
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-muted">{formatDate(log.timestamp)}</Text>
                    </View>

                    {/* メッセージ */}
                    <Text
                      className="text-foreground"
                      numberOfLines={isExpanded ? undefined : 2}
                    >
                      {log.message}
                    </Text>

                    {/* コンテキスト */}
                    {log.context?.endpoint && (
                      <Text className="text-xs text-muted mt-2">
                        {log.context.method || "GET"} {log.context.endpoint}
                      </Text>
                    )}

                    {/* 展開時の詳細 */}
                    {isExpanded && (
                      <View className="mt-4 pt-4 border-t border-border">
                        {/* スタックトレース */}
                        {log.stack && (
                          <View className="mb-4">
                            <Text className="text-xs font-semibold text-muted mb-1">
                              スタックトレース
                            </Text>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={true}
                            >
                              <Text
                                className="text-xs font-mono text-muted"
                                style={{ maxWidth: 600 }}
                              >
                                {log.stack}
                              </Text>
                            </ScrollView>
                          </View>
                        )}

                        {/* リクエスト情報 */}
                        {log.context && (
                          <View className="mb-4">
                            <Text className="text-xs font-semibold text-muted mb-1">
                              リクエスト情報
                            </Text>
                            <Text className="text-xs font-mono text-muted">
                              {JSON.stringify(log.context, null, 2)}
                            </Text>
                          </View>
                        )}

                        {/* アクション */}
                        {!log.resolved && (
                          <Pressable
                            onPress={() => handleResolve(log.id)}
                            style={({ pressed }) => ({
                              backgroundColor: colors.success,
                              paddingVertical: 8,
                              borderRadius: 8,
                              alignItems: "center",
                              opacity: pressed ? 0.8 : 1,
                            })}
                          >
                            <Text className="text-white font-semibold">解決済みにする</Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
