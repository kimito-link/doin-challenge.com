import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { HamburgerMenu } from "./hamburger-menu";

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
  showLoginStatus?: boolean;
  showHamburgerMenu?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  showCharacters = false,
  showLogo = true,
  isDesktop = false,
  rightElement,
  showLoginStatus = false,
  showHamburgerMenu = true,
}: AppHeaderProps) {
  const router = useRouter();
  
  const handleTitlePress = () => {
    router.push("/(tabs)");
  };
  
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: "#0D1117" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity 
          onPress={handleTitlePress}
          style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
          activeOpacity={0.7}
        >
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
        </TouchableOpacity>
        
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {showCharacters && (
            <View style={{ flexDirection: "row", marginRight: 8 }}>
              <Image 
                source={characterImages.linkYukkuri} 
                style={{ width: isDesktop ? 40 : 28, height: isDesktop ? 40 : 28, marginLeft: -4 }} 
                contentFit="contain" 
              />
              <Image 
                source={characterImages.kontaYukkuri} 
                style={{ width: isDesktop ? 40 : 28, height: isDesktop ? 40 : 28, marginLeft: -4 }} 
                contentFit="contain" 
              />
              <Image 
                source={characterImages.tanuneYukkuri} 
                style={{ width: isDesktop ? 40 : 28, height: isDesktop ? 40 : 28, marginLeft: -4 }} 
                contentFit="contain" 
              />
            </View>
          )}
          
          {rightElement}
          
          {showHamburgerMenu && (
            <HamburgerMenu isDesktop={isDesktop} />
          )}
        </View>
      </View>
      
      {subtitle && (
        <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
