import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CountdownProps {
  targetDate: Date | string;
  compact?: boolean;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date();
  const target = new Date(targetDate);
  const difference = target.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

export function Countdown({ targetDate, compact = false, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => 
    calculateTimeLeft(new Date(targetDate))
  );
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(new Date(targetDate));
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isComplete, onComplete]);

  if (isComplete) {
    return (
      <View style={compact ? styles.compactContainer : styles.container}>
        <LinearGradient
          colors={["#EC4899", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={compact ? styles.compactBadge : styles.completeBadge}
        >
          <Text style={compact ? styles.compactCompleteText : styles.completeText}>
            🎉 開催中！
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (compact) {
    // コンパクト表示（カード用）
    if (timeLeft.days > 0) {
      return (
        <View style={styles.compactContainer}>
          <View style={styles.compactBadge}>
            <Text style={styles.compactDays}>あと{timeLeft.days}日</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.compactBadge, { backgroundColor: "#EC4899" }]}>
          <Text style={styles.compactTime}>
            {String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </Text>
        </View>
      </View>
    );
  }

  // フル表示（詳細画面用）
  return (
    <View style={styles.container}>
      <Text style={styles.label}>イベントまであと</Text>
      <View style={styles.timerContainer}>
        <TimeUnit value={timeLeft.days} label="日" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.hours} label="時間" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.minutes} label="分" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.seconds} label="秒" />
      </View>
    </View>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.timeUnit}>
      <LinearGradient
        colors={["#1A1D21", "#2D3139"]}
        style={styles.timeBox}
      >
        <Text style={styles.timeValue}>{String(value).padStart(2, "0")}</Text>
      </LinearGradient>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
  },
  label: {
    color: "#D1D5DB",
    fontSize: 14,
    marginBottom: 12,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeUnit: {
    alignItems: "center",
  },
  timeBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3D4149",
  },
  timeValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  timeLabel: {
    color: "#CBD5E0",
    fontSize: 11,
    marginTop: 4,
  },
  separator: {
    color: "#EC4899",
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  completeBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  completeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // コンパクトスタイル
  compactContainer: {
    alignItems: "flex-start",
  },
  compactBadge: {
    backgroundColor: "#2D3139",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactDays: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  compactTime: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  compactCompleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
