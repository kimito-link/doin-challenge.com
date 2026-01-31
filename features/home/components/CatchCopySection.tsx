/**
 * キャッチコピーセクションコンポーネント
 * ホーム画面に表示されるアプリの紹介メッセージ
 */
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";
import { homeUI, homeText, homeGradient } from "@/features/home/ui/theme/tokens";

// キャラクター画像
const characterImages = {
  linkIdol: require("@/assets/images/characters/idolKimitoLink.png"),
};

export function CatchCopySection() {
  const colors = useColors();
  return (
    <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
      <LinearGradient
        colors={homeGradient.surfaceGradient}
        style={{
          borderRadius: 16,
          padding: 24,
          borderWidth: 1,
          borderColor: homeUI.border,
        }}
      >
        {/* キャラクターと吹き出し */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 20 }}>
          <Image 
            source={characterImages.linkIdol} 
            style={{ width: 80, height: 110, marginRight: 16 }} 
            contentFit="contain" 
          />
          <View style={{ 
            flex: 1, 
            backgroundColor: "rgba(236, 72, 153, 0.1)",
            borderRadius: 16,
            borderTopLeftRadius: 4,
            padding: 12,
            borderWidth: 1,
            borderColor: "rgba(236, 72, 153, 0.3)",
          }}>
            <Text style={{ 
              color: colors.foreground, 
              fontSize: 15, 
              fontWeight: "bold",
              marginBottom: 4,
            }}>
              みんな、ちょっと聞いて！😊✨
            </Text>
            <Text style={{ 
              color: homeText.primary, 
              fontSize: 13, 
              lineHeight: 20,
            }}>
              あなたの「推し」が、大きなステージに立つ瞬間を想像してみて。
            </Text>
          </View>
        </View>

        {/* メインメッセージ */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            color: homeText.muted, 
            fontSize: 14, 
            lineHeight: 24,
            marginBottom: 16,
          }}>
            客席を埋め尽くすファンの声援、{"\n"}
            リアルタイムで流れる応援コメント、{"\n"}
            ステージを照らすスポットライト…
          </Text>
          
          <Text style={{ 
            color: homeText.brand, 
            fontSize: 18, 
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 16,
          }}>
            その景色を、一緒に作りたいんだ。
          </Text>

          <Text style={{ 
            color: homeText.muted, 
            fontSize: 14, 
            lineHeight: 24,
          }}>
            「動員ちゃれんじ」は、みんなの想いを集めて、{"\n"}
            推しの夢を叶えるためのプラットフォーム。
          </Text>
        </View>

        {/* ハイライトメッセージ */}
        <View style={{
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderLeftWidth: 3,
          borderLeftColor: homeUI.iconBgPurple,
        }}>
          <Text style={{ 
            color: homeText.primary, 
            fontSize: 14, 
            lineHeight: 22,
          }}>
            一人の参加表明が、二人、三人と広がって、{"\n"}
            気づいたら会場が満員になってる。
          </Text>
        </View>

        {/* キーメッセージ */}
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ 
            color: colors.foreground, 
            fontSize: 16, 
            fontWeight: "bold",
            textAlign: "center",
            lineHeight: 26,
          }}>
            あなたの声援が、{"\n"}
            誰かの心を動かす。
          </Text>
        </View>

        {/* CTA */}
        <View style={{
          backgroundColor: "rgba(236, 72, 153, 0.15)",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}>
          <Text style={{ 
            color: homeText.brand, 
            fontSize: 15, 
            fontWeight: "bold",
            marginBottom: 4,
          }}>
            さあ、一緒に推しの未来を作ろう！🙌
          </Text>
          <Text style={{ 
            color: homeText.muted, 
            fontSize: 12,
          }}>
            下のチャレンジから参加表明してみてね
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
