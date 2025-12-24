import { FlatList, Text, View, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
};

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-color.jpg");

// 目標タイプの表示名とアイコン
const goalTypeConfig: Record<string, { label: string; icon: string; unit: string }> = {
  attendance: { label: "動員", icon: "people", unit: "人" },
  followers: { label: "フォロワー", icon: "person-add", unit: "人" },
  viewers: { label: "同時視聴", icon: "visibility", unit: "人" },
  points: { label: "ポイント", icon: "star", unit: "pt" },
  custom: { label: "カスタム", icon: "flag", unit: "" },
};

// イベントタイプのバッジ
const eventTypeBadge: Record<string, { label: string; color: string }> = {
  solo: { label: "ソロ", color: "#EC4899" },
  group: { label: "グループ", color: "#8B5CF6" },
};

type Challenge = {
  id: number;
  hostName: string;
  hostUsername: string | null;
  hostProfileImage: string | null;
  hostFollowersCount: number | null;
  title: string;
  description: string | null;
  goalType: string;
  goalValue: number;
  goalUnit: string;
  currentValue: number;
  eventType: string;
  eventDate: Date;
  venue: string | null;
  prefecture: string | null;
  status: string;
};

type FilterType = "all" | "solo" | "group";

function ChallengeCard({ challenge, onPress }: { challenge: Challenge; onPress: () => void }) {
  const colors = useColors();
  const eventDate = new Date(challenge.eventDate);
  const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
  
  const progress = Math.min((challenge.currentValue / challenge.goalValue) * 100, 100);
  const goalConfig = goalTypeConfig[challenge.goalType] || goalTypeConfig.custom;
  const typeBadge = eventTypeBadge[challenge.eventType] || eventTypeBadge.solo;
  const unit = challenge.goalUnit || goalConfig.unit;
  const remaining = Math.max(challenge.goalValue - challenge.currentValue, 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: "#1A1D21",
        borderRadius: 16,
        marginHorizontal: 8,
        marginVertical: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2D3139",
        width: "47%",
      }}
    >
      {/* タイプバッジ */}
      <View style={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}>
        <View
          style={{
            backgroundColor: typeBadge.color,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
            {typeBadge.label}
          </Text>
        </View>
      </View>

      {/* ヘッダー画像エリア */}
      <LinearGradient
        colors={["#EC4899", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 60, justifyContent: "flex-end", paddingHorizontal: 12, paddingBottom: 8 }}
      >
        {/* 目標タイプアイコン */}
        <View style={{ position: "absolute", top: 8, right: 8 }}>
          <MaterialIcons name={goalConfig.icon as any} size={16} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>

      <View style={{ padding: 12 }}>
        {/* タイトル */}
        <Text
          style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginBottom: 4 }}
          numberOfLines={2}
        >
          {challenge.title}
        </Text>

        {/* ホスト名 */}
        <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>
          {challenge.hostName}
        </Text>

        {/* 進捗表示 */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              {challenge.currentValue}
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}> / {challenge.goalValue}{unit}</Text>
            </Text>
          </View>
          
          {/* 進捗バー */}
          <View
            style={{
              height: 6,
              backgroundColor: "#2D3139",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: 3,
              }}
            />
          </View>
          
          <Text style={{ color: "#9CA3AF", fontSize: 10, marginTop: 4 }}>
            あと{remaining}{unit}で目標達成！
          </Text>
        </View>

        {/* 日付・場所 */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="event" size={12} color="#DD6500" />
            <Text style={{ color: "#DD6500", fontSize: 11, marginLeft: 2 }}>
              {formattedDate}
            </Text>
          </View>
          {challenge.venue && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="place" size={12} color="#9CA3AF" />
              <Text style={{ color: "#9CA3AF", fontSize: 11, marginLeft: 2 }} numberOfLines={1}>
                {challenge.venue.length > 6 ? challenge.venue.slice(0, 6) + "..." : challenge.venue}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FilterButton({ 
  label, 
  active, 
  onPress 
}: { 
  label: string; 
  active: boolean; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: active ? "#DD6500" : "#2D3139",
        marginRight: 8,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: active ? "bold" : "normal" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  
  const { data: challenges, isLoading, refetch } = trpc.events.list.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleChallengePress = (challengeId: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: challengeId.toString() },
    });
  };

  // フィルター適用
  const filteredChallenges = challenges?.filter((c: Challenge) => {
    if (filter === "all") return true;
    return c.eventType === filter;
  }) || [];

  return (
    <ScreenContainer containerClassName="bg-[#0D1117]">
      {/* ヘッダー */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: "#0D1117" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={logoImage}
              style={{ width: 100, height: 36 }}
              contentFit="contain"
            />
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
              動員ちゃれんじ
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Image source={characterImages.rinku} style={{ width: 32, height: 32, marginLeft: -6 }} contentFit="contain" />
            <Image source={characterImages.konta} style={{ width: 32, height: 32, marginLeft: -6 }} contentFit="contain" />
            <Image source={characterImages.tanune} style={{ width: 32, height: 32, marginLeft: -6 }} contentFit="contain" />
          </View>
        </View>
        
        {/* フィルター */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
        >
          <FilterButton label="すべて" active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterButton label="グループ" active={filter === "group"} onPress={() => setFilter("group")} />
          <FilterButton label="ソロ" active={filter === "solo"} onPress={() => setFilter("solo")} />
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D1117" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      ) : filteredChallenges.length > 0 ? (
        <FlatList
          data={filteredChallenges}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <ChallengeCard challenge={item as Challenge} onPress={() => handleChallengePress(item.id)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DD6500" />
          }
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100, backgroundColor: "#0D1117" }}
          style={{ backgroundColor: "#0D1117" }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#0D1117" }}>
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <Image source={characterImages.rinku} style={{ width: 80, height: 80 }} contentFit="contain" />
            <Image source={characterImages.konta} style={{ width: 80, height: 80, marginLeft: -16 }} contentFit="contain" />
            <Image source={characterImages.tanune} style={{ width: 80, height: 80, marginLeft: -16 }} contentFit="contain" />
          </View>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
            まだチャレンジがありません
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center" }}>
            「チャレンジ作成」タブから{"\n"}新しいチャレンジを作成しましょう
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
