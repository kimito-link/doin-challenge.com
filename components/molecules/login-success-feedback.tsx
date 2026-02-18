import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/theme/tokens";

interface LoginSuccessFeedbackProps {
  userName?: string;
  onComplete?: () => void;
  duration?: number; // ミリ秒
}

/**
 * ログイン成功フィードバックコンポーネント
 * 
 * 機能:
 * - アニメーション付き成功メッセージ
 * - ユーザー名表示
 * - ハプティックフィードバック
 * - 自動消去
 */
export function LoginSuccessFeedback({
  userName,
  onComplete,
  duration = 2000,
}: LoginSuccessFeedbackProps) {
  const colors = useColors();
  
  // アニメーション値
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  
  useEffect(() => {
    // 成功時にハプティックフィードバック
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // アニメーション開始
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });
    
    opacity.value = withTiming(1, { duration: 300 });
    
    // チェックマークアニメーション（少し遅延）
    setTimeout(() => {
      checkScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    }, 200);
    
    // 自動消去
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      });
    }, duration);
    
    return () => clearTimeout(timer);
  }, [scale, opacity, checkScale, duration, onComplete]);
  
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  
  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.success + "20" },
            checkAnimatedStyle,
          ]}
        >
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        </Animated.View>
        
        <Text style={[styles.title, { color: colors.foreground }]}>
          ログイン成功！
        </Text>
        
        {userName && (
          <Text style={[styles.userName, { color: colors.muted }]}>
            ようこそ、{userName}さん
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -150,
    marginTop: -80,
    width: 300,
    zIndex: 9999,
  },
  content: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: palette.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  userName: {
    fontSize: 14,
    textAlign: "center",
  },
});
