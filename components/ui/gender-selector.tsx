/**
 * GenderSelector Component
 * 汎用性別選択ラジオボタン
 * v6.70: 黒ベースのカードデザインに統一（貢献度ランキング、応援メッセージと同じトンマナ）
 */

import { View, Text, Pressable } from "react-native";
import { color } from "@/theme/tokens";
import { palette } from "@/theme/tokens/palette";
import { useColors } from "@/hooks/use-colors";

export type Gender = "male" | "female" | "";

export interface GenderSelectorProps {
  /** 選択された性別 */
  value: Gender;
  /** 値変更時のコールバック */
  onChange: (value: Gender) => void;
  /** ラベルテキスト */
  label?: string;
  /** 必須フィールドかどうか */
  required?: boolean;
  /** エラーメッセージ */
  errorMessage?: string;
  /** 無効状態 */
  disabled?: boolean;
  /** 男性のラベル */
  maleLabel?: string;
  /** 女性のラベル */
  femaleLabel?: string;
}

export function GenderSelector({
  value,
  onChange,
  label = "性別",
  required = false,
  errorMessage = "性別を選択してください",
  disabled = false,
  maleLabel = "男性",
  femaleLabel = "女性",
}: GenderSelectorProps) {
  const colors = useColors();
  const showError = required && value === "";
  
  return (
    <View style={{ marginBottom: 16 }}>
      {/* ラベル */}
      {label && (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ color: color.textSecondary, fontSize: 14 }}>
            {label}
          </Text>
          {required && (
            <Text style={{ color: color.accentPrimary, fontSize: 12, marginLeft: 6, fontWeight: "bold" }}>
              必須
            </Text>
          )}
        </View>
      )}

      {/* 選択ボタン */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* 男性 */}
        <GenderOption
          selected={value === "male"}
          onPress={() => !disabled && onChange("male")}
          emoji="👨"
          label={maleLabel}
          selectedColor={palette.genderMale}
          showRequiredBorder={required && value === ""}
          disabled={disabled}
        />

        {/* 女性 */}
        <GenderOption
          selected={value === "female"}
          onPress={() => !disabled && onChange("female")}
          emoji="👩"
          label={femaleLabel}
          selectedColor={palette.genderFemale}
          showRequiredBorder={required && value === ""}
          disabled={disabled}
        />
      </View>

      {/* エラーメッセージ */}
      {showError && (
        <Text style={{ color: color.danger, fontSize: 12, marginTop: 8 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

// 性別オプションボタン
function GenderOption({
  selected,
  onPress,
  emoji,
  label,
  selectedColor,
  showRequiredBorder,
  disabled,
}: {
  selected: boolean;
  onPress: () => void;
  emoji: string;
  label: string;
  selectedColor: string;
  showRequiredBorder: boolean;
  disabled: boolean;
}) {
  const colors = useColors();
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        backgroundColor: palette.gray800, // 黒ベースで統一（MessageCard、ContributionRankingと同じ）
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 2,
        borderColor: selected ? selectedColor : showRequiredBorder ? color.accentPrimary : palette.gray700,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ fontSize: 32, marginBottom: 4 }}>{emoji}</Text>
      <Text style={{ 
        color: selected ? selectedColor : color.textSecondary, 
        fontSize: 14, 
        fontWeight: "600" 
      }}>
        {label}
      </Text>
    </Pressable>
  );
}
