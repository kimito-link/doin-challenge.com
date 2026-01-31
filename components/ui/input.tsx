// components/ui/input.tsx
// v6.19: 統一されたフォーム入力コンポーネント

import { useState, useCallback, forwardRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Platform,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";

// ==================== 型定義 ====================

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  /** 入力欄のサイズ */
  size?: "sm" | "md" | "lg";
  /** 複数行入力 */
  multiline?: boolean;
  /** 複数行の場合の行数 */
  numberOfLines?: number;
}

// ==================== サイズ定義 ====================

const sizeStyles = {
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    minHeight: 44,
    borderRadius: 10,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 48,
    borderRadius: 12,
  },
  lg: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 18,
    minHeight: 56,
    borderRadius: 14,
  },
};

// ==================== Input ====================

/**
 * 統一されたテキスト入力コンポーネント
 * 
 * @example
 * // 基本的な使い方
 * <Input 
 *   label="メールアドレス" 
 *   placeholder="example@email.com"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 * 
 * // エラー表示
 * <Input 
 *   label="パスワード" 
 *   secureTextEntry
 *   error="パスワードは8文字以上必要です"
 *   value={password}
 *   onChangeText={setPassword}
 * />
 * 
 * // アイコン付き
 * <Input 
 *   label="検索" 
 *   icon="search"
 *   placeholder="キーワードを入力"
 * />
 */
export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  hint,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  size = "md",
  multiline = false,
  numberOfLines = 4,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const sizeStyle = sizeStyles[size];

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  }, [props.onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  }, [props.onBlur]);

  const borderColor = error 
    ? color.danger 
    : isFocused 
      ? color.accentPrimary 
      : color.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View 
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderRadius: sizeStyle.borderRadius,
            minHeight: multiline ? sizeStyle.minHeight * numberOfLines * 0.5 : sizeStyle.minHeight,
          },
        ]}
      >
        {icon && (
          <MaterialIcons 
            name={icon} 
            size={20} 
            color={isFocused ? color.accentPrimary : color.textMuted} 
            style={styles.icon}
          />
        )}
        
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              paddingVertical: sizeStyle.paddingVertical,
              paddingHorizontal: icon ? 0 : sizeStyle.paddingHorizontal,
              fontSize: sizeStyle.fontSize,
            },
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          placeholderTextColor={color.textSubtle}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <MaterialIcons 
            name={rightIcon} 
            size={20} 
            color={color.textMuted} 
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={14} color={color.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {hint && !error && (
        <Text style={styles.hintText}>{hint}</Text>
      )}
    </View>
  );
});

Input.displayName = "Input";

// ==================== SearchInput ====================

export interface SearchInputProps extends Omit<InputProps, "icon" | "label"> {
  onSearch?: (text: string) => void;
  onClear?: () => void;
}

/**
 * 検索入力コンポーネント
 * 
 * @example
 * <SearchInput 
 *   placeholder="チャレンジを検索"
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   onSearch={handleSearch}
 * />
 */
export function SearchInput({
  value,
  onChangeText,
  onSearch,
  onClear,
  ...props
}: SearchInputProps) {
  const handleClear = useCallback(() => {
    onChangeText?.("");
    onClear?.();
  }, [onChangeText, onClear]);

  const handleSubmit = useCallback(() => {
    if (value) {
      onSearch?.(value);
    }
  }, [value, onSearch]);

  return (
    <Input
      icon="search"
      rightIcon={value ? "close" : undefined}
      onRightIconPress={handleClear}
      value={value}
      onChangeText={onChangeText}
      returnKeyType="search"
      onSubmitEditing={handleSubmit}
      {...props}
    />
  );
}

// ==================== スタイル ====================

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: color.textWhite,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    flex: 1,
    color: color.textWhite,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      } as any,
    }),
  },
  multilineInput: {
    paddingTop: 12,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  errorText: {
    fontSize: 13,
    color: color.danger,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 13,
    color: color.textMuted,
    marginTop: 6,
  },
});

export default Input;
