/**
 * LinkSpeech Component
 * りんくの吹き出しメッセージ（共通コンポーネント）
 */

import { View, Text } from "react-native";
import { Image } from "expo-image";

interface LinkSpeechProps {
  message: string;
  /** キャラクター画像のパス（デフォルト: りんく） */
  characterImage?: any;
  /** 吹き出しの背景色（デフォルト: ピンク系） */
  backgroundColor?: string;
  /** 吹き出しの枠線色（デフォルト: ピンク系） */
  borderColor?: string;
}

export function LinkSpeech({ 
  message, 
  characterImage = require("@/assets/images/characters/rinku.png"),
  backgroundColor = "rgba(236, 72, 153, 0.1)",
  borderColor = "rgba(236, 72, 153, 0.3)",
}: LinkSpeechProps) {
  return (
    <View style={{ 
      flexDirection: "row", 
      alignItems: "flex-start", 
      marginTop: 16,
      marginBottom: 16,
      maxWidth: 500,
      width: "100%",
    }}>
      <Image 
        source={characterImage} 
        style={{ 
          width: 60, 
          height: 60,
          marginRight: 12,
        }} 
        contentFit="contain" 
      />
      <View style={{ 
        flex: 1, 
        backgroundColor,
        borderRadius: 12,
        borderTopLeftRadius: 4,
        padding: 14,
        borderWidth: 1,
        borderColor,
      }}>
        <Text style={{ 
          color: "#4B5563", 
          fontSize: 14, 
          lineHeight: 21,
        }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
