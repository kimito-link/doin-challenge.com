import { useState, useEffect } from "react";
import { color, palette } from "@/theme/tokens";
import { View, Text, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/hooks/use-auth";
import { GlobalMenu } from "@/components/organisms/global-menu";
import { TalkingCharacter } from "@/components/molecules/talking-character";
import * as Haptics from "expo-haptics";
import { APP_VERSION } from "@/shared/version";

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
  showMenu?: boolean;
}

const triggerHaptic = () => {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export function AppHeader({
  title,
  subtitle,
  showCharacters = true,
  showLogo = true,
  isDesktop = false,
  rightElement,
  showLoginStatus = true,
  showMenu = true,
}: AppHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  
  const handleTitlePress = () => {
    triggerHaptic();
    router.push("/(tabs)");
  };

  const handleMenuPress = () => {
    triggerHaptic();
    setMenuVisible(true);
  };
  
  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: color.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable 
            onPress={handleTitlePress}
            style={({ pressed }) => [
              { flexDirection: "row", alignItems: "center", flex: 1 },
              pressed && { opacity: 0.7 },
            ]}
          >
            {showLogo && (
              <Image
                source={logoImage}
                style={{ width: isDesktop ? 56 : 48, height: isDesktop ? 56 : 48 }}
                contentFit="contain"
              />
            )}
            <View style={{ marginLeft: showLogo ? 8 : 0 }}>
              <Text style={{ 
                color: color.textWhite, 
                fontSize: isDesktop ? 16 : 13, 
                fontWeight: "bold",
              }}>
                {`${title || "君斗りんくの動員ちゃれんじ"}-${APP_VERSION}`}
              </Text>
            </View>
          </Pressable>
          
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {rightElement ? (
              rightElement
            ) : showCharacters ? (
              <View style={{ flexDirection: "row", marginRight: showMenu ? 8 : 0, alignItems: "center" }}>
                {/* タップ反応キャラクター（メイン） */}
                <TalkingCharacter
                  size={isDesktop ? 44 : 36}
                  bubblePosition="bottom"
                />
                {/* 他のキャラクター（装飾） */}
                <Image 
                  source={characterImages.kontaYukkuri} 
                  style={{ width: isDesktop ? 40 : 32, height: isDesktop ? 40 : 32, marginLeft: -8 }} 
                  contentFit="contain"
                  priority="high"
                  cachePolicy="memory-disk"
                />
                <Image 
                  source={characterImages.tanuneYukkuri} 
                  style={{ width: isDesktop ? 40 : 32, height: isDesktop ? 40 : 32, marginLeft: -8 }} 
                  contentFit="contain"
                  priority="high"
                  cachePolicy="memory-disk"
                />
              </View>
            ) : null}
            
            {/* ハンバーガーメニューボタン */}
            {showMenu && (
              <Pressable
                onPress={handleMenuPress}
                style={({ pressed }) => [
                  {
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 22,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <MaterialIcons name="menu" size={24} color={color.textWhite} />
              </Pressable>
            )}
          </View>
        </View>
        
        {/* ログイン状態表示 */}
        {showLoginStatus && user && (
          <Pressable 
            onPress={handleMenuPress}
            style={({ pressed }) => [
              { 
                flexDirection: "row", 
                alignItems: "center", 
                marginTop: 8,
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                alignSelf: "flex-start",
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            {user.profileImage && (
              <Image
                source={{ uri: user.profileImage }}
                style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6 }}
                contentFit="cover"
              />
            )}
            <Text style={{ color: color.successDark, fontSize: 12, fontWeight: "600" }}>
              {user.name || user.username || "ゲスト"}でログイン中
            </Text>
            <MaterialIcons name="expand-more" size={16} color={color.successDark} style={{ marginLeft: 4 }} />
          </Pressable>
        )}
        
        {subtitle && (
          <Text style={{ color: color.textMuted, fontSize: 14, marginTop: 4 }}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* グローバルメニュー */}
      <GlobalMenu 
        isVisible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
    </>
  );
}
