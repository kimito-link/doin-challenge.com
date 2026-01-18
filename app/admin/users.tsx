/**
 * ユーザー管理画面
 * 
 * ユーザーの一覧・権限管理
 */

import { ScreenContainer } from "@/components/organisms/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
  createdAt: Date;
  role: "user" | "admin";
}

export default function UsersScreen() {
  const colors = useColors();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ユーザー一覧を取得
  const { data: users, isLoading, refetch, error } = trpc.admin.users.useQuery(undefined, {
    retry: false,
  });

  // ユーザー権限変更
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedUser(null);
      if (Platform.OS === "web") {
        window.alert("ユーザー権限を更新しました");
      } else {
        Alert.alert("成功", "ユーザー権限を更新しました");
      }
    },
    onError: (err) => {
      if (Platform.OS === "web") {
        window.alert(`エラー: ${err.message}`);
      } else {
        Alert.alert("エラー", err.message);
      }
    },
  });

  const handleRoleChange = (userId: number, newRole: "user" | "admin") => {
    const confirmMessage = newRole === "admin" 
      ? "このユーザーを管理者に昇格しますか？" 
      : "このユーザーの管理者権限を削除しますか？";
    
    if (Platform.OS === "web") {
      if (window.confirm(confirmMessage)) {
        updateRoleMutation.mutate({ userId, role: newRole });
      }
    } else {
      Alert.alert(
        "確認",
        confirmMessage,
        [
          { text: "キャンセル", style: "cancel" },
          { text: "OK", onPress: () => updateRoleMutation.mutate({ userId, role: newRole }) },
        ]
      );
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
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
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* ヘッダー */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">ユーザー管理</Text>
          <Text className="text-sm text-muted mt-1">
            {users?.length || 0} 人のユーザー
          </Text>
        </View>

        {error && (
          <View
            className="p-4 rounded-lg mb-4"
            style={{ backgroundColor: colors.error + "20" }}
          >
            <Text style={{ color: colors.error }}>⚠️ {error.message}</Text>
            <Text className="text-muted text-sm mt-1">
              管理者権限が必要です。ログインしているアカウントが管理者であることを確認してください。
            </Text>
          </View>
        )}

        {/* 統計 */}
        {users && users.length > 0 && (
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-muted text-sm">総ユーザー数</Text>
              <Text className="text-2xl font-bold text-foreground">{users.length}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-muted text-sm">管理者数</Text>
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {users.filter(u => u.role === "admin").length}
              </Text>
            </View>
          </View>
        )}

        {/* ユーザーリスト */}
        {users && users.length > 0 ? (
          <View className="gap-3">
            {users.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View className="bg-surface rounded-xl border border-border overflow-hidden">
                  <View className="p-4">
                    <View className="flex-row items-center">
                      {/* アバター */}
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.muted + "30" }}
                      >
                        <Ionicons name="person" size={24} color={colors.muted} />
                      </View>

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
                        <Text className="text-sm text-muted">
                          {user.email || "メールなし"} • {user.loginMethod || "不明"}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          最終ログイン: {formatDate(user.lastSignedIn)}
                        </Text>
                      </View>

                      {/* 展開アイコン */}
                      <Ionicons 
                        name={selectedUser?.id === user.id ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.muted} 
                      />
                    </View>

                    {/* 展開時の詳細 */}
                    {selectedUser?.id === user.id && (
                      <View className="mt-4 pt-4 border-t border-border">
                        <View className="gap-2">
                          <View className="flex-row">
                            <Text className="text-muted w-24">ID:</Text>
                            <Text className="text-foreground">{user.id}</Text>
                          </View>
                          <View className="flex-row">
                            <Text className="text-muted w-24">OpenID:</Text>
                            <Text className="text-foreground text-xs flex-1" numberOfLines={1}>
                              {user.openId}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text className="text-muted w-24">登録日:</Text>
                            <Text className="text-foreground">{formatDate(user.createdAt)}</Text>
                          </View>
                        </View>

                        {/* 権限変更ボタン */}
                        <View className="flex-row gap-2 mt-4">
                          {user.role === "user" ? (
                            <Pressable
                              onPress={() => handleRoleChange(user.id, "admin")}
                              disabled={updateRoleMutation.isPending}
                              style={({ pressed }) => [
                                { opacity: pressed || updateRoleMutation.isPending ? 0.7 : 1 },
                              ]}
                            >
                              <View 
                                className="px-4 py-2 rounded-lg"
                                style={{ backgroundColor: colors.primary }}
                              >
                                <Text className="text-white font-medium">
                                  {updateRoleMutation.isPending ? "処理中..." : "管理者に昇格"}
                                </Text>
                              </View>
                            </Pressable>
                          ) : (
                            <Pressable
                              onPress={() => handleRoleChange(user.id, "user")}
                              disabled={updateRoleMutation.isPending}
                              style={({ pressed }) => [
                                { opacity: pressed || updateRoleMutation.isPending ? 0.7 : 1 },
                              ]}
                            >
                              <View 
                                className="px-4 py-2 rounded-lg"
                                style={{ backgroundColor: colors.error }}
                              >
                                <Text className="text-white font-medium">
                                  {updateRoleMutation.isPending ? "処理中..." : "管理者権限を削除"}
                                </Text>
                              </View>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : !error ? (
          <View className="bg-surface rounded-xl p-8 items-center border border-border">
            <Ionicons name="people-outline" size={48} color={colors.muted} />
            <Text className="text-lg font-semibold text-foreground mt-4">
              ユーザーがいません
            </Text>
            <Text className="text-muted text-center mt-2">
              ユーザーが登録されると、ここに表示されます
            </Text>
          </View>
        ) : null}

        {/* 機能説明 */}
        <View className="mt-6 p-4 bg-surface rounded-xl border border-border">
          <Text className="font-semibold text-foreground mb-2">
            ユーザー管理機能
          </Text>
          <View className="gap-2">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text className="text-sm text-muted ml-2">ユーザー一覧の表示</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text className="text-sm text-muted ml-2">管理者権限の付与/剥奪</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-2">ユーザーの検索・フィルター（今後追加予定）</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-2">ユーザーの活動履歴（今後追加予定）</Text>
            </View>
          </View>
        </View>

        {/* 下部の余白 */}
        <View className="h-20" />
      </ScrollView>
    </ScreenContainer>
  );
}
