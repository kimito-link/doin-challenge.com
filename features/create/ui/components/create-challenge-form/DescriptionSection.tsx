// features/create/ui/components/create-challenge-form/DescriptionSection.tsx
// チャレンジ説明入力セクション

import { View, Text, TextInput } from "react-native";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import type { DescriptionSectionProps } from "./types";

/**
 * チャレンジ説明入力セクション
 * 複数行入力対応
 */
export function DescriptionSection({ value, onChange }: DescriptionSectionProps) {
  const colors = useColors();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
        チャレンジ説明（任意）
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="チャレンジの詳細を書いてね"
        placeholderTextColor={color.textSecondary}
        multiline
        numberOfLines={4}
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: color.border,
          minHeight: 100,
          textAlignVertical: "top",
        }}
      />
    </View>
  );
}
