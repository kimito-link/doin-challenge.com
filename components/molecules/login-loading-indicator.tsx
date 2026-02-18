import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface LoginLoadingIndicatorProps {
  message?: string;
  showProgress?: boolean;
  progress?: number; // 0-100
}

/**
 * ログイン処理中のローディングインジケーター
 * 
 * 機能:
 * - アニメーション付きローディング表示
 * - カスタマイズ可能なメッセージ
 * - 進捗表示（オプション）
 * - ハプティックフィードバック
 */
export function LoginLoadingIndicator({
  message = "ログイン中...",
  showProgress = false,
  progress = 0,
}: LoginLoadingIndicatorProps) {
  const colors = useColors();
  
  // アニメーション値
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    // ローディング開始時にハプティックフィードバック
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // パルスアニメーション
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale, opacity]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.loadingContainer, animatedStyle]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Animated.View>
      
      <Text style={[styles.message, { color: colors.foreground }]}>
        {message}
      </Text>
      
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.min(progress, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}
      
      <Text style={[styles.hint, { color: colors.muted }]}>
        しばらくお待ちください
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  hint: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  progressContainer: {
    width: "100%",
    marginTop: 16,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
});
