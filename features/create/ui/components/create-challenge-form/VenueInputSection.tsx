// features/create/ui/components/create-challenge-form/VenueInputSection.tsx
// 開催場所入力セクション

import { View, Text, TextInput, Pressable } from "react-native";
import { color } from "@/theme/tokens";
import { createFont } from "../../theme/tokens";
import { useColors } from "@/hooks/use-colors";
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
      
      {/* まだ決まっていないオプション */}
      <Pressable
        onPress={() => onChange("まだ決まっていない")}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isUndecided ? color.accentPrimary : color.textDisabled,
            backgroundColor: isUndecided ? color.accentPrimary : "transparent",
            marginRight: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isUndecided && (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.textWhite }} />
          )}
        </View>
        <Text style={{ color: colors.muted, fontSize: createFont.body }}>
          まだ決まっていない
        </Text>
      </Pressable>

      {/* 入力フィールドまたは説明テキスト */}
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
      {isUndecided && (
        <Text style={{ color: color.textSecondary, fontSize: createFont.meta, marginTop: 4 }}>
          ※ 決まり次第、後から編集できます
        </Text>
      )}
    </View>
  );
}
