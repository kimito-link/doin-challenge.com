/**
 * CharacterIconRow Component
 * 3キャラクターアイコンの横並び表示
 * 他の画面でも再利用可能な汎用コンポーネント
 */

import { View } from "react-native";
import { Image } from "expo-image";
import { mypageAccent } from "../../ui/theme/tokens";
import { characterImages } from "./constants";

interface CharacterIconConfig {
  image: keyof typeof characterImages;
  size: number;
  borderWidth: number;
  borderColor: string;
}

interface CharacterIconRowProps {
  /** カスタムアイコン設定（省略時はデフォルト3キャラクター） */
  icons?: CharacterIconConfig[];
  /** アイコン間のギャップ */
  gap?: number;
  /** 下部マージン */
  marginBottom?: number;
}

// デフォルトの3キャラクター設定
const defaultIcons: CharacterIconConfig[] = [
  {
    image: "linkYukkuri",
    size: 56,
    borderWidth: 2,
    borderColor: mypageAccent.linkPink,
  },
  {
    image: "kontaYukkuri",
    size: 64,
    borderWidth: 3,
    borderColor: mypageAccent.kontaOrange,
  },
  {
    image: "tanuneYukkuri",
    size: 56,
    borderWidth: 2,
    borderColor: mypageAccent.tanuneGreen,
  },
];

export function CharacterIconRow({ 
  icons = defaultIcons, 
  gap = 12, 
  marginBottom = 32 
}: CharacterIconRowProps) {
  return (
    <View style={{ 
      flexDirection: "row", 
      justifyContent: "center", 
      gap,
      marginBottom,
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
                source={characterImages[icon.image]} 
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
