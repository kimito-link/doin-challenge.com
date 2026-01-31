import { View, Text, Pressable, Modal, StyleSheet, Image, Animated, Platform } from "react-native";
import { color, palette } from "@/theme/tokens";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";

// キャラクター画像
const CHARACTER_IMAGES = {
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
  rinku: require("@/assets/images/characters/rinku.png"),
};

interface ErrorDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
  character?: "konta" | "tanune" | "rinku";
}

/**
 * ユーザーフレンドリーなエラーダイアログ
 * キャラクターが励ましながらエラーを伝える
 */
export function ErrorDialog({
  visible,
  title = "エラーが発生しました",
  message,
  onClose,
  onRetry,
  canRetry = true,
  character = "konta",
}: ErrorDialogProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // エラー時のハプティクスフィードバック
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      // アニメーション
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
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
  }, [visible]);

  const handleRetry = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onRetry?.();
  };

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  // キャラクターごとの励ましメッセージ
  const encourageMessages = {
    konta: "大丈夫！もう一回やってみよう！",
    tanune: "落ち着いて、ゆっくり試してみてね",
    rinku: "一緒に解決しよう！",
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
            styles.dialog,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* キャラクター */}
          <View style={styles.characterContainer}>
            <Image
              source={CHARACTER_IMAGES[character]}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>

          {/* エラーアイコン */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="error-outline" size={32} color={color.danger} />
          </View>

          {/* タイトル */}
          <Text style={styles.title}>{title}</Text>

          {/* メッセージ */}
          <Text style={styles.message}>{message}</Text>

          {/* キャラクターの励まし */}
          <View style={styles.encourageContainer}>
            <Text style={styles.encourageText}>
              {encourageMessages[character]}
            </Text>
          </View>

          {/* ボタン */}
          <View style={styles.buttonContainer}>
            {canRetry && onRetry && (
              <Pressable
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
                onPress={handleRetry}
              >
                <MaterialIcons name="refresh" size={20} color={color.textWhite} />
                <Text style={styles.retryButtonText}>もう一度試す</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                !canRetry && styles.closeButtonFull,
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * エラーダイアログを簡単に使うためのフック
 */
import { useState, useCallback } from "react";

export interface UseErrorDialogReturn {
  showError: (message: string, options?: {
    title?: string;
    canRetry?: boolean;
    onRetry?: () => void;
    character?: "konta" | "tanune" | "rinku";
  }) => void;
  hideError: () => void;
  ErrorDialogComponent: React.FC;
}

export function useErrorDialog(): UseErrorDialogReturn {
  const [state, setState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    canRetry: boolean;
    onRetry?: () => void;
    character: "konta" | "tanune" | "rinku";
  }>({
    visible: false,
    title: "エラーが発生しました",
    message: "",
    canRetry: true,
    character: "konta",
  });

  const showError = useCallback((message: string, options?: {
    title?: string;
    canRetry?: boolean;
    onRetry?: () => void;
    character?: "konta" | "tanune" | "rinku";
  }) => {
    setState({
      visible: true,
      title: options?.title || "エラーが発生しました",
      message,
      canRetry: options?.canRetry ?? true,
      onRetry: options?.onRetry,
      character: options?.character || "konta",
    });
  }, []);

  const hideError = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  const ErrorDialogComponent = useCallback(() => (
    <ErrorDialog
      visible={state.visible}
      title={state.title}
      message={state.message}
      onClose={hideError}
      onRetry={state.onRetry}
      canRetry={state.canRetry}
      character={state.character}
    />
  ), [state, hideError]);

  return { showError, hideError, ErrorDialogComponent };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    backgroundColor: color.surface,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.borderAlt,
  },
  characterContainer: {
    position: "absolute",
    top: -40,
    right: 16,
  },
  characterImage: {
    width: 60,
    height: 60,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  encourageContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  encourageText: {
    fontSize: 13,
    color: color.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  retryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.hostAccentLegacy,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  retryButtonText: {
    color: color.textWhite,
    fontSize: 15,
    fontWeight: "600",
  },
  closeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.borderAlt,
    borderRadius: 12,
    paddingVertical: 14,
  },
  closeButtonFull: {
    flex: 1,
  },
  closeButtonText: {
    color: color.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
});
