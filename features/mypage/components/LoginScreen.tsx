/**
 * ログイン画面コンポーネント
 * 未ログイン状態のマイページUI
 */
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
  linkFull: require("@/assets/images/characters/KimitoLink.png"),
  linkIdol: require("@/assets/images/characters/idolKimitoLink.png"),
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png"),
  kontaYukkuri: require("@/assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png"),
  tanuneYukkuri: require("@/assets/images/characters/tanunee/tanuki-yukkuri-smile-mouth-open.png"),
};

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-maru-orange.jpg");

// ログイン画面のパターンデータ
export const loginPatterns = [
  {
    id: 1,
    character: "linkIdol",
    title: "みんな、ちょっと聞いて！😊✨",
    message: "あなたの「推し」が、大きなステージに立つ瞬間を\n一緒に作りたいんだ。",
    highlight: "その景色を、一緒に作ろう！",
    gradientColors: ["#EC4899", "#8B5CF6"] as const,
    accentColor: "#EC4899",
  },
  {
    id: 2,
    character: "linkFull",
    title: "声を届けよう！🎙️✨",
    message: "あなたの応援の声が、\n誰かの心を動かす。",
    highlight: "一緒に推しの夢を叶えよう！",
    gradientColors: ["#8B5CF6", "#3B82F6"] as const,
    accentColor: "#8B5CF6",
  },
  {
    id: 3,
    character: "linkYukkuri",
    title: "ようこそ！🎉",
    message: "動員ちゃれんじへようこそ！\nみんなの想いを集めて、推しの夢を叶えよう。",
    highlight: "さあ、始めよう！",
    gradientColors: ["#F59E0B", "#EF4444"] as const,
    accentColor: "#F59E0B",
  },
  {
    id: 4,
    character: "kontaYukkuri",
    title: "コンタだよ！🦊",
    message: "友達を誘って、みんなで盛り上げよう！\n一人の参加が、大きな波になるんだ。",
    highlight: "一緒に盛り上げよう！",
    gradientColors: ["#DD6500", "#F59E0B"] as const,
    accentColor: "#DD6500",
  },
  {
    id: 5,
    character: "tanuneYukkuri",
    title: "たぬねだよ！🦝",
    message: "チャレンジを作って、\nみんなで目標達成を目指そう！",
    highlight: "目標達成でお祝い！🎉",
    gradientColors: ["#10B981", "#3B82F6"] as const,
    accentColor: "#10B981",
  },
  {
    id: 6,
    character: "linkIdol",
    title: "ステージへの道！🎭✨",
    message: "客席を埋め尽くすファンの声援、\nリアルタイムで流れる応援コメント…",
    highlight: "その感動を、一緒に！",
    gradientColors: ["#EC4899", "#F43F5E"] as const,
    accentColor: "#F43F5E",
  },
];

// ランダムにパターンを選択する関数
export const getRandomPattern = () => {
  return loginPatterns[Math.floor(Math.random() * loginPatterns.length)];
};

interface LoginScreenProps {
  isLoggingIn: boolean;
  loginPattern: typeof loginPatterns[0];
  onLogin: () => void;
  onPatternChange: (pattern: typeof loginPatterns[0]) => void;
}

export function LoginScreen({
  isLoggingIn,
  loginPattern,
  onLogin,
  onPatternChange,
}: LoginScreenProps) {
  const colors = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* グラデーション背景 */}
      <LinearGradient
        colors={["#1a237e", "#0D1117"]}
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
      
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          alignItems: "center", 
          padding: 24,
          paddingBottom: 48,
        }}
      >
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
          color: "#D1D5DB", 
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
              borderColor: "#EC4899",
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
              borderColor: "#F59E0B",
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
              borderColor: "#10B981",
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

        {/* メインメッセージ */}
        <LinearGradient
          colors={[...loginPattern.gradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            maxWidth: 400,
            width: "100%",
          }}
        >
          <Text style={{ 
            color: "#fff", 
            fontSize: 20, 
            fontWeight: "bold",
            marginBottom: 12,
            textAlign: "center",
          }}>
            {loginPattern.title}
          </Text>
          <Text style={{ 
            color: "rgba(255,255,255,0.9)", 
            fontSize: 14,
            lineHeight: 22,
            textAlign: "center",
            marginBottom: 16,
          }}>
            {loginPattern.message}
          </Text>
          <View style={{ 
            backgroundColor: "rgba(255,255,255,0.2)", 
            borderRadius: 8, 
            padding: 12,
          }}>
            <Text style={{ 
              color: "#fff", 
              fontSize: 16, 
              fontWeight: "bold",
              textAlign: "center",
            }}>
              {loginPattern.highlight}
            </Text>
          </View>
        </LinearGradient>

        {/* ログインボタン */}
        <TouchableOpacity
          onPress={onLogin}
          disabled={isLoggingIn}
          style={{
            backgroundColor: "#1DA1F2",
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: isLoggingIn ? 0.7 : 1,
            maxWidth: 400,
            width: "100%",
          }}
        >
          <MaterialIcons name="login" size={22} color={colors.foreground} />
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold", marginLeft: 10 }}>
            {isLoggingIn ? "認証中..." : "Xアカウントで認証しています"}
          </Text>
        </TouchableOpacity>

        {/* キャラクターの吹き出しメッセージ */}
        <View style={{ 
          flexDirection: "row", 
          alignItems: "flex-start", 
          marginTop: 24,
          maxWidth: 400,
          width: "100%",
        }}>
          <Image 
            source={characterImages[loginPattern.character as keyof typeof characterImages]} 
            style={{ 
              width: 60, 
              height: 60,
              marginRight: 12,
            }} 
            contentFit="contain" 
          />
          <View style={{ 
            flex: 1, 
            backgroundColor: "rgba(236, 72, 153, 0.1)",
            borderRadius: 12,
            borderTopLeftRadius: 4,
            padding: 12,
            borderWidth: 1,
            borderColor: "rgba(236, 72, 153, 0.3)",
          }}>
            <Text style={{ 
              color: "#E5E7EB", 
              fontSize: 13, 
              lineHeight: 20,
            }}>
              {loginPattern.message}
            </Text>
          </View>
        </View>

        {/* パターン切り替えボタン */}
        <TouchableOpacity
          onPress={() => onPatternChange(getRandomPattern())}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderRadius: 8,
            backgroundColor: "rgba(255,255,255,0.05)",
            marginTop: 16,
          }}
        >
          <MaterialIcons name="refresh" size={18} color="#D1D5DB" />
          <Text style={{ color: "#D1D5DB", fontSize: 13, marginLeft: 6 }}>
            他のキャラクターのメッセージを見る
          </Text>
        </TouchableOpacity>

        {/* パターンインジケーター */}
        <View style={{ flexDirection: "row", marginTop: 12, gap: 8 }}>
          {loginPatterns.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => onPatternChange(p)}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: p.id === loginPattern.id ? "#EC4899" : "#3D4148",
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
