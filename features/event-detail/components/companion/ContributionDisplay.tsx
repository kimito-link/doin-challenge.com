/**
 * ContributionDisplay Component
 * 貢献人数表示
 */

import { View, Text } from "react-native";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";

interface ContributionDisplayProps {
  companionCount: number;
}

export function ContributionDisplay({ companionCount }: ContributionDisplayProps) {
  const colors = useColors();
  const totalCount = 1 + companionCount;
  
  return (
    <>
      {/* メイン表示 */}
      <View style={{
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Text style={{ color: color.textSecondary, fontSize: 14 }}>
          貢献人数
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={{ color: color.accentPrimary, fontSize: 24, fontWeight: "bold" }}>
            {totalCount}
          </Text>
          <Text style={{ color: color.textSecondary, fontSize: 14, marginLeft: 4 }}>
            人
          </Text>
        </View>
      </View>

      {/* 説明テキスト */}
      <Text style={{ color: color.textHint, fontSize: 11, marginTop: 8 }}>
        ※ 自分 + 友人{companionCount}人 = {totalCount}人の貢献になります
      </Text>
    </>
  );
}
