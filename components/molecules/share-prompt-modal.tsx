/**
 * 参加完了モーダル（シェア促進）
 * 
 * v6.64: 仕様確定版
 * - 「あなたの参加で◯◯県が点灯」演出
 * - 達成率・残り人数を大きく表示
 * - ワンタップ共有導線（X）
 * - 黒ベースUI統一
 */
import { Modal, View, Text, Pressable, StyleSheet, Animated, Platform } from "react-native";
import { color } from "@/theme/tokens";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
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
  // 進捗情報
  currentParticipants?: number;
  goalParticipants?: number;
  participantNumber?: number; // あなたが◯人目
  prefecture?: string;
  // 県点灯情報（新規）
  isNewPrefecture?: boolean; // この県が初めて点灯したか
}

/**
 * 参加表明後のシェア促進モーダル（v6.64強化版）
 * - 「あなたの参加で◯◯県が点灯」演出
 * - 達成率・残り人数を大きく表示
 * - ワンタップ共有導線
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
  currentParticipants = 0,
  goalParticipants = 100,
  participantNumber,
  prefecture,
  isNewPrefecture = false,
}: SharePromptModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const prefectureGlowAnim = useRef(new Animated.Value(0)).current;
  const [isSharing, setIsSharing] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(0);

  // 進捗率を計算
  const progressPercent = goalParticipants > 0 
    ? Math.min((currentParticipants / goalParticipants) * 100, 100) 
    : 0;

  // 残り人数
  const remainingCount = Math.max(goalParticipants - currentParticipants, 0);

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

      // 進捗バーアニメーション
      Animated.timing(progressAnim, {
        toValue: progressPercent,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // 県点灯アニメーション（新規県の場合）
      if (prefecture && isNewPrefecture) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(prefectureGlowAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(prefectureGlowAnim, {
              toValue: 0.3,
              duration: 800,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }

      // 参加者番号カウントアップアニメーション
      if (participantNumber) {
        const duration = 1000;
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          setDisplayNumber(Math.floor(eased * participantNumber));
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        animate();
      }
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      progressAnim.setValue(0);
      prefectureGlowAnim.setValue(0);
      setDisplayNumber(0);
    }
  }, [visible, scaleAnim, opacityAnim, progressAnim, prefectureGlowAnim, progressPercent, participantNumber, prefecture, isNewPrefecture]);

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

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const glowOpacity = prefectureGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

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
              colors={[color.accentPrimary, color.accentAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <MaterialIcons name="celebration" size={40} color="#fff" />
            </LinearGradient>
          </View>

          {/* タイトル */}
          <Text style={styles.title}>参加表明完了！</Text>

          {/* 県点灯演出（メイン演出） */}
          {prefecture && (
            <Animated.View 
              style={[
                styles.prefectureHighlight,
                isNewPrefecture && { opacity: glowOpacity }
              ]}
            >
              <View style={styles.prefectureIconContainer}>
                <FontAwesome6 name="location-dot" size={24} color={color.accentPrimary} />
              </View>
              <View style={styles.prefectureTextContainer}>
                <Text style={styles.prefectureMainText}>
                  {isNewPrefecture ? (
                    <>あなたの参加で{"\n"}<Text style={styles.prefectureName}>{prefecture}</Text>が点灯！</>
                  ) : (
                    <><Text style={styles.prefectureName}>{prefecture}</Text>から参加</>
                  )}
                </Text>
                {isNewPrefecture && (
                  <Text style={styles.prefectureSubText}>
                    このチャレンジで初めての{prefecture}からの参加者です
                  </Text>
                )}
              </View>
            </Animated.View>
          )}

          {/* 達成率・残り人数（大きく表示） */}
          <View style={styles.progressSection}>
            {/* 達成率 */}
            <View style={styles.progressMainDisplay}>
              <Text style={styles.progressPercentLarge}>
                {Math.round(progressPercent)}
                <Text style={styles.progressPercentUnit}>%</Text>
              </Text>
              <Text style={styles.progressPercentLabel}>達成</Text>
            </View>

            {/* 進捗バー */}
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { width: progressWidth }
                ]} 
              />
            </View>

            {/* 残り人数 */}
            <View style={styles.remainingContainer}>
              <Text style={styles.remainingText}>
                あと<Text style={styles.remainingNumber}>{remainingCount}</Text>人で目標達成！
              </Text>
              <Text style={styles.currentStatus}>
                {currentParticipants} / {goalParticipants}人
              </Text>
            </View>
          </View>

          {/* あなたが◯人目の参加者です */}
          {participantNumber && (
            <View style={styles.participantNumberContainer}>
              <Text style={styles.participantNumberLabel}>あなたは</Text>
              <View style={styles.participantNumberBadge}>
                <Text style={styles.participantNumberValue}>{displayNumber || participantNumber}</Text>
                <Text style={styles.participantNumberUnit}>人目</Text>
              </View>
              <Text style={styles.participantNumberLabel}>の参加者</Text>
            </View>
          )}

          {/* 参加者情報カード（コンパクト版） */}
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
                  <View style={[styles.participantAvatar, { backgroundColor: color.accentPrimary }]}>
                    <Text style={styles.avatarText}>{participantName.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{participantName}</Text>
                  {participantUsername && (
                    <Text style={styles.participantUsername}>@{participantUsername}</Text>
                  )}
                </View>
                {contribution && contribution > 1 && (
                  <View style={styles.contributionBadge}>
                    <Text style={styles.contributionText}>+{contribution}</Text>
                  </View>
                )}
              </View>
              {message && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText} numberOfLines={2}>{message}</Text>
                </View>
              )}
            </View>
          )}

          {/* シェア促進メッセージ */}
          <View style={styles.sharePromptContainer}>
            <FontAwesome5 name="share-alt" size={14} color={color.accentPrimary} />
            <Text style={styles.sharePromptText}>
              シェアして仲間を増やそう！
            </Text>
          </View>

          {/* ワンタップ共有ボタン */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleShare}
              disabled={isSharing}
              style={({ pressed }) => [
                styles.shareButton,
                pressed && !isSharing && { transform: [{ scale: 0.98 }], opacity: 0.9 },
              ]}
            >
              <View style={styles.shareButtonInner}>
                <Text style={styles.xLogo}>𝕏</Text>
                <Text style={styles.shareButtonText}>
                  {isSharing ? "シェア中..." : "今すぐシェア"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.skipButtonText}>あとでシェア</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: color.bg,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
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
    color: color.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  // 県点灯演出
  prefectureHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${color.accentPrimary}15`,
    borderWidth: 1,
    borderColor: `${color.accentPrimary}40`,
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  prefectureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${color.accentPrimary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  prefectureTextContainer: {
    flex: 1,
  },
  prefectureMainText: {
    color: color.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  prefectureName: {
    color: color.accentPrimary,
    fontWeight: "bold",
    fontSize: 18,
  },
  prefectureSubText: {
    color: color.textMuted,
    fontSize: 12,
    marginTop: 4,
  },

  // 達成率・残り人数
  progressSection: {
    width: "100%",
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  progressMainDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  progressPercentLarge: {
    color: color.accentPrimary,
    fontSize: 56,
    fontWeight: "bold",
    lineHeight: 60,
  },
  progressPercentUnit: {
    fontSize: 28,
  },
  progressPercentLabel: {
    color: color.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: color.border,
    borderRadius: 5,
    overflow: "hidden",
    width: "100%",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: color.accentPrimary,
    borderRadius: 5,
  },
  remainingContainer: {
    alignItems: "center",
  },
  remainingText: {
    color: color.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  remainingNumber: {
    color: color.accentPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  currentStatus: {
    color: color.textMuted,
    fontSize: 13,
    marginTop: 4,
  },

  // 参加者番号
  participantNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 4,
  },
  participantNumberLabel: {
    color: color.textMuted,
    fontSize: 14,
  },
  participantNumberBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.accentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  participantNumberValue: {
    color: color.accentPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  participantNumberUnit: {
    color: color.accentPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },

  // 参加者カード
  participantCard: {
    backgroundColor: color.surface,
    borderRadius: 12,
    padding: 12,
    width: "100%",
    marginBottom: 16,
  },
  participantHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  participantInfo: {
    flex: 1,
    marginLeft: 10,
  },
  participantName: {
    color: color.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  participantUsername: {
    color: color.textMuted,
    fontSize: 12,
  },
  contributionBadge: {
    backgroundColor: `${color.accentPrimary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  contributionText: {
    color: color.accentPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  messageBox: {
    backgroundColor: color.bg,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  messageText: {
    color: color.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },

  // シェア促進
  sharePromptContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sharePromptText: {
    color: color.textMuted,
    fontSize: 14,
  },

  // ボタン
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  shareButton: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  shareButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  xLogo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: color.textMuted,
    fontSize: 14,
  },
});
