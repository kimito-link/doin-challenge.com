import { View, Text, Pressable, StyleSheet, Dimensions, ScrollView } from "react-native";
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
const CHARACTER_IMAGES: Record<string, any> = {
  rinku: require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png"),
  konta: require("@/assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png"),
  tanune: require("@/assets/images/characters/tanunee/tanuki-yukkuri-smile-mouth-open.png"),
  kimitolink: require("@/assets/images/characters/KimitoLink.png"),
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
            <View style={styles.participantCard}>
              <Text style={styles.participantEmoji}>👨</Text>
              <Text style={styles.participantName}>田中さん</Text>
              <Text style={styles.participantPref}>📍東京都</Text>
            </View>
            <View style={styles.participantCard}>
              <Text style={styles.participantEmoji}>👩</Text>
              <Text style={styles.participantName}>佐藤さん</Text>
              <Text style={styles.participantPref}>📍千葉県</Text>
            </View>
          </View>
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
          <Text style={styles.commentText}>「今回のライブ、絶対行く！チェキ会も楽しみ！」</Text>
        </View>
      );
    case "invite":
      return (
        <View style={styles.previewContainer}>
          <View style={styles.inviteRow}>
            <Text style={styles.previewEmoji}>📨</Text>
            <Text style={styles.inviteText}>+3人</Text>
          </View>
          <Text style={styles.previewText}>友達を招待</Text>
        </View>
      );
    case "form":
      return (
        <View style={styles.formPreview}>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>応援メッセージ</Text>
            <View style={styles.formInput}>
              <Text style={styles.formInputText}>今回も全力で応援します！</Text>
            </View>
          </View>
        </View>
      );
    case "prefecture":
      return (
        <View style={styles.previewContainer}>
          <View style={styles.prefectureGrid}>
            <View style={[styles.prefectureButton, styles.prefectureButtonSelected]}>
              <Text style={styles.prefectureTextSelected}>福岡県</Text>
            </View>
            <View style={styles.prefectureButton}>
              <Text style={styles.prefectureText}>東京都</Text>
            </View>
            <View style={styles.prefectureButton}>
              <Text style={styles.prefectureText}>大阪府</Text>
            </View>
          </View>
          <Text style={styles.previewText}>参加する県を選択</Text>
        </View>
      );
    case "profile":
      return (
        <View style={styles.profilePreview}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={{ fontSize: 24 }}>👩</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>@music_lover_123</Text>
              <Text style={styles.profileBio}>音楽好き / 推し活 / ライブ参戦</Text>
            </View>
          </View>
          <View style={styles.followButton}>
            <Text style={styles.followButtonText}>フォローする</Text>
          </View>
        </View>
      );
    case "influencer":
      return (
        <View style={styles.profilePreview}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: "#FFD700" }]}>
              <Text style={{ fontSize: 24 }}>👑</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>@super_fan_2024</Text>
              <Text style={styles.profileFollowers}>フォロワー 12,500人</Text>
            </View>
          </View>
          <View style={styles.followButton}>
            <Text style={styles.followButtonText}>フォローする</Text>
          </View>
        </View>
      );
    case "gender":
      return (
        <View style={styles.genderPreview}>
          <View style={styles.genderChart}>
            <View style={[styles.genderBar, { flex: 6, backgroundColor: "#3B82F6" }]}>
              <Text style={styles.genderText}>👨 60%</Text>
            </View>
            <View style={[styles.genderBar, { flex: 4, backgroundColor: "#EC4899" }]}>
              <Text style={styles.genderText}>👩 40%</Text>
            </View>
          </View>
          <Text style={styles.previewText}>男女比</Text>
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
  const title = experienceType === "organizer" ? "🎙️ 主催者の追体験" : "💖 ファンの追体験";

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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          key={currentSlide.id}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.content}
        >
          {/* キャラクターと心理描写の吹き出し */}
          <View style={styles.characterSection}>
            <View style={styles.characterContainer}>
              <Image
                source={characterImage}
                style={styles.characterImage}
                contentFit="contain"
              />
            </View>
            
            {/* 心理描写の吹き出し */}
            {currentSlide.thought && (
              <View style={styles.thoughtBubble}>
                <View style={styles.thoughtTail} />
                <Text style={styles.thoughtText}>{currentSlide.thought}</Text>
              </View>
            )}
          </View>

          {/* メインメッセージ */}
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
      </ScrollView>

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
            {isLastSlide ? "完了 ✓" : "次へ →"}
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
    gap: 6,
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressDotActive: {
    backgroundColor: "#FF6B9D",
    width: 20,
  },
  progressDotCompleted: {
    backgroundColor: "#FF6B9D",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  characterSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    width: "100%",
  },
  characterContainer: {
    marginRight: 12,
  },
  characterImage: {
    width: 80,
    height: 80,
  },
  thoughtBubble: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 12,
    position: "relative",
  },
  thoughtTail: {
    position: "absolute",
    left: -8,
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: "transparent",
    borderBottomWidth: 8,
    borderBottomColor: "transparent",
    borderRightWidth: 8,
    borderRightColor: "rgba(255, 255, 255, 0.15)",
  },
  thoughtText: {
    fontSize: 14,
    color: "#ffffff",
    lineHeight: 22,
    fontStyle: "italic",
  },
  speechBubble: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxWidth: SCREEN_WIDTH - 60,
    marginBottom: 12,
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
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  previewContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
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
    gap: 12,
    marginBottom: 8,
  },
  participantCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 100,
  },
  participantEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  participantName: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "bold",
  },
  participantPref: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
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
    minWidth: 280,
  },
  commentText: {
    fontSize: 16,
    color: "#ffffff",
    fontStyle: "italic",
  },
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  inviteText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ADE80",
  },
  formPreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    minWidth: 280,
  },
  formField: {
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  formInputText: {
    fontSize: 14,
    color: "#ffffff",
  },
  prefectureGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  prefectureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  prefectureButtonSelected: {
    backgroundColor: "#EC4899",
    borderColor: "#EC4899",
  },
  prefectureText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  prefectureTextSelected: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "bold",
  },
  profilePreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    minWidth: 280,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  profileBio: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  profileFollowers: {
    fontSize: 12,
    color: "#FFD700",
    marginTop: 2,
  },
  followButton: {
    backgroundColor: "#1DA1F2",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  genderPreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    minWidth: 280,
    alignItems: "center",
  },
  genderChart: {
    flexDirection: "row",
    height: 40,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  genderBar: {
    justifyContent: "center",
    alignItems: "center",
  },
  genderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
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
