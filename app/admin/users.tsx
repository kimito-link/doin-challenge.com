/**
 * ユーザー管理画面
 * 
 * ユーザーの一覧・権限管理
 */

import { ScreenContainer } from "@/components/organisms/screen-container";
import { useColors } from "@/hooks/use-colors";
import { apiGet, getErrorMessage } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
  role: string | null;
  // Twitter関連
  twitterId?: string;
  twitterUsername?: string;
  twitterProfileImage?: string;
  twitterFollowersCount?: number;
}

export default function UsersScreen() {
  const colors = useColors();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      // TODO: ユーザー一覧APIを実装
      // const result = await apiGet<User[]>("/api/admin/users");
      // if (result.ok && result.data) {
      //   setUsers(result.data);
      // }
      
      // 仮のデータ
      setUsers([]);
      setError("ユーザー一覧APIは未実装です");
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err instanceof Error ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted">ユーザーを読み込み中...</Text>
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
          <Text className="text-2xl font-bold text-foreground">ユーザー管理</Text>
          <Text className="text-sm text-muted mt-1">
            {users.length} 人のユーザー
          </Text>
        </View>

        {error && (
          <View
            className="p-4 rounded-lg mb-4"
            style={{ backgroundColor: colors.warning + "20" }}
          >
            <Text style={{ color: colors.warning }}>⚠️ {error}</Text>
          </View>
        )}

        {/* ユーザーリスト */}
        {users.length > 0 ? (
          <View className="gap-3">
            {users.map((user) => (
              <View
                key={user.id}
                className="bg-surface rounded-xl border border-border overflow-hidden"
              >
                <View className="p-4">
                  <View className="flex-row items-center">
                    {/* アバター */}
                    {user.twitterProfileImage ? (
                      <Image
                        source={{ uri: user.twitterProfileImage }}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.muted + "30" }}
                      >
                        <Ionicons name="person" size={24} color={colors.muted} />
                      </View>
                    )}

                    {/* ユーザー情報 */}
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <Text className="font-semibold text-foreground">
                          {user.name || "名前未設定"}
                        </Text>
                        {user.role === "admin" && (
                          <View
                            className="ml-2 px-2 py-0.5 rounded"
                            style={{ backgroundColor: colors.primary + "20" }}
                          >
                            <Text className="text-xs" style={{ color: colors.primary }}>
                              管理者
                            </Text>
                          </View>
                        )}
                      </View>
                      {user.twitterUsername && (
                        <Text className="text-sm text-muted">
                          @{user.twitterUsername}
                        </Text>
                      )}
                      <Text className="text-xs text-muted mt-1">
                        最終ログイン: {formatDate(user.lastSignedIn)}
                      </Text>
                    </View>

                    {/* フォロワー数 */}
                    {user.twitterFollowersCount !== undefined && (
                      <View className="items-end">
                        <Text className="text-lg font-bold text-foreground">
                          {user.twitterFollowersCount.toLocaleString()}
                        </Text>
                        <Text className="text-xs text-muted">フォロワー</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-surface rounded-xl p-8 items-center border border-border">
            <Ionicons name="people-outline" size={48} color={colors.muted} />
            <Text className="text-lg font-semibold text-foreground mt-4">
              ユーザーがいません
            </Text>
            <Text className="text-muted text-center mt-2">
              ユーザーが登録されると、ここに表示されます
            </Text>
          </View>
        )}

        {/* 機能説明 */}
        <View className="mt-6 p-4 bg-surface rounded-xl border border-border">
          <Text className="font-semibold text-foreground mb-2">
            今後追加予定の機能
          </Text>
          <View className="gap-2">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-2">ユーザー一覧の表示</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-2">管理者権限の付与/剥奪</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-2">ユーザーの検索・フィルター</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-2">ユーザーの活動履歴</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
