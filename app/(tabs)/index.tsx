import { FlatList, Text, View, TouchableOpacity, RefreshControl, ScrollView, TextInput, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { ResponsiveContainer } from "@/components/responsive-container";
import { OnboardingSteps } from "@/components/onboarding-steps";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useResponsive, useGridColumns } from "@/hooks/use-responsive";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Countdown } from "@/components/countdown";
import { PressableCard } from "@/components/pressable-card";
import { AppHeader } from "@/components/app-header";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
  // メインキャラクター（全身）
  linkFull: require("@/assets/images/characters/KimitoLink.png"),
  linkIdol: require("@/assets/images/characters/idolKimitoLink.png"),
  // ゆっくりキャラクター
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
  kontaYukkuri: require("@/assets/images/characters/konta/kitsune-yukkuri-normal.png"),
  tanuneYukkuri: require("@/assets/images/characters/tanunee/tanuki-yukkuri-normal-mouth-open.png"),
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

function ChallengeCard({ challenge, onPress, numColumns = 2 }: { challenge: Challenge; onPress: () => void; numColumns?: number }) {
  const colors = useColors();
  const { isDesktop } = useResponsive();
  const eventDate = new Date(challenge.eventDate);
  const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
  
  const progress = Math.min((challenge.currentValue / challenge.goalValue) * 100, 100);
  const goalConfig = goalTypeConfig[challenge.goalType] || goalTypeConfig.custom;
  const typeBadge = eventTypeBadge[challenge.eventType] || eventTypeBadge.solo;
  const unit = challenge.goalUnit || goalConfig.unit;
  const remaining = Math.max(challenge.goalValue - challenge.currentValue, 0);

  // カラム数に応じた幅を計算
  const cardWidth = numColumns === 3 ? "31%" : numColumns === 2 ? "47%" : "100%";

  return (
    <PressableCard
      onPress={onPress}
      style={{
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        marginHorizontal: isDesktop ? 4 : 4,
        marginVertical: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2D3139",
        width: cardWidth as any,
        // UXガイドライン: 軽いドロップシャドウ
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
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

      <View style={{ padding: 16 }}>
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

        {/* カウントダウン・日付 */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Countdown targetDate={challenge.eventDate} compact />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="event" size={12} color="#DD6500" />
            <Text style={{ color: "#DD6500", fontSize: 11, marginLeft: 2 }}>
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>
    </PressableCard>
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
        // UXガイドライン: 最小44pxのタップエリア
        minHeight: 44,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 22,
        backgroundColor: active ? "#DD6500" : "#2D3139",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: active ? "bold" : "normal" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// 空の状態表示コンポーネント（サンプルデータ生成ボタン付き）
function EmptyState({ onGenerateSamples }: { onGenerateSamples: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const generateMutation = trpc.dev.generateSampleChallenges.useMutation();
  const clearMutation = trpc.dev.clearSampleChallenges.useMutation();

  const handleGenerateSamples = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({ count: 6 });
      onGenerateSamples();
    } catch (error) {
      console.error("サンプルデータ生成エラー:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#0D1117" }}>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Image source={characterImages.linkIdol} style={{ width: 150, height: 200 }} contentFit="contain" />
      </View>
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
        まだチャレンジがありません
      </Text>
      <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
        「チャレンジ作成」タブから{"\n"}新しいチャレンジを作成しましょう
      </Text>
      
      {/* 開発者向けサンプルデータ生成ボタン */}
      <View style={{ marginTop: 16, padding: 16, backgroundColor: "#1A1D21", borderRadius: 12, borderWidth: 1, borderColor: "#2D3139" }}>
        <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 12, textAlign: "center" }}>
          🛠️ 開発者向け
        </Text>
        <TouchableOpacity
          onPress={handleGenerateSamples}
          disabled={isGenerating}
          style={{
            backgroundColor: isGenerating ? "#4B5563" : "#8B5CF6",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            minHeight: 44,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {isGenerating ? "生成中..." : "サンプルチャレンジを生成"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isDesktop, isTablet, width } = useResponsive();
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 2;
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  
  const { data: challenges, isLoading, refetch } = trpc.events.list.useQuery();
  const { data: searchResults, refetch: refetchSearch } = trpc.search.challenges.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );
  const { data: categoriesData } = trpc.categories.list.useQuery();

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
  const displayChallenges = isSearching && searchResults 
    ? searchResults.filter((c: Challenge & { categoryId?: number | null }) => {
        if (filter !== "all" && c.eventType !== filter) return false;
        if (categoryFilter && c.categoryId !== categoryFilter) return false;
        return true;
      })
    : (challenges?.filter((c: Challenge & { categoryId?: number | null }) => {
        if (filter !== "all" && c.eventType !== filter) return false;
        if (categoryFilter && c.categoryId !== categoryFilter) return false;
        return true;
      }) || []);

  return (
    <ScreenContainer containerClassName="bg-[#0D1117]">
      {/* ヘッダー */}
      <AppHeader 
        title="動員ちゃれんじ" 
        showCharacters={true}
        isDesktop={isDesktop}
      />
      <ResponsiveContainer style={{ paddingBottom: 8, backgroundColor: "#0D1117" }}>
        
        {/* 検索バー */}
        <View style={{ marginTop: 12 }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1A1D21",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: searchQuery ? "#DD6500" : "#2D3139",
          }}>
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setIsSearching(text.length > 0);
              }}
              placeholder="チャレンジを検索..."
              placeholderTextColor="#6B7280"
              style={{
                flex: 1,
                marginLeft: 8,
                color: "#fff",
                fontSize: 14,
              }}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(""); setIsSearching(false); }}>
                <MaterialIcons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* タイプフィルター */}
        <View style={{ flexDirection: "row", marginTop: 16 }}>
          <FilterButton label="すべて" active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterButton label="グループ" active={filter === "group"} onPress={() => setFilter("group")} />
          <FilterButton label="ソロ" active={filter === "solo"} onPress={() => setFilter("solo")} />
        </View>

        {/* カテゴリフィルター */}
        {categoriesData && categoriesData.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
          >
            <TouchableOpacity
              onPress={() => setCategoryFilter(null)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: categoryFilter === null ? "#8B5CF6" : "#1E293B",
                marginRight: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>全カテゴリ</Text>
            </TouchableOpacity>
            {categoriesData.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoryFilter(cat.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: categoryFilter === cat.id ? "#8B5CF6" : "#1E293B",
                  marginRight: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ marginRight: 4 }}>{cat.icon}</Text>
                <Text style={{ color: "#fff", fontSize: 12 }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ResponsiveContainer>

      {/* 3ステップ説明（初回訪問時のみ表示） */}
      {!isLoading && displayChallenges.length === 0 && (
        <OnboardingSteps />
      )}

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D1117" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      ) : displayChallenges.length > 0 ? (
        <FlatList
          key={`grid-${numColumns}`}
          data={displayChallenges}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <ChallengeCard challenge={item as Challenge} onPress={() => handleChallengePress(item.id)} numColumns={numColumns} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DD6500" />
          }
          contentContainerStyle={{ 
            paddingHorizontal: isDesktop ? 24 : 8, 
            paddingBottom: 100, 
            backgroundColor: "#0D1117",
            maxWidth: isDesktop ? 1200 : undefined,
            alignSelf: isDesktop ? "center" : undefined,
            width: isDesktop ? "100%" : undefined,
          }}
          style={{ backgroundColor: "#0D1117" }}
          columnWrapperStyle={{ justifyContent: "flex-start", gap: isDesktop ? 16 : 8 }}
        />
      ) : (
        <EmptyState onGenerateSamples={refetch} />
      )}
    </ScreenContainer>
  );
}
