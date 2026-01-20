// components/organisms/tutorial-overlay/effects.tsx
// v6.18: チュートリアルのエフェクトコンポーネント
import { View, Dimensions, StyleSheet, Text } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
} from "react-native-reanimated";
import { color } from "@/theme/tokens";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * 紙吹雪コンポーネント
 */
export function Confetti({ active }: { active: boolean }) {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => {
    const x = useSharedValue(Math.random() * SCREEN_WIDTH);
    const y = useSharedValue(-50);
    const rotation = useSharedValue(0);
    const scale = useSharedValue(0.5 + Math.random() * 0.5);
    
    useEffect(() => {
      if (active) {
        const delay = Math.random() * 500;
        y.value = withDelay(delay, withTiming(SCREEN_HEIGHT + 50, { duration: 2000 + Math.random() * 1000 }));
        rotation.value = withDelay(delay, withRepeat(withTiming(360, { duration: 1000 }), -1, false));
        x.value = withDelay(delay, withTiming(x.value + (Math.random() - 0.5) * 100, { duration: 2000 }));
      }
    }, [active]);

    const style = useAnimatedStyle(() => ({
      position: "absolute" as const,
      left: x.value,
      top: y.value,
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    }));

    const confettiColors = [color.coral, color.confettiTeal, color.confettiYellow, color.confettiMint, color.confettiCoral, color.hostAccentLegacy];
    const pieceColor = confettiColors[i % confettiColors.length];

    return (
      <Animated.View key={i} style={style}>
        <View style={{ width: 10, height: 10, backgroundColor: pieceColor, borderRadius: 2 }} />
      </Animated.View>
    );
  });

  if (!active) return null;
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{confettiPieces}</View>;
}

/**
 * キラキラエフェクトコンポーネント
 */
export function Sparkles({ active }: { active: boolean }) {
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);
    
    useEffect(() => {
      if (active) {
        const delay = i * 50;
        opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(delay, withTiming(1, { duration: 300 }));
      }
    }, [active]);

    const style = useAnimatedStyle(() => ({
      position: "absolute" as const,
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

    const angle = (i / 12) * Math.PI * 2;
    const radius = 80 + Math.random() * 40;
    const x = SCREEN_WIDTH / 2 + Math.cos(angle) * radius - 10;
    const y = SCREEN_HEIGHT / 2 - 50 + Math.sin(angle) * radius - 10;

    return (
      <Animated.View key={i} style={[style, { left: x, top: y }]}>
        <Text style={{ fontSize: 20, color: color.rankGold }}>✦</Text>
      </Animated.View>
    );
  });

  if (!active) return null;
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{sparkles}</View>;
}
