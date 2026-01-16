import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Platform } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// アイコン画像のマッピング
const TUTORIAL_ICONS: Record<string, any> = {
  cheer: require("@/assets/images/characters/idolKimitoLink.png"),
  list: require("@/assets/images/characters/idolKimitoLink.png"),
  notification: require("@/assets/images/characters/idolKimitoLink.png"),
  crown: require("@/assets/images/characters/idolKimitoLink.png"),
  smile: require("@/assets/images/characters/KimitoLink.png"),
  thinking: require("@/assets/images/characters/KimitoLink.png"),
  map: require("@/assets/images/characters/idolKimitoLink.png"),
  star: require("@/assets/images/characters/idolKimitoLink.png"),
  heart: require("@/assets/images/characters/idolKimitoLink.png"),
  chart: require("@/assets/images/characters/idolKimitoLink.png"),
};

export type TutorialStep = {
  /** 画面に表示する一言（12文字以内推奨） */
  message: string;
  /** サブメッセージ（メリットの説明） */
  subMessage?: string;
  /** アイコンタイプ */
  icon?: keyof typeof TUTORIAL_ICONS;
  /** ハイライトする要素の位置（指定しない場合は中央表示） */
  highlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
    /** 丸型ハイライトにするか */
    circular?: boolean;
  };
  /** メッセージの表示位置 */
  messagePosition?: "top" | "bottom" | "center";
  /** タップで次に進むか（falseの場合は特定のアクションを待つ） */
  tapToContinue?: boolean;
  /** 成功時のアニメーション */
  successAnimation?: "confetti" | "pulse" | "none";
};

type TutorialOverlayProps = {
  /** 現在のステップ */
  step: TutorialStep;
  /** 現在のステップ番号（1から開始） */
  stepNumber: number;
  /** 総ステップ数 */
  totalSteps: number;
  /** 次のステップに進む */
  onNext: () => void;
  /** チュートリアル終了 */
  onComplete: () => void;
  /** 表示/非表示 */
  visible: boolean;
};

/**
 * メリット訴求型チュートリアルオーバーレイ
 * 
 * 原則：
 * - 操作方法ではなく「なぜ使うべきか」を伝える
 * - キャラクターと一緒にメリットを説明
 * - 視覚的にわかりやすく
 */
export function TutorialOverlay({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onComplete,
  visible,
}: TutorialOverlayProps) {
  const colors = useColors();
  
  // アニメーション値
  const pulseScale = useSharedValue(1);
  const messageOpacity = useSharedValue(0);
  const characterBounce = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // メッセージのフェードイン
      messageOpacity.value = withTiming(1, { duration: 300 });
      
      // パルスアニメーション
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // キャラクターのバウンスアニメーション
      characterBounce.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 600, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [visible, step]);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const characterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: characterBounce.value }],
  }));

  const handleTap = () => {
    if (step.tapToContinue !== false) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      if (stepNumber >= totalSteps) {
        onComplete();
      } else {
        onNext();
      }
    }
  };

  if (!visible) return null;

  const iconSource = step.icon ? TUTORIAL_ICONS[step.icon] : TUTORIAL_ICONS.smile;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.container]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        style={styles.overlay}
      >
        {/* 暗いオーバーレイ */}
        <View style={styles.darkOverlay} />

        {/* メインコンテンツ */}
        <Animated.View style={[styles.contentContainer, messageStyle]}>
          {/* キャラクター */}
          <Animated.View style={[styles.characterContainer, characterStyle]}>
            <Image
              source={iconSource}
              style={styles.characterImage}
              contentFit="contain"
            />
          </Animated.View>

          {/* メッセージバブル */}
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{step.message}</Text>
            {step.subMessage && (
              <Text style={styles.subMessageText}>{step.subMessage}</Text>
            )}
          </View>

          {/* ステップインジケーター */}
          <View style={styles.stepIndicator}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  i + 1 === stepNumber && styles.stepDotActive,
                  i + 1 < stepNumber && styles.stepDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* タップヒント */}
          {step.tapToContinue !== false && (
            <Text style={styles.tapHint}>タップして続ける</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    maxWidth: 400,
  },
  characterContainer: {
    marginBottom: 24,
  },
  characterImage: {
    width: 150,
    height: 150,
  },
  messageBubble: {
    backgroundColor: "#DD6500",
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 32,
  },
  subMessageText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    marginTop: 24,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  stepDotActive: {
    backgroundColor: "#DD6500",
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: "#22C55E",
  },
  tapHint: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 16,
  },
});
