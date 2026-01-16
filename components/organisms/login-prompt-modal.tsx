import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import * as Haptics from "expo-haptics";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

// キャラクター画像
const characterImage = require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png");

interface LoginPromptModalProps {
  visible: boolean;
  onLogin: () => void;
  onSkip: () => void;
}

/**
 * チュートリアル完了後のログイン誘導モーダル
 * 
 * 任天堂原則：
 * - 強制しない（スキップ可能）
 * - ポジティブな表現
 * - キャラクターで親しみやすく
 */
export function LoginPromptModal({ visible, onLogin, onSkip }: LoginPromptModalProps) {
  const colors = useColors();
  const { login } = useAuth();
  
  // キャラクターのワクワクアニメーション
  const bounce = useSharedValue(0);
  const sparkle = useSharedValue(0);
  
  useEffect(() => {
    if (visible) {
      // ぴょんぴょんアニメーション
      bounce.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        true
      );
      
      // キラキラアニメーション
      sparkle.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 }),
        ),
        -1,
        true
      );
    }
  }, [visible]);
  
  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));
  
  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
  }));
  
  const handleLogin = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLogin();
    try {
      await login();
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  const handleSkip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSkip();
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.container}
        >
          {/* 背景グラデーション */}
          <LinearGradient
            colors={["#1A1D21", "#0D1117"]}
            style={styles.gradient}
          />
          
          {/* キラキラエフェクト */}
          <Animated.View style={[styles.sparkleContainer, sparkleAnimatedStyle]}>
            <Text style={styles.sparkle}>✨</Text>
            <Text style={[styles.sparkle, { top: 20, right: 30 }]}>⭐</Text>
            <Text style={[styles.sparkle, { bottom: 60, left: 20 }]}>✨</Text>
          </Animated.View>
          
          {/* キャラクター */}
          <Animated.View style={[styles.characterContainer, characterAnimatedStyle]}>
            <Image
              source={characterImage}
              style={styles.character}
              contentFit="contain"
            />
          </Animated.View>
          
          {/* メッセージ */}
          <Text style={[styles.title, { color: colors.foreground }]}>
            準備完了！
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            ログインして、推し活を始めよう
          </Text>
          
          {/* ログインボタン */}
          <TouchableOpacity
            onPress={handleLogin}
            style={styles.loginButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#DD6500", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>ログインして始める</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* スキップボタン */}
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipButtonText, { color: colors.muted }]}>
              あとで
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkle: {
    position: "absolute",
    fontSize: 20,
    top: 30,
    left: 30,
  },
  characterContainer: {
    marginBottom: 24,
  },
  character: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  loginButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#DD6500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 14,
  },
});
