import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTutorial } from "@/lib/tutorial-context";
import Animated, { FadeInDown } from "react-native-reanimated";

// キャラクター画像
const characterImage = require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png");

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "チャレンジって何？",
    answer: "推しのイベントやライブの参加者を集めるための機能です。主催者が作成し、ファンが参加表明できます。",
  },
  {
    question: "参加表明すると何が起きる？",
    answer: "主催者に参加者数が伝わり、会場選びの参考になります。また、参加履歴が記録されて常連バッジがもらえることも！",
  },
  {
    question: "ログインしないと使えない？",
    answer: "チャレンジの閲覧は誰でもできます。参加表明や作成にはログインが必要です。",
  },
  {
    question: "常連バッジはどうやってもらえる？",
    answer: "同じ主催者のチャレンジに複数回参加すると、参加回数に応じてバッジがつきます。",
  },
  {
    question: "地域マップは何のため？",
    answer: "主催者がファンの居住地を把握して、遠征ライブの開催地を決める参考にできます。",
  },
  {
    question: "Twitterアカウントは何に使われる？",
    answer: "急なキャンセルが出た時に、主催者が代わりの参加者を募集する連絡手段として使えます。",
  },
];

/**
 * ヘルプ画面
 * 使い方ガイドとよくある質問
 */
export default function HelpScreen() {
  const router = useRouter();
  const colors = useColors();
  const { resetTutorial } = useTutorial();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleBack = useCallback(() => {
    handleHaptic();
    router.back();
  }, [router, handleHaptic]);

  const handleReplayTutorial = useCallback(async () => {
    handleHaptic();
    await resetTutorial();
    router.back();
  }, [handleHaptic, resetTutorial, router]);

  const toggleFAQ = useCallback((index: number) => {
    handleHaptic();
    setExpandedIndex(expandedIndex === index ? null : index);
  }, [expandedIndex, handleHaptic]);

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ヘルプ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* キャラクターとメッセージ */}
        <Animated.View 
          entering={FadeInDown.duration(400)}
          style={styles.heroSection}
        >
          <Image
            source={characterImage}
            style={styles.character}
            contentFit="contain"
          />
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            困ったことがあったら{"\n"}ここを見てね！
          </Text>
        </Animated.View>

        {/* チュートリアルを見返すボタン */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <TouchableOpacity
            onPress={handleReplayTutorial}
            style={styles.tutorialButton}
            activeOpacity={0.8}
          >
            <View style={styles.tutorialButtonIcon}>
              <MaterialIcons name="replay" size={28} color="#EC4899" />
            </View>
            <View style={styles.tutorialButtonContent}>
              <Text style={styles.tutorialButtonTitle}>チュートリアルを見返す</Text>
              <Text style={styles.tutorialButtonDescription}>
                はじめの説明をもう一度見る
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </Animated.View>

        {/* よくある質問 */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>よくある質問</Text>
          
          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleFAQ(index)}
              style={styles.faqItem}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqQuestionIcon}>
                  <Text style={styles.faqQuestionIconText}>Q</Text>
                </View>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <MaterialIcons 
                  name={expandedIndex === index ? "expand-less" : "expand-more"} 
                  size={24} 
                  color="#9CA3AF" 
                />
              </View>
              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <View style={styles.faqAnswerIcon}>
                    <Text style={styles.faqAnswerIconText}>A</Text>
                  </View>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* 使い方のヒント */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>使い方のヒント</Text>
          
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <MaterialIcons name="lightbulb" size={24} color="#F59E0B" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>ファンの方へ</Text>
              <Text style={styles.tipText}>
                気になるチャレンジに参加表明すると、あなたの参加が主催者に届きます。何度も参加すると常連として認識されるかも！
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: "rgba(221, 101, 0, 0.1)" }]}>
              <MaterialIcons name="star" size={24} color="#DD6500" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>主催者の方へ</Text>
              <Text style={styles.tipText}>
                チャレンジを作成すると、参加者数や地域分布がリアルタイムでわかります。会場選びの参考にしてください！
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            その他のご質問は{"\n"}
            <Text style={styles.footerLink}>@doin_challenge</Text> までお気軽にどうぞ
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3139",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  character: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  tutorialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1D21",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },
  tutorialButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tutorialButtonContent: {
    flex: 1,
  },
  tutorialButtonTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  tutorialButtonDescription: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 8,
  },
  faqItem: {
    backgroundColor: "#1A1D21",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  faqQuestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(236, 72, 153, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  faqQuestionIconText: {
    color: "#EC4899",
    fontSize: 14,
    fontWeight: "bold",
  },
  faqQuestion: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  faqAnswer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
    marginLeft: 40,
  },
  faqAnswerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(221, 101, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  faqAnswerIconText: {
    color: "#DD6500",
    fontSize: 14,
    fontWeight: "bold",
  },
  faqAnswerText: {
    flex: 1,
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 22,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#1A1D21",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  tipText: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  footerLink: {
    color: "#EC4899",
    fontWeight: "600",
  },
});
