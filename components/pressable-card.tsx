import { Pressable, Platform, type PressableProps, type ViewStyle } from "react-native";
import { useState, useCallback } from "react";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

interface PressableCardProps extends Omit<PressableProps, "style"> {
  style?: ViewStyle;
  hoverStyle?: ViewStyle;
  pressedStyle?: ViewStyle;
  children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * PC表示でホバー効果を持つカードコンポーネント
 * UXガイドライン: マウスデバイスではホバー効果を適用
 */
export function PressableCard({
  style,
  hoverStyle,
  pressedStyle,
  children,
  onPress,
  ...props
}: PressableCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleHoverIn = useCallback(() => {
    if (Platform.OS === "web") {
      setIsHovered(true);
    }
  }, []);

  const handleHoverOut = useCallback(() => {
    if (Platform.OS === "web") {
      setIsHovered(false);
    }
  }, []);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  // アニメーションスタイル
  const animatedStyle = useAnimatedStyle(() => {
    const scale = isPressed ? 0.97 : isHovered ? 1.02 : 1;
    const translateY = isHovered && !isPressed ? -4 : 0;

    return {
      transform: [
        { scale: withTiming(scale, { duration: 150 }) },
        { translateY: withTiming(translateY, { duration: 150 }) },
      ],
    };
  }, [isHovered, isPressed]);

  // Web用のホバースタイル
  const webHoverStyle: ViewStyle = Platform.OS === "web" && isHovered ? {
    shadowColor: "#DD6500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderColor: "#DD6500",
  } : {};

  return (
    <AnimatedPressable
      onPress={onPress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        style,
        animatedStyle,
        webHoverStyle,
        isPressed && pressedStyle,
      ]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
