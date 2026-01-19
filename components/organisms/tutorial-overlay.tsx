import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Platform } from "react-native";
import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import Svg, { Circle, Path, Rect, G, Text as SvgText } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// キャラクター画像のマッピング（表情バリエーション）
const CHARACTER_IMAGES = {
  // りんくちゃん
  rinku_normal: require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
  rinku_smile: require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png"),
  rinku_blink: require("@/assets/images/characters/link/link-yukkuri-blink-mouth-open.png"),
  rinku_thinking: require("@/assets/images/characters/link/link-yukkuri-half-eyes-mouth-closed.png"),
  // こん太
  konta_normal: require("@/assets/images/characters/konta/kitsune-yukkuri-normal.png"),
  konta_smile: require("@/assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png"),
  konta_blink: require("@/assets/images/characters/konta/kitsune-yukkuri-blink-mouth-open.png"),
  // たぬ姉
  tanune_normal: require("@/assets/images/characters/tanunee/tanuki-yukkuri-normal-mouth-open.png"),
  tanune_smile: require("@/assets/images/characters/tanunee/tanuki-yukkuri-smile-mouth-open.png"),
  tanune_blink: require("@/assets/images/characters/tanunee/tanuki-yukkuri-blink-mouth-open.png"),
  // 君斗りんく（メイン）
  kimitolink: require("@/assets/images/characters/KimitoLink.png"),
  idol: require("@/assets/images/characters/idolKimitoLink.png"),
};

type CharacterKey = keyof typeof CHARACTER_IMAGES;

export type TutorialStep = {
  /** 画面に表示する一言（12文字以内推奨） */
  message: string;
  /** サブメッセージ（メリットの説明） */
  subMessage?: string;
  /** キャラクター */
  character?: CharacterKey;
  /** セリフ（キャラクターの吹き出し） */
  speech?: string;
  /** アイコンタイプ（レガシー互換） */
  icon?: string;
  /** ハイライトする要素の位置（指定しない場合は中央表示） */
  highlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
    /** 丸型ハイライトにするか */
    circular?: boolean;
  };
  /** メッセージの表示位置 */
  messagePosition?: "top" | "bottom" | "center";
  /** タップで次に進むか（falseの場合は特定のアクションを待つ） */
  tapToContinue?: boolean;
  /** 成功時のアニメーション */
  successAnimation?: "confetti" | "pulse" | "sparkle" | "none";
  /** プレビュー画像タイプ */
  previewType?: "map" | "participants" | "chart" | "notification" | "crown" | "none";
};

type TutorialOverlayProps = {
  /** 現在のステップ */
  step: TutorialStep;
  /** 現在のステップ番号（1から開始） */
  stepNumber: number;
  /** 総ステップ数 */
  totalSteps: number;
  /** 次のステップに進む */
  onNext: () => void;
  /** チュートリアル終了 */
  onComplete: () => void;
  /** 表示/非表示 */
  visible: boolean;
};

/**
 * 紙吹雪コンポーネント
 */
function Confetti({ active }: { active: boolean }) {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => {
    const x = useSharedValue(Math.random() * SCREEN_WIDTH);
    const y = useSharedValue(-50);
    const rotation = useSharedValue(0);
    const scale = useSharedValue(0.5 + Math.random() * 0.5);
    
    useEffect(() => {
      if (active) {
        const delay = Math.random() * 500;
        y.value = withDelay(delay, withTiming(SCREEN_HEIGHT + 50, { duration: 2000 + Math.random() * 1000 }));
        rotation.value = withDelay(delay, withRepeat(withTiming(360, { duration: 1000 }), -1, false));
        x.value = withDelay(delay, withTiming(x.value + (Math.random() - 0.5) * 100, { duration: 2000 }));
      }
    }, [active]);

    const style = useAnimatedStyle(() => ({
      position: "absolute" as const,
      left: x.value,
      top: y.value,
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    }));

    const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181", "#DD6500"];
    const color = colors[i % colors.length];

    return (
      <Animated.View key={i} style={style}>
        <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 2 }} />
      </Animated.View>
    );
  });

  if (!active) return null;
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{confettiPieces}</View>;
}

/**
 * キラキラエフェクトコンポーネント
 */
function Sparkles({ active }: { active: boolean }) {
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);
    
    useEffect(() => {
      if (active) {
        // 静的な表示（ちかちかアニメーション削除）
        const delay = i * 50;
        opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
        scale.value = withDelay(delay, withTiming(1, { duration: 300 }));
      }
    }, [active]);

    const style = useAnimatedStyle(() => ({
      position: "absolute" as const,
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

    const angle = (i / 12) * Math.PI * 2;
    const radius = 80 + Math.random() * 40;
    const x = SCREEN_WIDTH / 2 + Math.cos(angle) * radius - 10;
    const y = SCREEN_HEIGHT / 2 - 50 + Math.sin(angle) * radius - 10;

    return (
      <Animated.View key={i} style={[style, { left: x, top: y }]}>
        <Text style={{ fontSize: 20, color: "#FFD700" }}>✦</Text>
      </Animated.View>
    );
  });

  if (!active) return null;
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{sparkles}</View>;
}

/**
 * 日本地図プレビュー（簡易版）
 */
function MapPreview() {
  return (
    <View style={previewStyles.container}>
      <Svg width={200} height={150} viewBox="0 0 200 150">
        {/* 簡易日本地図 */}
        <G>
          {/* 北海道 */}
          <Circle cx={160} cy={30} r={15} fill="#FFB3B3" stroke="#DD6500" strokeWidth={1} />
          {/* 東北 */}
          <Circle cx={150} cy={55} r={12} fill="#FFD9D9" stroke="#DD6500" strokeWidth={1} />
          {/* 関東（赤く強調） */}
          <Circle cx={145} cy={80} r={18} fill="#FF4444" stroke="#DD6500" strokeWidth={2} />
          {/* 中部 */}
          <Circle cx={125} cy={85} r={14} fill="#FFCCCC" stroke="#DD6500" strokeWidth={1} />
          {/* 関西 */}
          <Circle cx={105} cy={95} r={16} fill="#FF8888" stroke="#DD6500" strokeWidth={1} />
          {/* 中国 */}
          <Circle cx={75} cy={100} r={12} fill="#FFE0E0" stroke="#DD6500" strokeWidth={1} />
          {/* 四国 */}
          <Circle cx={90} cy={115} r={10} fill="#FFD9D9" stroke="#DD6500" strokeWidth={1} />
          {/* 九州 */}
          <Circle cx={50} cy={115} r={14} fill="#FFCCCC" stroke="#DD6500" strokeWidth={1} />
        </G>
        {/* 凡例 */}
        <SvgText x={10} y={20} fontSize={10} fill="#FFFFFF">参加者が多い</SvgText>
        <Rect x={10} y={25} width={15} height={8} fill="#FF4444" />
        <SvgText x={10} y={50} fontSize={10} fill="#FFFFFF">参加者が少ない</SvgText>
        <Rect x={10} y={55} width={15} height={8} fill="#FFE0E0" />
      </Svg>
      <Text style={previewStyles.caption}>地域別参加者マップ</Text>
    </View>
  );
}

/**
 * 参加者リストプレビュー
 */
function ParticipantsPreview() {
  const participants = [
    { name: "@fan_user1", followers: "12.5K", badge: "👑" },
    { name: "@supporter_2", followers: "8.2K", badge: "⭐" },
    { name: "@love_oshi", followers: "5.1K", badge: "" },
  ];

  return (
    <View style={previewStyles.container}>
      <View style={previewStyles.listContainer}>
        {participants.map((p, i) => (
          <View key={i} style={previewStyles.listItem}>
            <View style={previewStyles.avatar} />
            <View style={previewStyles.listItemContent}>
              <Text style={previewStyles.listItemName}>{p.badge} {p.name}</Text>
              <Text style={previewStyles.listItemSub}>フォロワー {p.followers}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={previewStyles.caption}>参加者リスト</Text>
    </View>
  );
}

/**
 * 男女比グラフプレビュー
 */
function ChartPreview() {
  return (
    <View style={previewStyles.container}>
      <Svg width={150} height={100} viewBox="0 0 150 100">
        {/* 円グラフ */}
        <G transform="translate(75, 50)">
          {/* 男性（青） */}
          <Path
            d="M 0 0 L 40 0 A 40 40 0 0 1 -20 34.6 Z"
            fill="#4A90D9"
          />
          {/* 女性（ピンク） */}
          <Path
            d="M 0 0 L -20 34.6 A 40 40 0 1 1 40 0 Z"
            fill="#EC4899"
          />
        </G>
        {/* 凡例 */}
        <Rect x={5} y={10} width={12} height={12} fill="#EC4899" />
        <SvgText x={20} y={20} fontSize={10} fill="#FFFFFF">女性 65%</SvgText>
        <Rect x={5} y={30} width={12} height={12} fill="#4A90D9" />
        <SvgText x={20} y={40} fontSize={10} fill="#FFFFFF">男性 35%</SvgText>
      </Svg>
      <Text style={previewStyles.caption}>参加者の男女比</Text>
    </View>
  );
}

/**
 * 通知プレビュー
 */
function NotificationPreview() {
  return (
    <View style={previewStyles.container}>
      <View style={previewStyles.notificationCard}>
        <Text style={previewStyles.notificationIcon}>🔔</Text>
        <View>
          <Text style={previewStyles.notificationTitle}>新しい参加者！</Text>
          <Text style={previewStyles.notificationBody}>@fan_user1さんが参加表明しました</Text>
        </View>
      </View>
      <Text style={previewStyles.caption}>主催者に通知が届く</Text>
    </View>
  );
}

/**
 * 王冠プレビュー（常連表示）
 */
function CrownPreview() {
  return (
    <View style={previewStyles.container}>
      <View style={previewStyles.crownContainer}>
        <Text style={previewStyles.crownIcon}>👑</Text>
        <Text style={previewStyles.crownText}>常連ファン</Text>
        <Text style={previewStyles.crownSub}>参加回数: 15回</Text>
      </View>
      <Text style={previewStyles.caption}>たくさん参加すると特別扱い</Text>
    </View>
  );
}

/**
 * プレビューコンポーネントの選択
 */
function PreviewComponent({ type }: { type?: string }) {
  switch (type) {
    case "map":
      return <MapPreview />;
    case "participants":
      return <ParticipantsPreview />;
    case "chart":
      return <ChartPreview />;
    case "notification":
      return <NotificationPreview />;
    case "crown":
      return <CrownPreview />;
    default:
      return null;
  }
}

/**
 * 強化版チュートリアルオーバーレイ
 */
export function TutorialOverlay({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onComplete,
  visible,
}: TutorialOverlayProps) {
  const colors = useColors();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<CharacterKey>("rinku_normal");
  
  // アニメーション値
  const messageOpacity = useSharedValue(0);
  const characterBounce = useSharedValue(0);
  const characterScale = useSharedValue(1);
  const previewScale = useSharedValue(0);
  const speechBubbleScale = useSharedValue(0);

  // 表情変化のタイマー
  useEffect(() => {
    if (!visible) return;
    
    // 基本のキャラクターを設定
    const baseChar = step.character || "rinku_normal";
    setCurrentExpression(baseChar);
    
    // まばたきアニメーション
    const blinkInterval = setInterval(() => {
      const charBase = baseChar.split("_")[0];
      setCurrentExpression(`${charBase}_blink` as CharacterKey);
      setTimeout(() => {
        setCurrentExpression(baseChar);
      }, 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [visible, step.character]);

  useEffect(() => {
    if (visible) {
      // メッセージのフェードイン
      messageOpacity.value = withTiming(1, { duration: 300 });
      
      // キャラクターのバウンスアニメーション（削除：ちかちかしすぎるため）
      characterBounce.value = 0;

      // プレビューのスケールイン
      previewScale.value = withDelay(200, withSpring(1, { damping: 12 }));
      
      // 吹き出しのスケールイン
      if (step.speech) {
        speechBubbleScale.value = withDelay(400, withSpring(1, { damping: 10 }));
      }

      // エフェクト
      if (step.successAnimation === "confetti") {
        setTimeout(() => setShowConfetti(true), 300);
      } else if (step.successAnimation === "sparkle") {
        setShowSparkles(true);
      }
    } else {
      previewScale.value = 0;
      speechBubbleScale.value = 0;
      setShowConfetti(false);
      setShowSparkles(false);
    }
  }, [visible, step]);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: characterBounce.value },
      { scale: characterScale.value },
    ],
  }));

  const previewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: previewScale.value }],
    opacity: previewScale.value,
  }));

  const speechBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speechBubbleScale.value }],
    opacity: speechBubbleScale.value,
  }));

  const handleTap = () => {
    if (step.tapToContinue !== false) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // タップ時にキャラクターを笑顔に
      const charBase = (step.character || "rinku_normal").split("_")[0];
      setCurrentExpression(`${charBase}_smile` as CharacterKey);
      characterScale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      
      setTimeout(() => {
        if (stepNumber >= totalSteps) {
          onComplete();
        } else {
          onNext();
        }
      }, 200);
    }
  };

  if (!visible) return null;

  const characterSource = CHARACTER_IMAGES[currentExpression] || CHARACTER_IMAGES.rinku_normal;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.container]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        style={styles.overlay}
      >
        {/* 暗いオーバーレイ */}
        <View style={styles.darkOverlay} />

        {/* エフェクト */}
        <Confetti active={showConfetti} />
        <Sparkles active={showSparkles} />

        {/* メインコンテンツ */}
        <Animated.View style={[styles.contentContainer, messageStyle]}>
          {/* プレビュー画像 */}
          {step.previewType && step.previewType !== "none" && (
            <Animated.View style={[styles.previewContainer, previewStyle]}>
              <PreviewComponent type={step.previewType} />
            </Animated.View>
          )}

          {/* キャラクターと吹き出し */}
          <View style={styles.characterSection}>
            <Animated.View style={[styles.characterContainer, characterStyle]}>
              <Image
                source={characterSource}
                style={styles.characterImage}
                contentFit="contain"
              />
            </Animated.View>
            
            {/* キャラクターの吹き出し */}
            {step.speech && (
              <Animated.View style={[styles.speechBubble, speechBubbleStyle]}>
                <Text style={styles.speechText}>{step.speech}</Text>
                <View style={styles.speechTail} />
              </Animated.View>
            )}
          </View>

          {/* メッセージバブル */}
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{step.message}</Text>
            {step.subMessage && (
              <Text style={styles.subMessageText}>{step.subMessage}</Text>
            )}
          </View>

          {/* ステップインジケーター */}
          <View style={styles.stepIndicator}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  i + 1 === stepNumber && styles.stepDotActive,
                  i + 1 < stepNumber && styles.stepDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* タップヒント */}
          {step.tapToContinue !== false && (
            <Animated.View style={styles.tapHintContainer}>
              <Text style={styles.tapHint}>タップして続ける</Text>
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    maxWidth: 400,
  },
  previewContainer: {
    marginBottom: 20,
  },
  characterSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  characterContainer: {
    marginRight: 8,
  },
  characterImage: {
    width: 120,
    height: 120,
  },
  speechBubble: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: 180,
    position: "relative",
  },
  speechText: {
    color: "#333333",
    fontSize: 13,
    lineHeight: 18,
  },
  speechTail: {
    position: "absolute",
    left: -8,
    bottom: 15,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: "transparent",
    borderBottomWidth: 8,
    borderBottomColor: "transparent",
    borderRightWidth: 10,
    borderRightColor: "#FFFFFF",
  },
  messageBubble: {
    backgroundColor: "#DD6500",
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 32,
  },
  subMessageText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    marginTop: 24,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  stepDotActive: {
    backgroundColor: "#DD6500",
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: "#22C55E",
  },
  tapHintContainer: {
    marginTop: 16,
  },
  tapHint: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
});

const previewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    minWidth: 220,
  },
  caption: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    marginTop: 8,
  },
  listContainer: {
    width: "100%",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DD6500",
    marginRight: 10,
  },
  listItemContent: {
    flex: 1,
  },
  listItemName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  listItemSub: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  notificationBody: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
  },
  crownContainer: {
    alignItems: "center",
    padding: 16,
  },
  crownIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  crownText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },
  crownSub: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 4,
  },
});
