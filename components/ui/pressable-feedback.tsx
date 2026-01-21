// components/ui/pressable-feedback.tsx
// v6.21: 統一されたPressableラッパーコンポーネント
// プレスフィードバック（opacity/scale）とHapticsを自動適用

import { useCallback } from "react";
import { 
  Pressable, 
  Platform, 
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import * as Haptics from "expo-haptics";

export type FeedbackType = "opacity" | "scale" | "both" | "none";
export type HapticType = "light" | "medium" | "heavy" | "selection" | "none";

export interface PressableFeedbackProps extends Omit<PressableProps, "style"> {
  /** フィードバックの種類 */
  feedback?: FeedbackType;
  /** ハプティクスの種類 */
  haptic?: HapticType;
  /** プレス時のopacity (0-1) */
  pressedOpacity?: number;
  /** プレス時のscale (0-1) */
  pressedScale?: number;
  /** スタイル */
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  /** 子要素 */
  children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
}

/**
 * 統一されたPressableラッパーコンポーネント
 * 
 * プレスフィードバック（opacity/scale）とHapticsを自動適用
 * 
 * @example
 * // 基本的な使い方（opacity + light haptic）
 * <PressableFeedback onPress={handlePress}>
 *   <Text>タップ</Text>
 * </PressableFeedback>
 * 
 * // scale効果
 * <PressableFeedback feedback="scale" onPress={handlePress}>
 *   <Text>タップ</Text>
 * </PressableFeedback>
 * 
 * // 両方の効果
 * <PressableFeedback feedback="both" haptic="medium" onPress={handlePress}>
 *   <Text>タップ</Text>
 * </PressableFeedback>
 * 
 * // ハプティクスなし
 * <PressableFeedback haptic="none" onPress={handlePress}>
 *   <Text>タップ</Text>
 * </PressableFeedback>
 */
export function PressableFeedback({
  feedback = "opacity",
  haptic = "light",
  pressedOpacity = 0.7,
  pressedScale = 0.97,
  style,
  onPressIn,
  onPressOut,
  children,
  disabled,
  ...props
}: PressableFeedbackProps) {
  
  const handlePressIn = useCallback((event: any) => {
    // ハプティクスフィードバック
    if (haptic !== "none" && Platform.OS !== "web" && !disabled) {
      switch (haptic) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "selection":
          Haptics.selectionAsync();
          break;
      }
    }
    
    onPressIn?.(event);
  }, [haptic, disabled, onPressIn]);

  const getStyle = useCallback((pressed: boolean): StyleProp<ViewStyle> => {
    const baseStyle = typeof style === "function" ? style({ pressed }) : style;
    
    if (disabled || feedback === "none") {
      return baseStyle;
    }
    
    const feedbackStyle: ViewStyle = {};
    
    if (pressed) {
      if (feedback === "opacity" || feedback === "both") {
        feedbackStyle.opacity = pressedOpacity;
      }
      if (feedback === "scale" || feedback === "both") {
        feedbackStyle.transform = [{ scale: pressedScale }];
      }
    }
    
    return [baseStyle, feedbackStyle];
  }, [style, feedback, pressedOpacity, pressedScale, disabled]);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => getStyle(pressed)}
    >
      {typeof children === "function" 
        ? (state) => children(state)
        : children
      }
    </Pressable>
  );
}

/**
 * リスト項目用のPressable（opacity効果 + selection haptic）
 */
export function ListItemPressable({
  children,
  ...props
}: Omit<PressableFeedbackProps, "feedback" | "haptic">) {
  return (
    <PressableFeedback
      feedback="opacity"
      haptic="selection"
      pressedOpacity={0.7}
      {...props}
    >
      {children}
    </PressableFeedback>
  );
}

/**
 * カード用のPressable（scale効果 + light haptic）
 */
export function CardPressable({
  children,
  ...props
}: Omit<PressableFeedbackProps, "feedback" | "haptic">) {
  return (
    <PressableFeedback
      feedback="scale"
      haptic="light"
      pressedScale={0.98}
      {...props}
    >
      {children}
    </PressableFeedback>
  );
}

/**
 * アイコンボタン用のPressable（both効果 + light haptic）
 */
export function IconPressable({
  children,
  ...props
}: Omit<PressableFeedbackProps, "feedback" | "haptic">) {
  return (
    <PressableFeedback
      feedback="both"
      haptic="light"
      pressedOpacity={0.6}
      pressedScale={0.9}
      {...props}
    >
      {children}
    </PressableFeedback>
  );
}

export default PressableFeedback;
