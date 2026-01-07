import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Animated, Modal, Text, TouchableOpacity, View, Easing } from "react-native";

// キャラクター画像のURL
const CHARACTER_IMAGES = {
  rinku: "https://pbs.twimg.com/profile_images/1919057498083651584/rFPjWJiD_400x400.jpg",
  rinkuIdol: "https://pbs.twimg.com/media/GrPNmKMbYAA0jyU?format=png&name=small",
  konta: "https://pbs.twimg.com/profile_images/1919057498083651584/rFPjWJiD_400x400.jpg",
  tanune: "https://pbs.twimg.com/profile_images/1919057498083651584/rFPjWJiD_400x400.jpg",
};

// ログイン成功時のメッセージパターン
const SUCCESS_PATTERNS = [
  {
    id: "welcome",
    character: CHARACTER_IMAGES.rinkuIdol,
    title: "ログイン成功！🎉",
    message: "おかえりなさい！\n一緒に推しの夢を叶えよう！",
    emoji: "✨",
    gradient: ["#EC4899", "#8B5CF6"] as [string, string],
  },
  {
    id: "excited",
    character: CHARACTER_IMAGES.rinkuIdol,
    title: "やったー！🎊",
    message: "ログインありがとう！\nあなたの参加を待ってたよ！",
    emoji: "🌟",
    gradient: ["#F59E0B", "#EC4899"] as [string, string],
  },
  {
    id: "happy",
    character: CHARACTER_IMAGES.rinkuIdol,
    title: "ようこそ！😊",
    message: "動員ちゃれんじへようこそ！\nみんなで盛り上げていこう！",
    emoji: "💖",
    gradient: ["#8B5CF6", "#06B6D4"] as [string, string],
  },
  {
    id: "cheer",
    character: CHARACTER_IMAGES.rinkuIdol,
    title: "準備OK！💪",
    message: "さあ、推しを応援する\n準備はできた？",
    emoji: "🔥",
    gradient: ["#EF4444", "#F59E0B"] as [string, string],
  },
];

interface LoginSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userProfileImage?: string;
}

export function LoginSuccessModal({
  visible,
  onClose,
  userName,
  userProfileImage,
}: LoginSuccessModalProps) {
  const [pattern] = useState(() => 
    SUCCESS_PATTERNS[Math.floor(Math.random() * SUCCESS_PATTERNS.length)]
  );
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [confettiAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // アニメーションシーケンス
      Animated.sequence([
        // フェードイン
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // スケールアップ
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // 紙吹雪アニメーション
      Animated.loop(
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // 3秒後に自動で閉じる
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={handleClose}
          activeOpacity={1}
        />

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: "85%",
            maxWidth: 340,
          }}
        >
          {/* メインカード */}
          <View
            style={{
              backgroundColor: "#1A1D21",
              borderRadius: 24,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#2D3139",
            }}
          >
            {/* グラデーションヘッダー */}
            <LinearGradient
              colors={pattern.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 24,
                paddingHorizontal: 20,
                alignItems: "center",
              }}
            >
              {/* 紙吹雪エフェクト */}
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
                {[...Array(12)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${(i * 8) + 4}%`,
                      top: -20,
                      transform: [
                        {
                          translateY: confettiAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 200],
                          }),
                        },
                        {
                          rotate: confettiAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", `${360 + i * 30}deg`],
                          }),
                        },
                      ],
                      opacity: confettiAnim.interpolate({
                        inputRange: [0, 0.8, 1],
                        outputRange: [1, 1, 0],
                      }),
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {["✨", "🎉", "⭐", "💖", "🌟", "🎊"][i % 6]}
                    </Text>
                  </Animated.View>
                ))}
              </View>

              {/* キャラクターとユーザーアイコン */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                {/* キャラクター */}
                <Image
                  source={{ uri: pattern.character }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 3,
                    borderColor: "#fff",
                  }}
                />
                
                {/* ハートアイコン */}
                <View
                  style={{
                    marginHorizontal: 8,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <MaterialIcons name="favorite" size={24} color="#fff" />
                </View>

                {/* ユーザーアイコン */}
                {userProfileImage ? (
                  <Image
                    source={{ uri: userProfileImage }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 3,
                      borderColor: "#fff",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 3,
                      borderColor: "#fff",
                    }}
                  >
                    <MaterialIcons name="person" size={40} color="#fff" />
                  </View>
                )}
              </View>

              {/* タイトル */}
              <Text
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: "bold",
                  textAlign: "center",
                  textShadowColor: "rgba(0,0,0,0.3)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                {pattern.title}
              </Text>
            </LinearGradient>

            {/* メッセージ部分 */}
            <View style={{ padding: 24, alignItems: "center" }}>
              {/* ユーザー名 */}
              {userName && (
                <Text
                  style={{
                    color: "#EC4899",
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 8,
                  }}
                >
                  {userName}さん
                </Text>
              )}

              {/* メッセージ */}
              <Text
                style={{
                  color: "#E5E7EB",
                  fontSize: 16,
                  textAlign: "center",
                  lineHeight: 24,
                  marginBottom: 20,
                }}
              >
                {pattern.message}
              </Text>

              {/* 閉じるボタン */}
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 24,
                  backgroundColor: "#2D3139",
                }}
              >
                <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
                  タップして始める
                </Text>
                <MaterialIcons name="arrow-forward" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
