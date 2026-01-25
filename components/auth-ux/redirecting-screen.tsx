/**
 * Phase 2: ログインUX改善
 * PR-2: Redirecting画面（X画面に遷移中）
 */

import { View, Text, ActivityIndicator } from "react-native";
import { color } from "@/theme/tokens";
import { LinkSpeech } from "./link-speech";

export interface RedirectingScreenProps {
  /**
   * 表示するかどうか
   */
  visible: boolean;
}

/**
 * Redirecting画面
 * 
 * X画面に遷移中であることを表示
 * りんくの吹き出しで「X画面に移動するよ」と説明
 */
export function RedirectingScreen({ visible }: RedirectingScreenProps) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <View
        style={{
          backgroundColor: color.surface,
          borderRadius: 16,
          padding: 24,
          maxWidth: 320,
          width: "90%",
          alignItems: "center",
        }}
      >
        {/* りんくの吹き出し */}
        <LinkSpeech
          title="りんく"
          message="X画面に移動するよ。少し待ってね！"
        />

        {/* ローディングインジケーター */}
        <View style={{ marginTop: 24, alignItems: "center" }}>
          <ActivityIndicator size="large" color={color.accentPrimary} />
          <Text
            style={{
              color: color.textMuted,
              fontSize: 14,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            X画面に移動中...
          </Text>
        </View>
      </View>
    </View>
  );
}
