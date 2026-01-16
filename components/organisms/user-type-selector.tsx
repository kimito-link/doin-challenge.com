import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import type { UserType } from "@/hooks/use-tutorial";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// キャラクター画像
const characterImages = {
  fan: require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
  host: require("@/assets/images/characters/KimitoLink.png"),
};

type UserTypeSelectorProps = {
  visible: boolean;
  onSelect: (userType: UserType) => void;
  onSkip: () => void;
};

/**
 * ユーザータイプ選択画面
 * 
 * 任天堂原則：
 * - 「今やること」以外は見せない
 * - 失敗しそうな選択肢は表示しない
 * - 成功体験を数秒で与える
 */
export function UserTypeSelector({ visible, onSelect, onSkip }: UserTypeSelectorProps) {
  const colors = useColors();
  
  // アニメーション値
  const fanScale = useSharedValue(1);
  const hostScale = useSharedValue(1);

  const handlePressIn = (type: UserType) => {
    if (type === "fan") {
      fanScale.value = withSpring(0.95);
    } else {
      hostScale.value = withSpring(0.95);
    }
  };

  const handlePressOut = (type: UserType) => {
    if (type === "fan") {
      fanScale.value = withSpring(1);
    } else {
      hostScale.value = withSpring(1);
    }
  };

  const handleSelect = (type: UserType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSelect(type);
  };

  const fanStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fanScale.value }],
  }));

  const hostStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hostScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Animated.View entering={SlideInUp.delay(100).springify()} style={styles.content}>
          {/* タイトル */}
          <Text style={styles.title}>はじめまして！</Text>
          <Text style={styles.subtitle}>あなたはどっち？</Text>

          {/* 選択肢 */}
          <View style={styles.optionsContainer}>
            {/* ファン */}
            <Animated.View style={fanStyle}>
              <TouchableOpacity
                onPressIn={() => handlePressIn("fan")}
                onPressOut={() => handlePressOut("fan")}
                onPress={() => handleSelect("fan")}
                style={[styles.optionCard, { backgroundColor: "#EC4899" }]}
                activeOpacity={1}
              >
                <Image
                  source={characterImages.fan}
                  style={styles.characterImage}
                  contentFit="contain"
                />
                <Text style={styles.optionTitle}>ファン</Text>
                <Text style={styles.optionDescription}>推しを応援したい</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 主催者 */}
            <Animated.View style={hostStyle}>
              <TouchableOpacity
                onPressIn={() => handlePressIn("host")}
                onPressOut={() => handlePressOut("host")}
                onPress={() => handleSelect("host")}
                style={[styles.optionCard, { backgroundColor: "#DD6500" }]}
                activeOpacity={1}
              >
                <Image
                  source={characterImages.host}
                  style={styles.characterImage}
                  contentFit="contain"
                />
                <Text style={styles.optionTitle}>主催者</Text>
                <Text style={styles.optionDescription}>チャレンジを作りたい</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* スキップ */}
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>あとで見る</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 18,
    marginBottom: 40,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    maxWidth: 160,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  characterImage: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  optionDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textAlign: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
});
