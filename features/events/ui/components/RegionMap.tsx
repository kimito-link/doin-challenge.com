// features/events/ui/components/RegionMap.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";

export type RegionGroupVM = {
  id: string;
  name: string;
  prefectures: string[];
  countText?: string; // "参加 12" など表示用
  count?: number;     // 参加者数（数値）
};

export type RegionMapProps = {
  regions: RegionGroupVM[];
  selectedRegionId?: string;
  onSelectRegion: (region: RegionGroupVM) => void;
  onSelectPrefecture?: (prefectureName: string) => void;
};

export function RegionMap(props: RegionMapProps) {
  const { regions, selectedRegionId, onSelectRegion } = props;
  const colors = useColors();

  if (!regions.length) {
    return null;
  }

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        地域別参加者
      </Text>

      <View style={styles.grid}>
        {regions.map((r) => {
          const isSelected = r.id === selectedRegionId;
          const hasParticipants = (r.count ?? 0) > 0;
          
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => onSelectRegion(r)}
              style={[
                styles.regionCard,
                { 
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: hasParticipants ? colors.surface : colors.background,
                }
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.regionName, 
                { color: colors.foreground }
              ]}>
                {r.name}
              </Text>
              {!!r.countText && (
                <Text style={[
                  styles.countText, 
                  { color: hasParticipants ? colors.primary : colors.muted }
                ]}>
                  {r.countText}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  regionCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  regionName: {
    fontSize: 13,
    fontWeight: "600",
  },
  countText: {
    marginTop: 4,
    fontSize: 12,
  },
});
