/**
 * StatsLoadingState Component
 * 統計画面のローディング状態を表示
 */

import { View, Text, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { color } from "@/theme/tokens";

export function StatsLoadingState() {
  return (
    <ScreenContainer className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color={color.hostAccentLegacy} />
      <Text style={{ color: color.textMuted, marginTop: 16 }}>
        統計データを読み込み中...
      </Text>
    </ScreenContainer>
  );
}
