import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface FilterTab {
  id: string;
  label: string;
  icon?: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "pill" | "underline" | "shabetta";
  size?: "small" | "medium" | "large";
}

/**
 * フィルター切り替えタブコンポーネント
 * 「しゃべった！」アプリを参考にした、わかりやすいフィルターUI
 */
export function FilterTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "shabetta",
  size = "medium",
}: FilterTabsProps) {
  const colors = useColors();

  const handleTabPress = useCallback((tabId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabChange(tabId);
  }, [onTabChange]);

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 };
      case "large":
        return { paddingHorizontal: 24, paddingVertical: 14, fontSize: 16 };
      default:
        return { paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  if (variant === "shabetta") {
    // 「しゃべった！」風のピル型タブ
    return (
      <View style={styles.shabettaContainer}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
              style={[
                styles.shabettaTab,
                {
                  backgroundColor: isActive ? "#1F2937" : "transparent",
                  borderColor: isActive ? "#1F2937" : "#E5E7EB",
                  paddingHorizontal: sizeStyles.paddingHorizontal,
                  paddingVertical: sizeStyles.paddingVertical,
                },
              ]}
            >
              <Text
                style={[
                  styles.shabettaTabText,
                  {
                    color: isActive ? "#fff" : "#6B7280",
                    fontSize: sizeStyles.fontSize,
                    fontWeight: isActive ? "600" : "400",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  if (variant === "pill") {
    // ピル型タブ（カラフル版）
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillContainer}
        contentContainerStyle={styles.pillContent}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
              style={[
                styles.pillTab,
                {
                  backgroundColor: isActive ? "#EC4899" : "#2D3139",
                  paddingHorizontal: sizeStyles.paddingHorizontal,
                  paddingVertical: sizeStyles.paddingVertical,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillTabText,
                  {
                    color: isActive ? "#fff" : "#9CA3AF",
                    fontSize: sizeStyles.fontSize,
                    fontWeight: isActive ? "600" : "400",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  // アンダーライン型タブ
  return (
    <View style={styles.underlineContainer}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
            style={[
              styles.underlineTab,
              {
                borderBottomColor: isActive ? "#EC4899" : "transparent",
                paddingHorizontal: sizeStyles.paddingHorizontal,
                paddingVertical: sizeStyles.paddingVertical,
              },
            ]}
          >
            <Text
              style={[
                styles.underlineTabText,
                {
                  color: isActive ? "#EC4899" : "#9CA3AF",
                  fontSize: sizeStyles.fontSize,
                  fontWeight: isActive ? "600" : "400",
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * 「すべて」「お気に入り」切り替え用のプリセットタブ
 */
interface QuickFilterTabsProps {
  activeFilter: "all" | "favorites" | "participating";
  onFilterChange: (filter: "all" | "favorites" | "participating") => void;
}

export function QuickFilterTabs({ activeFilter, onFilterChange }: QuickFilterTabsProps) {
  const tabs: FilterTab[] = [
    { id: "all", label: "すべて" },
    { id: "favorites", label: "お気に入り" },
    { id: "participating", label: "参加中" },
  ];

  return (
    <FilterTabs
      tabs={tabs}
      activeTab={activeFilter}
      onTabChange={(id) => onFilterChange(id as "all" | "favorites" | "participating")}
      variant="shabetta"
    />
  );
}

const styles = StyleSheet.create({
  // しゃべった！風スタイル
  shabettaContainer: {
    flexDirection: "row",
    gap: 8,
  },
  shabettaTab: {
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  shabettaTabText: {
    textAlign: "center",
  },
  // ピル型スタイル
  pillContainer: {
    flexGrow: 0,
  },
  pillContent: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  pillTab: {
    borderRadius: 20,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  pillTabText: {
    textAlign: "center",
  },
  // アンダーライン型スタイル
  underlineContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2D3139",
  },
  underlineTab: {
    borderBottomWidth: 2,
    marginBottom: -1,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  underlineTabText: {
    textAlign: "center",
  },
});

export default FilterTabs;
