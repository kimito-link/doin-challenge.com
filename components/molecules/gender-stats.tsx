/**
 * GenderStats Component
 * 性別統計を表示する再利用可能なコンポーネント
 * 
 * 使用例:
 * <GenderStats maleCount={3} femaleCount={2} unspecifiedCount={1} />
 * <GenderStats maleCount={10} femaleCount={5} unspecifiedCount={0} size="small" />
 */

import { View, Text, type ViewStyle } from "react-native";
import { GenderIndicator, type Gender } from "@/components/atoms/gender-indicator";
import { palette } from "@/theme/tokens/palette";

export interface GenderStatsProps {
  maleCount: number;
  femaleCount: number;
  unspecifiedCount: number;
  size?: "small" | "medium";
  style?: ViewStyle;
  showZeroCounts?: boolean; // 0件の性別も表示するか
}

const SIZE_CONFIG = {
  small: {
    iconSize: 12,
    textSize: 11,
    spacing: 6,
  },
  medium: {
    iconSize: 16,
    textSize: 13,
    spacing: 8,
  },
} as const;

interface StatItemProps {
  gender: Gender;
  count: number;
  iconSize: "small" | "medium";
  textSize: number;
}

function StatItem({ gender, count, iconSize, textSize }: StatItemProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
      }}
    >
      <GenderIndicator gender={gender} size={iconSize} />
      <Text
        style={{
          color: palette.gray200,
          fontSize: textSize,
          fontWeight: "500",
        }}
      >
        {count}
      </Text>
    </View>
  );
}

export function GenderStats({
  maleCount,
  femaleCount,
  unspecifiedCount,
  size = "medium",
  style,
  showZeroCounts = false,
}: GenderStatsProps) {
  const sizeConfig = SIZE_CONFIG[size];

  // 0件の性別を表示するかどうか
  const shouldShowMale = showZeroCounts || maleCount > 0;
  const shouldShowFemale = showZeroCounts || femaleCount > 0;
  const shouldShowUnspecified = showZeroCounts || unspecifiedCount > 0;

  // すべて0件の場合は何も表示しない
  if (!shouldShowMale && !shouldShowFemale && !shouldShowUnspecified) {
    return null;
  }

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: sizeConfig.spacing,
        },
        style,
      ]}
    >
      {shouldShowMale && (
        <StatItem
          gender="male"
          count={maleCount}
          iconSize={size}
          textSize={sizeConfig.textSize}
        />
      )}
      {shouldShowFemale && (
        <StatItem
          gender="female"
          count={femaleCount}
          iconSize={size}
          textSize={sizeConfig.textSize}
        />
      )}
      {shouldShowUnspecified && (
        <StatItem
          gender="unspecified"
          count={unspecifiedCount}
          iconSize={size}
          textSize={sizeConfig.textSize}
        />
      )}
    </View>
  );
}
