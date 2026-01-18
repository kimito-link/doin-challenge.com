import { useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// キャラクター画像
const CHARACTER_IMAGES = {
  rinku: require("@/assets/images/characters/link/link-yukkuri-half-eyes-mouth-open.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
};

type CharacterType = "rinku" | "konta" | "tanune";

interface InlineValidationErrorProps {
  message: string;
  visible: boolean;
  character?: CharacterType;
}

/**
 * 入力フィールドの近くに表示するインラインバリデーションエラー
 * 吹き出し形式でキャラクターがエラーメッセージを伝える
 */
export function InlineValidationError({ 
  message, 
  visible, 
  character = "rinku" 
}: InlineValidationErrorProps) {
  const bounceY = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      // 出現アニメーション
      scale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(1, { duration: 100 })
      );
      
      bounceY.value = withSequence(
        withTiming(-4, { duration: 200 }),
        withTiming(0, { duration: 200 })
      );
      
      triggerHaptic();
    }
  }, [visible, bounceY, scale, triggerHaptic]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounceY.value },
      { scale: scale.value },
    ],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.content}>
        {/* キャラクター */}
        <Image
          source={CHARACTER_IMAGES[character]}
          style={styles.character}
          contentFit="contain"
        />
        
        {/* 吹き出し */}
        <View style={styles.bubble}>
          <View style={styles.bubbleArrow} />
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  character: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  bubble: {
    flex: 1,
    backgroundColor: "#EC4899",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: "relative",
  },
  bubbleArrow: {
    position: "absolute",
    left: -6,
    top: "50%",
    marginTop: -5,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#EC4899",
  },
  bubbleText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
