import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import type { Participation } from "@/types/participation";

export type DeleteParticipationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  participation: Participation | null;
};

export function DeleteParticipationModal({
  visible,
  onClose,
  onConfirm,
  isDeleting,
  participation,
}: DeleteParticipationModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: color.surface }]}>
          <View style={styles.header}>
            <MaterialIcons name="warning" size={48} color={color.danger} />
            <Text style={[styles.title, { color: colors.foreground }]}>
              参加表明を取り消しますか？
            </Text>
            <Text style={styles.subtitle}>
              この操作は取り消すことができません。
            </Text>
          </View>

          {participation && (
            <View style={[styles.participationCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.participationName, { color: colors.foreground }]}>
                {participation.displayName}
              </Text>
              {participation.message && (
                <Text style={styles.participationMessage} numberOfLines={2}>
                  {participation.message}
                </Text>
              )}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isDeleting}
              style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            >
              <Text style={[styles.deleteButtonText, { color: colors.foreground }]}>
                {isDeleting ? "削除中..." : "取り消す"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: color.border,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
  },
  subtitle: {
    color: color.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  participationCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: color.border,
  },
  participationName: {
    fontSize: 14,
    fontWeight: "600",
  },
  participationMessage: {
    color: color.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: color.border,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: color.danger,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
