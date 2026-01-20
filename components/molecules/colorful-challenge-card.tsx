import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { useResponsive } from "@/hooks/use-responsive";
import { AnimatedCard } from "@/components/molecules/animated-pressable";
import { LazyAvatar } from "@/components/molecules/lazy-image";
import { Countdown } from "@/components/atoms/countdown";
import { goalTypeConfig } from "@/constants/goal-types";

interface Challenge {
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
}

interface ColorfulChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
  numColumns?: number;
  colorIndex?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (challengeId: number) => void;
}

// 「しゃべった！」風のカラフルなカラーパレット
const CARD_COLORS = [
  { bg: "#EC4899", gradient: ["#EC4899", "#F472B6"] }, // ピンク
  { bg: "#EF4444", gradient: ["#EF4444", "#F87171"] }, // 赤
  { bg: "#F97316", gradient: ["#F97316", "#FB923C"] }, // オレンジ
  { bg: "#EAB308", gradient: ["#EAB308", "#FACC15"] }, // 黄色
  { bg: "#14B8A6", gradient: ["#14B8A6", "#2DD4BF"] }, // ティール
  { bg: "#22C55E", gradient: ["#22C55E", "#4ADE80"] }, // 緑
  { bg: "#8B5CF6", gradient: ["#8B5CF6", "#A78BFA"] }, // 紫
  { bg: "#3B82F6", gradient: ["#3B82F6", "#60A5FA"] }, // 青
];

// イベントタイプのバッジ
const eventTypeBadge: Record<string, { label: string; color: string }> = {
  solo: { label: "ソロ", color: "rgba(0,0,0,0.3)" },
  group: { label: "グループ", color: "rgba(0,0,0,0.3)" },
};

/**
 * カラフルなチャレンジカードコンポーネント
 * 「しゃべった！」アプリを参考にした、鮮やかな色のカード型UI
 */
export function ColorfulChallengeCard({ 
  challenge, 
  onPress, 
  numColumns = 2,
  colorIndex,
  isFavorite = false,
  onToggleFavorite,
}: ColorfulChallengeCardProps) {
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
  
  // カードの色を決定（IDベースで一貫性を保つ）
  const cardColorIdx = colorIndex !== undefined ? colorIndex : challenge.id % CARD_COLORS.length;
  const cardColor = CARD_COLORS[cardColorIdx];

  return (
    <AnimatedCard
      onPress={onPress}
      scaleAmount={0.97}
      style={{
        borderRadius: 16,
        marginHorizontal: isDesktop ? 4 : 4,
        marginVertical: 6,
        overflow: "hidden",
        width: cardWidth as any,
        // UXガイドライン: 軽いドロップシャドウ
        shadowColor: cardColor.bg,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={cardColor.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* お気に入りアイコン（左上） */}
        <TouchableOpacity 
          style={styles.favoriteIcon}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite?.(challenge.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons 
            name={isFavorite ? "star" : "star-outline"} 
            size={20} 
            color={isFavorite ? "#FFD700" : "rgba(255,255,255,0.6)"} 
          />
        </TouchableOpacity>

        {/* メニューアイコン（右上） */}
        <View style={styles.menuIcon}>
          <MaterialIcons name="more-horiz" size={20} color="rgba(255,255,255,0.6)" />
        </View>

        {/* メインコンテンツ */}
        <View style={styles.content}>
          {/* タイトル（大きく中央に） */}
          <Text style={styles.title} numberOfLines={2}>
            {challenge.title}
          </Text>

          {/* 作成者情報 */}
          <View style={styles.hostContainer}>
            <LazyAvatar
              source={challenge.hostProfileImage ? { uri: challenge.hostProfileImage } : undefined}
              size={20}
              fallbackColor="rgba(255,255,255,0.3)"
              fallbackText={(challenge.hostName || "?").charAt(0)}
            />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName} numberOfLines={1}>
                {challenge.hostName}
              </Text>
              {challenge.hostUsername && (
                <Text style={styles.hostUsername} numberOfLines={1}>
                  @{challenge.hostUsername}
                </Text>
              )}
            </View>
          </View>

          {/* タグ/バッジ（タイプ表示） */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: typeBadge.color }]}>
              <Text style={styles.badgeText}>{typeBadge.label}</Text>
            </View>
            {challenge.venue && (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
                <MaterialIcons name="place" size={10} color="#fff" />
                <Text style={[styles.badgeText, { marginLeft: 2 }]} numberOfLines={1}>
                  {challenge.venue}
                </Text>
              </View>
            )}
          </View>

          {/* 進捗情報 */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {challenge.currentValue.toLocaleString()} / {challenge.goalValue.toLocaleString()}{unit}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%` }
                ]} 
              />
            </View>
          </View>

          {/* 日付（右下） */}
          <View style={styles.dateContainer}>
            <MaterialIcons name="event" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        {/* コメントアイコン（右下） */}
        <View style={styles.commentIcon}>
          <MaterialIcons name="chat-bubble-outline" size={18} color="rgba(255,255,255,0.6)" />
        </View>
      </LinearGradient>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  cardGradient: {
    minHeight: 140,
    padding: 16,
    position: "relative",
  },
  favoriteIcon: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  menuIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  progressContainer: {
    width: "100%",
    marginTop: 8,
  },
  progressText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "500",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  dateContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginLeft: 4,
  },
  commentIcon: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },
  hostContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  hostInfo: {
    marginLeft: 6,
    flex: 1,
  },
  hostName: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
  },
  hostUsername: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
  },
});

export default ColorfulChallengeCard;
