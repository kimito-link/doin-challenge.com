import { Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// 画像アセット
const APP_LOGO = require("@/assets/images/logos/kimitolink-logo.jpg");
const CHARACTER_CONFUSED = require("@/assets/images/characters/link/link-yukkuri-half-eyes-mouth-open.png");

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <ScreenContainer containerClassName="bg-background">
      <View className="flex-1 items-center justify-center p-6">
        {/* ロゴ */}
        <Image
          source={APP_LOGO}
          style={{ width: 120, height: 40, marginBottom: 24 }}
          contentFit="contain"
        />

        {/* キャラクター */}
        <Image
          source={CHARACTER_CONFUSED}
          style={{ width: 120, height: 120, marginBottom: 16 }}
          contentFit="contain"
        />

        {/* 吹き出し */}
        <View className="bg-surface rounded-2xl px-4 py-2 border border-border mb-6">
          <Text className="text-primary text-lg font-bold text-center">
            あれ？迷子かな？🤔
          </Text>
        </View>

        {/* エラーコード */}
        <Text className="text-6xl font-bold text-muted mb-2">404</Text>

        {/* メッセージ */}
        <Text className="text-xl font-bold text-foreground mb-2 text-center">
          ページが見つかりません
        </Text>
        <Text className="text-base text-muted text-center mb-8 px-4">
          お探しのページは存在しないか、{"\n"}移動した可能性があります。
        </Text>

        {/* ボタン */}
        <View className="w-full max-w-sm gap-3">
          <TouchableOpacity
            onPress={() => router.replace("/")}
            className="bg-primary rounded-xl py-4 px-6 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <MaterialIcons name="home" size={20} color="#fff" />
            <Text className="text-white text-base font-bold ml-2">
              ホームに戻る
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-surface rounded-xl py-4 px-6 flex-row items-center justify-center border border-border"
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={20} color="#687076" />
            <Text className="text-muted text-base font-bold ml-2">
              前のページに戻る
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
