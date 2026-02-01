/**
 * LoginModal Component
 * 共通ログイン確認モーダル
 * 
 * すべての画面（ホーム、チャレンジ、マイページ）で使用する統一されたログインUI
 */

import { View, Text, Modal, Pressable, Image } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { Button } from "../ui/button";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  BounceIn,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { useEffect, useState, useMemo } from "react";

interface LoginModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// りんくのメッセージバリエーション
const RINKU_MESSAGES = [
  "ログインすると、参加履歴やお気に入りが使えるよ！",
  "一緒に推しを応援しよう！ログインして参加しよう！",
  "ログインすると、あなたの応援が記録されるよ！",
  "みんなと一緒に推しを盛り上げよう！",
  "ログインして、もっと楽しく推し活しよう！",
];

export function LoginModal({ 
  visible, 
  onConfirm, 
  onCancel 
}: LoginModalProps) {
  const colors = useColors();

  // ランダムなメッセージを選択（モーダルが表示されるたびに変わる）
  const rinkuMessage = useMemo(() => {
    return RINKU_MESSAGES[Math.floor(Math.random() * RINKU_MESSAGES.length)];
  }, [visible]);

  // りんくキャラクターのバウンスアニメーション
  const rinkuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withSpring(-5, { damping: 10, stiffness: 100 }),
              withSpring(0, { damping: 10, stiffness: 100 })
            ),
            -1, // 無限ループ
            false
          ),
        },
      ],
    };
  });

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
            fontSize: 22, 
            fontWeight: "700", 
            color: colors.foreground,
            marginBottom: 20,
            textAlign: "center",
            letterSpacing: 0.5,
          }}>
            Xでログインしますか？
          </Text>

          {/* 説明 */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ 
              fontSize: 15, 
              color: colors.muted,
              marginBottom: 6,
              lineHeight: 22,
              textAlign: "center",
            }}>
              このあとXの公式画面に移動します。
            </Text>
            <Text style={{ 
              fontSize: 15, 
              color: colors.muted,
              lineHeight: 22,
              textAlign: "center",
            }}>
              戻ってきたらログイン完了です。
            </Text>
          </View>

          {/* りんくの吹き出し */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={{ 
              flexDirection: "row", 
              alignItems: "flex-start", 
              marginBottom: 28,
              backgroundColor: "#FFF5F0",
              padding: 20,
              borderRadius: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Animated.Image
              source={require("@/assets/images/characters/rinku.png")}
              style={[
                { width: 64, height: 64, marginRight: 12 },
                rinkuAnimatedStyle,
              ]}
            />
            <Animated.View 
              entering={FadeInUp.delay(400).springify()}
              style={{ flex: 1 }}
            >
              <Text style={{ 
                fontSize: 15, 
                color: colors.foreground,
                lineHeight: 23,
                fontWeight: "500",
              }}>
                {rinkuMessage}
              </Text>
            </Animated.View>
          </Animated.View>

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
