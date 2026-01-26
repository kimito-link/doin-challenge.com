/**
 * features/events/components/ParticipationSuccessModal.tsx
 * 
 * 参加完了モーダル
 * - りんく吹き出し
 * - 参加方法別のメッセージ
 * - 県点灯演出（Phase 3で実装）
 */

import { View, Text, Modal, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { LinkSpeech } from "@/components/organisms/link-speech";
import { RegionMap } from "@/features/events/components/RegionMap";
import { ATTENDANCE_MESSAGES } from "@/types/attendance";
import type { AttendanceType } from "@/types/attendance";

export interface ParticipationSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  attendanceType: AttendanceType;
  participantNumber?: number; // 参加順番（APIから取得、Phase 2では未実装）
  prefecture?: string; // 参加者の都道府県（Phase 3で使用）
}

export function ParticipationSuccessModal({
  visible,
  onClose,
  attendanceType,
  participantNumber,
  prefecture,
}: ParticipationSuccessModalProps) {
  const colors = useColors();

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  // 参加方法別のメッセージ
  const attendanceMessage = ATTENDANCE_MESSAGES[attendanceType];

  // 参加順番メッセージ（APIから取得できた場合のみ表示）
  const participantMessage = participantNumber
    ? `${participantNumber}人目の参加だよ！`
    : "参加してくれて";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            {/* 成功アイコン */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[color.accentPrimary, color.accentAlt]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.iconGradient}
              >
                <MaterialIcons name="check-circle" size={64} color={color.textWhite} />
              </LinearGradient>
            </View>

            {/* タイトル */}
            <Text style={[styles.title, { color: colors.foreground }]}>
              参加表明完了！
            </Text>

            {/* りんく吹き出し */}
            <View style={styles.speechContainer}>
              <LinkSpeech
                message={`${participantMessage}ありがとう！\n${attendanceMessage}`}
              />
            </View>

            {/* 県点灯演出 */}
            {prefecture && (
              <View style={styles.mapContainer}>
                <RegionMap
                  participations={[]}
                  highlightPrefecture={prefecture}
                />
              </View>
            )}

            {/* 閉じるボタン */}
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: color.surface },
                pressed && styles.closeButtonPressed,
              ]}
            >
              <Text style={[styles.closeButtonText, { color: colors.foreground }]}>
                閉じる
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
  },
  modal: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  speechContainer: {
    width: "100%",
    marginBottom: 20,
  },
  mapContainer: {
    width: "100%",
    marginBottom: 20,
  },
  closeButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
