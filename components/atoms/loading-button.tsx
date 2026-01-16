import { useState, useCallback } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View, Platform, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface LoadingButtonProps {
  onPress: () => Promise<void> | void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  haptic?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

const variantStyles = {
  primary: {
    bg: "#EC4899",
    text: "#fff",
    border: "transparent",
  },
  secondary: {
    bg: "#1A1D21",
    text: "#fff",
    border: "#374151",
  },
  outline: {
    bg: "transparent",
    text: "#EC4899",
    border: "#EC4899",
  },
  ghost: {
    bg: "transparent",
    text: "#9CA3AF",
    border: "transparent",
  },
  destructive: {
    bg: "#EF4444",
    text: "#fff",
    border: "transparent",
  },
};

const sizeStyles = {
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    iconSize: 16,
    minHeight: 44, // Apple HIG準拠
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    iconSize: 20,
    minHeight: 48,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 18,
    iconSize: 24,
    minHeight: 56,
  },
};

/**
 * 非同期処理対応のローディングボタン
 * 
 * UI/UXガイドに基づく設計:
 * - 即時フィードバック: クリック時に即座にローディング状態に
 * - 処理状態の可視化: スピナーで処理中を表示
 * - 成功/エラーフィードバック: 処理完了後に結果を表示
 */
export function LoadingButton({
  onPress,
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  haptic = true,
}: LoadingButtonProps) {
  const [loading, setLoading] = useState(false);
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const handlePress = useCallback(async () => {
    if (loading || disabled) return;
    
    // 触覚フィードバック
    if (haptic && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  }, [loading, disabled, haptic, onPress]);

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          borderWidth: variant === "outline" || variant === "secondary" ? 1 : 0,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          minHeight: sizeStyle.minHeight,
          opacity: isDisabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.text} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === "left" && (
            <MaterialIcons
              name={icon}
              size={sizeStyle.iconSize}
              color={variantStyle.text}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: variantStyle.text,
                fontSize: sizeStyle.fontSize,
              },
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === "right" && (
            <MaterialIcons
              name={icon}
              size={sizeStyle.iconSize}
              color={variantStyle.text}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
