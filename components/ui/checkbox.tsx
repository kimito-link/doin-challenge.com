// components/ui/checkbox.tsx
// v6.20: 統一されたCheckboxコンポーネント

import { useCallback } from "react";
import { View, Text, Pressable, StyleSheet, type ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";

// ==================== 型定義 ====================

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  containerStyle?: ViewStyle;
  testID?: string;
}

// ==================== サイズ定義 ====================

const sizeStyles = {
  sm: {
    checkboxSize: 20,
    iconSize: 14,
    fontSize: 12,
  },
  md: {
    checkboxSize: 24,
    iconSize: 18,
    fontSize: 14,
  },
};

// ==================== Checkbox ====================

/**
 * 統一されたCheckboxコンポーネント
 * 
 * @example
 * // 基本的な使い方
 * <Checkbox
 *   checked={isChecked}
 *   onChange={setIsChecked}
 *   label="同意する"
 * />
 * 
 * // 説明文付き
 * <Checkbox
 *   checked={allowVideo}
 *   onChange={setAllowVideo}
 *   label="動画使用を許可"
 *   description="応援動画に使用される場合があります"
 * />
 * 
 * // 小さいサイズ
 * <Checkbox
 *   checked={isPublic}
 *   onChange={setIsPublic}
 *   label="公開する"
 *   size="sm"
 * />
 */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  size = "md",
  disabled = false,
  containerStyle,
  testID,
}: CheckboxProps) {
  const colors = useColors();
  const sizeStyle = sizeStyles[size];

  const handlePress = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, onChange, disabled]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        {
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        containerStyle,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      testID={testID ? `${testID}-pressable` : undefined}
    >
      {/* チェックボックス */}
      <View
        style={[
          styles.checkbox,
          {
            width: sizeStyle.checkboxSize,
            height: sizeStyle.checkboxSize,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: checked
              ? color.accentPrimary
              : disabled
              ? color.textDisabled
              : color.textHint,
            backgroundColor: checked ? color.accentPrimary : "transparent",
          },
        ]}
        testID={testID ? `${testID}-checkbox` : undefined}
      >
        {checked && (
          <MaterialIcons
            name="check"
            size={sizeStyle.iconSize}
            color={colors.foreground}
          />
        )}
      </View>

      {/* ラベル・説明文 */}
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            {
              color: disabled ? color.textDisabled : colors.foreground,
              fontSize: sizeStyle.fontSize,
            },
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              {
                color: color.textSecondary,
                fontSize: sizeStyle.fontSize - 2,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// ==================== スタイル ====================

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 44, // アクセシビリティ: 最小タッチターゲット
  },
  checkbox: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2, // ラベルと揃えるための微調整
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontWeight: "600",
    lineHeight: 20,
  },
  description: {
    marginTop: 4,
    lineHeight: 16,
  },
});
