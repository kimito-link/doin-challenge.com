import { Pressable, Platform, Text, type PressableProps, type ViewStyle, type TextStyle, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface HoverableButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * PC表示でホバー効果を持つボタンコンポーネント
 * Apple HIG準拠: 最小タップエリア44px
 */
export function HoverableButton({
  title,
  variant = "primary",
  size = "md",
  style,
  textStyle,
  disabled = false,
  loading = false,
  icon,
  onPress,
  ...props
}: HoverableButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleHoverIn = useCallback(() => {
    if (Platform.OS === "web" && !disabled) {
      setIsHovered(true);
    }
  }, [disabled]);

  const handleHoverOut = useCallback(() => {
    if (Platform.OS === "web") {
      setIsHovered(false);
    }
  }, []);

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  // アニメーションスタイル
  const animatedStyle = useAnimatedStyle(() => {
    const scale = isPressed ? 0.97 : isHovered ? 1.02 : 1;
    const opacity = disabled ? 0.5 : isPressed ? 0.8 : 1;

    return {
      transform: [{ scale: withTiming(scale, { duration: 100 }) }],
      opacity: withTiming(opacity, { duration: 100 }),
    };
  }, [isHovered, isPressed, disabled]);

  // バリアントに応じたスタイル
  const variantStyles = getVariantStyles(variant, isHovered, isPressed);
  const sizeStyles = getSizeStyles(size);

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {icon}
      <Text style={[styles.text, sizeStyles.text, variantStyles.text, textStyle]}>
        {loading ? "読み込み中..." : title}
      </Text>
    </AnimatedPressable>
  );
}

function getVariantStyles(variant: string, isHovered: boolean, isPressed: boolean) {
  const baseStyles: { container: ViewStyle; text: TextStyle } = {
    container: {},
    text: {},
  };

  switch (variant) {
    case "primary":
      return {
        container: {
          backgroundColor: isHovered ? "#FF7B00" : "#DD6500",
          borderWidth: 0,
          ...(Platform.OS === "web" && isHovered ? {
            shadowColor: "#DD6500",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
          } : {}),
        } as ViewStyle,
        text: {
          color: "#FFFFFF",
          fontWeight: "600",
        } as TextStyle,
      };
    case "secondary":
      return {
        container: {
          backgroundColor: isHovered ? "#2A2D30" : "#1E2022",
          borderWidth: 1,
          borderColor: isHovered ? "#DD6500" : "#334155",
        } as ViewStyle,
        text: {
          color: isHovered ? "#DD6500" : "#ECEDEE",
          fontWeight: "500",
        } as TextStyle,
      };
    case "outline":
      return {
        container: {
          backgroundColor: isHovered ? "rgba(221, 101, 0, 0.1)" : "transparent",
          borderWidth: 2,
          borderColor: isHovered ? "#FF7B00" : "#DD6500",
        } as ViewStyle,
        text: {
          color: isHovered ? "#FF7B00" : "#DD6500",
          fontWeight: "600",
        } as TextStyle,
      };
    case "ghost":
      return {
        container: {
          backgroundColor: isHovered ? "rgba(221, 101, 0, 0.1)" : "transparent",
          borderWidth: 0,
        } as ViewStyle,
        text: {
          color: isHovered ? "#FF7B00" : "#9BA1A6",
          fontWeight: "500",
        } as TextStyle,
      };
    default:
      return baseStyles;
  }
}

function getSizeStyles(size: string) {
  switch (size) {
    case "sm":
      return {
        container: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: 36,
          borderRadius: 8,
        } as ViewStyle,
        text: {
          fontSize: 13,
        } as TextStyle,
      };
    case "lg":
      return {
        container: {
          paddingHorizontal: 24,
          paddingVertical: 16,
          minHeight: 56,
          borderRadius: 16,
        } as ViewStyle,
        text: {
          fontSize: 17,
        } as TextStyle,
      };
    case "md":
    default:
      return {
        container: {
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 44, // Apple HIG準拠
          borderRadius: 12,
        } as ViewStyle,
        text: {
          fontSize: 15,
        } as TextStyle,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    textAlign: "center",
  },
});
