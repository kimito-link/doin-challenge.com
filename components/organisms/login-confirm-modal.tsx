/**
 * LoginConfirmModal Component
 * ログイン確認モーダル
 * 
 * Xログイン開始前に表示し、ユーザーに心の準備をさせる
 */

import { View, Text, Modal, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { LinkSpeech } from "./link-speech";
import { Button } from "../ui/button";

interface LoginConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LoginConfirmModal({ 
  visible, 
  onConfirm, 
  onCancel 
}: LoginConfirmModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable 
        style={{ 
          flex: 1, 
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
        onPress={onCancel}
      >
        <Pressable 
          style={{ 
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            width: "100%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* タイトル */}
          <Text style={{ 
            fontSize: 20, 
            fontWeight: "bold", 
            color: colors.foreground,
            marginBottom: 16,
            textAlign: "center",
          }}>
            Xでログインしますか？
          </Text>

          {/* 説明 */}
          <Text style={{ 
            fontSize: 14, 
            color: colors.muted,
            marginBottom: 8,
            lineHeight: 21,
          }}>
            このあとXの公式画面に移動します。
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.muted,
            marginBottom: 20,
            lineHeight: 21,
          }}>
            戻ってきたらログイン完了です。
          </Text>

          {/* りんくの吹き出し */}
          <LinkSpeech 
            message="ログインすると、参加履歴やお気に入りが使えるよ！"
          />

          {/* ボタン */}
          <View style={{ gap: 12, marginTop: 8 }}>
            <Button
              onPress={onConfirm}
              icon="login"
              style={{ backgroundColor: "#1DA1F2" }}
            >
              Xでログイン
            </Button>
            <Button
              onPress={onCancel}
              variant="outline"
            >
              やめておく
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
