/**
 * RoleSelectionModal - 初回ログイン時の役割選択画面
 * 
 * v6.63: 「売れる状態まで作り切る」Phase A-3
 * - 新規ユーザー向けの役割選択
 * - 「ファンとして参加」「主催者として企画」の2択
 * - 説明文は短く、価値が即伝わる内容
 */
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { color } from "@/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Animated, Modal, Text, Pressable, View, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { navigate } from "@/lib/navigation/app-routes";

// キャラクター画像
const CHARACTER_IMAGE = "https://pbs.twimg.com/media/GrPNmKMbYAA0jyU?format=png&name=small";

interface RoleSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userProfileImage?: string;
}

/**
 * 初回ログイン時に表示される役割選択モーダル
 * ユーザーが「ファン」か「主催者」かを選択する
 */
export function RoleSelectionModal({
  visible,
  onClose,
  userName,
  userProfileImage,
}: RoleSelectionModalProps) {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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

  const handleFanRole = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleClose();
    // ホーム画面（チャレンジ一覧）に遷移
    navigate.toHome();
  };

  const handleHostRole = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleClose();
    // チャレンジ作成画面に遷移
    navigate.toCreate();
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
          backgroundColor: "rgba(0,0,0,0.85)",
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeAnim,
        }}
      >
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={handleClose}
        />

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: "90%",
            maxWidth: 380,
          }}
        >
          <View
            style={{
              backgroundColor: color.surface,
              borderRadius: 24,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: color.border,
            }}
          >
            {/* ヘッダー */}
            <LinearGradient
              colors={[color.accentPrimary, color.accentAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 24,
                paddingHorizontal: 20,
                alignItems: "center",
              }}
            >
              {/* キャラクターとユーザーアイコン */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Image
                  source={{ uri: CHARACTER_IMAGE }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.8)",
                  }}
                />
                <View
                  style={{
                    marginHorizontal: 8,
                    backgroundColor: "rgba(0,0,0,0.15)",
                    borderRadius: 16,
                    padding: 6,
                  }}
                >
                  <MaterialIcons name="celebration" size={20} color="#111827" />
                </View>
                {userProfileImage ? (
                  <Image
                    source={{ uri: userProfileImage }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      borderWidth: 2,
                      borderColor: "rgba(255,255,255,0.8)",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: "rgba(0,0,0,0.15)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "rgba(255,255,255,0.8)",
                    }}
                  >
                    <MaterialIcons name="person" size={28} color="#111827" />
                  </View>
                )}
              </View>

              <Text
                style={{
                  color: "#111827",
                  fontSize: 20,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                ようこそ、{userName || "ゲスト"}さん！
              </Text>
              <Text
                style={{
                  color: "rgba(17,24,39,0.7)",
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                どちらで始めますか？
              </Text>
            </LinearGradient>

            <View style={{ padding: 20 }}>
              {/* ファンとして参加 */}
              <Pressable
                onPress={handleFanRole}
                style={({ pressed }) => [
                  {
                    backgroundColor: color.bg,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: pressed ? color.accentPrimary : color.border,
                  },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${color.danger}20`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome5 name="heart" size={22} color={color.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: color.textPrimary, fontSize: 18, fontWeight: "bold" }}>
                      ファンとして参加
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={color.textMuted} />
                </View>
                <Text style={{ color: color.textMuted, fontSize: 14, lineHeight: 20 }}>
                  推しのイベントを見つけて応援しよう。{"\n"}
                  参加表明であなたの地域を点灯させよう！
                </Text>
              </Pressable>

              {/* 主催者として企画 */}
              <Pressable
                onPress={handleHostRole}
                style={({ pressed }) => [
                  {
                    backgroundColor: color.bg,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: pressed ? color.warning : color.border,
                  },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${color.warning}20`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome5 name="crown" size={22} color={color.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: color.textPrimary, fontSize: 18, fontWeight: "bold" }}>
                      主催者として企画
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={color.textMuted} />
                </View>
                <Text style={{ color: color.textMuted, fontSize: 14, lineHeight: 20 }}>
                  イベントを作成してファンを集めよう。{"\n"}
                  参加者数をリアルタイムで可視化できる！
                </Text>
              </Pressable>

              {/* 後で選ぶ */}
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [
                  {
                    paddingVertical: 12,
                    alignItems: "center",
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ color: color.textMuted, fontSize: 14 }}>
                  後で選ぶ
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
