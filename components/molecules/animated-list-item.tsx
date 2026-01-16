import { useRef, useEffect } from "react";
import { Animated, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { usePressAnimation } from "@/lib/animations";
import { touchTarget } from "@/constants/design-system";

interface AnimatedListItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  delay?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

/**
 * アニメーション付きリストアイテム
 * 
 * UI/UXガイドに基づく設計:
 * - 滑らかなトランジション: フェードイン + スライドイン
 * - プレスフィードバック: スケール + 触覚
 * - 遅延アニメーション: リストアイテムの順次表示
 */
export function AnimatedListItem({
  children,
  onPress,
  delay = 0,
  style,
  disabled = false,
}: AnimatedListItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const { scaleAnim, onPressIn, onPressOut } = usePressAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, fadeAnim, translateY]);

  const content = (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }, { scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        disabled={disabled}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    minHeight: touchTarget.minSize,
  },
});
