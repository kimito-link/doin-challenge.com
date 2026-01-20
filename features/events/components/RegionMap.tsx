/**
 * 地域別マップコンポーネント
 * 参加者の地域分布を表示
 */
import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { regionGroups, countByRegion, type RegionName } from "@/constants/prefectures";
import type { Participation } from "@/types/participation";

interface RegionMapProps {
  /** 参加者リスト */
  participations: Participation[];
}

export function RegionMap({ participations }: RegionMapProps) {
  const colors = useColors();
  
  // 地域ごとの参加者数を集計
  const regionCounts = countByRegion(participations);
  const maxCount = Math.max(...Object.values(regionCounts), 1);

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        地域別参加者
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {regionGroups.map((region) => {
          const count = regionCounts[region.name as RegionName] || 0;
          const intensity = count / maxCount;

          return (
            <View
              key={region.name}
              style={{
                width: "48%",
                backgroundColor: "#1A1D21",
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: count > 0 ? `rgba(236, 72, 153, ${0.3 + intensity * 0.7})` : "#2D3139",
              }}
            >
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{region.name}</Text>
              <Text style={{ color: count > 0 ? "#EC4899" : "#6B7280", fontSize: 20, fontWeight: "bold" }}>
                {count}人
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
