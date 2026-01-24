import { View, Text, Pressable, Modal, StyleSheet, Animated, Platform } from "react-native";
import { color, palette } from "@/theme/tokens";
import { useRef, useEffect } from "react";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { LinkSpeech } from "@/components/organisms/link-speech";

// キャラクター画像（半目で寂しそうな表情）
const characterImage = require("@/assets/images/characters/link/link-yukkuri-half-eyes-mouth-closed.png");

interface LogoutConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ログアウト確認モーダル（キャラクター付き）
 * かわいいデザインでユーザーに確認を求める
 */
export function LogoutConfirmModal({
  visible,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const characterBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // モーダル表示アニメーション
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

      // キャラクターの揺れアニメーション
      Animated.loop(
        Animated.sequence([
          Animated.timing(characterBounce, {
            toValue: -5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(characterBounce, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      characterBounce.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim, characterBounce]);

  const handleConfirm = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onConfirm();
  };

  const handleCancel = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleCancel}
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
          <Pressable>
            {/* キャラクターと吹き出し */}
            <View style={styles.characterSection}>
              <Animated.View
                style={[
                  styles.characterContainer,
                  { transform: [{ translateY: characterBounce }] },
                ]}
              >
                <Image
                  source={characterImage}
                  style={styles.character}
                  contentFit="contain"
                />
              </Animated.View>
              
              {/* 吹き出し */}
              <View style={{ width: '100%', marginTop: 8 }}>
                <LinkSpeech 
                  message="ログアウトすると、参加履歴やお気に入りが見られなくなるよ。\n本当にログアウトする？"
                  characterImage={characterImage}
                />
              </View>
            </View>

            {/* タイトル */}
            <Text style={styles.title}>ログアウトしますか？</Text>

            {/* ボタン */}
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleConfirm}
                style={({ pressed }) => [
                  styles.button,
                  styles.confirmButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                ]}
              >
                <MaterialIcons name="logout" size={18} color={color.textWhite} style={{ marginRight: 6 }} />
                <Text style={styles.confirmButtonText}>ログアウトする</Text>
              </Pressable>

              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
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
    padding: 24,
  },
  container: {
    backgroundColor: color.surface,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },
  characterSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  characterContainer: {
    marginBottom: 8,
  },
  character: {
    width: 100,
    height: 100,
  },

  title: {
    color: color.textWhite,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },
  cancelButtonText: {
    color: color.accentPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: color.textSubtle,
  },
  confirmButtonText: {
    color: color.textWhite,
    fontSize: 15,
    fontWeight: "600",
  },
});
