import { FlatList, Text, View, Pressable, RefreshControl, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { color, palette } from "@/theme/tokens";
import { Image } from "expo-image";
import { navigateBack } from "@/lib/navigation/app-routes";
import { useState } from "react";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/organisms/app-header";

type PeriodType = "weekly" | "monthly" | "all";

// ランキングアイテムの型（実際のAPIレスポンスに合わせる）
type ContributionRankingItem = {
  userId: number | null;
  userName: string | null;
  userImage: string | null;
  totalContribution: number;
  participationCount: number;
};

type HostRankingItem = {
  hostUserId: number | null;
  hostName: string;
  hostProfileImage: string | null;
  totalParticipants: number;
  challengeCount: number;
  avgAchievementRate: number;
};

type RankingItem = ContributionRankingItem | HostRankingItem;

const periodLabels: Record<PeriodType, string> = {
  weekly: "週間",
  monthly: "月間",
  all: "累計",
};

const rankColors = [color.rankGold, color.rankSilver, color.rankBronze];

export default function RankingsScreen() {

  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [tab, setTab] = useState<"contribution" | "hosts">("contribution");
  
  const { data: contributionRanking, isLoading: contributionLoading, refetch: refetchContribution } = 
    trpc.rankings.contribution.useQuery({ period, limit: 50 });
  const { data: hostRanking, isLoading: hostLoading, refetch: refetchHost } = 
    trpc.rankings.hosts.useQuery({ limit: 50 });
  const { data: myPosition } = trpc.rankings.myPosition.useQuery(
    { period },
    { enabled: !!user }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (tab === "contribution") {
      await refetchContribution();
    } else {
      await refetchHost();
    }
    setRefreshing(false);
  };

  const isLoading = tab === "contribution" ? contributionLoading : hostLoading;
  const data = tab === "contribution" ? contributionRanking : hostRanking;

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* ヘッダー */}
      <AppHeader 
        title="君斗りんくの動員ちゃれんじ" 
        showCharacters={false}
        rightElement={
          <Pressable
            onPress={() => navigateBack()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <MaterialIcons name="arrow-back" size={24} color={color.textWhite} />
            <Text style={{ color: color.textWhite, marginLeft: 8 }}>戻る</Text>
          </Pressable>
        }
      />
      <View style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: color.border,
      }}>
        <Text style={{ color: color.textWhite, fontSize: 18, fontWeight: "bold" }}>
          ランキング
        </Text>
        <Text style={{ color: "#A0AEC0", fontSize: 12, marginTop: 4 }}>
          チャレンジへの参加・貢献でポイントを獲得して上位を目指そう
        </Text>
      </View>

      {/* タブ切り替え */}
      <View style={{ 
        flexDirection: "row", 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        gap: 8,
      }}>
        <Pressable
          onPress={() => setTab("contribution")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: tab === "contribution" ? color.hostAccentLegacy : color.surface,
            alignItems: "center",
          }}
        >
          <Text style={{ color: color.textWhite, fontWeight: tab === "contribution" ? "bold" : "normal" }}>
            貢献度
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("hosts")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: tab === "hosts" ? color.hostAccentLegacy : color.surface,
            alignItems: "center",
          }}
        >
          <Text style={{ color: color.textWhite, fontWeight: tab === "hosts" ? "bold" : "normal" }}>
            主催者
          </Text>
        </Pressable>
      </View>

      {/* タブ説明 */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ color: color.textSubtle, fontSize: 11 }}>
          {tab === "contribution" 
            ? "貢献度: チャレンジへの参加・同伴・拡散で獲得したポイントのランキング"
            : "主催者: チャレンジを作成した人の総参加予定数ランキング"}
        </Text>
      </View>

      {/* 期間フィルター（貢献度タブのみ） */}
      {tab === "contribution" && (
        <View style={{ 
          flexDirection: "row", 
          paddingHorizontal: 16, 
          paddingBottom: 12,
          gap: 8,
        }}>
          {(["weekly", "monthly", "all"] as PeriodType[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: period === p ? color.accentPrimary : color.border,
              }}
            >
              <Text style={{ color: color.textWhite, fontSize: 13 }}>
                {periodLabels[p]}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* 自分の順位 */}
      {user && myPosition && tab === "contribution" && (
        <View style={{
          marginHorizontal: 16,
          marginBottom: 12,
          padding: 16,
          borderRadius: 12,
          backgroundColor: color.surface,
          borderWidth: 1,
          borderColor: color.hostAccentLegacy,
        }}>
          <Text style={{ color: color.textMuted, fontSize: 12, marginBottom: 4 }}>
            あなたの順位
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: color.hostAccentLegacy, fontSize: 32, fontWeight: "bold" }}>
                {myPosition.position || "-"}
              </Text>
              <Text style={{ color: color.textMuted, fontSize: 14, marginLeft: 4 }}>位</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: color.accentPrimary, fontSize: 20, fontWeight: "bold" }}>
                {myPosition.totalContribution?.toLocaleString() || 0}
              </Text>
              <Text style={{ color: color.textMuted, fontSize: 12 }}>貢献度</Text>
            </View>
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: color.textMuted }}>読み込み中...</Text>
        </View>
      ) : data && data.length > 0 ? (
        <FlatList
          data={data as RankingItem[]}
          keyExtractor={(item, index) => `${(item as ContributionRankingItem).userId || (item as HostRankingItem).hostUserId || index}-${index}`}
          renderItem={({ item, index }: { item: RankingItem; index: number }) => (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: color.border,
            }}>
              {/* 順位 */}
              <View style={{ width: 40, alignItems: "center" }}>
                {index < 3 ? (
                  <LinearGradient
                    colors={index === 0 ? [color.rankGold, "#FFA500"] : index === 1 ? [color.rankSilver, "#A0A0A0"] : [color.rankBronze, "#8B4513"]}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: color.textWhite, fontSize: 16, fontWeight: "bold" }}>
                      {index + 1}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={{ color: color.textMuted, fontSize: 16, fontWeight: "bold" }}>
                    {index + 1}
                  </Text>
                )}
              </View>
              
              {/* プロフィール */}
              {((item as ContributionRankingItem).userImage || (item as HostRankingItem).hostProfileImage) ? (
                <Image
                  source={{ uri: (item as ContributionRankingItem).userImage || (item as HostRankingItem).hostProfileImage || undefined }}
                  style={{ width: 48, height: 48, borderRadius: 24, marginLeft: 8 }}
                />
              ) : (
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginLeft: 8,
                  backgroundColor: color.accentPrimary,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ color: color.textWhite, fontSize: 20, fontWeight: "bold" }}>
                    {((item as ContributionRankingItem).userName || (item as HostRankingItem).hostName || "?")[0]}
                  </Text>
                </View>
              )}
              
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: color.textWhite, fontSize: 16, fontWeight: "600" }}>
                  {(item as ContributionRankingItem).userName || (item as HostRankingItem).hostName || "匿名"}
                </Text>
                {tab === "hosts" && (
                  <Text style={{ color: color.textMuted, fontSize: 12, marginTop: 2 }}>
                    {(item as ContributionRankingItem).participationCount || 0} 回参加
                  </Text>
                )}
              </View>
              
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: color.accentPrimary, fontSize: 18, fontWeight: "bold" }}>
                  {((item as ContributionRankingItem).totalContribution || (item as HostRankingItem).totalParticipants || 0).toLocaleString()}
                </Text>
                <Text style={{ color: color.textMuted, fontSize: 10 }}>
                  {tab === "contribution" ? "貢献度" : "総参加予定数"}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.hostAccentLegacy} />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          // パフォーマンス最適化
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={Platform.OS !== "web"}
          updateCellsBatchingPeriod={50}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <MaterialIcons name="leaderboard" size={64} color={color.textSubtle} />
          <Text style={{ color: color.textWhite, fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>
            まだランキングデータがありません
          </Text>
          <Text style={{ color: color.textMuted, fontSize: 14, textAlign: "center" }}>
            チャレンジに参加して貢献度を上げましょう
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
