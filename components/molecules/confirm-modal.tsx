import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Platform } from "react-native";
import { useRef, useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
}

/**
 * クロスプラットフォーム対応の確認モーダル
 * Alert.alertはWebで動作しないため、このコンポーネントを使用
 */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "確認",
  cancelText = "キャンセル",
  confirmStyle = "default",
  onConfirm,
  onCancel,
  icon,
  iconColor = "#EC4899",
}: ConfirmModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* アイコン */}
            {icon && (
              <View style={styles.iconContainer}>
                <MaterialIcons name={icon} size={40} color={iconColor} />
              </View>
            )}

            {/* タイトル */}
            <Text style={styles.title}>{title}</Text>

            {/* メッセージ */}
            <Text style={styles.message}>{message}</Text>

            {/* ボタン */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={onCancel}
                style={[styles.button, styles.cancelButton]}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                style={[
                  styles.button,
                  styles.confirmButton,
                  confirmStyle === "destructive" && styles.destructiveButton,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    confirmStyle === "destructive" && styles.destructiveButtonText,
                  ]}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
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
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    color: "#D1D5DB",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#2D3139",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  destructiveButton: {
    backgroundColor: "#EF4444",
  },
  destructiveButtonText: {
    color: "#fff",
  },
});
