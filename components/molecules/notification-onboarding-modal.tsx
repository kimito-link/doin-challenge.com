import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export type NotificationOnboardingModalProps = {
  visible: boolean;
  onClose: () => void;
  onEnable: () => void;
};

export function NotificationOnboardingModal({
  visible,
  onClose,
  onEnable,
}: NotificationOnboardingModalProps) {
  const colors = useColors();

  const handleEnable = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEnable();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* アイコン */}
          <View style={[styles.iconContainer, { backgroundColor: color.accentPrimary + "20" }]}>
            <MaterialIcons name="notifications-active" size={48} color={color.accentPrimary} />
          </View>

          {/* タイトル */}
          <Text style={[styles.title, { color: colors.foreground }]}>
            🎉 リアルタイム通知を受け取ろう！
          </Text>

          {/* 説明 */}
          <Text style={[styles.description, { color: color.textMuted }]}>
            新しい参加者や目標達成をリアルタイムで通知します。いつでも設定から変更できます。
          </Text>

          {/* 通知の種類 */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="person-add" size={20} color={color.accentPrimary} />
              <Text style={[styles.featureText, { color: colors.foreground }]}>
                新しい参加者
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="emoji-events" size={20} color={color.rankGold} />
              <Text style={[styles.featureText, { color: colors.foreground }]}>
                目標達成
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="flag" size={20} color={color.blue400} />
              <Text style={[styles.featureText, { color: colors.foreground }]}>
                マイルストーン
              </Text>
            </View>
          </View>

          {/* ボタン */}
          <Pressable
            onPress={handleEnable}
            style={({ pressed }) => [
              styles.enableButton,
              { backgroundColor: color.accentPrimary },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.enableButtonText}>通知を有効にする</Text>
          </Pressable>

          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.skipButtonText, { color: color.textMuted }]}>
              後で設定する
            </Text>
          </Pressable>
        </View>
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
  modal: {
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: {
    width: "100%",
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: color.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 12,
    fontWeight: "500",
  },
  enableButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  enableButtonText: {
    color: color.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
