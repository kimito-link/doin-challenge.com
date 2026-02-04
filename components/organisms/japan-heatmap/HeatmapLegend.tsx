/**
 * HeatmapLegend - ヒートマップの凡例
 * 
 * 単一責任: 色の凡例表示のみ
 */

import { View, Text, StyleSheet } from "react-native";
import { color } from "@/theme/tokens";

export function HeatmapLegend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: color.heatmapLevel1 }]} />
        <Text style={styles.legendText}>少</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: color.heatmapLevel2 }]} />
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: color.heatmapLevel4 }]} />
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: color.heatmapLevel6 }]} />
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: color.heatmapLevel7 }]} />
        <Text style={styles.legendText}>多</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 24,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#666",
  },
  legendText: {
    color: color.textMuted,
    fontSize: 12,
    marginHorizontal: 4,
  },
});
