/**
 * WelcomeMessage Component
 * ログイン後のウェルカムメッセージ
 * 
 * ログイン成功後に3秒間表示されるウェルカムメッセージ
 * キャラクターがランダムに選択され、アニメーション付きで表示される
 */

import { View, Text, Modal } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { getRandomLoginMessage, type LoginMessage } from "@/constants/login-messages";

// キャラクター画像の静的マッピング（動的require()を避けるため）
const CHARACTER_IMAGES = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
};

interface WelcomeMessageProps {
  visible: boolean;
  onHide: () => void;
  userName?: string;
}

export function WelcomeMessage({ visible, onHide, userName }: WelcomeMessageProps) {
  const colors = useColors();
  const [message, setMessage] = useState<LoginMessage | null>(null);

  // 表示時にランダムなメッセージを選択
  useEffect(() => {
    if (visible) {
      setMessage(getRandomLoginMessage());
      
      // 3秒後に自動的に非表示
      const timer = setTimeout(() => {
        onHide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  // キャラクターのバウンスアニメーション
  const characterAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withSpring(-8, { damping: 10, stiffness: 100 }),
              withSpring(0, { damping: 10, stiffness: 100 })
            ),
            -1, // 無限ループ
            false
          ),
        },
      ],
    };
  });

  if (!message) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={{
            backgroundColor: colors.background,
            borderRadius: 20,
            padding: 32,
            maxWidth: 400,
            width: "90%",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* キャラクター */}
          <Animated.Image
            source={CHARACTER_IMAGES[message.character]}
            style={[
              { width: 80, height: 80, marginBottom: 20 },
              characterAnimatedStyle,
            ]}
          />

          {/* ウェルカムメッセージ */}
          <Animated.Text
            entering={FadeIn.delay(200)}
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            おかえりなさい！
          </Animated.Text>

          {/* ユーザー名 */}
          {userName && (
            <Animated.Text
              entering={FadeIn.delay(300)}
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.primary,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {userName}さん
            </Animated.Text>
          )}

          {/* キャラクターメッセージ */}
          <Animated.Text
            entering={FadeIn.delay(400)}
            style={{
              fontSize: 15,
              color: colors.muted,
              lineHeight: 23,
              textAlign: "center",
            }}
          >
            {getWelcomeMessage(message.character)}
          </Animated.Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * キャラクターごとのウェルカムメッセージを取得
 */
function getWelcomeMessage(character: "rinku" | "konta" | "tanune"): string {
  const messages = {
    rinku: "今日も一緒に推し活を楽しもう！",
    konta: "みんなで盛り上がっていこう！",
    tanune: "あなたの応援、しっかり記録するね！",
  };
  return messages[character];
}
