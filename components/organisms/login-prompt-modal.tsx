import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useTutorial } from "@/lib/tutorial-context";
import * as Haptics from "expo-haptics";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

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
 * 導線強化版：
 * - 「次に何をすればいいか」を明確に
 * - ファン向け：チャレンジを探す
 * - 主催者向け：チャレンジを作成
 * - ログインは任意（押し付けない）
 */
export function LoginPromptModal({ visible, onLogin, onSkip }: LoginPromptModalProps) {
  const colors = useColors();
  const { login } = useAuth();
  const { userType } = useTutorial();
  const router = useRouter();
  
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
  
  // メインアクション（ユーザータイプに応じて変更）
  const handleMainAction = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSkip(); // モーダルを閉じる
    
    if (userType === "host") {
      // 主催者向け：チャレンジ作成画面へ
      router.push("/create");
    } else {
      // ファン向け：ホーム画面（チャレンジ一覧）へ
      router.push("/");
    }
  };
  
  if (!visible) return null;
  
  // ユーザータイプに応じたメッセージ
  const isHost = userType === "host";
  const title = "準備完了！";
  const subtitle = isHost 
    ? "さっそくチャレンジを作ってみよう"
    : "気になるチャレンジを探してみよう";
  const mainButtonText = isHost 
    ? "チャレンジを作成する"
    : "チャレンジを探す";
  
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
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {subtitle}
          </Text>
          
          {/* メインアクションボタン（チャレンジを探す/作成する） */}
          <TouchableOpacity
            onPress={handleMainAction}
            style={styles.mainButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isHost ? ["#DD6500", "#F59E0B"] : ["#EC4899", "#F472B6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mainButtonGradient}
            >
              <Text style={styles.mainButtonText}>{mainButtonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* ログインボタン（サブ） */}
          <TouchableOpacity
            onPress={handleLogin}
            style={styles.loginButton}
            activeOpacity={0.8}
          >
            <Text style={[styles.loginButtonText, { color: colors.foreground }]}>
              ログインして記録を残す
            </Text>
          </TouchableOpacity>
          
          {/* 説明テキスト */}
          <Text style={[styles.helperText, { color: colors.muted }]}>
            ログインすると参加履歴が保存されます
          </Text>
          
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
    paddingVertical: 32,
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
    marginBottom: 20,
  },
  character: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  mainButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  mainButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  loginButton: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  skipButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 14,
  },
});
