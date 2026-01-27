import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useEffect } from "react";

interface ParticipationBannerProps {
  /**
   * 参加者の名前
   */
  name: string;
  /**
   * バナーが表示されているかどうか
   */
  visible: boolean;
  /**
   * バナーが非表示になったときのコールバック
   */
  onDismiss: () => void;
}

/**
 * 参加表明バナーコンポーネント
 * 新しい参加者が参加表明したときに画面上部に表示される
 */
export function ParticipationBanner({
  name,
  visible,
  onDismiss,
}: ParticipationBannerProps) {
  const colors = useColors();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // バナーを表示
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withSpring(1, { damping: 15, stiffness: 100 });

      // 3秒後に非表示
      translateY.value = withDelay(
        3000,
        withSpring(-100, { damping: 15, stiffness: 100 }, () => {
          runOnJS(onDismiss)();
        })
      );
      opacity.value = withDelay(3000, withSpring(0, { damping: 15, stiffness: 100 }));
    } else {
      // バナーを非表示
      translateY.value = withSpring(-100, { damping: 15, stiffness: 100 });
      opacity.value = withSpring(0, { damping: 15, stiffness: 100 });
    }
  }, [visible, translateY, opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.emoji]}>🎉</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.background }]}>
            新しい参加者！
          </Text>
          <Text style={[styles.subtitle, { color: colors.background }]}>
            {name}さんが参加表明しました
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
  },
});
