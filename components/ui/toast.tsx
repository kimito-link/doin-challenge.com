/**
 * Toast Component
 * 控えめな成功/エラー通知を表示
 */

import { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { color } from "@/theme/tokens";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: "success" | "error";
  duration?: number;
  onHide?: () => void;
}

export function Toast({
  visible,
  message,
  type = "success",
  duration = 3000,
  onHide,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show animation
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withSpring(1, { damping: 15, stiffness: 100 });

      // Hide after duration
      translateY.value = withDelay(
        duration,
        withSpring(-100, { damping: 15, stiffness: 100 }, () => {
          if (onHide) {
            runOnJS(onHide)();
          }
        })
      );
      opacity.value = withDelay(
        duration,
        withSpring(0, { damping: 15, stiffness: 100 })
      );
    }
  }, [visible, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const backgroundColor =
    type === "success" ? color.accentPrimary : "#EF4444"; // red500
  const icon = type === "success" ? "✓" : "✕";

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 60,
          left: 16,
          right: 16,
          zIndex: 9999,
          backgroundColor,
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        animatedStyle,
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>
          {icon}
        </Text>
      </View>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: "600",
          flex: 1,
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
