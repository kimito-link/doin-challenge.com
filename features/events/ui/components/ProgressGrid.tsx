// features/events/ui/components/ProgressGrid.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";

export type ProgressItemVM = {
  key: string;
  label: string;
  valueText: string; // "12人" / "45%" など表示済み文字列
  subText?: string;  // "目標まであと..." 等
  color?: string;    // アクセントカラー
};

export type ProgressGridProps = {
  progressItems: ProgressItemVM[];
  onPressItem?: (item: ProgressItemVM) => void;
};

export function ProgressGrid(props: ProgressGridProps) {
  const { progressItems, onPressItem } = props;
  const colors = useColors();

  if (!progressItems.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {progressItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          disabled={!onPressItem}
          onPress={() => onPressItem?.(item)}
          style={[
            styles.card,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]}
          activeOpacity={onPressItem ? 0.7 : 1}
        >
          <Text style={[styles.label, { color: colors.muted }]}>
            {item.label}
          </Text>
          <Text style={[
            styles.value, 
            { color: item.color ?? colors.primary }
          ]}>
            {item.valueText}
          </Text>
          {!!item.subText && (
            <Text style={[styles.subText, { color: colors.muted }]}>
              {item.subText}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
  value: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
  },
});
