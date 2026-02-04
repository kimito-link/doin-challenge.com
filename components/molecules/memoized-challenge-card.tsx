import { memo, useCallback } from "react";
import { color, palette } from "@/theme/tokens";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { goalTypeConfig } from "@/constants/goal-types";
import * as Haptics from "expo-haptics";

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

interface MemoizedChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
  numColumns?: number;
}

// イベントタイプのバッジ
const eventTypeBadge: Record<string, { label: string; color: string }> = {
  solo: { label: "ソロ", color: color.accentPrimary },
  group: { label: "グループ", color: color.accentAlt },
};

/**
 * メモ化されたチャレンジカードコンポーネント
 * 
 * React.memoを使用して不要な再レンダリングを防止
 * FlatListのパフォーマンス向上に貢献
 */
export const MemoizedChallengeCard = memo<MemoizedChallengeCardProps>(
  function MemoizedChallengeCard({ challenge, onPress, numColumns = 1 }) {
    const eventDate = new Date(challenge.eventDate);
    const progress = Math.min((challenge.currentValue / challenge.goalValue) * 100, 100);
    const goalConfig = goalTypeConfig[challenge.goalType] || goalTypeConfig.custom;
    const unit = challenge.goalUnit || goalConfig.unit;
    const remaining = Math.max(challenge.goalValue - challenge.currentValue, 0);
    const badge = eventTypeBadge[challenge.eventType];

    // カードの幅を計算
    const cardWidth = numColumns > 1 ? `${100 / numColumns - 2}%` : "100%";

    const handlePress = useCallback(() => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }, [onPress]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          { width: cardWidth as any },
          pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
        ]}
      >
        {/* グラデーション背景 */}
        <LinearGradient
          colors={[color.surface, color.bg]}
          style={styles.gradient}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            {/* 主催者情報 */}
            <View style={styles.hostInfo}>
              {challenge.hostProfileImage ? (
                <Image
                  source={{ uri: challenge.hostProfileImage }}
                  style={styles.avatar}
                  cachePolicy="memory-disk"
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                  transition={200}
                  priority="low"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarText}>
                    {(challenge.hostName || "?")[0]}
                  </Text>
                </View>
              )}
              <View style={styles.hostTextContainer}>
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

            {/* イベントタイプバッジ */}
            {badge && (
              <View style={[styles.badge, { backgroundColor: badge.color }]}>
                <Text style={styles.badgeText}>{badge.label}</Text>
              </View>
            )}
          </View>

          {/* タイトル */}
          <Text style={styles.title} numberOfLines={2}>
            {challenge.title}
          </Text>

          {/* 進捗バー */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]}
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {challenge.currentValue.toLocaleString()} / {challenge.goalValue.toLocaleString()} {unit}
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(progress)}%
              </Text>
            </View>
          </View>

          {/* フッター */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <MaterialIcons name="event" size={14} color={color.textMuted} />
              <Text style={styles.footerText}>
                {eventDate.toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
              </Text>
            </View>
            {challenge.venue && (
              <View style={styles.footerItem}>
                <MaterialIcons name="place" size={14} color={color.textMuted} />
                <Text style={styles.footerText} numberOfLines={1}>
                  {challenge.venue}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Pressable>
    );
  },
  // カスタム比較関数
  (prevProps, nextProps) => {
    // IDと現在値が同じなら再レンダリングしない
    return (
      prevProps.challenge.id === nextProps.challenge.id &&
      prevProps.challenge.currentValue === nextProps.challenge.currentValue &&
      prevProps.numColumns === nextProps.numColumns
    );
  }
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    backgroundColor: color.hostAccentLegacy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: color.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
  hostTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  hostName: {
    color: color.textWhite,
    fontSize: 14,
    fontWeight: "600",
  },
  hostUsername: {
    color: color.textMuted,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: color.textWhite,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    color: color.textWhite,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: color.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: color.hostAccentLegacy,
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    color: color.textMuted,
    fontSize: 12,
  },
  progressPercent: {
    color: color.hostAccentLegacy,
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 16,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    color: color.textMuted,
    fontSize: 12,
  },
});

export default MemoizedChallengeCard;
