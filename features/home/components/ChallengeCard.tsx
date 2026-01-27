/**
 * チャレンジカードコンポーネント
 * ホーム画面のグリッドに表示されるチャレンジカード
 * 
 * ファーストビューの情報削減: 最大5要素に制限
 * - タイトル
 * - 日時（or 残り日数）
 * - 参加予定（会場/配信）
 * - 進捗バー
 * - ジャンル（イベントタイプバッジ）
 */
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { homeColor, homeGradient, homeUI, homeText } from "@/features/home/ui/theme/tokens";
import { palette } from "@/theme/tokens/palette";
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
  width?: number; // px幅（useGridLayoutから渡す）
  colorIndex?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export function ChallengeCard({
  challenge,
  onPress,
  numColumns = 2,
  width,
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

  // 主催者の性別による色分け（左側に2pxの色付きボーダー）
  const getGenderBorderColor = () => {
    if (challenge.hostGender === "male") return palette.genderMale;
    if (challenge.hostGender === "female") return palette.genderFemale;
    return "transparent";
  };

  // width(px)が来たらそれを使用、来なければ従来互換でフォールバック
  const fallbackCardWidth = numColumns === 3 ? "31%" : numColumns === 2 ? "47%" : "100%";
  const cardWidth = width ?? fallbackCardWidth;

  return (
    <AnimatedCard
      onPress={onPress}
      scaleAmount={0.98}
      style={{
        backgroundColor: homeUI.surface,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: homeUI.border,
        borderLeftWidth: 2,
        borderLeftColor: getGenderBorderColor(),
        width: cardWidth as any,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* ジャンル（イベントタイプバッジ） */}
      <View style={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}>
        <View style={{ backgroundColor: typeBadge.color, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>{typeBadge.label}</Text>
        </View>
      </View>

      {/* ヘッダー（アバター + 主催者名） */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, paddingTop: 36 }}>
        <LazyAvatar
          source={challenge.hostProfileImage ? { uri: challenge.hostProfileImage } : undefined}
          size={32}
          fallbackColor={homeColor.fallback}
          fallbackText={challenge.hostName?.charAt(0) || challenge.hostUsername?.charAt(0) || "?"}
          lazy={true}
        />
        <Text style={{ color: homeText.muted, fontSize: 12, marginLeft: 8, flex: 1 }} numberOfLines={1}>
          {challenge.hostName}
        </Text>
      </View>

      {/* タイトル */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold" }} numberOfLines={2}>
          {challenge.title}
        </Text>
      </View>

      {/* 参加予定（会場/配信） */}
      {challenge.venue && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="place" size={14} color={homeText.accent} />
            <Text style={{ color: homeText.accent, fontSize: 12, marginLeft: 4, flex: 1 }} numberOfLines={1}>
              {challenge.venue}
            </Text>
          </View>
        </View>
      )}

      {/* 進捗バー */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
            {challenge.currentValue}
            <Text style={{ fontSize: 12, color: homeText.muted }}> / {challenge.goalValue}{unit}</Text>
          </Text>
          <Text style={{ color: homeText.accent, fontSize: 12, fontWeight: "600" }}>
            {progress.toFixed(0)}%
          </Text>
        </View>
        <View style={{ height: 6, backgroundColor: homeUI.progressBar, borderRadius: 3, overflow: "hidden" }}>
          <LinearGradient
            colors={homeGradient.pinkPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: "100%", width: `${progress}%`, borderRadius: 3 }}
          />
        </View>
      </View>

      {/* 日時（or 残り日数） */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 12 }}>
        {!isDateUndecided && <Countdown targetDate={challenge.eventDate} compact />}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="event" size={12} color={homeText.accent} />
          <Text style={{ color: homeText.accent, fontSize: 12, marginLeft: 2 }}>{formattedDate}</Text>
        </View>
      </View>
    </AnimatedCard>
  );
}
