import { TouchableOpacity, Text, ActivityIndicator, View, Platform, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  haptic?: boolean;
}

const variantStyles = {
  primary: {
    bg: "#EC4899",
    text: "#fff",
    border: "transparent",
    activeBg: "#DB2777",
  },
  secondary: {
    bg: "#1A1D21",
    text: "#fff",
    border: "#374151",
    activeBg: "#2D3139",
  },
  outline: {
    bg: "transparent",
    text: "#EC4899",
    border: "#EC4899",
    activeBg: "rgba(236, 72, 153, 0.1)",
  },
  ghost: {
    bg: "transparent",
    text: "#9CA3AF",
    border: "transparent",
    activeBg: "rgba(255, 255, 255, 0.1)",
  },
  destructive: {
    bg: "#EF4444",
    text: "#fff",
    border: "transparent",
    activeBg: "#DC2626",
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
 * 統一されたボタンコンポーネント
 * 
 * UI/UXガイドに基づく設計:
 * - 最低タッチターゲット: 44x44px (Apple HIG準拠)
 * - 即時フィードバック: ローディング状態、触覚フィードバック
 * - 一貫したデザイン: プライマリ/セカンダリ/アウトライン/ゴースト/破壊的
 * - アクセシビリティ: 十分なコントラスト比
 */
export function Button({
  onPress,
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  haptic = true,
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const handlePress = () => {
    if (loading || disabled) return;
    
    // 触覚フィードバック
    if (haptic && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };

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
