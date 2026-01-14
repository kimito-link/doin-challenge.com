import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";

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
}

export function AppHeader({
  title,
  subtitle,
  showCharacters = true,
  showLogo = true,
  isDesktop = false,
  rightElement,
  showLoginStatus = true,
}: AppHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  
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
      
      {/* ログイン状態表示 */}
      {showLoginStatus && user && (
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          marginTop: 8,
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          alignSelf: "flex-start",
        }}>
          {user.profileImage && (
            <Image
              source={{ uri: user.profileImage }}
              style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6 }}
              contentFit="cover"
            />
          )}
          <Text style={{ color: "#10B981", fontSize: 12, fontWeight: "600" }}>
            {user.name || user.username || "ゲスト"}でログイン中
          </Text>
        </View>
      )}
      
      {subtitle && (
        <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
