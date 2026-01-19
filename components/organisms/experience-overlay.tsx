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

// キャラクター画像のマッピング（ゆっくりスタイル）
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
          <View style={styles.mapPreview}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>地域別参加者</Text>
            </View>
            <View style={styles.mapGrid}>
              <View style={[styles.mapRegion, { backgroundColor: "#EC4899" }]}>
                <Text style={styles.mapRegionName}>東京</Text>
                <Text style={styles.mapRegionCount}>25人</Text>
              </View>
              <View style={[styles.mapRegion, { backgroundColor: "#8B5CF6" }]}>
                <Text style={styles.mapRegionName}>大阪</Text>
                <Text style={styles.mapRegionCount}>18人</Text>
              </View>
              <View style={[styles.mapRegion, { backgroundColor: "#3B82F6" }]}>
                <Text style={styles.mapRegionName}>福岡</Text>
                <Text style={styles.mapRegionCount}>12人</Text>
              </View>
              <View style={[styles.mapRegion, { backgroundColor: "#10B981" }]}>
                <Text style={styles.mapRegionName}>北海道</Text>
                <Text style={styles.mapRegionCount}>8人</Text>
              </View>
            </View>
          </View>
        </View>
      );
    case "participants":
      return (
        <View style={styles.previewContainer}>
          <View style={styles.participantRow}>
            <View style={styles.participantCard}>
              <View style={[styles.participantAvatar, { backgroundColor: "#EC4899" }]}>
                <Text style={styles.participantInitial}>田</Text>
              </View>
              <Text style={styles.participantName}>田中さん</Text>
              <Text style={styles.participantPref}>東京都</Text>
            </View>
            <View style={styles.participantCard}>
              <View style={[styles.participantAvatar, { backgroundColor: "#8B5CF6" }]}>
                <Text style={styles.participantInitial}>佐</Text>
              </View>
              <Text style={styles.participantName}>佐藤さん</Text>
              <Text style={styles.participantPref}>千葉県</Text>
            </View>
            <View style={styles.participantCard}>
              <View style={[styles.participantAvatar, { backgroundColor: "#3B82F6" }]}>
                <Text style={styles.participantInitial}>鈴</Text>
              </View>
              <Text style={styles.participantName}>鈴木さん</Text>
              <Text style={styles.participantPref}>福岡県</Text>
            </View>
          </View>
        </View>
      );
    case "chart":
      return (
        <View style={styles.previewContainer}>
          <View style={styles.chartPreview}>
            <Text style={styles.chartTitle}>カテゴリ別チャレンジ</Text>
            <View style={styles.chartBars}>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 60, backgroundColor: "#EC4899" }]} />
                <Text style={styles.chartBarLabel}>アイドル</Text>
              </View>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 45, backgroundColor: "#8B5CF6" }]} />
                <Text style={styles.chartBarLabel}>バンド</Text>
              </View>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 35, backgroundColor: "#3B82F6" }]} />
                <Text style={styles.chartBarLabel}>VTuber</Text>
              </View>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 25, backgroundColor: "#10B981" }]} />
                <Text style={styles.chartBarLabel}>その他</Text>
              </View>
            </View>
          </View>
        </View>
      );
    case "notification":
      return (
        <View style={styles.notificationPreview}>
          <View style={styles.notificationIconContainer}>
            <Text style={styles.notificationIconText}>🔔</Text>
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>動員ちゃれんじ</Text>
            <Text style={styles.notificationBody}>推しの新しいチャレンジが始まりました！</Text>
            <Text style={styles.notificationTime}>たった今</Text>
          </View>
        </View>
      );
    case "crown":
      return (
        <View style={styles.previewContainer}>
          <View style={styles.badgePreview}>
            <View style={styles.crownIcon}>
              <Text style={styles.crownEmoji}>👑</Text>
            </View>
            <Text style={styles.badgeTitle}>常連ファンバッジ</Text>
            <Text style={styles.badgeDesc}>5回以上参加で獲得！</Text>
          </View>
        </View>
      );
    case "comment":
      return (
        <View style={styles.commentPreview}>
          <View style={styles.commentHeader}>
            <View style={[styles.commentAvatar, { backgroundColor: "#EC4899" }]}>
              <Text style={styles.commentAvatarText}>M</Text>
            </View>
            <View>
              <Text style={styles.commentName}>@music_lover</Text>
              <Text style={styles.commentTime}>2時間前</Text>
            </View>
          </View>
          <Text style={styles.commentText}>「今回のライブ、絶対行く！チェキ会も楽しみ！推しに会えるの待ちきれない〜💕」</Text>
        </View>
      );
    case "invite":
      return (
        <View style={styles.previewContainer}>
          <View style={styles.invitePreview}>
            <Text style={styles.inviteTitle}>友達を誘う</Text>
            <View style={styles.inviteCounter}>
              <Pressable style={styles.inviteButton}>
                <Text style={styles.inviteButtonText}>−</Text>
              </Pressable>
              <Text style={styles.inviteCount}>3人</Text>
              <Pressable style={[styles.inviteButton, styles.inviteButtonActive]}>
                <Text style={[styles.inviteButtonText, styles.inviteButtonTextActive]}>＋</Text>
              </Pressable>
            </View>
            <Text style={styles.inviteDesc}>一緒に参加する友達の人数</Text>
          </View>
        </View>
      );
    case "form":
      return (
        <View style={styles.formPreview}>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>応援メッセージ</Text>
            <View style={styles.formInput}>
              <Text style={styles.formInputText}>今回も全力で応援します！楽しみにしてます！</Text>
            </View>
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>参加する都道府県</Text>
            <View style={styles.formSelect}>
              <Text style={styles.formSelectText}>福岡県</Text>
              <Text style={styles.formSelectArrow}>▼</Text>
            </View>
          </View>
        </View>
      );
    case "prefecture":
      return (
        <View style={styles.previewContainer}>
          <Text style={styles.prefectureTitle}>参加する都道府県を選択</Text>
          <View style={styles.prefectureGrid}>
            <View style={styles.prefectureButton}>
              <Text style={styles.prefectureText}>東京都</Text>
            </View>
            <View style={styles.prefectureButton}>
              <Text style={styles.prefectureText}>大阪府</Text>
            </View>
            <View style={[styles.prefectureButton, styles.prefectureButtonSelected]}>
              <Text style={styles.prefectureTextSelected}>福岡県 ✓</Text>
            </View>
            <View style={styles.prefectureButton}>
              <Text style={styles.prefectureText}>北海道</Text>
            </View>
          </View>
        </View>
      );
    case "profile":
      return (
        <View style={styles.profilePreview}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: "#8B5CF6" }]}>
              <Text style={styles.profileAvatarText}>M</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>@music_lover_123</Text>
              <Text style={styles.profileBio}>音楽好き / 推し活 / ライブ参戦</Text>
              <Text style={styles.profileFollowers}>フォロワー 1,234人</Text>
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
              <Text style={styles.profileAvatarText}>S</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.influencerBadge}>
                <Text style={styles.influencerBadgeText}>👑 インフルエンサー</Text>
              </View>
              <Text style={styles.profileName}>@super_fan_2024</Text>
              <Text style={styles.profileFollowers}>フォロワー 12,500人</Text>
            </View>
          </View>
          <View style={[styles.followButton, { backgroundColor: "#FFD700" }]}>
            <Text style={[styles.followButtonText, { color: "#1a1a2e" }]}>フォローする</Text>
          </View>
        </View>
      );
    case "gender":
      return (
        <View style={styles.genderPreview}>
          <Text style={styles.genderTitle}>参加者の男女比</Text>
          <View style={styles.genderChart}>
            <View style={[styles.genderBar, { flex: 6, backgroundColor: "#3B82F6" }]}>
              <Text style={styles.genderText}>男性 60%</Text>
            </View>
            <View style={[styles.genderBar, { flex: 4, backgroundColor: "#EC4899" }]}>
              <Text style={styles.genderText}>女性 40%</Text>
            </View>
          </View>
          <View style={styles.genderLegend}>
            <View style={styles.genderLegendItem}>
              <View style={[styles.genderLegendDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={styles.genderLegendText}>男性: 60人</Text>
            </View>
            <View style={styles.genderLegendItem}>
              <View style={[styles.genderLegendDot, { backgroundColor: "#EC4899" }]} />
              <Text style={styles.genderLegendText}>女性: 40人</Text>
            </View>
          </View>
        </View>
      );
    
    // 新しいプレビュータイプ
    case "challenge-card":
      return (
        <View style={styles.challengeCardPreview}>
          <View style={styles.challengeCardHeader}>
            <Text style={styles.challengeCardCategory}>🎤 アイドル</Text>
            <Text style={styles.challengeCardDays}>あと7日</Text>
          </View>
          <Text style={styles.challengeCardTitle}>りんくの100人動員チャレンジ</Text>
          <View style={styles.challengeCardHost}>
            <View style={[styles.challengeCardAvatar, { backgroundColor: "#EC4899" }]}>
              <Text style={styles.challengeCardAvatarText}>り</Text>
            </View>
            <Text style={styles.challengeCardHostName}>@kimito_link</Text>
          </View>
          <View style={styles.challengeCardProgress}>
            <View style={styles.challengeCardProgressBar}>
              <View style={[styles.challengeCardProgressFill, { width: "65%" }]} />
            </View>
            <Text style={styles.challengeCardProgressText}>65 / 100人</Text>
          </View>
        </View>
      );
    case "progress-bar":
      return (
        <View style={styles.progressBarPreview}>
          <Text style={styles.progressBarTitle}>目標達成状況</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View 
                entering={FadeIn.duration(500)}
                style={[styles.progressBarFill, { width: "65%" }]} 
              />
            </View>
            <View style={styles.progressBarLabels}>
              <Text style={styles.progressBarCurrent}>65人</Text>
              <Text style={styles.progressBarGoal}>/ 100人</Text>
            </View>
          </View>
          <View style={styles.progressBarMilestones}>
            <View style={[styles.progressBarMilestone, styles.progressBarMilestoneCompleted]}>
              <Text style={styles.progressBarMilestoneText}>25%</Text>
            </View>
            <View style={[styles.progressBarMilestone, styles.progressBarMilestoneCompleted]}>
              <Text style={styles.progressBarMilestoneText}>50%</Text>
            </View>
            <View style={styles.progressBarMilestone}>
              <Text style={styles.progressBarMilestoneText}>75%</Text>
            </View>
            <View style={styles.progressBarMilestone}>
              <Text style={styles.progressBarMilestoneText}>100%</Text>
            </View>
          </View>
        </View>
      );
    case "countdown":
      return (
        <View style={styles.countdownPreview}>
          <Text style={styles.countdownTitle}>イベントまであと</Text>
          <View style={styles.countdownNumbers}>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownNumber}>7</Text>
              <Text style={styles.countdownLabel}>日</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownNumber}>12</Text>
              <Text style={styles.countdownLabel}>時間</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownNumber}>34</Text>
              <Text style={styles.countdownLabel}>分</Text>
            </View>
          </View>
          <Text style={styles.countdownDate}>2026年1月26日(日) 18:00開演</Text>
        </View>
      );
    case "achievement":
      return (
        <View style={styles.achievementPreview}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementEmoji}>🏆</Text>
          </View>
          <Text style={styles.achievementTitle}>達成記念ページ</Text>
          <Text style={styles.achievementDesc}>参加者100人の名前が掲載されます</Text>
          <View style={styles.achievementNames}>
            <Text style={styles.achievementName}>田中さん</Text>
            <Text style={styles.achievementName}>佐藤さん</Text>
            <Text style={styles.achievementName}>鈴木さん</Text>
            <Text style={styles.achievementMore}>...他97人</Text>
          </View>
        </View>
      );
    case "share":
      return (
        <View style={styles.sharePreview}>
          <Text style={styles.shareTitle}>SNSでシェア</Text>
          <View style={styles.shareButtons}>
            <View style={[styles.shareButton, { backgroundColor: "#1DA1F2" }]}>
              <Text style={styles.shareButtonText}>𝕏 でシェア</Text>
            </View>
            <View style={[styles.shareButton, { backgroundColor: "#06C755" }]}>
              <Text style={styles.shareButtonText}>LINE</Text>
            </View>
          </View>
          <View style={styles.shareCard}>
            <Text style={styles.shareCardText}>「りんくの100人動員チャレンジに参加しました！🎉」</Text>
          </View>
        </View>
      );
    case "ranking":
      return (
        <View style={styles.rankingPreview}>
          <Text style={styles.rankingTitle}>貢献度ランキング</Text>
          <View style={styles.rankingList}>
            <View style={styles.rankingItem}>
              <Text style={styles.rankingPosition}>🥇</Text>
              <View style={[styles.rankingAvatar, { backgroundColor: "#FFD700" }]}>
                <Text style={styles.rankingAvatarText}>S</Text>
              </View>
              <Text style={styles.rankingName}>@super_fan</Text>
              <Text style={styles.rankingScore}>+15人</Text>
            </View>
            <View style={styles.rankingItem}>
              <Text style={styles.rankingPosition}>🥈</Text>
              <View style={[styles.rankingAvatar, { backgroundColor: "#C0C0C0" }]}>
                <Text style={styles.rankingAvatarText}>M</Text>
              </View>
              <Text style={styles.rankingName}>@music_lover</Text>
              <Text style={styles.rankingScore}>+8人</Text>
            </View>
            <View style={[styles.rankingItem, styles.rankingItemHighlight]}>
              <Text style={styles.rankingPosition}>5</Text>
              <View style={[styles.rankingAvatar, { backgroundColor: "#EC4899" }]}>
                <Text style={styles.rankingAvatarText}>あ</Text>
              </View>
              <Text style={styles.rankingName}>あなた</Text>
              <Text style={styles.rankingScore}>+3人</Text>
            </View>
          </View>
        </View>
      );
    case "dm":
      return (
        <View style={styles.dmPreview}>
          <Text style={styles.dmTitle}>ダイレクトメッセージ</Text>
          <View style={styles.dmMessages}>
            <View style={styles.dmMessageReceived}>
              <Text style={styles.dmMessageText}>福岡から参加するんですね！私も福岡です😊</Text>
            </View>
            <View style={styles.dmMessageSent}>
              <Text style={styles.dmMessageText}>そうなんです！一緒に遠征しませんか？</Text>
            </View>
            <View style={styles.dmMessageReceived}>
              <Text style={styles.dmMessageText}>ぜひ！新幹線で行く予定です🚄</Text>
            </View>
          </View>
        </View>
      );
    case "reminder":
      return (
        <View style={styles.reminderPreview}>
          <Text style={styles.reminderTitle}>リマインダー設定</Text>
          <View style={styles.reminderOptions}>
            <View style={styles.reminderOption}>
              <Text style={styles.reminderOptionText}>1日前</Text>
              <View style={[styles.reminderToggle, styles.reminderToggleOn]}>
                <View style={styles.reminderToggleKnob} />
              </View>
            </View>
            <View style={styles.reminderOption}>
              <Text style={styles.reminderOptionText}>3時間前</Text>
              <View style={[styles.reminderToggle, styles.reminderToggleOn]}>
                <View style={styles.reminderToggleKnob} />
              </View>
            </View>
            <View style={styles.reminderOption}>
              <Text style={styles.reminderOptionText}>1時間前</Text>
              <View style={styles.reminderToggle}>
                <View style={styles.reminderToggleKnob} />
              </View>
            </View>
          </View>
        </View>
      );
    case "ticket":
      return (
        <View style={styles.ticketPreview}>
          <Text style={styles.ticketTitle}>チケット情報</Text>
          <View style={styles.ticketList}>
            <View style={styles.ticketItem}>
              <Text style={styles.ticketType}>前売り券</Text>
              <Text style={styles.ticketPrice}>¥3,000</Text>
            </View>
            <View style={styles.ticketItem}>
              <Text style={styles.ticketType}>当日券</Text>
              <Text style={styles.ticketPrice}>¥3,500</Text>
            </View>
          </View>
          <View style={styles.ticketButton}>
            <Text style={styles.ticketButtonText}>チケットを購入する →</Text>
          </View>
        </View>
      );
    case "cheer":
      return (
        <View style={styles.cheerPreview}>
          <Text style={styles.cheerTitle}>エールを送る</Text>
          <View style={styles.cheerButtons}>
            <View style={styles.cheerButton}>
              <Text style={styles.cheerEmoji}>👏</Text>
              <Text style={styles.cheerCount}>24</Text>
            </View>
            <View style={styles.cheerButton}>
              <Text style={styles.cheerEmoji}>❤️</Text>
              <Text style={styles.cheerCount}>56</Text>
            </View>
            <View style={styles.cheerButton}>
              <Text style={styles.cheerEmoji}>🔥</Text>
              <Text style={styles.cheerCount}>18</Text>
            </View>
            <View style={styles.cheerButton}>
              <Text style={styles.cheerEmoji}>✨</Text>
              <Text style={styles.cheerCount}>32</Text>
            </View>
          </View>
        </View>
      );
    case "badge":
      return (
        <View style={styles.badgePreview}>
          <Text style={styles.badgeTitle}>獲得バッジ</Text>
          <View style={styles.badgeGrid}>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>🎉</Text>
              <Text style={styles.badgeName}>初参加</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>🌟</Text>
              <Text style={styles.badgeName}>連続参加</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>👑</Text>
              <Text style={styles.badgeName}>常連ファン</Text>
            </View>
            <View style={[styles.badgeItem, styles.badgeItemLocked]}>
              <Text style={styles.badgeEmoji}>🏆</Text>
              <Text style={styles.badgeName}>???</Text>
            </View>
          </View>
        </View>
      );
    case "stats":
      return (
        <View style={styles.statsPreview}>
          <Text style={styles.statsTitle}>統計ダッシュボード</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>65</Text>
              <Text style={styles.statsLabel}>参加者数</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>12</Text>
              <Text style={styles.statsLabel}>都道府県</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>156</Text>
              <Text style={styles.statsLabel}>エール数</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>89%</Text>
              <Text style={styles.statsLabel}>リピート率</Text>
            </View>
          </View>
        </View>
      );
    case "celebration":
      return (
        <View style={styles.celebrationPreview}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>目標達成！</Text>
          <Text style={styles.celebrationSubtitle}>100人の参加表明が集まりました！</Text>
          <View style={styles.celebrationConfetti}>
            <Text style={styles.confettiItem}>🎊</Text>
            <Text style={styles.confettiItem}>✨</Text>
            <Text style={styles.confettiItem}>🎉</Text>
            <Text style={styles.confettiItem}>🌟</Text>
          </View>
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
        <View>
          <Text style={styles.title}>{title}</Text>
          {currentSlide.stepTitle && (
            <Text style={styles.stepTitle}>
              {currentSlide.stepNumber !== undefined && currentSlide.stepNumber > 0 
                ? `STEP ${currentSlide.stepNumber}: ${currentSlide.stepTitle}`
                : currentSlide.stepTitle
              }
            </Text>
          )}
        </View>
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

      {/* プログレスバー（ステップ表示） */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarWrapper}>
          <View 
            style={[
              styles.progressBarFillHeader, 
              { width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{currentSlideIndex + 1} / {totalSlides}</Text>
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

      {/* ナビゲーションボタン（こん太とたぬ姉のキャラクター吹き出し） */}
      <View style={styles.navigation}>
        {/* こん太（戻るボタン） */}
        <Pressable
          onPress={prevSlide}
          disabled={currentSlideIndex === 0}
          style={({ pressed }) => [
            styles.characterNavButton,
            currentSlideIndex === 0 && styles.characterNavButtonDisabled,
            pressed && { transform: [{ scale: 0.95 }] }
          ]}
        >
          <Image
            source={CHARACTER_IMAGES.konta}
            style={styles.navCharacterImage}
            contentFit="contain"
          />
          <View style={[
            styles.navBubble,
            styles.navBubbleLeft,
            currentSlideIndex === 0 && styles.navBubbleDisabled
          ]}>
            <View style={styles.navBubbleTailLeft} />
            <Text style={[
              styles.navBubbleText,
              currentSlideIndex === 0 && styles.navBubbleTextDisabled
            ]}>← 戻る</Text>
          </View>
        </Pressable>

        {/* たぬ姉（次へボタン） */}
        <Pressable
          onPress={nextSlide}
          style={({ pressed }) => [
            styles.characterNavButton,
            pressed && { transform: [{ scale: 0.95 }] }
          ]}
        >
          <View style={[styles.navBubble, styles.navBubbleRight, styles.navBubblePrimary]}>
            <Text style={styles.navBubbleTextPrimary}>
              {isLastSlide ? "完了 ✓" : "次へ →"}
            </Text>
            <View style={styles.navBubbleTailRight} />
          </View>
          <Image
            source={CHARACTER_IMAGES.tanune}
            style={styles.navCharacterImage}
            contentFit="contain"
          />
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  stepTitle: {
    fontSize: 12,
    color: "#FF6B9D",
    marginTop: 4,
    fontWeight: "600",
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
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  progressBarWrapper: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFillHeader: {
    height: "100%",
    backgroundColor: "#FF6B9D",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    minWidth: 50,
    textAlign: "right",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    padding: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  
  // Map preview
  mapPreview: {
    width: "100%",
  },
  mapHeader: {
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  mapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mapRegion: {
    borderRadius: 8,
    padding: 12,
    minWidth: 70,
    alignItems: "center",
  },
  mapRegionName: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "bold",
  },
  mapRegionCount: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
    marginTop: 4,
  },
  
  // Participant styles
  participantRow: {
    flexDirection: "row",
    gap: 8,
  },
  participantCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 80,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  participantInitial: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
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
  
  // Chart preview
  chartPreview: {
    width: "100%",
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 80,
  },
  chartBarItem: {
    alignItems: "center",
  },
  chartBarFill: {
    width: 40,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Notification preview
  notificationPreview: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 320,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EC4899",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIconText: {
    fontSize: 24,
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
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
  
  // Badge/Crown preview
  badgePreview: {
    alignItems: "center",
    width: "100%",
  },
  crownIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  crownEmoji: {
    fontSize: 32,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginTop: 12,
  },
  badgeItem: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    minWidth: 70,
  },
  badgeItemLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 10,
    color: "#ffffff",
  },
  
  // Comment preview
  commentPreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  commentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  commentTime: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
  },
  commentText: {
    fontSize: 14,
    color: "#ffffff",
    lineHeight: 22,
  },
  
  // Invite preview
  invitePreview: {
    alignItems: "center",
    width: "100%",
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  inviteCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  inviteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  inviteButtonActive: {
    backgroundColor: "#4ADE80",
  },
  inviteButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
  inviteButtonTextActive: {
    color: "#1a1a2e",
  },
  inviteCount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4ADE80",
  },
  inviteDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Form preview
  formPreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 6,
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
  formSelect: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formSelectText: {
    fontSize: 14,
    color: "#ffffff",
  },
  formSelectArrow: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  
  // Prefecture preview
  prefectureTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  prefectureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  prefectureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  prefectureButtonSelected: {
    backgroundColor: "#EC4899",
    borderColor: "#EC4899",
  },
  prefectureText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  prefectureTextSelected: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "bold",
  },
  
  // Profile preview
  profilePreview: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
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
    marginTop: 4,
  },
  influencerBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  influencerBadgeText: {
    fontSize: 10,
    color: "#FFD700",
    fontWeight: "bold",
  },
  followButton: {
    backgroundColor: "#1DA1F2",
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  
  // Gender preview
  genderPreview: {
    width: "100%",
    maxWidth: 320,
  },
  genderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  genderChart: {
    flexDirection: "row",
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  genderBar: {
    justifyContent: "center",
    alignItems: "center",
  },
  genderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  genderLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  genderLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  genderLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  genderLegendText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Challenge card preview
  challengeCardPreview: {
    backgroundColor: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.5)",
  },
  challengeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  challengeCardCategory: {
    fontSize: 12,
    color: "#EC4899",
    backgroundColor: "rgba(236, 72, 153, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengeCardDays: {
    fontSize: 12,
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengeCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  challengeCardHost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  challengeCardAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  challengeCardAvatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  challengeCardHostName: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  challengeCardProgress: {
    gap: 8,
  },
  challengeCardProgressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  challengeCardProgressFill: {
    height: "100%",
    backgroundColor: "#4ADE80",
    borderRadius: 4,
  },
  challengeCardProgressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  
  // Progress bar preview
  progressBarPreview: {
    width: "100%",
    maxWidth: 320,
  },
  progressBarTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4ADE80",
    borderRadius: 8,
  },
  progressBarLabels: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },
  progressBarCurrent: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ADE80",
  },
  progressBarGoal: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressBarMilestones: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressBarMilestone: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressBarMilestoneCompleted: {
    backgroundColor: "rgba(74, 222, 128, 0.3)",
  },
  progressBarMilestoneText: {
    fontSize: 10,
    color: "#ffffff",
  },
  
  // Countdown preview
  countdownPreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  countdownTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
  },
  countdownNumbers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countdownItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    minWidth: 60,
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  countdownLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
  },
  countdownSeparator: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.5)",
  },
  countdownDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Achievement preview
  achievementPreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  achievementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementEmoji: {
    fontSize: 40,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
  },
  achievementNames: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  achievementName: {
    fontSize: 12,
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  achievementMore: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  // Share preview
  sharePreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  shareTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  shareButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  shareButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  shareCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    width: "100%",
  },
  shareCardText: {
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
  },
  
  // Ranking preview
  rankingPreview: {
    width: "100%",
    maxWidth: 320,
  },
  rankingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  rankingList: {
    gap: 8,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  rankingItemHighlight: {
    backgroundColor: "rgba(236, 72, 153, 0.3)",
    borderWidth: 1,
    borderColor: "#EC4899",
  },
  rankingPosition: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    width: 24,
    textAlign: "center",
  },
  rankingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankingAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  rankingName: {
    flex: 1,
    fontSize: 14,
    color: "#ffffff",
  },
  rankingScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4ADE80",
  },
  
  // DM preview
  dmPreview: {
    width: "100%",
    maxWidth: 320,
  },
  dmTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  dmMessages: {
    gap: 8,
  },
  dmMessageReceived: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  dmMessageSent: {
    backgroundColor: "#EC4899",
    borderRadius: 12,
    borderTopRightRadius: 4,
    padding: 12,
    maxWidth: "80%",
    alignSelf: "flex-end",
  },
  dmMessageText: {
    fontSize: 14,
    color: "#ffffff",
  },
  
  // Reminder preview
  reminderPreview: {
    width: "100%",
    maxWidth: 320,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  reminderOptions: {
    gap: 12,
  },
  reminderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
  },
  reminderOptionText: {
    fontSize: 14,
    color: "#ffffff",
  },
  reminderToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 2,
  },
  reminderToggleOn: {
    backgroundColor: "#4ADE80",
  },
  reminderToggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  
  // Ticket preview
  ticketPreview: {
    width: "100%",
    maxWidth: 320,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  ticketList: {
    gap: 8,
    marginBottom: 12,
  },
  ticketItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
  },
  ticketType: {
    fontSize: 14,
    color: "#ffffff",
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4ADE80",
  },
  ticketButton: {
    backgroundColor: "#EC4899",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  ticketButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  
  // Cheer preview
  cheerPreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  cheerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  cheerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cheerButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    minWidth: 60,
  },
  cheerEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  cheerCount: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "bold",
  },
  
  // Stats preview
  statsPreview: {
    width: "100%",
    maxWidth: 320,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statsItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statsLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  
  // Celebration preview
  celebrationPreview: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 16,
  },
  celebrationConfetti: {
    flexDirection: "row",
    gap: 16,
  },
  confettiItem: {
    fontSize: 32,
  },
  
  // Navigation
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  
  // キャラクターナビゲーションボタン
  characterNavButton: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  characterNavButtonDisabled: {
    opacity: 0.4,
  },
  navCharacterImage: {
    width: 56,
    height: 56,
  },
  navBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "relative",
    marginBottom: 8,
  },
  navBubbleLeft: {
    marginLeft: -8,
  },
  navBubbleRight: {
    marginRight: -8,
  },
  navBubbleDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  navBubblePrimary: {
    backgroundColor: "#FF6B9D",
  },
  navBubbleTailLeft: {
    position: "absolute",
    left: -6,
    bottom: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderBottomWidth: 6,
    borderBottomColor: "transparent",
    borderRightWidth: 6,
    borderRightColor: "rgba(255, 255, 255, 0.15)",
  },
  navBubbleTailRight: {
    position: "absolute",
    right: -6,
    bottom: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderBottomWidth: 6,
    borderBottomColor: "transparent",
    borderLeftWidth: 6,
    borderLeftColor: "#FF6B9D",
  },
  navBubbleText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  navBubbleTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
  navBubbleTextPrimary: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  
  // 旧ナビゲーション（後方互換用）
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
});
