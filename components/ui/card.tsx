import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, borderRadius, shadows } from "@/constants/design-system";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  onPress?: () => void;
  style?: ViewStyle;
  padding?: "none" | "sm" | "md" | "lg";
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

interface CardFooterProps {
  children: React.ReactNode;
}

/**
 * 統一されたカードコンポーネント
 * 
 * UI/UXガイドに基づく設計:
 * - 一貫性: 統一されたスタイルとバリエーション
 * - タッチターゲット: クリック可能な場合は十分なサイズ
 * - 視覚的階層: 適切な影とボーダー
 */
export function Card({
  children,
  variant = "default",
  onPress,
  style,
  padding = "md",
}: CardProps) {
  const paddingValue = {
    none: 0,
    sm: spacing.sm,
    md: spacing.lg,
    lg: spacing.xl,
  }[padding];

  const variantStyle = {
    default: {
      backgroundColor: colors.background.secondary,
      borderWidth: 0,
    },
    elevated: {
      backgroundColor: colors.background.elevated,
      ...shadows.md,
    },
    outlined: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border.default,
    },
  }[variant];

  const content = (
    <View
      style={[
        styles.card,
        variantStyle,
        { padding: paddingValue },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

/**
 * カードヘッダー
 */
export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

/**
 * カードフッター
 */
export function CardFooter({ children }: CardFooterProps) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  action: {
    marginLeft: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
