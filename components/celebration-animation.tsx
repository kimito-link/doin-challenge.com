import { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// キャラクター画像
const CHARACTER_HAPPY = require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png");

interface CelebrationAnimationProps {
  visible: boolean;
  onComplete?: () => void;
  characterSize?: number;
  showConfetti?: boolean;
}

/**
 * 成功時のお祝いアニメーションコンポーネント
 * キャラクターがジャンプして喜ぶアニメーション + 紙吹雪
 */
export function CelebrationAnimation({
  visible,
  onComplete,
  characterSize = 120,
  showConfetti = true,
}: CelebrationAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // キャラクターアニメーション値
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  // 紙吹雪のアニメーション値（複数）
  const confettiItems = Array.from({ length: 12 }, (_, i) => ({
    x: useSharedValue(0),
    y: useSharedValue(0),
    rotation: useSharedValue(0),
    opacity: useSharedValue(0),
    scale: useSharedValue(1),
  }));

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleComplete = () => {
    setIsAnimating(false);
    onComplete?.();
  };

  useEffect(() => {
    if (visible && !isAnimating) {
      setIsAnimating(true);
      
      // ハプティクスフィードバック
      triggerHaptic();

      // キャラクターの登場アニメーション
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );

      // ジャンプアニメーション（3回）
      translateY.value = withDelay(
        300,
        withRepeat(
          withSequence(
            withTiming(-30, { duration: 200, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })
          ),
          3,
          false
        )
      );

      // 軽い回転
      rotate.value = withDelay(
        300,
        withRepeat(
          withSequence(
            withTiming(-5, { duration: 100 }),
            withTiming(5, { duration: 100 }),
            withTiming(0, { duration: 100 })
          ),
          3,
          false
        )
      );

      // 紙吹雪アニメーション
      if (showConfetti) {
        confettiItems.forEach((item, index) => {
          const delay = index * 50;
          const angle = (index / confettiItems.length) * Math.PI * 2;
          const distance = 100 + Math.random() * 50;
          
          item.opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
          item.x.value = withDelay(
            delay,
            withTiming(Math.cos(angle) * distance, { duration: 800, easing: Easing.out(Easing.quad) })
          );
          item.y.value = withDelay(
            delay,
            withSequence(
              withTiming(-50 - Math.random() * 30, { duration: 400, easing: Easing.out(Easing.quad) }),
              withTiming(100 + Math.random() * 50, { duration: 600, easing: Easing.in(Easing.quad) })
            )
          );
          item.rotation.value = withDelay(
            delay,
            withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1000 })
          );
          item.opacity.value = withDelay(
            delay + 700,
            withTiming(0, { duration: 300 })
          );
        });
      }

      // アニメーション完了後のコールバック
      const timeout = setTimeout(() => {
        runOnJS(handleComplete)();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const characterStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  if (!visible && !isAnimating) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* 紙吹雪 */}
      {showConfetti && confettiItems.map((item, index) => {
        const confettiStyle = useAnimatedStyle(() => ({
          opacity: item.opacity.value,
          transform: [
            { translateX: item.x.value },
            { translateY: item.y.value },
            { rotate: `${item.rotation.value}deg` },
            { scale: item.scale.value },
          ],
        }));

        const colors = ["#EC4899", "#F97316", "#FBBF24", "#22C55E", "#3B82F6", "#8B5CF6"];
        const color = colors[index % colors.length];

        return (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              confettiStyle,
              { backgroundColor: color },
            ]}
          />
        );
      })}

      {/* キャラクター */}
      <Animated.View style={[styles.characterContainer, characterStyle]}>
        <Image
          source={CHARACTER_HAPPY}
          style={{ width: characterSize, height: characterSize }}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

/**
 * 簡易的なお祝いエフェクト（紙吹雪のみ）
 */
export function ConfettiEffect({
  visible,
  onComplete,
}: {
  visible: boolean;
  onComplete?: () => void;
}) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (visible) {
      const colors = ["#EC4899", "#F97316", "#FBBF24", "#22C55E", "#3B82F6", "#8B5CF6"];
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        color: colors[i % colors.length],
        delay: i * 30,
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!visible || particles.length === 0) return null;

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} {...particle} />
      ))}
    </View>
  );
}

function ConfettiParticle({
  x,
  color,
  delay,
}: {
  x: number;
  color: string;
  delay: number;
}) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateX.value = withDelay(delay, withTiming(x, { duration: 1000 }));
    translateY.value = withDelay(
      delay,
      withTiming(200, { duration: 1000, easing: Easing.in(Easing.quad) })
    );
    rotation.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1000 })
    );
    opacity.value = withDelay(delay + 700, withTiming(0, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        style,
        { backgroundColor: color },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  characterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 100,
    zIndex: 999,
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
