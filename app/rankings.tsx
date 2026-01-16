import { FlatList, Text, View, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/app-header";

type PeriodType = "weekly" | "monthly" | "all";

const periodLabels: Record<PeriodType, string> = {
  weekly: "週間",
  monthly: "月間",
  all: "累計",
};

const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function RankingsScreen() {
  const router = useRouter();
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
    <ScreenContainer containerClassName="bg-[#0D1117]">
      {/* ヘッダー */}
      <AppHeader 
        title="動員ちゃれんじ" 
        showCharacters={false}
        rightElement={
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>戻る</Text>
          </TouchableOpacity>
        }
      />
      <View style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2D3139",
      }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
          ランキング
        </Text>
      </View>

      {/* タブ切り替え */}
      <View style={{ 
        flexDirection: "row", 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        gap: 8,
      }}>
        <TouchableOpacity
          onPress={() => setTab("contribution")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: tab === "contribution" ? "#DD6500" : "#1A1D21",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: tab === "contribution" ? "bold" : "normal" }}>
            貢献度
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("hosts")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: tab === "hosts" ? "#DD6500" : "#1A1D21",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: tab === "hosts" ? "bold" : "normal" }}>
            ホスト
          </Text>
        </TouchableOpacity>
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
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: period === p ? "#EC4899" : "#2D3139",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13 }}>
                {periodLabels[p]}
              </Text>
            </TouchableOpacity>
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
          backgroundColor: "#1A1D21",
          borderWidth: 1,
          borderColor: "#DD6500",
        }}>
          <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 4 }}>
            あなたの順位
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#DD6500", fontSize: 32, fontWeight: "bold" }}>
                {myPosition.position || "-"}
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 4 }}>位</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#EC4899", fontSize: 20, fontWeight: "bold" }}>
                {myPosition.totalContribution?.toLocaleString() || 0}
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>貢献度</Text>
            </View>
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      ) : data && data.length > 0 ? (
        <FlatList
          data={data as any[]}
          keyExtractor={(item: any, index) => `${item.userId || item.hostUserId}-${index}`}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#2D3139",
            }}>
              {/* 順位 */}
              <View style={{ width: 40, alignItems: "center" }}>
                {index < 3 ? (
                  <LinearGradient
                    colors={index === 0 ? ["#FFD700", "#FFA500"] : index === 1 ? ["#C0C0C0", "#A0A0A0"] : ["#CD7F32", "#8B4513"]}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                      {index + 1}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={{ color: "#9CA3AF", fontSize: 16, fontWeight: "bold" }}>
                    {index + 1}
                  </Text>
                )}
              </View>
              
              {/* プロフィール */}
              {item.userImage ? (
                <Image
                  source={{ uri: item.userImage || undefined }}
                  style={{ width: 48, height: 48, borderRadius: 24, marginLeft: 8 }}
                />
              ) : (
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginLeft: 8,
                  backgroundColor: "#EC4899",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                    {(item.userName || "?")[0]}
                  </Text>
                </View>
              )}
              
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  {item.userName || "匿名"}
                </Text>
                {tab === "hosts" && (
                  <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>
                    {item.participationCount || 0} 回参加
                  </Text>
                )}
              </View>
              
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#EC4899", fontSize: 18, fontWeight: "bold" }}>
                  {(item.totalContribution || 0).toLocaleString()}
                </Text>
                <Text style={{ color: "#9CA3AF", fontSize: 10 }}>
                  {tab === "contribution" ? "貢献度" : "総動員数"}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DD6500" />
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
          <MaterialIcons name="leaderboard" size={64} color="#4B5563" />
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>
            まだランキングデータがありません
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center" }}>
            チャレンジに参加して貢献度を上げましょう
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
