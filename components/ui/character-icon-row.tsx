/**
 * CharacterIconRow Component
 * 複数キャラクターアイコンの横並び表示
 * 汎用UIコンポーネント - 様々な画面で再利用可能
 */

import { View, ImageSourcePropType } from "react-native";
import { Image } from "expo-image";

export interface CharacterIconConfig {
  /** 画像ソース */
  image: ImageSourcePropType;
  /** アイコンサイズ（幅・高さ） */
  size: number;
  /** ボーダー幅 */
  borderWidth: number;
  /** ボーダー色 */
  borderColor: string;
}

export interface CharacterIconRowProps {
  /** アイコン設定の配列 */
  icons: CharacterIconConfig[];
  /** アイコン間のギャップ */
  gap?: number;
  /** 下部マージン */
  marginBottom?: number;
  /** 上部マージン */
  marginTop?: number;
  /** 中央揃えにするか */
  centered?: boolean;
}

/**
 * 複数のキャラクターアイコンを横並びで表示するコンポーネント
 * 
 * @example
 * ```tsx
 * <CharacterIconRow
 *   icons={[
 *     { image: require("@/assets/images/char1.png"), size: 56, borderWidth: 2, borderColor: "#FF69B4" },
 *     { image: require("@/assets/images/char2.png"), size: 64, borderWidth: 3, borderColor: "#FFA500" },
 *   ]}
 *   gap={12}
 *   marginBottom={24}
 * />
 * ```
 */
export function CharacterIconRow({ 
  icons, 
  gap = 12, 
  marginBottom = 0,
  marginTop = 0,
  centered = true,
}: CharacterIconRowProps) {
  return (
    <View style={{ 
      flexDirection: "row", 
      justifyContent: centered ? "center" : "flex-start", 
      gap,
      marginBottom,
      marginTop,
    }}>
      {icons.map((icon, index) => {
        const innerSize = icon.size - (icon.borderWidth * 2);
        return (
          <View key={index} style={{ alignItems: "center" }}>
            <View style={{ 
              width: icon.size, 
              height: icon.size, 
              borderRadius: icon.size / 2, 
              borderWidth: icon.borderWidth, 
              borderColor: icon.borderColor,
              overflow: "hidden",
            }}>
              <Image 
                source={icon.image} 
                style={{ width: innerSize, height: innerSize }} 
                contentFit="cover"
                priority="high"
                cachePolicy="memory-disk"
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
