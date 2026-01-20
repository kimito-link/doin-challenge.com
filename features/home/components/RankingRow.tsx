// features/home/components/RankingRow.tsx
import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { homeText, homeUI } from "@/features/home/ui/theme/tokens";
import type { Challenge } from "@/types/challenge";
import { AnimatedCard } from "@/components/molecules/animated-pressable";
import { LazyAvatar } from "@/components/molecules/lazy-image";
import { goalTypeConfig } from "@/constants/goal-types";
import { eventTypeBadge } from "@/types/challenge";

type Props = {
  rank: number; // 1-based
  challenge: Challenge;
  onPress: () => void;
};

function rankLabel(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

export function RankingRow({ rank, challenge, onPress }: Props) {
  const colors = useColors();
  const goalConfig = goalTypeConfig[challenge.goalType] || goalTypeConfig.custom;
  const typeBadge = eventTypeBadge[challenge.eventType] || eventTypeBadge.solo;

  const current = Math.max(Number(challenge.currentValue ?? 0), 0);
  const goal = Math.max(Number(challenge.goalValue ?? 0), 1);
  const progress = Math.min((current / goal) * 100, 100);
  const unit = challenge.goalUnit || goalConfig.unit;

  const eventDate = new Date(challenge.eventDate);
  const isDateUndecided = eventDate.getFullYear() === 9999;
  const formattedDate = isDateUndecided ? "未定" : `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;

  return (
    <AnimatedCard
      onPress={onPress}
      scaleAmount={0.99}
      style={{
        backgroundColor: homeUI.surface,
        borderWidth: 1,
        borderColor: homeUI.border,
        borderRadius: 14,
        padding: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Rank */}
        <View style={{ width: 34, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
            {rankLabel(rank)}
          </Text>
        </View>

        {/* Avatar */}
        <View style={{ marginRight: 10 }}>
          <LazyAvatar
            source={challenge.hostProfileImage ? { uri: challenge.hostProfileImage } : undefined}
            size={36}
            fallbackColor={homeText.accent}
            fallbackText={challenge.hostName?.charAt(0) || challenge.hostUsername?.charAt(0) || "?"}
            lazy
          />
        </View>

        {/* Main */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ backgroundColor: typeBadge.color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>{typeBadge.label}</Text>
            </View>
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", flex: 1 }} numberOfLines={1}>
              {challenge.title}
            </Text>
          </View>

          <Text style={{ color: homeText.muted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
            {challenge.hostName}
          </Text>

          {/* Progress */}
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>
                {current.toLocaleString()}
                <Text style={{ color: homeText.muted, fontSize: 11 }}> / {goal.toLocaleString()}{unit}</Text>
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialIcons name="event" size={12} color={homeText.accent} />
                <Text style={{ color: homeText.accent, fontSize: 12 }}>{formattedDate}</Text>
              </View>
            </View>

            <View style={{ height: 6, backgroundColor: homeUI.progressBar, borderRadius: 3, overflow: "hidden" }}>
              <View style={{ height: "100%", width: `${progress}%`, backgroundColor: homeText.accent }} />
            </View>
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}
