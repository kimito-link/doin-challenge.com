// features/create/ui/components/create-challenge-form/VenueInputSection.tsx
// 開催場所入力セクション

import { View, Text, TextInput } from "react-native";
import { color } from "@/theme/tokens";
import { createFont } from "../../theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { UndecidedOption } from "./UndecidedOption";
import type { VenueInputSectionProps } from "./types";

/**
 * 開催場所入力セクション
 * 「まだ決まっていない」オプション付き
 */
export function VenueInputSection({ value, onChange }: VenueInputSectionProps) {
  const colors = useColors();
  const isUndecided = value === "まだ決まっていない";

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, fontSize: createFont.body, marginBottom: 8 }}>
        開催場所（任意）
      </Text>

      <UndecidedOption
        checked={isUndecided}
        onToggle={() => onChange("まだ決まっていない")}
        note="※ 決まり次第、後から編集できます"
      />

      {!isUndecided && (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="例: 渋谷○○ホール / YouTube / ミクチャ"
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
      )}
    </View>
  );
}
