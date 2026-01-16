import { Text, View, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { AppHeader } from "@/components/organisms/app-header";

const { width: screenWidth } = Dimensions.get("window");

// アチーブメント定義
const ACHIEVEMENTS = [
  // 参加系
  { id: "first_participation", name: "はじめの一歩", description: "初めてチャレンジに参加した", icon: "🎉", type: "participation", rarity: "common", points: 10 },
  { id: "participate_5", name: "常連さん", description: "5つのチャレンジに参加した", icon: "⭐", type: "participation", rarity: "uncommon", points: 25 },
  { id: "participate_10", name: "応援マスター", description: "10のチャレンジに参加した", icon: "🌟", type: "participation", rarity: "rare", points: 50 },
  { id: "participate_25", name: "レジェンド", description: "25のチャレンジに参加した", icon: "👑", type: "participation", rarity: "epic", points: 100 },
  { id: "participate_50", name: "殿堂入り", description: "50のチャレンジに参加した", icon: "🏆", type: "participation", rarity: "legendary", points: 250 },
  
  // 主催系
  { id: "first_host", name: "初主催", description: "初めてチャレンジを主催した", icon: "🎤", type: "hosting", rarity: "uncommon", points: 30 },
  { id: "host_5", name: "イベンター", description: "5つのチャレンジを主催した", icon: "🎪", type: "hosting", rarity: "rare", points: 75 },
  { id: "host_10", name: "プロデューサー", description: "10のチャレンジを主催した", icon: "🎬", type: "hosting", rarity: "epic", points: 150 },
  
  // 招待系
  { id: "invite_1", name: "お誘い上手", description: "初めて友達を招待した", icon: "💌", type: "invitation", rarity: "common", points: 15 },
  { id: "invite_5", name: "招待達人", description: "5人を招待した", icon: "📨", type: "invitation", rarity: "uncommon", points: 40 },
  { id: "invite_10", name: "インフルエンサー", description: "10人を招待した", icon: "📣", type: "invitation", rarity: "rare", points: 80 },
  { id: "invite_25", name: "伝説の勧誘師", description: "25人を招待した", icon: "🌈", type: "invitation", rarity: "epic", points: 200 },
  
  // 貢献系
  { id: "contribution_10", name: "サポーター", description: "累計10人を動員した", icon: "💪", type: "contribution", rarity: "common", points: 20 },
  { id: "contribution_50", name: "エース", description: "累計50人を動員した", icon: "🔥", type: "contribution", rarity: "rare", points: 100 },
  { id: "contribution_100", name: "MVP", description: "累計100人を動員した", icon: "💎", type: "contribution", rarity: "legendary", points: 300 },
  
  // 連続参加系
  { id: "streak_3", name: "3日連続", description: "3日連続でチャレンジに参加した", icon: "🔗", type: "streak", rarity: "uncommon", points: 35 },
  { id: "streak_7", name: "1週間連続", description: "7日連続でチャレンジに参加した", icon: "⛓️", type: "streak", rarity: "rare", points: 70 },
  { id: "streak_30", name: "30日連続", description: "30日連続でチャレンジに参加した", icon: "🏅", type: "streak", rarity: "legendary", points: 500 },
  
  // 目標達成系
  { id: "goal_reached", name: "目標達成", description: "参加したチャレンジが目標を達成した", icon: "🎯", type: "special", rarity: "rare", points: 60 },
];

// レアリティの色
const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: "#374151", border: "#6B7280", text: "#9CA3AF" },
  uncommon: { bg: "#065F46", border: "#10B981", text: "#34D399" },
  rare: { bg: "#1E3A8A", border: "#3B82F6", text: "#60A5FA" },
  epic: { bg: "#581C87", border: "#A855F7", text: "#C084FC" },
  legendary: { bg: "#78350F", border: "#F59E0B", text: "#FCD34D" },
};

// レアリティの日本語名
const RARITY_NAMES: Record<string, string> = {
  common: "コモン",
  uncommon: "アンコモン",
  rare: "レア",
  epic: "エピック",
  legendary: "レジェンダリー",
};

// タイプの日本語名
const TYPE_NAMES: Record<string, string> = {
  participation: "参加",
  hosting: "主催",
  invitation: "招待",
  contribution: "貢献",
  streak: "連続",
  special: "特別",
};

// アチーブメントカード
function AchievementCard({ 
  achievement, 
  isUnlocked, 
  progress,
  maxProgress,
}: { 
  achievement: typeof ACHIEVEMENTS[0]; 
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}) {
  const colors = RARITY_COLORS[achievement.rarity];
  
  return (
    <View
      style={{
        backgroundColor: isUnlocked ? colors.bg : "#1A1D21",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: isUnlocked ? colors.border : "#2D3139",
        opacity: isUnlocked ? 1 : 0.6,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isUnlocked ? colors.border : "#2D3139",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 24 }}>{isUnlocked ? achievement.icon : "🔒"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ color: isUnlocked ? colors.text : "#6B7280", fontSize: 16, fontWeight: "bold" }}>
              {achievement.name}
            </Text>
            <View
              style={{
                backgroundColor: colors.border,
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                {RARITY_NAMES[achievement.rarity]}
              </Text>
            </View>
          </View>
          <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
            {achievement.description}
          </Text>
          {/* 進捗バー（未解除の場合） */}
          {!isUnlocked && progress !== undefined && maxProgress !== undefined && (
            <View style={{ marginTop: 8 }}>
              <View style={{ height: 4, backgroundColor: "#2D3139", borderRadius: 2, overflow: "hidden" }}>
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min((progress / maxProgress) * 100, 100)}%`,
                    backgroundColor: colors.border,
                    borderRadius: 2,
                  }}
                />
              </View>
              <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 4 }}>
                {progress} / {maxProgress}
              </Text>
            </View>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: isUnlocked ? "#FFD700" : "#6B7280", fontSize: 14, fontWeight: "bold" }}>
            +{achievement.points}
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 10 }}>ポイント</Text>
        </View>
      </View>
    </View>
  );
}

export default function AchievementsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // ユーザーの統計情報を取得
  const { data: myParticipations = [] } = trpc.participations.myParticipations.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: myEvents = [] } = trpc.events.myEvents.useQuery(undefined, {
    enabled: !!user,
  });

  // アチーブメントの解除状況を計算
  const achievementStatus = useMemo(() => {
    const participationCount = myParticipations.length;
    const hostCount = myEvents.length;
    const totalContribution = myParticipations.reduce((sum, p) => sum + (p.contribution || 1), 0);
    
    // 招待数は仮で0（実際はDBから取得する必要がある）
    const inviteCount = 0;
    
    // 連続参加日数は仮で0（実際は日付を計算する必要がある）
    const streakDays = 0;
    
    // 目標達成したチャレンジ数は仮で0
    const goalReachedCount = 0;
    
    return ACHIEVEMENTS.map(achievement => {
      let isUnlocked = false;
      let progress = 0;
      let maxProgress = 1;
      
      switch (achievement.id) {
        case "first_participation":
          isUnlocked = participationCount >= 1;
          progress = participationCount;
          maxProgress = 1;
          break;
        case "participate_5":
          isUnlocked = participationCount >= 5;
          progress = participationCount;
          maxProgress = 5;
          break;
        case "participate_10":
          isUnlocked = participationCount >= 10;
          progress = participationCount;
          maxProgress = 10;
          break;
        case "participate_25":
          isUnlocked = participationCount >= 25;
          progress = participationCount;
          maxProgress = 25;
          break;
        case "participate_50":
          isUnlocked = participationCount >= 50;
          progress = participationCount;
          maxProgress = 50;
          break;
        case "first_host":
          isUnlocked = hostCount >= 1;
          progress = hostCount;
          maxProgress = 1;
          break;
        case "host_5":
          isUnlocked = hostCount >= 5;
          progress = hostCount;
          maxProgress = 5;
          break;
        case "host_10":
          isUnlocked = hostCount >= 10;
          progress = hostCount;
          maxProgress = 10;
          break;
        case "invite_1":
          isUnlocked = inviteCount >= 1;
          progress = inviteCount;
          maxProgress = 1;
          break;
        case "invite_5":
          isUnlocked = inviteCount >= 5;
          progress = inviteCount;
          maxProgress = 5;
          break;
        case "invite_10":
          isUnlocked = inviteCount >= 10;
          progress = inviteCount;
          maxProgress = 10;
          break;
        case "invite_25":
          isUnlocked = inviteCount >= 25;
          progress = inviteCount;
          maxProgress = 25;
          break;
        case "contribution_10":
          isUnlocked = totalContribution >= 10;
          progress = totalContribution;
          maxProgress = 10;
          break;
        case "contribution_50":
          isUnlocked = totalContribution >= 50;
          progress = totalContribution;
          maxProgress = 50;
          break;
        case "contribution_100":
          isUnlocked = totalContribution >= 100;
          progress = totalContribution;
          maxProgress = 100;
          break;
        case "streak_3":
          isUnlocked = streakDays >= 3;
          progress = streakDays;
          maxProgress = 3;
          break;
        case "streak_7":
          isUnlocked = streakDays >= 7;
          progress = streakDays;
          maxProgress = 7;
          break;
        case "streak_30":
          isUnlocked = streakDays >= 30;
          progress = streakDays;
          maxProgress = 30;
          break;
        case "goal_reached":
          isUnlocked = goalReachedCount >= 1;
          progress = goalReachedCount;
          maxProgress = 1;
          break;
      }
      
      return {
        ...achievement,
        isUnlocked,
        progress,
        maxProgress,
      };
    });
  }, [myParticipations, myEvents]);

  // 統計
  const stats = useMemo(() => {
    const unlocked = achievementStatus.filter(a => a.isUnlocked).length;
    const total = achievementStatus.length;
    const points = achievementStatus.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0);
    return { unlocked, total, points };
  }, [achievementStatus]);

  // タイプ別にグループ化
  const groupedAchievements = useMemo(() => {
    const groups: Record<string, typeof achievementStatus> = {};
    achievementStatus.forEach(a => {
      if (!groups[a.type]) groups[a.type] = [];
      groups[a.type].push(a);
    });
    return groups;
  }, [achievementStatus]);

  if (!user) {
    return (
      <ScreenContainer className="p-4">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#9CA3AF", fontSize: 16 }}>ログインしてください</Text>
          <TouchableOpacity
            onPress={() => router.push("/mypage")}
            style={{ marginTop: 16, padding: 12 }}
          >
            <Text style={{ color: "#EC4899" }}>ログイン画面へ</Text>
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
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          アチーブメント
        </Text>

        {/* 統計サマリー */}
        <LinearGradient
          colors={["#EC4899", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 12, padding: 20, marginBottom: 24 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
                {stats.unlocked}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                解除済み
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
                {stats.total}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                全アチーブメント
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#FFD700", fontSize: 28, fontWeight: "bold" }}>
                {stats.points}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                獲得ポイント
              </Text>
            </View>
          </View>
          {/* 進捗バー */}
          <View style={{ marginTop: 16 }}>
            <View style={{ height: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden" }}>
              <View
                style={{
                  height: "100%",
                  width: `${(stats.unlocked / stats.total) * 100}%`,
                  backgroundColor: "#fff",
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, textAlign: "center", marginTop: 4 }}>
              {((stats.unlocked / stats.total) * 100).toFixed(0)}% コンプリート
            </Text>
          </View>
        </LinearGradient>

        {/* タイプ別アチーブメント */}
        {Object.entries(groupedAchievements).map(([type, achievements]) => (
          <View key={type} style={{ marginBottom: 24 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              {TYPE_NAMES[type] || type}
            </Text>
            {achievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={achievement.isUnlocked}
                progress={achievement.progress}
                maxProgress={achievement.maxProgress}
              />
            ))}
          </View>
        ))}

        {/* 余白 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
