import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { useExperience, ExperienceSlide } from "@/lib/experience-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// キャラクター画像のマッピング
const CHARACTER_IMAGES = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
  kimitolink: require("@/assets/images/characters/kimitolink.png"),
};

// プレビューコンポーネント
function PreviewContent({ type }: { type: ExperienceSlide["previewType"] }) {
  switch (type) {
    case "map":
      return (
        <View style={styles.previewContainer}>
          <Text style={styles.previewEmoji}>🗾</Text>
          <Text style={styles.previewText}>地図で参加者の分布が見える</Text>
        </View>
      );
    case "participants":
      return (
        <View style={styles.previewContainer}>
          <View style={styles.participantRow}>
            <Text style={styles.previewEmoji}>👤</Text>
            <Text style={styles.previewEmoji}>👤</Text>
            <Text style={styles.previewEmoji}>👤</Text>
          </View>
          <Text style={styles.previewText}>参加者リスト</Text>
        </View>
      );
    case "chart":
      return (
        <View style={styles.previewContainer}>
          <Text style={styles.previewEmoji}>📊</Text>
          <Text style={styles.previewText}>男女比・地域分布</Text>
        </View>
      );
    case "notification":
      return (
        <View style={styles.notificationPreview}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>動員ちゃれんじ</Text>
            <Text style={styles.notificationBody}>推しの新しいチャレンジが始まりました！</Text>
          </View>
        </View>
      );
    case "crown":
      return (
        <View style={styles.previewContainer}>
          <Text style={styles.previewEmoji}>👑</Text>
          <Text style={styles.previewText}>常連ファンバッジ</Text>
        </View>
      );
    case "comment":
      return (
        <View style={styles.commentPreview}>
          <Text style={styles.commentText}>「今回のライブ、絶対行く！楽しみ！」</Text>
        </View>
      );
    case "invite":
      return (
        <View style={styles.previewContainer}>
          <Text style={styles.previewEmoji}>📨</Text>
          <Text style={styles.previewText}>友達を招待</Text>
        </View>
      );
    default:
      return null;
  }
}

export function ExperienceOverlay() {
  const { 
    isActive, 
    currentSlide, 
    currentSlideIndex, 
    totalSlides, 
    nextSlide, 
    prevSlide, 
    endExperience,
    experienceType,
  } = useExperience();
  const insets = useSafeAreaInsets();

  if (!isActive || !currentSlide) {
    return null;
  }

  const characterImage = CHARACTER_IMAGES[currentSlide.character];
  const isLastSlide = currentSlideIndex === totalSlides - 1;
  const title = experienceType === "organizer" ? "主催者の追体験" : "ファンの追体験";

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={[
        styles.overlay, 
        { 
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          backgroundColor: currentSlide.backgroundColor || "#1a1a2e",
        }
      ]}
    >
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable 
          onPress={endExperience}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && { opacity: 0.7 }
          ]}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* プログレスバー */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSlides }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentSlideIndex && styles.progressDotActive,
              index < currentSlideIndex && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* コンテンツ */}
      <Animated.View 
        key={currentSlide.id}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
        style={styles.content}
      >
        {/* キャラクター */}
        <View style={styles.characterContainer}>
          <Image
            source={characterImage}
            style={styles.characterImage}
            contentFit="contain"
          />
        </View>

        {/* 吹き出し */}
        <View style={styles.speechBubble}>
          <Text style={styles.messageText}>{currentSlide.message}</Text>
        </View>

        {/* サブメッセージ */}
        {currentSlide.subMessage && (
          <Text style={styles.subMessageText}>{currentSlide.subMessage}</Text>
        )}

        {/* プレビュー */}
        {currentSlide.previewType && currentSlide.previewType !== "none" && (
          <PreviewContent type={currentSlide.previewType} />
        )}
      </Animated.View>

      {/* ナビゲーションボタン */}
      <View style={styles.navigation}>
        <Pressable
          onPress={prevSlide}
          disabled={currentSlideIndex === 0}
          style={({ pressed }) => [
            styles.navButton,
            currentSlideIndex === 0 && styles.navButtonDisabled,
            pressed && { opacity: 0.7 }
          ]}
        >
          <Text style={[
            styles.navButtonText,
            currentSlideIndex === 0 && styles.navButtonTextDisabled
          ]}>← 戻る</Text>
        </Pressable>

        <Text style={styles.slideCounter}>
          {currentSlideIndex + 1} / {totalSlides}
        </Text>

        <Pressable
          onPress={nextSlide}
          style={({ pressed }) => [
            styles.navButton,
            styles.navButtonPrimary,
            pressed && { opacity: 0.7 }
          ]}
        >
          <Text style={styles.navButtonTextPrimary}>
            {isLastSlide ? "完了" : "次へ →"}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressDotActive: {
    backgroundColor: "#FF6B9D",
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: "#FF6B9D",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  characterContainer: {
    marginBottom: 20,
  },
  characterImage: {
    width: 120,
    height: 120,
  },
  speechBubble: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxWidth: SCREEN_WIDTH - 60,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "center",
  },
  subMessageText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  previewContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    minWidth: 200,
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: "#ffffff",
  },
  participantRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  notificationPreview: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 280,
  },
  notificationIcon: {
    fontSize: 32,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  notificationBody: {
    fontSize: 12,
    color: "#666",
  },
  commentPreview: {
    backgroundColor: "rgba(255, 107, 157, 0.2)",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B9D",
  },
  commentText: {
    fontSize: 16,
    color: "#ffffff",
    fontStyle: "italic",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonPrimary: {
    backgroundColor: "#FF6B9D",
  },
  navButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  navButtonTextPrimary: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  slideCounter: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
});
