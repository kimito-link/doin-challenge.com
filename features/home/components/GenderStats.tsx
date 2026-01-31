/**
 * v6.176: 性別統計コンポーネント
 * チャレンジカードに表示する性別統計
 */
import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { homeText } from "@/features/home/ui/theme/tokens";

interface GenderStatsProps {
  maleCount?: number;
  femaleCount?: number;
  unspecifiedCount?: number;
  totalParticipants?: number;
}

export function GenderStats({ maleCount = 0, femaleCount = 0, unspecifiedCount = 0, totalParticipants = 0 }: GenderStatsProps) {
  // 参加者がいない場合は表示しない
  if (totalParticipants === 0) {
    return null;
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 }}>
      {/* 男性 */}
      {maleCount > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MaterialIcons name="male" size={14} color="#3B82F6" />
          <Text style={{ color: homeText.muted, fontSize: 11 }}>{maleCount}</Text>
        </View>
      )}
      
      {/* 女性 */}
      {femaleCount > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MaterialIcons name="female" size={14} color="#EC4899" />
          <Text style={{ color: homeText.muted, fontSize: 11 }}>{femaleCount}</Text>
        </View>
      )}
      
      {/* 不明 */}
      {unspecifiedCount > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MaterialIcons name="help-outline" size={14} color="#9CA3AF" />
          <Text style={{ color: homeText.muted, fontSize: 11 }}>{unspecifiedCount}</Text>
        </View>
      )}
    </View>
  );
}
