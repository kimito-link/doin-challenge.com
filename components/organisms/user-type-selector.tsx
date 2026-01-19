import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import type { UserType } from "@/lib/tutorial-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// キャラクター画像
const characterImages = {
  fan: require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
  host: require("@/assets/images/characters/tanunee/tanuki-yukkuri-normal-mouth-open.png"),
  main: require("@/assets/images/characters/KimitoLink.png"),
};

type UserTypeSelectorProps = {
  visible: boolean;
  onSelect: (userType: UserType) => void;
  onSkip: () => void;
};

/**
 * ユーザータイプ選択画面（Web互換版）
 * 
 * - Web環境ではreact-native-reanimatedを使用しない
 * - シンプルなフェードイン/アウトで表示
 */
export function UserTypeSelector({ visible, onSelect, onSkip }: UserTypeSelectorProps) {
  const colors = useColors();
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // 少し遅延してフェードイン
      const timer = setTimeout(() => {
        setOpacity(1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleSelect = (type: UserType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSelect(type);
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { opacity }]}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* メインキャラクター */}
          <View style={styles.mainCharacterContainer}>
            <Image
              source={characterImages.main}
              style={styles.mainCharacterImage}
              contentFit="contain"
            />
            {/* キラキラエフェクト */}
            <Text style={[styles.sparkle, styles.sparkle1]}>✦</Text>
            <Text style={[styles.sparkle, styles.sparkle2]}>✦</Text>
            <Text style={[styles.sparkle, styles.sparkle3]}>✦</Text>
          </View>

          {/* タイトル */}
          <View>
            <Text style={styles.title}>はじめまして！</Text>
            <Text style={styles.subtitle}>あなたはどっち？</Text>
          </View>

          {/* 選択肢 */}
          <View style={styles.optionsContainer}>
            {/* ファン */}
            <TouchableOpacity
              onPress={() => handleSelect("fan")}
              style={[styles.optionCard, { backgroundColor: "#EC4899" }]}
              activeOpacity={0.8}
            >
              <View style={styles.optionImageContainer}>
                <Image
                  source={characterImages.fan}
                  style={styles.characterImage}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.optionTitle}>ファン</Text>
              <Text style={styles.optionDescription}>推しを応援したい</Text>
              <View style={styles.optionBadge}>
                <Text style={styles.optionBadgeText}>参加する側</Text>
              </View>
            </TouchableOpacity>

            {/* 主催者 */}
            <TouchableOpacity
              onPress={() => handleSelect("host")}
              style={[styles.optionCard, { backgroundColor: "#DD6500" }]}
              activeOpacity={0.8}
            >
              <View style={styles.optionImageContainer}>
                <Image
                  source={characterImages.host}
                  style={styles.characterImage}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.optionTitle}>主催者</Text>
              <Text style={styles.optionDescription}>チャレンジを作りたい</Text>
              <View style={styles.optionBadge}>
                <Text style={styles.optionBadgeText}>企画する側</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 説明テキスト */}
          <Text style={styles.helpText}>
            どちらを選んでも、あとで両方使えます
          </Text>

          {/* スキップ */}
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>あとで見る</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
    // CSS transitionはReact Nativeでは使えないが、opacityの変更で対応
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  mainCharacterContainer: {
    position: "relative",
    marginBottom: 16,
  },
  mainCharacterImage: {
    width: 100,
    height: 100,
  },
  sparkle: {
    position: "absolute",
    fontSize: 20,
    color: "#FFD700",
  },
  sparkle1: {
    top: -10,
    right: -15,
  },
  sparkle2: {
    top: 20,
    left: -20,
  },
  sparkle3: {
    bottom: 0,
    right: -20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 18,
    marginBottom: 32,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  optionCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    maxWidth: 160,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  characterImage: {
    width: 60,
    height: 60,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  optionDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  optionBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  optionBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  helpText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
});
