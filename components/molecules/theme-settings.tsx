import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { color, palette } from "@/theme/tokens";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

interface ThemeSettingsProps {
  onClose?: () => void;
}

const triggerHaptic = () => {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/**
 * テーマ設定コンポーネント
 * v5.80: ダークモード専用化（ライトモードは削除）
 */
export function ThemeSettingsPanel({ onClose }: ThemeSettingsProps) {
  const handleClose = () => {
    triggerHaptic();
    onClose?.();
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>テーマ設定</Text>
        {onClose && (
          <Pressable 
            onPress={handleClose} 
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <MaterialIcons name="close" size={24} color={color.slate200} />
          </Pressable>
        )}
      </View>

      {/* 現在のテーマ表示 */}
      <View style={styles.currentTheme}>
        <View style={styles.currentThemeIcon}>
          <MaterialIcons
            name="dark-mode"
            size={32}
            color={color.hostAccentLegacy}
          />
        </View>
        <Text style={styles.currentThemeText}>
          ダークモード
        </Text>
      </View>

      {/* 説明 */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={20} color={color.hostAccentLegacy} />
        <Text style={styles.infoText}>
          このアプリはダークモード専用です。目に優しく、バッテリー消費も抑えられます。
        </Text>
      </View>

      {/* フッター */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          将来のアップデートでライトモードが追加される可能性があります。
        </Text>
      </View>
    </View>
  );
}

/**
 * テーマ切り替えボタン（コンパクト版）
 * v5.80: ダークモード専用のため、アイコン表示のみ
 */
export function ThemeToggleButton() {
  return (
    <View style={styles.toggleButton}>
      <MaterialIcons name="dark-mode" size={24} color={color.hostAccentLegacy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    color: color.slate200,
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  currentTheme: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: color.surfaceDark,
    borderRadius: 16,
    marginBottom: 24,
  },
  currentThemeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${color.hostAccentLegacy}33`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  currentThemeText: {
    color: color.slate200,
    fontSize: 18,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: `${color.hostAccentLegacy}1A`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: color.slate200,
    lineHeight: 20,
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 16,
  },
  footerText: {
    color: color.slate400,
    fontSize: 12,
    textAlign: "center",
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(221, 101, 0, 0.1)",
  },
});
