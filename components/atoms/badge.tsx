import { View, Text, StyleSheet } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "primary";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles = {
  default: {
    bg: "rgba(156, 163, 175, 0.2)",
    text: "#D1D5DB",
    border: "#CBD5E0",
  },
  success: {
    bg: "rgba(34, 197, 94, 0.2)",
    text: "#22C55E",
    border: "#22C55E",
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.2)",
    text: "#F59E0B",
    border: "#F59E0B",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.2)",
    text: "#EF4444",
    border: "#EF4444",
  },
  info: {
    bg: "rgba(59, 130, 246, 0.2)",
    text: "#3B82F6",
    border: "#3B82F6",
  },
  primary: {
    bg: "rgba(221, 101, 0, 0.2)",
    text: "#DD6500",
    border: "#DD6500",
  },
};

const sizeStyles = {
  sm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    fontSize: 10,
    borderRadius: 4,
  },
  md: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 12,
    borderRadius: 6,
  },
  lg: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    borderRadius: 8,
  },
};

/**
 * バッジコンポーネント
 * ステータス表示、タグ、カウンターなどに使用
 */
export function Badge({
  children,
  variant = "default",
  size = "md",
  icon,
}: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.borderRadius,
        },
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
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
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: "600",
  },
});
