/**
 * アニメーション最適化ヘルパー
 * React Native Reanimatedを使った高性能アニメーション
 */

import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  type WithTimingConfig,
  type WithSpringConfig,
} from "react-native-reanimated";

/**
 * タイミングアニメーションの設定プリセット
 */
export const TIMING_CONFIGS = {
  /** 高速（150ms） */
  fast: {
    duration: 150,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  /** 通常（250ms） */
  normal: {
    duration: 250,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  /** ゆっくり（400ms） */
  slow: {
    duration: 400,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  /** スムーズ（300ms、ease-in-out） */
  smooth: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  } as WithTimingConfig,

  /** 急速（100ms） */
  quick: {
    duration: 100,
    easing: Easing.out(Easing.quad),
  } as WithTimingConfig,
} as const;

/**
 * スプリングアニメーションの設定プリセット
 */
export const SPRING_CONFIGS = {
  /** 柔らかい */
  soft: {
    damping: 15,
    stiffness: 150,
  } as WithSpringConfig,

  /** 通常 */
  normal: {
    damping: 20,
    stiffness: 200,
  } as WithSpringConfig,

  /** 硬い */
  stiff: {
    damping: 25,
    stiffness: 300,
  } as WithSpringConfig,

  /** バウンシー */
  bouncy: {
    damping: 10,
    stiffness: 100,
  } as WithSpringConfig,
} as const;

/**
 * フェードインアニメーション
 */
export function useFadeIn(duration: number = 250, delay: number = 0) {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withDelay(
      delay,
      withTiming(opacity.value, { duration, easing: Easing.out(Easing.ease) })
    ),
  }));

  const fadeIn = () => {
    opacity.value = 1;
  };

  const fadeOut = () => {
    opacity.value = 0;
  };

  return { animatedStyle, fadeIn, fadeOut, opacity };
}

/**
 * スケールアニメーション
 */
export function useScale(initialScale: number = 1) {
  const scale = useSharedValue(initialScale);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scaleIn = (toValue: number = 1, config: WithTimingConfig = TIMING_CONFIGS.fast) => {
    scale.value = withTiming(toValue, config);
  };

  const scaleOut = (toValue: number = 0, config: WithTimingConfig = TIMING_CONFIGS.fast) => {
    scale.value = withTiming(toValue, config);
  };

  const pulse = (toValue: number = 1.1, config: WithTimingConfig = TIMING_CONFIGS.quick) => {
    scale.value = withSequence(
      withTiming(toValue, config),
      withTiming(1, config)
    );
  };

  return { animatedStyle, scaleIn, scaleOut, pulse, scale };
}

/**
 * スライドインアニメーション
 */
export function useSlideIn(
  direction: "left" | "right" | "top" | "bottom" = "bottom",
  distance: number = 100
) {
  const translateX = useSharedValue(direction === "left" ? -distance : direction === "right" ? distance : 0);
  const translateY = useSharedValue(direction === "top" ? -distance : direction === "bottom" ? distance : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const slideIn = (config: WithTimingConfig = TIMING_CONFIGS.normal) => {
    translateX.value = withTiming(0, config);
    translateY.value = withTiming(0, config);
  };

  const slideOut = (config: WithTimingConfig = TIMING_CONFIGS.normal) => {
    if (direction === "left") {
      translateX.value = withTiming(-distance, config);
    } else if (direction === "right") {
      translateX.value = withTiming(distance, config);
    } else if (direction === "top") {
      translateY.value = withTiming(-distance, config);
    } else {
      translateY.value = withTiming(distance, config);
    }
  };

  return { animatedStyle, slideIn, slideOut, translateX, translateY };
}

/**
 * プレスアニメーション（スケール + 不透明度）
 */
export function usePressAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pressIn = () => {
    scale.value = withTiming(0.97, TIMING_CONFIGS.quick);
    opacity.value = withTiming(0.8, TIMING_CONFIGS.quick);
  };

  const pressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIGS.normal);
    opacity.value = withTiming(1, TIMING_CONFIGS.quick);
  };

  return { animatedStyle, pressIn, pressOut, scale, opacity };
}

/**
 * 回転アニメーション
 */
export function useRotation(initialRotation: number = 0) {
  const rotation = useSharedValue(initialRotation);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rotateTo = (toValue: number, config: WithTimingConfig = TIMING_CONFIGS.normal) => {
    rotation.value = withTiming(toValue, config);
  };

  const spin = (duration: number = 1000) => {
    rotation.value = withTiming(360, {
      duration,
      easing: Easing.linear,
    });
  };

  return { animatedStyle, rotateTo, spin, rotation };
}

/**
 * シェイクアニメーション
 */
export function useShake() {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return { animatedStyle, shake, translateX };
}

/**
 * パルスアニメーション（無限ループ）
 */
export function usePulse(minScale: number = 0.95, maxScale: number = 1.05, duration: number = 1000) {
  const scale = useSharedValue(minScale);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const startPulse = () => {
    scale.value = withSequence(
      withTiming(maxScale, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      withTiming(minScale, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
    );
  };

  const stopPulse = () => {
    scale.value = withTiming(1, TIMING_CONFIGS.fast);
  };

  return { animatedStyle, startPulse, stopPulse, scale };
}

/**
 * 複合アニメーション（フェードイン + スライドイン）
 */
export function useFadeSlideIn(
  direction: "left" | "right" | "top" | "bottom" = "bottom",
  distance: number = 50,
  duration: number = 300
) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(direction === "left" ? -distance : direction === "right" ? distance : 0);
  const translateY = useSharedValue(direction === "top" ? -distance : direction === "bottom" ? distance : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const fadeSlideIn = (delay: number = 0) => {
    const config = { duration, easing: Easing.out(Easing.ease) };
    opacity.value = withDelay(delay, withTiming(1, config));
    translateX.value = withDelay(delay, withTiming(0, config));
    translateY.value = withDelay(delay, withTiming(0, config));
  };

  const fadeSlideOut = () => {
    const config = { duration: duration / 2, easing: Easing.in(Easing.ease) };
    opacity.value = withTiming(0, config);
    if (direction === "left") {
      translateX.value = withTiming(-distance, config);
    } else if (direction === "right") {
      translateX.value = withTiming(distance, config);
    } else if (direction === "top") {
      translateY.value = withTiming(-distance, config);
    } else {
      translateY.value = withTiming(distance, config);
    }
  };

  return { animatedStyle, fadeSlideIn, fadeSlideOut, opacity, translateX, translateY };
}
