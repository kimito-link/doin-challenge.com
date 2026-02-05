/**
 * StatsEmptyState Component
 * 統計データが存在しない場合の状態を表示
 */

import { View, Text } from "react-native";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { color } from "@/theme/tokens";

export function StatsEmptyState() {
  return (
    <ScreenContainer className="p-6">
      <Text style={{ fontSize: 24, fontWeight: "bold", color: color.textWhite }}>
        統計ダッシュボード
      </Text>
      <Text style={{ color: color.textMuted, marginTop: 16 }}>
        統計データを読み込めませんでした。
      </Text>
    </ScreenContainer>
  );
}
