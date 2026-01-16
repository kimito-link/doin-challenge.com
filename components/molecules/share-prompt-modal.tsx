import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { shareParticipation } from "@/lib/share";

interface SharePromptModalProps {
  visible: boolean;
  onClose: () => void;
  challengeTitle: string;
  hostName: string;
  challengeId: number;
  // 参加者情報（オプション）
  participantName?: string;
  participantUsername?: string;
  participantImage?: string;
  message?: string;
  contribution?: number;
}

/**
 * 参加表明後のシェア促進モーダル
 */
export function SharePromptModal({
  visible,
  onClose,
  challengeTitle,
  hostName,
  challengeId,
  participantName,
  participantUsername,
  participantImage,
  message,
  contribution,
}: SharePromptModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (visible) {
      // ハプティックフィードバック
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // アニメーション開始
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareParticipation(challengeTitle, hostName, challengeId);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onClose();
    } finally {
      setIsSharing(false);
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* 成功アイコン */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <MaterialIcons name="check" size={40} color="#fff" />
            </LinearGradient>
          </View>

          {/* タイトル */}
          <Text style={styles.title}>参加表明完了！🎉</Text>
          <Text style={styles.subtitle}>
            「{challengeTitle}」への参加を表明しました
          </Text>

          {/* 参加者情報カード */}
          {participantName && (
            <View style={styles.participantCard}>
              <View style={styles.participantHeader}>
                {participantImage ? (
                  <Image
                    source={{ uri: participantImage }}
                    style={styles.participantAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.participantAvatar, { backgroundColor: '#EC4899' }]}>
                    <Text style={styles.avatarText}>{participantName.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{participantName}</Text>
                  {participantUsername && (
                    <Text style={styles.participantUsername}>@{participantUsername}</Text>
                  )}
                </View>
                {contribution && (
                  <View style={styles.contributionBadge}>
                    <Text style={styles.contributionText}>+{contribution}</Text>
                    <Text style={styles.contributionLabel}>貢献</Text>
                  </View>
                )}
              </View>
              {message && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              )}
            </View>
          )}

          {/* シェア促進メッセージ */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              Xでシェアして仲間を増やしませんか？
            </Text>
            <Text style={styles.subMessage}>
              みんなで目標達成を目指しましょう！
            </Text>
          </View>

          {/* ボタン */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleShare}
              disabled={isSharing}
              style={styles.shareButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#000", "#1a1a1a"]}
                style={styles.shareButtonGradient}
              >
                <Text style={styles.xLogo}>𝕏</Text>
                <Text style={styles.shareButtonText}>
                  {isSharing ? "シェア中..." : "Xでシェア"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>今回はスキップ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#1A1D21",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  participantCard: {
    backgroundColor: "#2D3139",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 16,
  },
  participantHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  participantUsername: {
    color: "#DD6500",
    fontSize: 14,
  },
  contributionBadge: {
    alignItems: "center",
  },
  contributionText: {
    color: "#EC4899",
    fontSize: 24,
    fontWeight: "bold",
  },
  contributionLabel: {
    color: "#6B7280",
    fontSize: 11,
  },
  messageBox: {
    backgroundColor: "#1A1D21",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  messageText: {
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: "#0D1117",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  message: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  subMessage: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  shareButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  shareButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  xLogo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#6B7280",
    fontSize: 14,
  },
});
