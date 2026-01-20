/**
 * チャレンジカードコンポーネント
 * ホーム画面のグリッドに表示されるチャレンジカード
 */
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { useResponsive } from "@/hooks/use-responsive";
import { AnimatedCard } from "@/components/molecules/animated-pressable";
import { LazyAvatar } from "@/components/molecules/lazy-image";
import { Countdown } from "@/components/atoms/countdown";
import { goalTypeConfig } from "@/constants/goal-types";
import type { Challenge } from "@/types/challenge";
import { eventTypeBadge } from "@/types/challenge";

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
  numColumns?: number;
  colorIndex?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export function ChallengeCard({
  challenge,
  onPress,
  numColumns = 2,
  colorIndex: _colorIndex,
  isFavorite: _isFavorite = false,
  onToggleFavorite: _onToggleFavorite,
}: ChallengeCardProps) {
  const colors = useColors();
  const { isDesktop } = useResponsive();
  const eventDate = new Date(challenge.eventDate);
  const isDateUndecided = eventDate.getFullYear() === 9999;
  const formattedDate = isDateUndecided ? "未定" : `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;

  const progress = Math.min((challenge.currentValue / challenge.goalValue) * 100, 100);
  const goalConfig = goalTypeConfig[challenge.goalType] || goalTypeConfig.custom;
  const typeBadge = eventTypeBadge[challenge.eventType] || eventTypeBadge.solo;
  const unit = challenge.goalUnit || goalConfig.unit;
  const remaining = Math.max(challenge.goalValue - challenge.currentValue, 0);

  const cardWidth = numColumns === 3 ? "31%" : numColumns === 2 ? "47%" : "100%";

  return (
    <AnimatedCard
      onPress={onPress}
      scaleAmount={0.98}
      style={{
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        marginHorizontal: isDesktop ? 4 : 4,
        marginVertical: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2D3139",
        width: cardWidth as any,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}>
        <View style={{ backgroundColor: typeBadge.color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
          <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>{typeBadge.label}</Text>
        </View>
      </View>

      <LinearGradient
        colors={["#EC4899", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 60, justifyContent: "flex-end", paddingHorizontal: 12, paddingBottom: 8 }}
      >
        <View style={{ position: "absolute", top: 8, right: 8 }}>
          <MaterialIcons name={goalConfig.icon as any} size={16} color="rgba(255,255,255,0.7)" />
        </View>
        {challenge.venue && (
          <View style={{ position: "absolute", top: 8, left: 8, right: 32 }}>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600" }} numberOfLines={1}>
              {challenge.venue}
            </Text>
          </View>
        )}
        <View style={{ position: "absolute", bottom: -16, left: 12 }}>
          <LazyAvatar
            source={challenge.hostProfileImage ? { uri: challenge.hostProfileImage } : undefined}
            size={32}
            fallbackColor="#EC4899"
            fallbackText={challenge.hostName?.charAt(0) || challenge.hostUsername?.charAt(0) || "?"}
            lazy={true}
          />
        </View>
      </LinearGradient>

      <View style={{ padding: 16, paddingTop: 20 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginBottom: 4 }} numberOfLines={2}>
          {challenge.title}
        </Text>
        <Text style={{ color: "#D1D5DB", fontSize: 12, marginBottom: 8 }}>{challenge.hostName}</Text>
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>
              {challenge.currentValue}
              <Text style={{ fontSize: 12, color: "#D1D5DB" }}> / {challenge.goalValue}{unit}</Text>
            </Text>
          </View>
          <View style={{ height: 6, backgroundColor: "#2D3139", borderRadius: 3, overflow: "hidden" }}>
            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: "100%", width: `${progress}%`, borderRadius: 3 }}
            />
          </View>
          <Text style={{ color: "#D1D5DB", fontSize: 10, marginTop: 4 }}>
            あと{remaining}{unit}で目標達成！
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {!isDateUndecided && <Countdown targetDate={challenge.eventDate} compact />}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="event" size={12} color="#FBBF24" />
            <Text style={{ color: "#FBBF24", fontSize: 12, marginLeft: 2 }}>{formattedDate}</Text>
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}
