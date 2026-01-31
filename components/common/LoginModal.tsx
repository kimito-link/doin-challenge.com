/**
 * LoginModal Component
 * 共通ログイン確認モーダル
 * 
 * すべての画面（ホーム、チャレンジ、マイページ）で使用する統一されたログインUI
 */

import { View, Text, Modal, Pressable, Image } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { Button } from "../ui/button";

interface LoginModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LoginModal({ 
  visible, 
  onConfirm, 
  onCancel 
}: LoginModalProps) {
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
          <View style={{ 
            flexDirection: "row", 
            alignItems: "flex-start", 
            marginBottom: 24,
            backgroundColor: "#FFF5F0",
            padding: 16,
            borderRadius: 12,
          }}>
            <Image
              source={require("@/assets/images/characters/rinku.png")}
              style={{ width: 48, height: 48, marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 14, 
                color: colors.foreground,
                lineHeight: 21,
              }}>
                ログインすると、参加履歴やお気に入りが使えるよ！
              </Text>
            </View>
          </View>

          {/* ボタン */}
          <View style={{ gap: 12 }}>
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
