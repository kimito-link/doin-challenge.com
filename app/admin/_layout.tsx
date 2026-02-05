/**
 * 管理画面レイアウト
 * 
 * サイドバー付きの管理画面専用レイアウト
 * 管理者のみアクセス可能
 */

import { Stack, usePathname } from "expo-router";
import { navigate, navigateReplace } from "@/lib/navigation";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { palette } from "@/theme/tokens";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "ダッシュボード", icon: "grid-outline", path: "/admin" },
  { id: "system", label: "システム状態", icon: "server-outline", path: "/admin/system" },
  { id: "data-integrity", label: "データ整合性", icon: "checkmark-done-circle-outline", path: "/admin/data-integrity" },
  { id: "errors", label: "エラーログ", icon: "bug-outline", path: "/admin/errors" },
  { id: "categories", label: "カテゴリ管理", icon: "pricetags-outline", path: "/admin/categories" },
  { id: "challenges", label: "チャレンジ管理", icon: "trophy-outline", path: "/admin/challenges" },
  { id: "users", label: "ユーザー管理", icon: "people-outline", path: "/admin/users" },
  { id: "api-usage", label: "API使用量", icon: "analytics-outline", path: "/admin/api-usage" },
  { id: "release-notes", label: "リリースノート", icon: "document-text-outline", path: "/admin/release-notes" },
  { id: "components", label: "コンポーネント", icon: "cube-outline", path: "/admin/component-gallery" },
  { id: "participations", label: "参加管理", icon: "chatbubbles-outline", path: "/admin/participations" },
];

export default function AdminLayout() {
  const colors = useColors();
  
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(Platform.OS === "web");

  // ローディング中
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted">読み込み中...</Text>
      </View>
    );
  }

  // 未ログインまたは管理者以外
  if (!user || user.role !== "admin") {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Ionicons name="lock-closed" size={64} color={colors.muted} />
        <Text className="text-xl font-bold text-foreground mt-4">アクセス権限がありません</Text>
        <Text className="text-muted text-center mt-2">
          この画面は管理者のみアクセスできます
        </Text>
        <Pressable
          onPress={() => navigateReplace.toHomeRoot()}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 24,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text className="text-white font-semibold">ホームに戻る</Text>
        </Pressable>
      </View>
    );
  }

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname.startsWith(path);
  };

  return (
    <View className="flex-1 flex-row bg-background">
      {/* サイドバー（PC/タブレット） */}
      {sidebarOpen && (
        <View
          className="bg-surface border-r border-border"
          style={{
            width: 260,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          {/* ヘッダー */}
          <View className="p-4 border-b border-border">
            <Text className="text-lg font-bold text-foreground">管理画面</Text>
            <Text className="text-xs text-muted mt-1">動員ちゃれんじ Admin</Text>
          </View>

          {/* メニュー */}
          <ScrollView className="flex-1">
            <View className="p-2">
              {menuItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => navigate.toAdminPath(item.path)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 4,
                    backgroundColor: isActive(item.path)
                      ? colors.primary + "20"
                      : pressed
                      ? colors.border
                      : "transparent",
                  })}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isActive(item.path) ? colors.primary : colors.muted}
                  />
                  <Text
                    className="ml-3"
                    style={{
                      color: isActive(item.path) ? colors.primary : colors.foreground,
                      fontWeight: isActive(item.path) ? "600" : "400",
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* フッター */}
          <View className="p-4 border-t border-border">
            <Pressable
              onPress={() => navigateReplace.toHomeRoot()}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderRadius: 8,
                backgroundColor: pressed ? colors.border : "transparent",
              })}
            >
              <Ionicons name="arrow-back" size={20} color={colors.muted} />
              <Text className="ml-3 text-muted">アプリに戻る</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* メインコンテンツ */}
      <View className="flex-1">
        {/* モバイル用ヘッダー */}
        {!sidebarOpen && (
          <View
            className="flex-row items-center justify-between px-4 py-3 bg-surface border-b border-border"
            style={{ paddingTop: insets.top + 12 }}
          >
            <Pressable
              onPress={() => setSidebarOpen(true)}
              style={({ pressed }) => ({
                padding: 8,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="menu" size={24} color={colors.foreground} />
            </Pressable>
            <Text className="text-lg font-bold text-foreground">管理画面</Text>
            <Pressable
              onPress={() => navigateReplace.toHomeRoot()}
              style={({ pressed }) => ({
                padding: 8,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>
        )}

        {/* サイドバー閉じるボタン（PC） */}
        {sidebarOpen && Platform.OS === "web" && (
          <Pressable
            onPress={() => setSidebarOpen(false)}
            style={({ pressed }) => ({
              position: "absolute",
              top: insets.top + 12,
              right: 12,
              padding: 8,
              zIndex: 10,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={24} color={colors.muted} />
          </Pressable>
        )}

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </View>

      {/* モバイル用オーバーレイ */}
      {sidebarOpen && Platform.OS !== "web" && (
        <Pressable
          onPress={() => setSidebarOpen(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 260,
            right: 0,
            bottom: 0,
            backgroundColor: palette.gray900 + "80", // rgba(0,0,0,0.5) の透明度16進数
          }}
        />
      )}
    </View>
  );
}
