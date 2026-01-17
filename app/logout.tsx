import { Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { getApiBaseUrl } from "@/constants/oauth";

// キャラクター画像
const characterImages = {
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png"),
  kontaYukkuri: require("@/assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png"),
  tanuneYukkuri: require("@/assets/images/characters/tanunee/tanuki-yukkuri-smile-mouth-open.png"),
};

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-maru-orange.jpg");

// ログアウトメッセージパターン
const logoutMessages = [
  { character: "linkYukkuri", message: "またねー♪", subMessage: "また遊びに来てね！" },
  { character: "kontaYukkuri", message: "バイバイ！🦊", subMessage: "次も一緒に盛り上げよう！" },
  { character: "tanuneYukkuri", message: "お疲れさま！🦝", subMessage: "また会えるの楽しみにしてるよ！" },
];

export default function LogoutScreen() {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutComplete, setLogoutComplete] = useState(false);
  const [messagePattern] = useState(() => 
    logoutMessages[Math.floor(Math.random() * logoutMessages.length)]
  );

  // ログアウト処理
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setLogoutComplete(true);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 自動的にログアウト処理を開始
  useEffect(() => {
    if (isAuthenticated && !logoutComplete && !isLoggingOut) {
      handleLogout();
    }
  }, [isAuthenticated]);

  const handleSameAccountLogin = () => {
    const apiBaseUrl = getApiBaseUrl();
    window.location.href = `${apiBaseUrl}/api/twitter/auth`;
  };

  const handleDifferentAccountLogin = () => {
    const apiBaseUrl = getApiBaseUrl();
    window.location.href = `${apiBaseUrl}/api/twitter/auth?switch=true`;
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* グラデーション背景 */}
      <LinearGradient
        colors={["#1E40AF", "#0D1117"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <View style={{ 
        flex: 1, 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 24,
      }}>
        {/* ロゴ */}
        <Image 
          source={logoImage} 
          style={{ 
            width: 60, 
            height: 60,
            borderRadius: 30,
            marginBottom: 24,
          }} 
          contentFit="contain" 
        />

        {/* キャラクターとチェックマーク */}
        <View style={{ 
          alignItems: "center", 
          marginBottom: 24,
        }}>
          <Image 
            source={characterImages[messagePattern.character as keyof typeof characterImages]} 
            style={{ 
              width: 80, 
              height: 80,
              marginBottom: 8,
            }} 
            contentFit="contain" 
          />
          
          {/* 吹き出し */}
          <View style={{
            backgroundColor: "rgba(236, 72, 153, 0.2)",
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: "rgba(236, 72, 153, 0.4)",
            marginBottom: 16,
          }}>
            <Text style={{ 
              color: "#EC4899", 
              fontSize: 18, 
              fontWeight: "bold",
              textAlign: "center",
            }}>
              {messagePattern.message}
            </Text>
          </View>

          {/* チェックマーク */}
          {logoutComplete && (
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#10B981",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: 3,
              borderColor: "#34D399",
            }}>
              <MaterialIcons name="check" size={40} color="#fff" />
            </View>
          )}
        </View>

        {/* メインメッセージ */}
        <Text style={{ 
          color: "#fff", 
          fontSize: 24, 
          fontWeight: "bold",
          marginBottom: 8,
          textAlign: "center",
        }}>
          {isLoggingOut ? "ログアウト中..." : "ログアウトしました"}
        </Text>

        <Text style={{ 
          color: "#9CA3AF", 
          fontSize: 14,
          marginBottom: 24,
          textAlign: "center",
        }}>
          {isLoggingOut 
            ? "少々お待ちください..." 
            : `動員ちゃれんじからログアウトしました`
          }
        </Text>

        {/* ログアウトについての説明 */}
        {logoutComplete && (
          <View style={{
            backgroundColor: "#1E3A5F",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            maxWidth: 400,
            width: "100%",
            borderWidth: 1,
            borderColor: "#2563EB",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MaterialIcons name="info" size={18} color="#60A5FA" />
              <Text style={{ color: "#60A5FA", fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                ログアウトについて
              </Text>
            </View>
            <Text style={{ color: "#E5E7EB", fontSize: 13, lineHeight: 20 }}>
              アカウント情報は安全に保護されました。{"\n"}
              別のアカウントでログインする場合は、下の「ログイン」ボタンをクリックしてください。{"\n"}
              同じアカウントで再度ログインすることもできます。
            </Text>
          </View>
        )}

        {/* ボタン */}
        {logoutComplete && (
          <View style={{ width: "100%", maxWidth: 400, gap: 12 }}>
            {/* ホームページに戻る */}
            <TouchableOpacity
              onPress={() => router.replace("/")}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="home" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                ホームページに戻る
              </Text>
            </TouchableOpacity>

            {/* 同じアカウントで再ログイン */}
            <TouchableOpacity
              onPress={handleSameAccountLogin}
              style={{
                backgroundColor: "#10B981",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                同じアカウントで再ログイン
              </Text>
            </TouchableOpacity>

            {/* 別のアカウントでログイン */}
            <TouchableOpacity
              onPress={handleDifferentAccountLogin}
              style={{
                backgroundColor: "transparent",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#3B82F6",
              }}
            >
              <MaterialIcons name="swap-horiz" size={20} color="#3B82F6" />
              <Text style={{ color: "#3B82F6", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                別のアカウントでログイン
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* サブメッセージ */}
        {logoutComplete && (
          <Text style={{ 
            color: "#6B7280", 
            fontSize: 13,
            marginTop: 24,
            textAlign: "center",
          }}>
            {messagePattern.subMessage}
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
}
