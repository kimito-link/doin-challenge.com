/**
 * 追体験バナーコンポーネント
 * 主催者・ファンの体験を開始するためのバナー
 */
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import { homeUI, homeText, homeFont } from "@/features/home/ui/theme/tokens";
import { useResponsive } from "@/hooks/use-responsive";
import { useExperience } from "@/lib/experience-context";
import { Button } from "@/components/ui/button";

export function ExperienceBanner() {
  const colors = useColors();
  const { isDesktop } = useResponsive();
  const { startExperience } = useExperience();

  return (
    <View style={{ marginHorizontal: isDesktop ? 24 : 16, marginTop: 16, marginBottom: 8 }}>
      <View style={{
        backgroundColor: homeUI.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: homeUI.border,
      }}>
        <Text style={{ 
          color: colors.foreground, 
          fontSize: homeFont.title, 
          fontWeight: "bold",
          marginBottom: 12,
          textAlign: "center",
        }}>
          追体験してみよう
        </Text>
        <Text style={{ 
          color: homeText.muted, 
          fontSize: homeFont.meta,
          lineHeight: 20,
          textAlign: "center",
          marginBottom: 16,
        }}>
          動員ちゃれんじの使い方を、{"\n"}
          主催者・ファンそれぞれの視点で体験できるよ！
        </Text>
        
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* りんくといっしょに主催者体験（りんく主役・左） */}
          <Button
            variant="ghost"
            onPress={() => startExperience("organizer")}
            style={{
              flex: 1,
              backgroundColor: homeText.brand,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              overflow: "hidden",
              flexDirection: "column",
              height: "auto",
            }}
          >
            <Image
              source={require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png")}
              style={{ width: 48, height: 48, marginBottom: 8 }}
              contentFit="contain"
            />
            <Text style={{ 
              color: "#fff", 
fontSize: homeFont.body,
              fontWeight: "bold",
              marginBottom: 4,
            }}>
              りんくと主催者体験
            </Text>
            <Text style={{ 
              color: "rgba(255,255,255,0.8)", 
              fontSize: homeFont.meta,
              textAlign: "center",
            }}>
              チャレンジを{"\n"}作る側の体験
            </Text>
          </Button>
          
          {/* りんくといっしょにファン体験（こん太・たぬ姉は仲間） */}
          <Button
            variant="ghost"
            onPress={() => startExperience("fan")}
            style={{
              flex: 1,
              backgroundColor: homeUI.iconBgPurple,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              overflow: "hidden",
              flexDirection: "column",
              height: "auto",
            }}
          >
            <Image
              source={require("@/assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png")}
              style={{ width: 48, height: 48, marginBottom: 8 }}
              contentFit="contain"
            />
            <Text style={{ 
              color: "#fff", 
fontSize: homeFont.body,
              fontWeight: "bold",
              marginBottom: 4,
            }}>
              りんくとファン体験
            </Text>
            <Text style={{ 
              color: "rgba(255,255,255,0.8)", 
              fontSize: homeFont.meta,
              textAlign: "center",
            }}>
              参加表明する{"\n"}側の体験
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
