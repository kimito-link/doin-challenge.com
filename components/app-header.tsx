import { View, Text } from "react-native";
import { Image } from "expo-image";

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-color.jpg");

// キャラクター画像
const characterImages = {
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
  kontaYukkuri: require("@/assets/images/characters/konta/kitsune-yukkuri-normal.png"),
  tanuneYukkuri: require("@/assets/images/characters/tanunee/tanuki-yukkuri-normal-mouth-open.png"),
};

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showCharacters?: boolean;
  showLogo?: boolean;
  isDesktop?: boolean;
  rightElement?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  showCharacters = true,
  showLogo = true,
  isDesktop = false,
  rightElement,
}: AppHeaderProps) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: "#0D1117" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {showLogo && (
            <Image
              source={logoImage}
              style={{ width: isDesktop ? 100 : 80, height: isDesktop ? 36 : 28 }}
              contentFit="contain"
            />
          )}
          {title && (
            <Text style={{ 
              color: "#fff", 
              fontSize: isDesktop ? 18 : 14, 
              fontWeight: "bold", 
              marginLeft: showLogo ? 8 : 0 
            }}>
              {title}
            </Text>
          )}
        </View>
        
        {rightElement ? (
          rightElement
        ) : showCharacters ? (
          <View style={{ flexDirection: "row" }}>
            <Image 
              source={characterImages.linkYukkuri} 
              style={{ width: isDesktop ? 48 : 36, height: isDesktop ? 48 : 36, marginLeft: -4 }} 
              contentFit="contain" 
            />
            <Image 
              source={characterImages.kontaYukkuri} 
              style={{ width: isDesktop ? 48 : 36, height: isDesktop ? 48 : 36, marginLeft: -4 }} 
              contentFit="contain" 
            />
            <Image 
              source={characterImages.tanuneYukkuri} 
              style={{ width: isDesktop ? 48 : 36, height: isDesktop ? 48 : 36, marginLeft: -4 }} 
              contentFit="contain" 
            />
          </View>
        ) : null}
      </View>
      
      {subtitle && (
        <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
