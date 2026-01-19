import { Text, View, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { AppHeader } from "@/components/organisms/app-header";
import { ExportButton } from "@/components/molecules/export-button";
import type { ExportData } from "@/lib/export-stats";
import { ParticipantRanking } from "@/components/organisms/participant-ranking";

const { width: screenWidth } = Dimensions.get("window");

// 地域グループ
const regionGroups = [
  { name: "北海道", prefectures: ["北海道"], color: "#3B82F6" },
  { name: "東北", prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"], color: "#60A5FA" },
  { name: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"], color: "#EC4899" },
  { name: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"], color: "#10B981" },
  { name: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"], color: "#F59E0B" },
  { name: "中国・四国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"], color: "#8B5CF6" },
  { name: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"], color: "#EF4444" },
];

type Participation = {
  id: number;
  userId: number | null;
  displayName: string;
  username: string | null;
  profileImage: string | null;
  message: string | null;
  companionCount: number;
  contribution: number;
  prefecture: string | null;
  isAnonymous: boolean;
  createdAt: Date;
};

// 時間帯別ヒートマップコンポーネント
function TimeHeatmap({ participations }: { participations: Participation[] }) {
  // 時間帯別の参加者数を集計（0-23時）
  const hourCounts = useMemo(() => {
    const counts: number[] = Array(24).fill(0);
    participations.forEach(p => {
      const hour = new Date(p.createdAt).getHours();
      counts[hour] += p.contribution || 1;
    });
    return counts;
  }, [participations]);

  const maxCount = Math.max(...hourCounts, 1);

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        ⏰ 時間帯別参加分布
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
        {hourCounts.map((count, hour) => {
          const intensity = count / maxCount;
          return (
            <View
              key={hour}
              style={{
                width: (screenWidth - 64) / 12 - 2,
                height: 40,
                margin: 1,
                borderRadius: 4,
                backgroundColor: count > 0 
                  ? `rgba(236, 72, 153, ${0.2 + intensity * 0.8})` 
                  : "#1A1D21",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: count > 0 ? "#fff" : "#CBD5E0", fontSize: 10 }}>
                {hour}時
              </Text>
              {count > 0 && (
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                  {count}
                </Text>
              )}
            </View>
          );
        })}
      </View>
      <Text style={{ color: "#D1D5DB", fontSize: 12, textAlign: "center", marginTop: 8 }}>
        参加登録が多い時間帯ほど濃いピンクで表示
      </Text>
    </View>
  );
}

// 日別推移グラフコンポーネント
function DailyTrendChart({ participations }: { participations: Participation[] }) {
  // 日別の参加者数を集計
  const dailyData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    participations.forEach(p => {
      const date = new Date(p.createdAt).toISOString().split("T")[0];
      dateMap[date] = (dateMap[date] || 0) + (p.contribution || 1);
    });
    
    // 日付順にソート
    const sortedDates = Object.keys(dateMap).sort();
    return sortedDates.map(date => ({
      date,
      count: dateMap[date],
      cumulative: 0,
    }));
  }, [participations]);

  // 累積値を計算
  let cumulative = 0;
  dailyData.forEach(d => {
    cumulative += d.count;
    d.cumulative = cumulative;
  });

  const maxCumulative = cumulative || 1;
  const chartHeight = 120;

  if (dailyData.length === 0) {
    return (
      <View style={{ marginVertical: 16 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
          📈 参加者数推移
        </Text>
        <View style={{ backgroundColor: "#1A1D21", borderRadius: 8, padding: 24, alignItems: "center" }}>
          <Text style={{ color: "#CBD5E0" }}>まだ参加者がいません</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        📈 参加者数推移
      </Text>
      <View style={{ backgroundColor: "#1A1D21", borderRadius: 8, padding: 16 }}>
        {/* グラフエリア */}
        <View style={{ height: chartHeight, flexDirection: "row", alignItems: "flex-end" }}>
          {dailyData.map((d, index) => {
            const barHeight = (d.cumulative / maxCumulative) * chartHeight;
            return (
              <View
                key={d.date}
                style={{
                  flex: 1,
                  alignItems: "center",
                  marginHorizontal: 1,
                }}
              >
                <LinearGradient
                  colors={["#EC4899", "#8B5CF6"]}
                  style={{
                    width: "80%",
                    height: barHeight,
                    borderRadius: 4,
                  }}
                />
              </View>
            );
          })}
        </View>
        {/* X軸ラベル */}
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          {dailyData.length <= 7 ? (
            dailyData.map((d, index) => (
              <View key={d.date} style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ color: "#CBD5E0", fontSize: 8 }}>
                  {d.date.slice(5)}
                </Text>
              </View>
            ))
          ) : (
            <>
              <Text style={{ color: "#CBD5E0", fontSize: 10, flex: 1 }}>
                {dailyData[0]?.date.slice(5)}
              </Text>
              <Text style={{ color: "#CBD5E0", fontSize: 10, flex: 1, textAlign: "right" }}>
                {dailyData[dailyData.length - 1]?.date.slice(5)}
              </Text>
            </>
          )}
        </View>
        {/* 統計サマリー */}
        <View style={{ flexDirection: "row", marginTop: 16, justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#CBD5E0", fontSize: 12 }}>合計</Text>
            <Text style={{ color: "#EC4899", fontSize: 20, fontWeight: "bold" }}>{cumulative}人</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#CBD5E0", fontSize: 12 }}>日数</Text>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>{dailyData.length}日</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#CBD5E0", fontSize: 12 }}>平均/日</Text>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
              {(cumulative / dailyData.length).toFixed(1)}人
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// 地域分布円グラフコンポーネント
function RegionPieChart({ participations }: { participations: Participation[] }) {
  // 地域ごとの参加者数を集計
  const regionData = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    
    participations.forEach(p => {
      if (p.prefecture) {
        const region = regionGroups.find(r => r.prefectures.includes(p.prefecture!));
        if (region) {
          counts[region.name] = (counts[region.name] || 0) + (p.contribution || 1);
          total += p.contribution || 1;
        }
      }
    });

    return regionGroups.map(region => ({
      name: region.name,
      count: counts[region.name] || 0,
      color: region.color,
      percentage: total > 0 ? ((counts[region.name] || 0) / total * 100).toFixed(1) : "0",
    })).filter(r => r.count > 0).sort((a, b) => b.count - a.count);
  }, [participations]);

  const total = regionData.reduce((sum, r) => sum + r.count, 0);

  if (regionData.length === 0) {
    return (
      <View style={{ marginVertical: 16 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
          🗾 地域分布
        </Text>
        <View style={{ backgroundColor: "#1A1D21", borderRadius: 8, padding: 24, alignItems: "center" }}>
          <Text style={{ color: "#CBD5E0" }}>地域データがありません</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        🗾 地域分布
      </Text>
      <View style={{ backgroundColor: "#1A1D21", borderRadius: 8, padding: 16 }}>
        {/* 横棒グラフ */}
        {regionData.map((region, index) => (
          <View key={region.name} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: "#fff", fontSize: 14 }}>{region.name}</Text>
              <Text style={{ color: "#D1D5DB", fontSize: 14 }}>
                {region.count}人 ({region.percentage}%)
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: "#2D3139", borderRadius: 4, overflow: "hidden" }}>
              <View
                style={{
                  height: "100%",
                  width: `${(region.count / total) * 100}%`,
                  backgroundColor: region.color,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        ))}
        {/* 合計 */}
        <View style={{ borderTopWidth: 1, borderTopColor: "#2D3139", paddingTop: 12, marginTop: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#D1D5DB", fontSize: 14 }}>合計</Text>
            <Text style={{ color: "#EC4899", fontSize: 16, fontWeight: "bold" }}>{total}人</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// 都道府県別ランキング
function PrefectureRanking({ participations }: { participations: Participation[] }) {
  const prefectureData = useMemo(() => {
    const counts: Record<string, number> = {};
    participations.forEach(p => {
      if (p.prefecture) {
        counts[p.prefecture] = (counts[p.prefecture] || 0) + (p.contribution || 1);
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [participations]);

  if (prefectureData.length === 0) {
    return null;
  }

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        🏆 都道府県別ランキング TOP10
      </Text>
      <View style={{ backgroundColor: "#1A1D21", borderRadius: 8, padding: 16 }}>
        {prefectureData.map((pref, index) => (
          <View
            key={pref.name}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: index < prefectureData.length - 1 ? 1 : 0,
              borderBottomColor: "#2D3139",
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#2D3139",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ color: index < 3 ? "#000" : "#fff", fontSize: 12, fontWeight: "bold" }}>
                {index + 1}
              </Text>
            </View>
            <Text style={{ color: "#fff", fontSize: 14, flex: 1 }}>{pref.name}</Text>
            <Text style={{ color: "#EC4899", fontSize: 16, fontWeight: "bold" }}>{pref.count}人</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// 統計サマリーカード
function StatsSummary({ challenge, participations }: { challenge: any; participations: Participation[] }) {
  const stats = useMemo(() => {
    const total = participations.reduce((sum, p) => sum + (p.contribution || 1), 0);
    const uniqueParticipants = participations.length;
    const avgContribution = uniqueParticipants > 0 ? total / uniqueParticipants : 0;
    const withCompanions = participations.filter(p => p.companionCount > 0).length;
    const companionRate = uniqueParticipants > 0 ? (withCompanions / uniqueParticipants * 100) : 0;
    const progressRate = challenge?.goalValue ? (total / challenge.goalValue * 100) : 0;
    
    return {
      total,
      uniqueParticipants,
      avgContribution,
      withCompanions,
      companionRate,
      progressRate,
    };
  }, [challenge, participations]);

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        📊 統計サマリー
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        <View style={{ width: "48%", backgroundColor: "#1A1D21", borderRadius: 8, padding: 16, marginBottom: 8 }}>
          <Text style={{ color: "#CBD5E0", fontSize: 12 }}>総動員数</Text>
          <Text style={{ color: "#EC4899", fontSize: 24, fontWeight: "bold" }}>{stats.total}人</Text>
        </View>
        <View style={{ width: "48%", backgroundColor: "#1A1D21", borderRadius: 8, padding: 16, marginBottom: 8 }}>
          <Text style={{ color: "#CBD5E0", fontSize: 12 }}>参加者数</Text>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{stats.uniqueParticipants}人</Text>
        </View>
        <View style={{ width: "48%", backgroundColor: "#1A1D21", borderRadius: 8, padding: 16, marginBottom: 8 }}>
          <Text style={{ color: "#CBD5E0", fontSize: 12 }}>平均貢献度</Text>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{stats.avgContribution.toFixed(1)}人</Text>
        </View>
        <View style={{ width: "48%", backgroundColor: "#1A1D21", borderRadius: 8, padding: 16, marginBottom: 8 }}>
          <Text style={{ color: "#CBD5E0", fontSize: 12 }}>同伴率</Text>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{stats.companionRate.toFixed(0)}%</Text>
        </View>
        <View style={{ width: "100%", backgroundColor: "#1A1D21", borderRadius: 8, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "#CBD5E0", fontSize: 12 }}>目標達成率</Text>
            <Text style={{ color: "#EC4899", fontSize: 14, fontWeight: "bold" }}>
              {stats.progressRate.toFixed(1)}%
            </Text>
          </View>
          <View style={{ height: 12, backgroundColor: "#2D3139", borderRadius: 6, overflow: "hidden" }}>
            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: "100%",
                width: `${Math.min(stats.progressRate, 100)}%`,
                borderRadius: 6,
              }}
            />
          </View>
          <Text style={{ color: "#D1D5DB", fontSize: 12, textAlign: "center", marginTop: 4 }}>
            {stats.total} / {challenge?.goalValue || 0} {challenge?.goalUnit || "人"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  // チャレンジ詳細を取得
  const { data: challenge, isLoading: challengeLoading } = trpc.events.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  // 参加者一覧を取得
  const { data: participations = [], isLoading: participationsLoading } = trpc.participations.listByEvent.useQuery(
    { eventId: Number(id) },
    { enabled: !!id }
  );

  const isLoading = challengeLoading || participationsLoading;

  // 主催者かどうかチェック
  const isHost = user && challenge && (user.id === challenge.hostUserId);

  if (isLoading) {
    return (
      <ScreenContainer className="p-4">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#D1D5DB" }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!challenge) {
    return (
      <ScreenContainer className="p-4">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#D1D5DB" }}>チャレンジが見つかりません</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16, padding: 12 }}
          >
            <Text style={{ color: "#EC4899" }}>戻る</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* ヘッダー */}
        <AppHeader 
          title="君斗りんくの動員ちゃれんじ" 
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
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                統計ダッシュボード
              </Text>
              <Text style={{ color: "#D1D5DB", fontSize: 14 }} numberOfLines={1}>
                {challenge.title}
              </Text>
            </View>
            {/* エクスポートボタン（主催者のみ） */}
            {isHost && (
              <ExportButton
                data={{
                  challenge: {
                    id: challenge.id,
                    title: challenge.title,
                    hostName: challenge.hostName || "",
                    goalValue: challenge.goalValue,
                    goalUnit: challenge.goalUnit || "人",
                    startDate: new Date(challenge.eventDate),
                    endDate: new Date(challenge.eventDate),
                  },
                  participations: participations.map(p => ({
                    ...p,
                    createdAt: new Date(p.createdAt),
                  })),
                  exportDate: new Date(),
                }}
              />
            )}
          </View>
        </View>

        {/* 主催者限定メッセージ */}
        {!isHost && (
          <View style={{ backgroundColor: "#1A1D21", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: "#F59E0B", fontSize: 14 }}>
              ⚠️ 一部の詳細データは主催者のみ閲覧できます
            </Text>
          </View>
        )}

        {/* 統計サマリー */}
        <StatsSummary challenge={challenge} participations={participations} />

        {/* 日別推移グラフ */}
        <DailyTrendChart participations={participations} />

        {/* 地域分布 */}
        <RegionPieChart participations={participations} />

        {/* 都道府県別ランキング */}
        <PrefectureRanking participations={participations} />

        {/* 時間帯別ヒートマップ */}
        <TimeHeatmap participations={participations} />

        {/* 参加者ランキング */}
        {participations.length > 0 && (
          <ParticipantRanking
            participants={participations.map(p => ({
              ...p,
              createdAt: new Date(p.createdAt),
            }))}
            maxDisplay={15}
            showBadges={true}
            title="貢献ランキング"
          />
        )}

        {/* 余白 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
