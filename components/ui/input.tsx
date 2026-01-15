import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Animated,
  Platform,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors, spacing, borderRadius, touchTarget, typography } from "@/constants/design-system";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  required?: boolean;
  showPasswordToggle?: boolean;
}

/**
 * 統一された入力フィールドコンポーネント
 * 
 * UI/UXガイドに基づく設計:
 * - ラベル: フィールド上部に配置（プレースホルダーの代わりにならない）
 * - リアルタイムバリデーション: エラー表示
 * - アクセシビリティ: 必須フィールドの明示
 * - パスワード表示切替: セキュリティと利便性のバランス
 */
export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.status.error : colors.border.default, colors.border.focus],
  });

  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.status.error : (isFocused ? colors.border.focus : colors.border.default),
          },
        ]}
      >
        {leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary.default : colors.text.tertiary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={actualSecureTextEntry}
          {...props}
        />

        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={isPasswordVisible ? "visibility" : "visibility-off"}
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name={rightIcon} size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {(error || hint) && (
        <View style={styles.messageContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={14} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : hint ? (
            <Text style={styles.hintText}>{hint}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  required: {
    color: colors.status.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: touchTarget.minSize,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === "ios" ? spacing.md : spacing.sm,
    minHeight: touchTarget.minSize,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  rightIconButton: {
    padding: spacing.md,
    minWidth: touchTarget.minSize,
    minHeight: touchTarget.minSize,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    marginTop: spacing.xs,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.status.error,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});
