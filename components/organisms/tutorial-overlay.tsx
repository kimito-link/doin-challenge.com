import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Platform } from "react-native";
import { useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export type TutorialStep = {
  /** 画面に表示する一言（12文字以内推奨） */
  message: string;
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
 * 任天堂クオリティのチュートリアルオーバーレイ
 * 
 * 原則：
 * - 説明文で理解させようとしない
 * - 最初の行動は3秒以内に成功させる
 * - 1ステップにつき1アクションのみ
 * - 専門用語・抽象表現は禁止
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
  const arrowBounce = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // メッセージのフェードイン
      messageOpacity.value = withTiming(1, { duration: 300 });
      
      // パルスアニメーション（ハイライト部分）
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // 矢印のバウンスアニメーション
      arrowBounce.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [visible, step]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowBounce.value }],
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

  // ハイライト位置の計算
  const highlight = step.highlight;
  const hasHighlight = !!highlight;
  
  // メッセージ位置の計算
  const getMessagePosition = () => {
    if (!hasHighlight) {
      return { top: SCREEN_HEIGHT / 2 - 50 };
    }
    
    const position = step.messagePosition || "bottom";
    if (position === "top") {
      return { top: Math.max(highlight!.y - 120, 60) };
    } else if (position === "center") {
      return { top: SCREEN_HEIGHT / 2 - 50 };
    } else {
      return { top: Math.min(highlight!.y + highlight!.height + 40, SCREEN_HEIGHT - 150) };
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.container]}
    >
      {/* 暗いオーバーレイ（ハイライト部分は透明） */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        style={styles.overlay}
      >
        {/* SVGでハイライト部分を切り抜く代わりに、4つの暗い領域を配置 */}
        {hasHighlight ? (
          <>
            {/* 上部 */}
            <View style={[styles.darkArea, { top: 0, left: 0, right: 0, height: highlight!.y - 10 }]} />
            {/* 下部 */}
            <View style={[styles.darkArea, { top: highlight!.y + highlight!.height + 10, left: 0, right: 0, bottom: 0 }]} />
            {/* 左部 */}
            <View style={[styles.darkArea, { top: highlight!.y - 10, left: 0, width: highlight!.x - 10, height: highlight!.height + 20 }]} />
            {/* 右部 */}
            <View style={[styles.darkArea, { top: highlight!.y - 10, left: highlight!.x + highlight!.width + 10, right: 0, height: highlight!.height + 20 }]} />
            
            {/* ハイライト枠 */}
            <Animated.View
              style={[
                styles.highlightBorder,
                pulseStyle,
                {
                  top: highlight!.y - 10,
                  left: highlight!.x - 10,
                  width: highlight!.width + 20,
                  height: highlight!.height + 20,
                  borderRadius: highlight!.circular ? (highlight!.width + 20) / 2 : 16,
                },
              ]}
            />
          </>
        ) : (
          <View style={[styles.darkArea, { top: 0, left: 0, right: 0, bottom: 0 }]} />
        )}

        {/* メッセージ */}
        <Animated.View style={[styles.messageContainer, messageStyle, getMessagePosition()]}>
          {/* 矢印（ハイライトがある場合） */}
          {hasHighlight && step.messagePosition !== "center" && (
            <Animated.View style={[styles.arrow, arrowStyle, step.messagePosition === "top" ? styles.arrowDown : styles.arrowUp]}>
              <Text style={styles.arrowText}>
                {step.messagePosition === "top" ? "▼" : "▲"}
              </Text>
            </Animated.View>
          )}
          
          {/* メッセージテキスト */}
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{step.message}</Text>
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
  },
  darkArea: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  highlightBorder: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#DD6500",
    backgroundColor: "transparent",
  },
  messageContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
  },
  messageBubble: {
    backgroundColor: "#DD6500",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    maxWidth: 300,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  arrow: {
    position: "absolute",
  },
  arrowUp: {
    top: -20,
  },
  arrowDown: {
    bottom: -20,
  },
  arrowText: {
    color: "#DD6500",
    fontSize: 24,
  },
  stepIndicator: {
    flexDirection: "row",
    marginTop: 16,
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
    marginTop: 12,
  },
});
