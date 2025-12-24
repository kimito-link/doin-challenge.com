import { Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Share, Dimensions, Linking } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Countdown } from "@/components/countdown";

const { width: screenWidth } = Dimensions.get("window");

// 目標タイプの表示名とアイコン
const goalTypeConfig: Record<string, { label: string; icon: string; unit: string }> = {
  attendance: { label: "動員", icon: "people", unit: "人" },
  followers: { label: "フォロワー", icon: "person-add", unit: "人" },
  viewers: { label: "同時視聴", icon: "visibility", unit: "人" },
  points: { label: "ポイント", icon: "star", unit: "pt" },
  custom: { label: "カスタム", icon: "flag", unit: "" },
};

// 地域グループ
const regionGroups = [
  { name: "北海道・東北", prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { name: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { name: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { name: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { name: "中国・四国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"] },
  { name: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];

// 都道府県リスト
const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
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

// 進捗グリッドコンポーネント
function ProgressGrid({ current, goal, unit }: { current: number; goal: number; unit: string }) {
  const gridSize = Math.min(goal, 100);
  const filledCount = Math.min(current, gridSize);
  const cellSize = Math.floor((screenWidth - 64) / 10);
  
  return (
    <View style={{ marginVertical: 16 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
        {Array.from({ length: gridSize }).map((_, index) => (
          <View
            key={index}
            style={{
              width: cellSize - 2,
              height: cellSize - 2,
              margin: 1,
              borderRadius: 2,
              backgroundColor: index < filledCount ? "#EC4899" : "#2D3139",
            }}
          />
        ))}
      </View>
      <Text style={{ color: "#9CA3AF", fontSize: 12, textAlign: "center", marginTop: 8 }}>
        1マス = 1{unit}
      </Text>
    </View>
  );
}

// 地域別マップコンポーネント
function RegionMap({ participations }: { participations: Participation[] }) {
  // 地域ごとの参加者数を集計
  const regionCounts: Record<string, number> = {};
  
  participations.forEach(p => {
    if (p.prefecture) {
      const region = regionGroups.find(r => r.prefectures.includes(p.prefecture!));
      if (region) {
        regionCounts[region.name] = (regionCounts[region.name] || 0) + (p.contribution || 1);
      }
    }
  });

  const maxCount = Math.max(...Object.values(regionCounts), 1);

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        地域別参加者
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {regionGroups.map((region) => {
          const count = regionCounts[region.name] || 0;
          const intensity = count / maxCount;
          
          return (
            <View
              key={region.name}
              style={{
                width: "48%",
                backgroundColor: "#1A1D21",
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: count > 0 ? `rgba(236, 72, 153, ${0.3 + intensity * 0.7})` : "#2D3139",
              }}
            >
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{region.name}</Text>
              <Text style={{ color: count > 0 ? "#EC4899" : "#6B7280", fontSize: 20, fontWeight: "bold" }}>
                {count}人
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// 貢献度ランキングコンポーネント
function ContributionRanking({ participations }: { participations: Participation[] }) {
  const sorted = [...participations]
    .sort((a, b) => (b.contribution || 1) - (a.contribution || 1))
    .slice(0, 5);

  if (sorted.length === 0) return null;

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        貢献度ランキング
      </Text>
      {sorted.map((p, index) => (
        <View
          key={p.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1A1D21",
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            borderWidth: index === 0 ? 2 : 1,
            borderColor: index === 0 ? "#FFD700" : "#2D3139",
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
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
          {p.profileImage && !p.isAnonymous ? (
            <Image
              source={{ uri: p.profileImage }}
              style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
            />
          ) : (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#EC4899",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
                {p.displayName.charAt(0)}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
              {p.isAnonymous ? "匿名" : p.displayName}
            </Text>
            {p.username && !p.isAnonymous && (
              <Text style={{ color: "#DD6500", fontSize: 12 }}>@{p.username}</Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#EC4899", fontSize: 18, fontWeight: "bold" }}>
              +{p.contribution || 1}
            </Text>
            <Text style={{ color: "#6B7280", fontSize: 10 }}>
              {p.companionCount > 0 ? `(本人+${p.companionCount}人)` : ""}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// 応援メッセージカード
function MessageCard({ participation, onCheer, cheerCount, onDM, challengeId }: { participation: Participation; onCheer?: () => void; cheerCount?: number; onDM?: (userId: number) => void; challengeId?: number }) {
  return (
    <View
      style={{
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#2D3139",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        {participation.profileImage && !participation.isAnonymous ? (
          <Image
            source={{ uri: participation.profileImage }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#EC4899",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {participation.displayName.charAt(0)}
            </Text>
          </View>
        )}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            {participation.isAnonymous ? "匿名" : participation.displayName}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {participation.username && !participation.isAnonymous && (
              <Text style={{ color: "#DD6500", fontSize: 14, marginRight: 8 }}>
                @{participation.username}
              </Text>
            )}
            {participation.prefecture && (
              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                📍{participation.prefecture}
              </Text>
            )}
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#EC4899", fontSize: 14, fontWeight: "bold" }}>
            +{participation.contribution || 1}人
          </Text>
        </View>
      </View>
      {participation.message && (
        <Text style={{ color: "#E5E7EB", fontSize: 15, lineHeight: 22, marginBottom: 12 }}>
          {participation.message}
        </Text>
      )}
      {/* エール・ DMボタン */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 8, gap: 8 }}>
        {onDM && participation.userId && !participation.isAnonymous && (
          <TouchableOpacity
            onPress={() => onDM(participation.userId!)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#2D3139",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 4 }}>💬</Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>DM</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onCheer}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2D3139",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 4 }}>👏</Text>
          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>エール{cheerCount && cheerCount > 0 ? ` (${cheerCount})` : ""}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companionCount, setCompanionCount] = useState(0);
  const [prefecture, setPrefecture] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPrefectureList, setShowPrefectureList] = useState(false);
  const [allowVideoUse, setAllowVideoUse] = useState(true);
  const [selectedPrefectureFilter, setSelectedPrefectureFilter] = useState("all");
  const [showPrefectureFilterList, setShowPrefectureFilterList] = useState(false);

  const challengeId = parseInt(id || "0", 10);
  
  const { data: challenge, isLoading: challengeLoading } = trpc.events.getById.useQuery({ id: challengeId });
  const { data: participations, isLoading: participationsLoading, refetch } = trpc.participations.listByEvent.useQuery({ eventId: challengeId });
  
  // フォロー状態
  const hostUserId = challenge?.hostUserId;
  const { data: isFollowing } = trpc.follows.isFollowing.useQuery(
    { followeeId: hostUserId! },
    { enabled: !!user && !!hostUserId && hostUserId !== user.id }
  );
  
  const followMutation = trpc.follows.follow.useMutation({
    onSuccess: () => {
      Alert.alert("フォローしました", "新着チャレンジの通知を受け取れます");
    },
  });
  
  const unfollowMutation = trpc.follows.unfollow.useMutation();
  
  const handleFollowToggle = () => {
    if (!user) {
      Alert.alert("ログインが必要です", "フォローするにはログインしてください");
      return;
    }
    if (!hostUserId) return;
    
    if (isFollowing) {
      unfollowMutation.mutate({ followeeId: hostUserId });
    } else {
      followMutation.mutate({
        followeeId: hostUserId,
        followeeName: challenge?.hostName,
        followeeImage: challenge?.hostProfileImage || undefined,
      });
    }
  };
  
  const createParticipationMutation = trpc.participations.create.useMutation({
    onSuccess: () => {
      setMessage("");
      setCompanionCount(0);
      setPrefecture("");
      setShowForm(false);
      refetch();
    },
  });
  
  const createAnonymousMutation = trpc.participations.createAnonymous.useMutation({
    onSuccess: () => {
      setMessage("");
      setDisplayName("");
      setCompanionCount(0);
      setPrefecture("");
      setShowForm(false);
      refetch();
    },
  });

  // エール送信mutation
  const sendCheerMutation = trpc.cheers.send.useMutation({
    onSuccess: () => {
      Alert.alert("👏", "エールを送りました！");
    },
    onError: (error) => {
      Alert.alert("エラー", error.message || "エールの送信に失敗しました");
    },
  });

  const handleSendCheer = (participationId: number, toUserId?: number) => {
    if (!user) {
      Alert.alert("ログインが必要です", "エールを送るにはログインしてください");
      return;
    }
    sendCheerMutation.mutate({
      toParticipationId: participationId,
      toUserId,
      challengeId,
      emoji: "👏",
    });
  };

  const handleSubmit = () => {
    if (user) {
      createParticipationMutation.mutate({
        challengeId,
        message,
        companionCount,
        prefecture,
        displayName: user.name || "ゲスト",
      });
    } else {
      if (!displayName.trim()) {
        Alert.alert("エラー", "お名前を入力してください");
        return;
      }
      createAnonymousMutation.mutate({
        challengeId,
        displayName: displayName.trim(),
        message,
        companionCount,
        prefecture,
      });
    }
  };

  if (challengeLoading) {
    return (
      <ScreenContainer containerClassName="bg-[#0D1117]">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D1117" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!challenge) {
    return (
      <ScreenContainer containerClassName="bg-[#0D1117]">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D1117" }}>
          <Text style={{ color: "#9CA3AF" }}>チャレンジが見つかりません</Text>
        </View>
      </ScreenContainer>
    );
  }

  const eventDate = new Date(challenge.eventDate);
  const formattedDate = `${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;
  
  const goalConfig = goalTypeConfig[challenge.goalType || "attendance"] || goalTypeConfig.attendance;
  const unit = challenge.goalUnit || goalConfig.unit;
  const currentValue = challenge.currentValue || 0;
  const goalValue = challenge.goalValue || 100;
  const progress = Math.min((currentValue / goalValue) * 100, 100);
  const remaining = Math.max(goalValue - currentValue, 0);

  const [isGeneratingOgp, setIsGeneratingOgp] = useState(false);
  const generateOgpMutation = trpc.ogp.generateChallengeOgp.useMutation();

  const handleShare = async () => {
    try {
      const shareMessage = `🎯 ${challenge.title}\n\n📊 現在 ${currentValue}/${goalValue}${unit}（${Math.round(progress)}%）\nあと${remaining}${unit}で目標達成！\n\n一緒に応援しよう！\n\n#KimitoLink #動員ちゃれんじ`;
      
      await Share.share({ message: shareMessage });
    } catch (error) {
      Alert.alert("エラー", "シェアに失敗しました");
    }
  };

  const handleShareWithOgp = async () => {
    try {
      setIsGeneratingOgp(true);
      const result = await generateOgpMutation.mutateAsync({ challengeId });
      
      const shareMessage = `🎯 ${challenge.title}\n\n📊 現在 ${currentValue}/${goalValue}${unit}（${Math.round(progress)}%）\nあと${remaining}${unit}で目標達成！\n\n一緒に応援しよう！\n${result.url || ""}\n\n#KimitoLink #動員ちゃれんじ`;
      
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.error("OGP share error:", error);
      // フォールバックとして通常のシェアを実行
      handleShare();
    } finally {
      setIsGeneratingOgp(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#0D1117]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1, backgroundColor: "#0D1117" }}>
          {/* ヘッダー */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8 }}>戻る</Text>
            </TouchableOpacity>
          </View>

          {/* ヘッダー画像 */}
          <LinearGradient
            colors={["#EC4899", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ marginHorizontal: 16, borderRadius: 16, padding: 20 }}
          >
            {/* ホスト情報 */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              {challenge.hostProfileImage ? (
                <Image
                  source={{ uri: challenge.hostProfileImage }}
                  style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#fff" }}
                />
              ) : (
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
                    {challenge.hostName.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                  {challenge.hostName}
                </Text>
                {challenge.hostUsername && (
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                    @{challenge.hostUsername}
                  </Text>
                )}
                {challenge.hostFollowersCount !== null && (
                  <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                    {challenge.hostFollowersCount?.toLocaleString()} フォロワー
                  </Text>
                )}
              </View>
              {/* フォローボタン */}
              {user && hostUserId && hostUserId !== user.id && (
                <TouchableOpacity
                  onPress={handleFollowToggle}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isFollowing ? "rgba(255,255,255,0.2)" : "#fff",
                  }}
                >
                  <Text style={{ 
                    color: isFollowing ? "#fff" : "#EC4899", 
                    fontSize: 13, 
                    fontWeight: "bold" 
                  }}>
                    {isFollowing ? "フォロー中" : "フォロー"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
              {challenge.title}
            </Text>
          </LinearGradient>

          {/* カウントダウンセクション */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <View
              style={{
                backgroundColor: "#1A1D21",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#2D3139",
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["rgba(236, 72, 153, 0.1)", "rgba(139, 92, 246, 0.1)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 4 }}
              >
                <Countdown targetDate={challenge.eventDate} />
              </LinearGradient>
            </View>
          </View>

          {/* 進捗セクション */}
          <View style={{ padding: 16 }}>
            <View
              style={{
                backgroundColor: "#1A1D21",
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: "#2D3139",
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14 }}>現在の達成状況</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={{ color: "#EC4899", fontSize: 48, fontWeight: "bold" }}>
                    {currentValue}
                  </Text>
                  <Text style={{ color: "#6B7280", fontSize: 20, marginLeft: 4 }}>
                    / {goalValue}{unit}
                  </Text>
                </View>
              </View>

              {/* 進捗バー */}
              <View
                style={{
                  height: 12,
                  backgroundColor: "#2D3139",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <LinearGradient
                  colors={["#EC4899", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    borderRadius: 6,
                  }}
                />
              </View>
              
              {progress >= 100 ? (
                <TouchableOpacity
                  onPress={() => router.push(`/achievement/${challengeId}`)}
                  style={{
                    backgroundColor: "#EC4899",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 24,
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                    🎉 達成記念ページを見る
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center" }}>
                  あと<Text style={{ color: "#EC4899", fontWeight: "bold" }}>{remaining}{unit}</Text>で目標達成！
                </Text>
              )}

              {/* 進捗グリッド */}
              <ProgressGrid current={currentValue} goal={goalValue} unit={unit} />
            </View>

            {/* イベント情報 */}
            <View
              style={{
                backgroundColor: "#1A1D21",
                borderRadius: 16,
                padding: 16,
                marginTop: 16,
                borderWidth: 1,
                borderColor: "#2D3139",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <MaterialIcons name="event" size={20} color="#DD6500" />
                <Text style={{ color: "#fff", fontSize: 16, marginLeft: 8 }}>
                  {formattedDate}
                </Text>
              </View>

              {challenge.venue && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <MaterialIcons name="place" size={20} color="#DD6500" />
                  <Text style={{ color: "#fff", fontSize: 16, marginLeft: 8 }}>
                    {challenge.venue}
                  </Text>
                </View>
              )}

              {challenge.description && (
                <Text style={{ color: "#9CA3AF", fontSize: 15, lineHeight: 22 }}>
                  {challenge.description}
                </Text>
              )}
            </View>

            {/* チケット情報セクション */}
            {(challenge.ticketPresale || challenge.ticketDoor || challenge.ticketUrl) && (
              <View
                style={{
                  backgroundColor: "#1A1D21",
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: "#2D3139",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <MaterialIcons name="confirmation-number" size={20} color="#EC4899" />
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                    チケット情報
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 16 }}>
                  {challenge.ticketPresale && (
                    <View style={{ flex: 1, backgroundColor: "#0D1117", borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 4 }}>前売り券</Text>
                      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                        ¥{challenge.ticketPresale.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {challenge.ticketDoor && (
                    <View style={{ flex: 1, backgroundColor: "#0D1117", borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 4 }}>当日券</Text>
                      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                        ¥{challenge.ticketDoor.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                {challenge.ticketUrl && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(challenge.ticketUrl!)}
                    style={{
                      backgroundColor: "#EC4899",
                      borderRadius: 12,
                      padding: 14,
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="open-in-new" size={18} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                      チケットを購入する
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ホスト用管理ボタン */}
            {user && challenge.hostUserId === user.id && (
              <View style={{ gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/manage-comments/${challengeId}`)}
                  style={{
                    backgroundColor: "#8B5CF6",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name="star" size={20} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                    コメント管理（ピックアップ）
                  </Text>
                </TouchableOpacity>
                
                {/* 達成記念ページ作成ボタン（目標達成時のみ） */}
                {progress >= 100 && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "達成記念ページを作成",
                        "目標達成を記念して、参加者全員の名前を掲載した記念ページを作成しますか？",
                        [
                          { text: "キャンセル", style: "cancel" },
                          {
                            text: "作成する",
                            onPress: async () => {
                              // TODO: 達成記念ページ作成APIを呼び出す
                              router.push(`/achievement/${challengeId}`);
                            },
                          },
                        ]
                      );
                    }}
                    style={{
                      backgroundColor: "#EC4899",
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="celebration" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                      達成記念ページを作成
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 地域別マップ */}
            {participations && participations.length > 0 && (
              <RegionMap participations={participations as Participation[]} />
            )}

            {/* 貢献度ランキング */}
            {participations && participations.length > 0 && (
              <ContributionRanking participations={participations as Participation[]} />
            )}

            {/* 応援メッセージ */}
            {participations && participations.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                    応援メッセージ ({participations.length}件)
                  </Text>
                  
                  {/* 地域フィルター */}
                  <TouchableOpacity
                    onPress={() => setShowPrefectureFilterList(!showPrefectureFilterList)}
                    style={{
                      backgroundColor: "#1A1D21",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: selectedPrefectureFilter !== "all" ? "#EC4899" : "#2D3139",
                    }}
                  >
                    <MaterialIcons name="filter-list" size={16} color={selectedPrefectureFilter !== "all" ? "#EC4899" : "#9CA3AF"} />
                    <Text style={{ color: selectedPrefectureFilter !== "all" ? "#EC4899" : "#9CA3AF", fontSize: 12, marginLeft: 4 }}>
                      {selectedPrefectureFilter === "all" ? "地域" : selectedPrefectureFilter}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 地域フィルターリスト */}
                {showPrefectureFilterList && (
                  <View style={{ backgroundColor: "#1A1D21", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#2D3139" }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                      <TouchableOpacity
                        onPress={() => { setSelectedPrefectureFilter("all"); setShowPrefectureFilterList(false); }}
                        style={{
                          backgroundColor: selectedPrefectureFilter === "all" ? "#EC4899" : "#2D3139",
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 12 }}>すべて</Text>
                      </TouchableOpacity>
                      {regionGroups.map((region) => (
                        <TouchableOpacity
                          key={region.name}
                          onPress={() => { setSelectedPrefectureFilter(region.name); setShowPrefectureFilterList(false); }}
                          style={{
                            backgroundColor: selectedPrefectureFilter === region.name ? "#EC4899" : "#2D3139",
                            borderRadius: 16,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            marginRight: 8,
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 12 }}>{region.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {prefectures.map((pref) => (
                        <TouchableOpacity
                          key={pref}
                          onPress={() => { setSelectedPrefectureFilter(pref); setShowPrefectureFilterList(false); }}
                          style={{
                            backgroundColor: selectedPrefectureFilter === pref ? "#EC4899" : "#0D1117",
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                          }}
                        >
                          <Text style={{ color: selectedPrefectureFilter === pref ? "#fff" : "#9CA3AF", fontSize: 11 }}>{pref}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* フィルター適用済みメッセージ一覧 */}
                {participations
                  .filter((p: any) => {
                    if (selectedPrefectureFilter === "all") return true;
                    // 地域グループでフィルター
                    const region = regionGroups.find(r => r.name === selectedPrefectureFilter);
                    if (region) return region.prefectures.includes(p.prefecture || "");
                    // 都道府県でフィルター
                    return p.prefecture === selectedPrefectureFilter;
                  })
                  .map((p: any) => (
                    <MessageCard 
                      key={p.id} 
                      participation={p as Participation} 
                      onCheer={() => handleSendCheer(p.id, p.userId)}
                      onDM={(userId) => router.push(`/messages/${userId}?challengeId=${challengeId}` as never)}
                      challengeId={challengeId}
                    />
                  ))}
                
                {participations.filter((p: any) => {
                  if (selectedPrefectureFilter === "all") return true;
                  const region = regionGroups.find(r => r.name === selectedPrefectureFilter);
                  if (region) return region.prefectures.includes(p.prefecture || "");
                  return p.prefecture === selectedPrefectureFilter;
                }).length === 0 && selectedPrefectureFilter !== "all" && (
                  <View style={{ alignItems: "center", paddingVertical: 24 }}>
                    <MaterialIcons name="search-off" size={48} color="#6B7280" />
                    <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 8 }}>
                      {selectedPrefectureFilter}からの参加者はまだいません
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 参加表明フォーム */}
            {showForm ? (
              <View
                style={{
                  backgroundColor: "#1A1D21",
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: "#2D3139",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
                  参加表明
                </Text>

                {!user && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                      お名前 *
                    </Text>
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="ニックネーム"
                      placeholderTextColor="#6B7280"
                      style={{
                        backgroundColor: "#0D1117",
                        borderRadius: 8,
                        padding: 12,
                        color: "#fff",
                        borderWidth: 1,
                        borderColor: "#2D3139",
                      }}
                    />
                  </View>
                )}

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                    都道府県
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPrefectureList(!showPrefectureList)}
                    style={{
                      backgroundColor: "#0D1117",
                      borderRadius: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#2D3139",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: prefecture ? "#fff" : "#6B7280" }}>
                      {prefecture || "選択してください"}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#6B7280" />
                  </TouchableOpacity>
                  {showPrefectureList && (
                    <View
                      style={{
                        backgroundColor: "#0D1117",
                        borderRadius: 8,
                        marginTop: 4,
                        maxHeight: 200,
                        borderWidth: 1,
                        borderColor: "#2D3139",
                      }}
                    >
                      <ScrollView nestedScrollEnabled>
                        {prefectures.map((pref) => (
                          <TouchableOpacity
                            key={pref}
                            onPress={() => {
                              setPrefecture(pref);
                              setShowPrefectureList(false);
                            }}
                            style={{
                              padding: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: "#2D3139",
                            }}
                          >
                            <Text style={{ color: "#fff" }}>{pref}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                    友達を何人連れて行きますか？
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => setCompanionCount(Math.max(0, companionCount - 1))}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "#2D3139",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialIcons name="remove" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginHorizontal: 24 }}>
                      {companionCount}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setCompanionCount(companionCount + 1)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "#EC4899",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialIcons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 16 }}>
                      人
                    </Text>
                  </View>
                  <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 8 }}>
                    あなたの貢献: {1 + companionCount}人
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                    応援メッセージ（任意）
                  </Text>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="応援メッセージを書いてね"
                    placeholderTextColor="#6B7280"
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: "#0D1117",
                      borderRadius: 8,
                      padding: 12,
                      color: "#fff",
                      borderWidth: 1,
                      borderColor: "#2D3139",
                      minHeight: 80,
                      textAlignVertical: "top",
                    }}
                  />
                </View>

                {/* 応援動画使用許可 */}
                <TouchableOpacity
                  onPress={() => setAllowVideoUse(!allowVideoUse)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: "#0D1117",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: allowVideoUse ? "#EC4899" : "#2D3139",
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: allowVideoUse ? "#EC4899" : "#6B7280",
                      backgroundColor: allowVideoUse ? "#EC4899" : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {allowVideoUse && <MaterialIcons name="check" size={16} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 14 }}>
                      応援動画での使用を許可する
                    </Text>
                    <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
                      素敵なコメントは応援動画で使わせてもらうかも！
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 参加条件・お約束 */}
                <View
                  style={{
                    backgroundColor: "#0D1117",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#2D3139",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ fontSize: 16 }}>🌈</Text>
                    <Text style={{ color: "#EC4899", fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                      みんなで楽しく応援するためのお約束
                    </Text>
                  </View>
                  <View style={{ backgroundColor: "#1A1D21", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <Text style={{ color: "#9CA3AF", fontSize: 12, lineHeight: 18 }}>
                      りんくからのお願いだよ～！{"\n"}
                      みんなで仲良く、楽しく応援していこうね♪
                    </Text>
                  </View>
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={{ color: "#EC4899", marginRight: 8 }}>✱</Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 11, flex: 1, lineHeight: 16 }}>
                        このサイトは「アイドル応援ちゃんねる」が愛情たっぷりで運営してるよ！
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={{ color: "#EC4899", marginRight: 8 }}>✱</Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 11, flex: 1, lineHeight: 16 }}>
                        素敵なコメントは、応援動画を作るときに使わせてもらうかも！
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={{ color: "#EC4899", marginRight: 8 }}>✱</Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 11, flex: 1, lineHeight: 16 }}>
                        アイドルちゃんを傷つけるコメントや、迷惑なコメントは絶対ダメだよ～！
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={{ color: "#EC4899", marginRight: 8 }}>✱</Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 11, flex: 1, lineHeight: 16 }}>
                        みんなの「応援のキモチ」で、アイドルちゃんたちをキラキラさせちゃおう！
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 参加条件 */}
                <View
                  style={{
                    backgroundColor: "#1DA1F2",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons name="info" size={20} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 12, marginLeft: 8, flex: 1 }}>
                    参加条件: @idolfunch のTwitterフォロー必須！
                  </Text>
                  <TouchableOpacity
                    onPress={() => Linking.openURL("https://twitter.com/idolfunch")}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>フォロー</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setShowForm(false)}
                    style={{
                      flex: 1,
                      backgroundColor: "#2D3139",
                      borderRadius: 12,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 16 }}>キャンセル</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={createParticipationMutation.isPending || createAnonymousMutation.isPending}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={["#EC4899", "#8B5CF6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                      }}
                    />
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                      参加表明する
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ gap: 12, marginTop: 16 }}>
                {/* シェアボタン */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={handleShare}
                    style={{
                      flex: 1,
                      backgroundColor: "#1A1D21",
                      borderRadius: 12,
                      padding: 14,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#2D3139",
                    }}
                  >
                    <MaterialIcons name="share" size={18} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 14, marginLeft: 6 }}>シェア</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleShareWithOgp}
                    disabled={isGeneratingOgp}
                    style={{
                      flex: 1,
                      backgroundColor: isGeneratingOgp ? "#2D3139" : "#1DA1F2",
                      borderRadius: 12,
                      padding: 14,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="image" size={18} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 14, marginLeft: 6 }}>
                      {isGeneratingOgp ? "生成中..." : "画像付き"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => setShowForm(true)}
                  style={{
                    flex: 2,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={["#EC4899", "#8B5CF6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                  />
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                    参加表明する
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
