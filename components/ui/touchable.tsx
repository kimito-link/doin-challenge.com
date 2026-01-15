import { TouchableOpacity, TouchableOpacityProps, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { touchTarget } from "@/constants/design-system";

interface TouchableProps extends TouchableOpacityProps {
  haptic?: boolean;
  hapticType?: "light" | "medium" | "heavy";
}

/**
 * アクセシビリティ対応のタッチターゲットラッパー
 * 
 * UI/UXガイドに基づく設計:
 * - 最小タッチターゲット: 44x44px (Apple HIG準拠)
 * - 触覚フィードバック: タップ時のハプティクス
 * - アクセシビリティ: 十分なタップ領域
 */
export function Touchable({
  children,
  onPress,
  haptic = true,
  hapticType = "light",
  style,
  ...props
}: TouchableProps) {
  const handlePress = () => {
    if (haptic && Platform.OS !== "web") {
      const hapticStyle = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      }[hapticType];
      Haptics.impactAsync(hapticStyle);
    }
    onPress?.({} as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.touchable, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    justifyContent: "center",
    alignItems: "center",
  },
});
