/**
 * 運営管理者ダッシュボード
 * 
 * サイト全体を管理するための管理画面
 * アクセス制限: 特定のTwitterアカウント（管理者）のみ
 */

import { ScreenContainer } from "@/components/organisms/screen-container";
import { AppHeader } from "@/components/organisms/app-header";
import { color, palette } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { navigate } from "@/lib/navigation/app-routes";

// 管理者のTwitter ID
const ADMIN_TWITTER_IDS = [
  "kimito_link", // 君斗りんく
];

interface StatCard {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  path?: string;
}

export default function AdminDashboard() {
  const colors = useColors();
  const { user, loading: authLoading } = useAuth();

  const handleHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // 管理者チェック
  const isAdmin = user?.username && ADMIN_TWITTER_IDS.includes(user.username);

  // 統計データを取得
  const { data: challenges, isLoading: loadingChallenges } = trpc.events.list.useQuery();
  const { data: categories, isLoading: loadingCategories } = trpc.categories.list.useQuery();

  const stats: StatCard[] = [
    {
      title: "チャレンジ数",
      value: challenges?.length ?? 0,
      icon: "trophy-outline",
      color: colors.primary,
      path: "/admin/challenges",
    },
    {
      title: "カテゴリ数",
      value: categories?.length ?? 0,
      icon: "pricetags-outline",
      color: colors.success,
      path: "/admin/categories",
    },
    {
      title: "公開中",
      value: challenges?.filter((c: any) => c.isPublic).length ?? 0,
      icon: "eye-outline",
      color: color.info,
    },
    {
      title: "非公開",
      value: challenges?.filter((c: any) => !c.isPublic).length ?? 0,
      icon: "eye-off-outline",
      color: colors.muted,
    },
  ];

  const isLoading = loadingChallenges || loadingCategories;

  // ローディング中
  if (authLoading) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <AppHeader title="管理ダッシュボード" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={color.hostAccentLegacy} />
        </View>
      </ScreenContainer>
    );
  }

  // 未ログイン
  if (!user) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <AppHeader title="管理ダッシュボード" />
        <View className="flex-1 items-center justify-center p-8">
          <MaterialIcons name="lock" size={64} color={colors.muted} />
          <Text className="text-xl font-bold text-foreground mt-4 mb-2">
            ログインが必要です
          </Text>
          <Text className="text-sm text-muted text-center mb-6">
            管理画面にアクセスするにはログインしてください
          </Text>
          <Pressable
            onPress={() => {
              handleHaptic();
              navigate.toMypageTab();
            }}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">ログインする</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // 管理者でない
  if (!isAdmin) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <AppHeader title="管理ダッシュボード" />
        <View className="flex-1 items-center justify-center p-8">
          <MaterialIcons name="block" size={64} color={colors.error} />
          <Text className="text-xl font-bold text-foreground mt-4 mb-2">
            アクセス権限がありません
          </Text>
          <Text className="text-sm text-muted text-center mb-6">
            この画面は運営管理者のみアクセスできます
          </Text>
          <Pressable
            onPress={() => {
              handleHaptic();
              navigate.toHome();
            }}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">ホームに戻る</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <AppHeader title="管理ダッシュボード" />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* 管理者バッジ */}
        <View 
          className="flex-row items-center self-start px-3 py-2 rounded-lg mb-6 gap-2"
          style={{ backgroundColor: `${color.rankGold}20`, borderWidth: 1, borderColor: color.rankGold }}
        >
          <MaterialIcons name="admin-panel-settings" size={20} color={color.rankGold} />
          <Text style={{ color: color.rankGold, fontWeight: "600" }}>
            管理者: @{user.username}
          </Text>
        </View>

        {/* ヘッダー */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">ダッシュボード</Text>
          <Text className="text-sm text-muted mt-1">システム全体の概要</Text>
        </View>

        {/* 統計カード */}
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4 text-muted">読み込み中...</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-4 mb-6">
            {stats.map((stat, index) => (
              <Pressable
                key={index}
                onPress={() => stat.path && navigate.toAdminPath(stat.path)}
                style={({ pressed }) => ({
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed && stat.path ? 0.8 : 1,
                })}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                  {stat.path && (
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                  )}
                </View>
                <Text className="text-3xl font-bold text-foreground">{stat.value}</Text>
                <Text className="text-sm text-muted mt-1">{stat.title}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* クイックアクション */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">クイックアクション</Text>
          <View className="gap-3">
            <Pressable
              onPress={() => navigate.toAdminPath("/admin/system")}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Ionicons name="server-outline" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">システム状態を確認</Text>
                <Text className="text-sm text-muted">DB接続、API状況を確認</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => navigate.toAdminPath("/admin/categories")}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.success + "20" }}
              >
                <Ionicons name="pricetags-outline" size={20} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">カテゴリを管理</Text>
                <Text className="text-sm text-muted">カテゴリの追加・編集・削除</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => navigate.toAdminPath("/admin/challenges")}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: color.info + "20" }}
              >
                <Ionicons name="trophy-outline" size={20} color={color.info} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">チャレンジを管理</Text>
                <Text className="text-sm text-muted">チャレンジの編集・公開設定</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => navigate.toApiUsage()}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.warning + "20" }}
              >
                <Ionicons name="analytics-outline" size={20} color={colors.warning} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">API使用量を確認</Text>
                <Text className="text-sm text-muted">Twitter APIのレート制限を監視</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* 最近のチャレンジ */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-3">最近のチャレンジ</Text>
          {challenges && challenges.length > 0 ? (
            <View className="gap-2">
              {challenges.slice(0, 5).map((challenge: any) => (
                <View
                  key={challenge.id}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-foreground flex-1" numberOfLines={1}>
                      {challenge.title}
                    </Text>
                    <View
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: challenge.isPublic
                          ? colors.success + "20"
                          : colors.muted + "20",
                      }}
                    >
                      <Text
                        className="text-xs"
                        style={{
                          color: challenge.isPublic ? colors.success : colors.muted,
                        }}
                      >
                        {challenge.isPublic ? "公開" : "非公開"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-muted mt-1">
                    {challenge.hostName} • {new Date(challenge.eventDate).toLocaleDateString("ja-JP")}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-8 items-center border border-border">
              <Ionicons name="trophy-outline" size={48} color={colors.muted} />
              <Text className="text-muted mt-2">チャレンジがありません</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
