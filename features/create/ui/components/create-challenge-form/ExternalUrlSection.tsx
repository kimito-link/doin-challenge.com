// features/create/ui/components/create-challenge-form/ExternalUrlSection.tsx
// 外部URL入力セクション

import { View, Text, TextInput } from "react-native";
import { color } from "@/theme/tokens";
import { createFont } from "../../theme/tokens";
import { useColors } from "@/hooks/use-colors";
import type { ExternalUrlSectionProps } from "./types";

/**
 * 外部URL入力セクション
 * YouTubeプレミア公開URL等の入力
 */
export function ExternalUrlSection({ value, onChange }: ExternalUrlSectionProps) {
  const colors = useColors();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, fontSize: createFont.body, marginBottom: 8 }}>
        外部URL（任意）
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="YouTubeプレミア公開URL等"
        placeholderTextColor={color.textSecondary}
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: color.border,
        }}
      />
    </View>
  );
}
