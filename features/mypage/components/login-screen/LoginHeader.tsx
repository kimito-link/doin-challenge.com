/**
 * LoginHeader Component
 * ロゴ、キャッチコピー、3キャラクターアイコン
 */

import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import { mypageText, mypageAccent } from "../../ui/theme/tokens";
import { characterImages, logoImage } from "./constants";

export function LoginHeader() {
  const colors = useColors();

  return (
    <>
      {/* ロゴとキャッチコピー */}
      <Image 
        source={logoImage} 
        style={{ 
          width: 80, 
          height: 80,
          borderRadius: 40,
          marginBottom: 16,
        }} 
        contentFit="contain" 
      />
      <Text style={{ 
        color: colors.foreground, 
        fontSize: 20, 
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
      }}>
        動員ちゃれんじ
      </Text>
      <Text style={{ 
        color: mypageText.muted, 
        fontSize: 14,
        marginBottom: 24,
        textAlign: "center",
      }}>
        推しと繋がる、みんなで応援する
      </Text>

      {/* 3つのキャラクターアイコン */}
      <View style={{ 
        flexDirection: "row", 
        justifyContent: "center", 
        gap: 12,
        marginBottom: 32,
      }}>
        <View style={{ alignItems: "center" }}>
          <View style={{ 
            width: 56, 
            height: 56, 
            borderRadius: 28, 
            borderWidth: 2, 
            borderColor: mypageAccent.linkPink,
            overflow: "hidden",
          }}>
            <Image 
              source={characterImages.linkYukkuri} 
              style={{ width: 52, height: 52 }} 
              contentFit="cover"
              priority="high"
              cachePolicy="memory-disk"
            />
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <View style={{ 
            width: 64, 
            height: 64, 
            borderRadius: 32, 
            borderWidth: 3, 
            borderColor: mypageAccent.kontaOrange,
            overflow: "hidden",
          }}>
            <Image 
              source={characterImages.kontaYukkuri} 
              style={{ width: 58, height: 58 }} 
              contentFit="cover"
              priority="high"
              cachePolicy="memory-disk"
            />
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <View style={{ 
            width: 56, 
            height: 56, 
            borderRadius: 28, 
            borderWidth: 2, 
            borderColor: mypageAccent.tanuneGreen,
            overflow: "hidden",
          }}>
            <Image 
              source={characterImages.tanuneYukkuri} 
              style={{ width: 52, height: 52 }} 
              contentFit="cover"
              priority="high"
              cachePolicy="memory-disk"
            />
          </View>
        </View>
      </View>
    </>
  );
}
