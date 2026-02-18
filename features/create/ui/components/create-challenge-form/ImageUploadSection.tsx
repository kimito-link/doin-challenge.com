/**
 * ImageUploadSection Component
 * チャレンジ作成フォームの画像URL入力セクション
 */

import { View, Text, TextInput } from "react-native";
import { Image } from "expo-image";
import { color } from "@/theme/tokens";
import { useState } from "react";

interface ImageUploadSectionProps {
  imageUrl?: string;
  onImageChange: (url: string) => void;
}

export function ImageUploadSection({ imageUrl, onImageChange }: ImageUploadSectionProps) {
  const [inputValue, setInputValue] = useState(imageUrl || "");

  const handleChange = (text: string) => {
    setInputValue(text);
    onImageChange(text);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: color.textPrimary, marginBottom: 8 }}>
        アイキャッチ画像（任意）
      </Text>
      <Text style={{ fontSize: 14, color: color.textSecondary, marginBottom: 12 }}>
        イベントの魅力を伝える画像URLを入力してください（推奨サイズ: 1200x675px）
      </Text>

      <TextInput
        value={inputValue}
        onChangeText={handleChange}
        placeholder="https://example.com/image.jpg"
        placeholderTextColor={color.textSecondary}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: color.surface,
          borderWidth: 1,
          borderColor: color.border,
          fontSize: 14,
          color: color.textPrimary,
          marginBottom: 12,
        }}
      />

      {inputValue && (
        <View>
          <Text style={{ fontSize: 14, color: color.textSecondary, marginBottom: 8 }}>
            プレビュー:
          </Text>
          <Image
            source={{ uri: inputValue }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              backgroundColor: color.surface,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
            transition={200}
          />
        </View>
      )}
    </View>
  );
}
