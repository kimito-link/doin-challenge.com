import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useCallback } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useThemeContext, getThemeModeLabel, getThemeModeIcon } from "@/lib/theme-provider";

type ThemeMode = "system" | "light" | "dark";

interface ThemeModeOptionProps {
  mode: ThemeMode;
  currentMode: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
}

function ThemeModeOption({ mode, currentMode, onSelect }: ThemeModeOptionProps) {
  const isSelected = mode === currentMode;
  const label = getThemeModeLabel(mode);
  const iconName = getThemeModeIcon(mode);

  const handlePress = useCallback(() => {
    if ((Platform.OS as string) !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(mode);
  }, [mode, onSelect]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.optionItem,
        isSelected && styles.optionItemSelected,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
    >
      <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
        <MaterialIcons
          name={iconName as any}
          size={24}
          color={isSelected ? "#DD6500" : "#9CA3AF"}
        />
      </View>
      <View style={styles.optionInfo}>
        <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
          {label}
        </Text>
        <Text style={styles.optionDescription}>
          {mode === "system" && "デバイスの設定に合わせて自動切替"}
          {mode === "light" && "常に明るい背景で表示"}
          {mode === "dark" && "常に暗い背景で表示"}
        </Text>
      </View>
      {isSelected && (
        <MaterialIcons name="check-circle" size={24} color="#DD6500" />
      )}
    </TouchableOpacity>
  );
}

interface ThemeSettingsProps {
  onClose?: () => void;
}

/**
 * テーマ設定コンポーネント
 * ライト/ダーク/システム設定の切り替え
 */
export function ThemeSettingsPanel({ onClose }: ThemeSettingsProps) {
  const { themeMode, setThemeMode, colorScheme } = useThemeContext();

  const handleModeSelect = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    if ((Platform.OS as string) !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [setThemeMode]);

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>テーマ設定</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* 現在のテーマ表示 */}
      <View style={styles.currentTheme}>
        <View style={styles.currentThemeIcon}>
          <MaterialIcons
            name={colorScheme === "dark" ? "dark-mode" : "light-mode"}
            size={32}
            color="#DD6500"
          />
        </View>
        <Text style={styles.currentThemeText}>
          現在: {colorScheme === "dark" ? "ダークモード" : "ライトモード"}
        </Text>
      </View>

      {/* テーマ選択オプション */}
      <View style={styles.optionList}>
        <Text style={styles.sectionTitle}>表示モード</Text>

        <ThemeModeOption
          mode="system"
          currentMode={themeMode}
          onSelect={handleModeSelect}
        />

        <ThemeModeOption
          mode="light"
          currentMode={themeMode}
          onSelect={handleModeSelect}
        />

        <ThemeModeOption
          mode="dark"
          currentMode={themeMode}
          onSelect={handleModeSelect}
        />
      </View>

      {/* 説明 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          テーマ設定はこのデバイスにのみ保存されます。
        </Text>
      </View>
    </View>
  );
}

/**
 * テーマ切り替えボタン（コンパクト版）
 * ヘッダーなどに配置するための小さなトグルボタン
 */
export function ThemeToggleButton() {
  const { colorScheme, toggleTheme, themeMode } = useThemeContext();

  const handlePress = useCallback(() => {
    if ((Platform.OS as string) !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  }, [toggleTheme]);

  const iconName = getThemeModeIcon(themeMode);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.toggleButton}
      accessibilityRole="button"
      accessibilityLabel={`テーマを切り替え（現在: ${getThemeModeLabel(themeMode)}）`}
    >
      <MaterialIcons
        name={iconName as any}
        size={24}
        color={colorScheme === "dark" ? "#F59E0B" : "#6B7280"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151718",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3139",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  currentTheme: {
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  currentThemeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(221, 101, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  currentThemeText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  optionList: {
    padding: 16,
  },
  sectionTitle: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1D21",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionItemSelected: {
    borderColor: "#DD6500",
    backgroundColor: "rgba(221, 101, 0, 0.1)",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2D3139",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionIconSelected: {
    backgroundColor: "rgba(221, 101, 0, 0.2)",
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  optionTitleSelected: {
    color: "#DD6500",
  },
  optionDescription: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  footer: {
    padding: 16,
    marginTop: "auto",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A1D21",
    alignItems: "center",
    justifyContent: "center",
  },
});
