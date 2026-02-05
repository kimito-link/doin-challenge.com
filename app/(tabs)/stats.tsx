import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { Card, CardHeader } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { color } from "@/theme/tokens";

export default function StatsScreen() {
  const { data: userStats, isLoading, isError, error, refetch } = trpc.stats.getUserStats.useQuery({
    retry: 2, // 根本的解決: 一時的なネットワークエラーに対応
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={color.hostAccentLegacy} />
        <Text style={{ color: color.textMuted, marginTop: 16 }}>統計データを読み込み中...</Text>
      </ScreenContainer>
    );
  }

  // 根本的解決: エラー状態を明確に処理
  if (isError) {
    const errorMessage = error?.message || "統計データを読み込めませんでした";
    return (
      <ScreenContainer className="p-6">
        <Text style={{ fontSize: 24, fontWeight: "bold", color: color.textWhite }}>
          統計ダッシュボード
        </Text>
        <View style={{ marginTop: 24, padding: 16, backgroundColor: `${color.danger}20`, borderRadius: 12, borderWidth: 1, borderColor: color.danger }}>
          <Text style={{ color: color.danger, fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            エラーが発生しました
          </Text>
          <Text style={{ color: color.textMuted, fontSize: 14, marginBottom: 16 }}>
            {errorMessage}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{
              backgroundColor: color.accentPrimary,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: color.textWhite, fontWeight: "600" }}>再試行</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (!userStats) {
    return (
      <ScreenContainer className="p-6">
        <Text style={{ fontSize: 24, fontWeight: "bold", color: color.textWhite }}>
          統計ダッシュボード
        </Text>
        <Text style={{ color: color.textMuted, marginTop: 16 }}>
          統計データを読み込めませんでした。
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: color.textWhite, marginBottom: 8 }}>
          統計ダッシュボード
        </Text>

        {/* サマリーカード */}
        <View style={{ gap: 16 }}>
          <Card variant="elevated" padding="lg">
            <CardHeader title="総参加数" subtitle="あなたが参加したチャレンジの総数" />
            <Text style={{ fontSize: 40, fontWeight: "bold", color: color.hostAccentLegacy, marginTop: 8 }}>
              {userStats.summary.totalChallenges}
            </Text>
          </Card>

          <Card variant="elevated" padding="lg">
            <CardHeader title="達成数" subtitle="完了したチャレンジの数" />
            <Text style={{ fontSize: 40, fontWeight: "bold", color: color.hostAccentLegacy, marginTop: 8 }}>
              {userStats.summary.completedChallenges}
            </Text>
          </Card>

          <Card variant="elevated" padding="lg">
            <CardHeader title="達成率" subtitle="チャレンジの達成率" />
            <Text style={{ fontSize: 40, fontWeight: "bold", color: color.hostAccentLegacy, marginTop: 8 }}>
              {userStats.summary.completionRate}%
            </Text>
          </Card>
        </View>

        {/* 月別統計 */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="月別アクティビティ" subtitle="過去6ヶ月の参加数推移" />
          <View style={{ marginTop: 16, gap: 12 }}>
            {userStats.monthlyStats.map((stat) => (
              <View
                key={stat.month}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: color.border,
                }}
              >
                <Text style={{ fontSize: 16, color: color.textWhite }}>{stat.month}</Text>
                <Text style={{ fontSize: 18, fontWeight: "600", color: color.hostAccentLegacy }}>
                  {stat.count}件
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* 週別アクティビティ */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="週別アクティビティ" subtitle="過去4週間の参加数推移" />
          <View style={{ marginTop: 16, gap: 12 }}>
            {userStats.weeklyActivity.map((activity) => (
              <View
                key={activity.week}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: color.border,
                }}
              >
                <Text style={{ fontSize: 16, color: color.textWhite }}>{activity.week}</Text>
                <Text style={{ fontSize: 18, fontWeight: "600", color: color.hostAccentLegacy }}>
                  {activity.count}件
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* 最近のアクティビティ */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="最近のアクティビティ" subtitle="直近10件の参加履歴" />
          <View style={{ marginTop: 16, gap: 12 }}>
            {userStats.recentActivity.map((activity) => (
              <View
                key={activity.id}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: color.border,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: color.textWhite }}>
                  {activity.eventTitle}
                </Text>
                <Text style={{ fontSize: 14, color: color.textMuted, marginTop: 4 }}>
                  {new Date(activity.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
