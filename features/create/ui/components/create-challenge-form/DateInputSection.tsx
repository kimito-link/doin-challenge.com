// features/create/ui/components/create-challenge-form/DateInputSection.tsx
// 開催日入力セクション

import { View, Text, Pressable } from "react-native";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { DatePicker } from "@/components/molecules/date-picker";
import type { DateInputSectionProps } from "./types";

/**
 * 開催日入力セクション
 * 「まだ決まっていない」オプション付き
 */
export function DateInputSection({
  value,
  onChange,
  showValidationError,
  inputRef,
}: DateInputSectionProps) {
  const colors = useColors();
  const isUndecided = value === "9999-12-31";
  const hasError = showValidationError && !value.trim();

  const handleToggleUndecided = () => {
    if (isUndecided) {
      onChange("");
    } else {
      onChange("9999-12-31");
    }
  };

  return (
    <View ref={inputRef} style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
        開催日
      </Text>
      
      {/* まだ決まっていないオプション */}
      <Pressable
        onPress={handleToggleUndecided}
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
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          まだ決まっていない
        </Text>
      </Pressable>

      {/* 日付選択または説明テキスト */}
      {isUndecided ? (
        <Text style={{ color: color.textSecondary, fontSize: 12 }}>
          ※ 日程が決まり次第、後から編集できます
        </Text>
      ) : (
        <View style={{ borderWidth: hasError ? 1 : 0, borderColor: color.accentPrimary, borderRadius: 8 }}>
          <DatePicker
            value={value}
            onChange={onChange}
            placeholder="日付を選択"
          />
        </View>
      )}
    </View>
  );
}
