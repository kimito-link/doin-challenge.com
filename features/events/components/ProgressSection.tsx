import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { Countdown } from "@/components/atoms/countdown";
import { TalkingCharacter } from "@/components/molecules/talking-character";
import { CelebrationAnimation } from "@/components/molecules/celebration-animation";

const { width: screenWidth } = Dimensions.get("window");

export type ProgressSectionProps = {
  current: number;
  goal: number;
  unit: string;
  eventDate?: Date | null;
  momentum?: {
    recent24h: number;
    recent1h: number;
    isHot: boolean;
  };
};

export function ProgressSection({
  current,
  goal,
  unit,
  eventDate,
  momentum,
}: ProgressSectionProps) {
  const colors = useColors();
  const progress = Math.min((current / goal) * 100, 100);
  const isAchieved = progress >= 100;

  return (
    <View style={styles.container}>
      {/* カウントダウン */}
      {eventDate && (
        <View style={styles.countdownContainer}>
          <View style={styles.countdownCard}>
            <LinearGradient
              colors={[color.surface, color.surfaceAlt]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.countdownContent}>
              <Countdown targetDate={eventDate} />
            </View>
          </View>
        </View>
      )}

      {/* 進捗カード */}
      <View style={styles.progressCard}>
        {/* 数値表示 */}
        <View style={styles.numberContainer}>
          <View style={styles.numberRow}>
            <Text style={[styles.currentNumber, { color: color.accentPrimary }]}>
              {current.toLocaleString()}
            </Text>
            <Text style={[styles.goalNumber, { color: color.textSecondary }]}>
              / {goal.toLocaleString()} {unit}
            </Text>
          </View>
        </View>

        {/* 進捗バー */}
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={[color.accentPrimary, color.accentAlt]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${progress}%` }]}
          />
        </View>

        {/* 達成時のお祝い */}
        {isAchieved && (
          <View style={styles.achievementContainer}>
            <CelebrationAnimation visible={true} />
            <TalkingCharacter size={80} />
          </View>
        )}

        {/* 勢い表示 */}
        {momentum?.isHot && (
          <View style={styles.momentumBadge}>
            <Text style={styles.momentumText}>
              🔥 勢いあり！24時間で+{momentum.recent24h}人
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  countdownContainer: {
    marginBottom: 16,
  },
  countdownCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: color.border,
  },
  countdownContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  progressCard: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  numberContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentNumber: {
    fontSize: 48,
    fontWeight: "bold",
  },
  goalNumber: {
    fontSize: 18,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: color.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  achievementContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  momentumBadge: {
    backgroundColor: color.warning,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "center",
    marginTop: 12,
  },
  momentumText: {
    color: color.textWhite,
    fontSize: 12,
    fontWeight: "bold",
  },
});
