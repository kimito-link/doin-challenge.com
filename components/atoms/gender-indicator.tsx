/**
 * GenderIndicator Component
 * 性別を表すアイコンと色を表示する再利用可能なコンポーネント
 * 
 * 使用例:
 * <GenderIndicator gender="male" size="medium" />
 * <GenderIndicator gender="female" size="small" showLabel />
 */

import { View, Text, type ViewStyle } from "react-native";
import { palette } from "@/theme/tokens/palette";

export type Gender = "male" | "female" | "unspecified";

export interface GenderIndicatorProps {
  gender: Gender;
  size?: "small" | "medium" | "large";
  showLabel?: boolean; // "男性" / "女性" のラベルを表示するか
  style?: ViewStyle;
}

const GENDER_CONFIG = {
  male: {
    color: palette.genderMale, // 青
    icon: "♂",
    label: "男性",
  },
  female: {
    color: palette.genderFemale, // ピンク
    icon: "♀",
    label: "女性",
  },
  unspecified: {
    color: palette.genderNeutral, // ニュートラル
    icon: "?",
    label: "未設定",
  },
} as const;

const SIZE_CONFIG = {
  small: {
    iconSize: 12,
    labelSize: 10,
    spacing: 2,
  },
  medium: {
    iconSize: 16,
    labelSize: 12,
    spacing: 4,
  },
  large: {
    iconSize: 20,
    labelSize: 14,
    spacing: 6,
  },
} as const;

export function GenderIndicator({
  gender,
  size = "medium",
  showLabel = false,
  style,
}: GenderIndicatorProps) {
  const config = GENDER_CONFIG[gender];
  const sizeConfig = SIZE_CONFIG[size];

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
      {/* アイコン */}
      <Text
        style={{
          color: config.color,
          fontSize: sizeConfig.iconSize,
          fontWeight: "bold",
        }}
      >
        {config.icon}
      </Text>

      {/* ラベル（オプション） */}
      {showLabel && (
        <Text
          style={{
            color: config.color,
            fontSize: sizeConfig.labelSize,
          }}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
}
