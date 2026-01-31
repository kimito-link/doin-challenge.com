/**
 * Phase 2: ログインUX改善
 * PR-1: LinkSpeechコンポーネント（りんくの吹き出し）
 * 
 * このファイルはPhase 2実装ガイドに基づいて作成されています。
 * docs/phase2-implementation-guide.md を参照してください。
 */

import { View, Text } from "react-native";
import { Image } from "expo-image";

export type LinkSpeechTone = "normal" | "warning";

export type LinkSpeechProps = {
  title?: string; // 例: "りんく"
  message: string; // 吹き出し本文（短い）
  tone?: LinkSpeechTone;
};

/**
 * りんくの吹き出しコンポーネント
 * 
 * ログイン確認モーダルなどで使用
 */
export function LinkSpeech({ title, message, tone = "normal" }: LinkSpeechProps) {
  return (
    <View className="items-center gap-4">
      {/* りんくのアイコン */}
      <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
        <Image
          source={require("@/assets/images/link-icon.png")}
          className="w-16 h-16"
          contentFit="contain"
        />
      </View>

      {/* タイトル（オプション） */}
      {title && (
        <Text className="text-lg font-bold text-foreground">{title}</Text>
      )}

      {/* 吹き出し */}
      <View
        className={`
          px-4 py-3 rounded-2xl
          ${tone === "warning" ? "bg-warning/10 border border-warning" : "bg-surface border border-border"}
        `}
      >
        <Text
          className={`
            text-base leading-relaxed text-center
            ${tone === "warning" ? "text-warning" : "text-foreground"}
          `}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
