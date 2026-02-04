// features/create/ui/components/create-challenge-form/TitleInputSection.tsx
// チャレンジ名入力セクション

import { View, Text, TextInput } from "react-native";
import { color } from "@/theme/tokens";
import { createFont } from "../../theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { InlineValidationError } from "@/components/molecules/inline-validation-error";
import type { TitleInputSectionProps } from "./types";

/**
 * チャレンジ名入力セクション
 * バリデーションエラー表示付き
 */
export function TitleInputSection({
  value,
  onChange,
  showValidationError,
  inputRef,
}: TitleInputSectionProps) {
  const colors = useColors();
  const hasError = showValidationError && !value.trim();

  return (
    <View ref={inputRef} style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, fontSize: createFont.body, marginBottom: 8 }}>
        チャレンジ名 *
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="例: ○○ワンマンライブ動員チャレンジ"
        placeholderTextColor={color.textSecondary}
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: hasError ? color.accentPrimary : color.border,
        }}
      />
      <InlineValidationError
        message="チャレンジ名を入れてね！"
        visible={hasError}
        character="rinku"
      />
    </View>
  );
}
