import { View, Text, ScrollView, Pressable, Alert, Share, TextInput, KeyboardAvoidingView, Platform, Dimensions, Linking } from "react-native";
import * as Haptics from "expo-haptics";
import { color, palette } from "@/theme/tokens";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useRef, useMemo } from "react";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { lookupTwitterUser, getErrorMessage } from "@/lib/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Countdown } from "@/components/atoms/countdown";
import { AppHeader } from "@/components/organisms/app-header";
import { shareToTwitter, shareParticipation } from "@/lib/share";
import { SharePromptModal } from "@/components/molecules/share-prompt-modal";
import { ReminderButton } from "@/components/molecules/reminder-button";
import { OptimizedAvatar } from "@/components/molecules/optimized-image";
import { Skeleton } from "@/components/atoms/skeleton-loader";
import { EventDetailSkeleton } from "@/components/organisms/event-detail-skeleton";
import { JapanHeatmap } from "@/components/organisms/japan-heatmap";
import { JapanBlockMap } from "@/components/organisms/japan-block-map";
import { JapanDeformedMap } from "@/components/organisms/japan-deformed-map";
import { JapanRegionBlocks } from "@/components/organisms/japan-region-blocks";
import { PrefectureParticipantsModal } from "@/components/molecules/prefecture-participants-modal";
import { RegionParticipantsModal } from "@/components/molecules/region-participants-modal";
import { GrowthTrajectoryChart } from "@/components/organisms/growth-trajectory-chart";
import { ParticipantRanking, TopThreeRanking } from "@/components/organisms/participant-ranking";
import { TicketTransferSection } from "@/components/organisms/ticket-transfer-section";
import { CelebrationAnimation } from "@/components/molecules/celebration-animation";
import { TalkingCharacter, ACHIEVEMENT_MESSAGES } from "@/components/molecules/talking-character";
import { HostProfileModal } from "@/components/organisms/host-profile-modal";
import { FanProfileModal } from "@/components/organisms/fan-profile-modal";
import { TwitterUserCard } from "@/components/molecules/twitter-user-card";
import { useFavorites } from "@/hooks/use-favorites";
import { getChallengeColor } from "@/lib/challenge-colors";
import { goalTypeConfig } from "@/constants/goal-types";
import { regionGroups, prefectures } from "@/constants/prefectures";
import {
  RegionMap,
  ParticipantsList,
  ContributionRanking,
  MessageCard,
  MessagesSection,
  ConfirmationModal,
  DeleteParticipationModal,
  type GenderFilter,
  type Companion,
  type LookedUpProfile,
} from "@/features/events/components";
import type { Participation } from "@/types/participation";

const { width: screenWidth } = Dimensions.get("window");

// 進捗グリッドコンポーネント
function ProgressGrid({ current, goal, unit }: { current: number; goal: number; unit: string }) {
  const gridSize = Math.min(goal, 100);
  const filledCount = Math.min(current, gridSize);
  const cellSize = Math.floor((screenWidth - 64) / 10);
  
  return (
    <View style={{ marginVertical: 16 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
        {Array.from({ length: gridSize }).map((_, index) => (
          <View
            key={index}
            style={{
              width: cellSize - 2,
              height: cellSize - 2,
              margin: 1,
              borderRadius: 2,
              backgroundColor: index < filledCount ? color.accentPrimary : color.border,
            }}
          />
        ))}
      </View>
      <Text style={{ color: color.textSecondary, fontSize: 12, textAlign: "center", marginTop: 8 }}>
        1マス = 1{unit}
      </Text>
    </View>
  );
}


export default function ChallengeDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, login } = useAuth();
  
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companionCount, setCompanionCount] = useState(0);
  const [prefecture, setPrefecture] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("")
  const [showForm, setShowForm] = useState(false);
  const [showPrefectureList, setShowPrefectureList] = useState(false);
  const [allowVideoUse, setAllowVideoUse] = useState(true);
  const [selectedPrefectureFilter, setSelectedPrefectureFilter] = useState("all");
  const [showPrefectureFilterList, setShowPrefectureFilterList] = useState(false);
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<GenderFilter>("all");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingParticipationId, setEditingParticipationId] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const messagesRef = useRef<View>(null);
  
  // 友人追加用のstate
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [showAddCompanionForm, setShowAddCompanionForm] = useState(false);
  const [newCompanionName, setNewCompanionName] = useState("");
  const [newCompanionTwitter, setNewCompanionTwitter] = useState("");
  const [isLookingUpTwitter, setIsLookingUpTwitter] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookedUpProfile, setLookedUpProfile] = useState<LookedUpProfile | null>(null);

  // 都道府県別参加者モーダル用のstate
  const [selectedPrefectureForModal, setSelectedPrefectureForModal] = useState<string | null>(null);
  
  // 地域別参加者モーダル用のstate
  const [selectedRegion, setSelectedRegion] = useState<{ name: string; prefectures: string[] } | null>(null);

  // ホストプロフィールモーダル用のstate
  const [showHostProfileModal, setShowHostProfileModal] = useState(false);
  
  // ファンプロフィールモーダル用のstate
  const [selectedFan, setSelectedFan] = useState<{
    twitterId: string;
    username: string;
    displayName: string;
    profileImage?: string;
  } | null>(null);

  // 参加表明削除モーダル用のstate
  const [showDeleteParticipationModal, setShowDeleteParticipationModal] = useState(false);
  const [deleteTargetParticipation, setDeleteTargetParticipation] = useState<Participation | null>(null);

  const challengeId = parseInt(id || "0", 10);
  
  // お気に入り機能
  const { isFavorite, toggleFavorite } = useFavorites();
  const isChallengeFavorite = isFavorite(challengeId);
  
  const { data: challenge, isLoading: challengeLoading } = trpc.events.getById.useQuery({ id: challengeId });
  const { data: participations, isLoading: participationsLoading, refetch } = trpc.participations.listByEvent.useQuery({ eventId: challengeId });
  
  // 自分の参加表明を確認（twitterIdで照合）
  const myParticipation = useMemo(() => {
    if (!user || !participations) return null;
    const twitterId = user.openId?.startsWith("twitter:") 
      ? user.openId.replace("twitter:", "") 
      : user.openId;
    return participations.find(p => p.twitterId === twitterId) || null;
  }, [user, participations]);
  
  // 勢いを計算（24時間以内の参加表明数）
  const momentum = useMemo(() => {
    if (!participations) return { recent24h: 0, recent1h: 0, isHot: false };
    const now = new Date();
    const recent24h = participations.filter(p => {
      const createdAt = new Date(p.createdAt);
      return (now.getTime() - createdAt.getTime()) < 24 * 60 * 60 * 1000;
    }).length;
    const recent1h = participations.filter(p => {
      const createdAt = new Date(p.createdAt);
      return (now.getTime() - createdAt.getTime()) < 60 * 60 * 1000;
    }).length;
    return {
      recent24h,
      recent1h,
      isHot: recent24h >= 5 || recent1h >= 2,
    };
  }, [participations]);
  
  // 友人データを取得
  const { data: challengeCompanions } = trpc.companions.forChallenge.useQuery(
    { challengeId },
    { enabled: challengeId > 0 }
  );
  
  // フォロー状態
  const hostUserId = challenge?.hostUserId;
  const { data: isFollowing } = trpc.follows.isFollowing.useQuery(
    { followeeId: hostUserId! },
    { enabled: !!user && !!hostUserId && hostUserId !== user.id }
  );
  
  const followMutation = trpc.follows.follow.useMutation({
    onSuccess: () => {
      Alert.alert("フォローしました", "新着チャレンジの通知を受け取れます");
    },
  });
  
  const unfollowMutation = trpc.follows.unfollow.useMutation();
  
  // ホストのフォロワーID一覧を取得（ランキング優先表示用）
  const { data: followerIds } = trpc.follows.followerIds.useQuery(
    { userId: hostUserId! },
    { enabled: !!hostUserId }
  );
  
  const handleFollowToggle = () => {
    if (!user) {
      Alert.alert("ログインが必要です", "フォローするにはログインしてください");
      return;
    }
    if (!hostUserId) return;
    
    if (isFollowing) {
      unfollowMutation.mutate({ followeeId: hostUserId });
    } else {
      followMutation.mutate({
        followeeId: hostUserId,
        followeeName: challenge?.hostName,
        followeeImage: challenge?.hostProfileImage || undefined,
      });
    }
  };
  
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [lastParticipation, setLastParticipation] = useState<{
    name: string;
    username?: string;
    image?: string;
    message?: string;
    contribution: number;
  } | null>(null);
  const [isGeneratingOgp, setIsGeneratingOgp] = useState(false);
  const generateOgpMutation = trpc.ogp.generateChallengeOgp.useMutation();

  // 参加表明削除mutation
  const deleteParticipationMutation = trpc.participations.delete.useMutation({
    onSuccess: async () => {
      Alert.alert("参加取消", "参加表明を取り消しました");
      setShowDeleteParticipationModal(false);
      setDeleteTargetParticipation(null);
      await refetch();
    },
    onError: (error) => {
      Alert.alert("エラー", error.message || "削除に失敗しました");
    },
  });

  const createParticipationMutation = trpc.participations.create.useMutation({
    onSuccess: async () => {
      setLastParticipation({
        name: user?.name || "",
        username: user?.username || undefined,
        image: user?.profileImage || undefined,
        message: message || undefined,
        contribution: 1 + companions.length,
      });
      setMessage("");
      setCompanionCount(0);
      setPrefecture("");
      setCompanions([]);
      setShowForm(false);
      
      setJustSubmitted(true);
      await refetch();
      
      setTimeout(() => {
        messagesRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 50, animated: true });
          },
          () => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        );
      }, 600);
      
      setTimeout(() => {
        setShowSharePrompt(true);
      }, 2000);
    },
    onError: (error) => {
      console.error("Participation error:", error);
      const errorMessage = error.message || "参加表明の登録に失敗しました";
      Alert.alert(
        "参加表明エラー",
        errorMessage,
        [
          { text: "もう一度試す", onPress: () => {} },
          { text: "閉じる", style: "cancel" },
        ]
      );
    },
  });
  
  const createAnonymousMutation = trpc.participations.createAnonymous.useMutation({
    onSuccess: () => {
      setMessage("");
      setDisplayName("");
      setCompanionCount(0);
      setPrefecture("");
      setCompanions([]);
      setShowForm(false);
      refetch();
      setShowSharePrompt(true);
    },
  });
  
  // 参加表明更新mutation
  const updateParticipationMutation = trpc.participations.update.useMutation({
    onSuccess: async () => {
      setMessage("");
      setCompanionCount(0);
      setPrefecture("");
      setCompanions([]);
      setShowForm(false);
      setIsEditMode(false);
      setEditingParticipationId(null);
      await refetch();
      Alert.alert("更新完了", "参加表明を更新しました");
    },
    onError: (error) => {
      console.error("Update error:", error);
      Alert.alert("更新に失敗しました", error.message || "もう一度お試しください");
    },
  });

  // エール送信mutation
  const sendCheerMutation = trpc.cheers.send.useMutation({
    onSuccess: () => {
      Alert.alert("👏", "エールを送りました！");
    },
    onError: (error) => {
      Alert.alert("エラー", error.message || "エールの送信に失敗しました");
    },
  });

  const handleSendCheer = (participationId: number, toUserId: number | null) => {
    if (!user) {
      Alert.alert("ログインが必要です", "エールを送るにはログインしてください");
      return;
    }
    sendCheerMutation.mutate({
      toParticipationId: participationId,
      toUserId: toUserId ?? undefined,
      challengeId,
      emoji: "👏",
    });
  };

  // Twitterプロフィール検索
  const lookupTwitterProfile = async (input: string) => {
    if (!input.trim()) {
      setLookedUpProfile(null);
      setLookupError(null);
      return;
    }
    
    setIsLookingUpTwitter(true);
    setLookupError(null);
    
    try {
      const result = await lookupTwitterUser(input.trim());
      
      if (!result.ok) {
        if (result.status === 404) {
          setLookupError("ユーザーが見つかりません");
        } else {
          setLookupError(getErrorMessage(result));
        }
        setLookedUpProfile(null);
        return;
      }
      
      if (result.data) {
        setLookedUpProfile({
          id: result.data.id,
          name: result.data.name,
          username: result.data.username,
          profileImage: result.data.profile_image_url || "",
        });
        if (!newCompanionName.trim()) {
          setNewCompanionName(result.data.name);
        }
      }
    } catch (error) {
      console.error("Twitter lookup error:", error);
      setLookupError("検索に失敗しました");
      setLookedUpProfile(null);
    } finally {
      setIsLookingUpTwitter(false);
    }
  };

  // 友人追加ハンドラー
  const handleAddCompanion = () => {
    const displayName = lookedUpProfile?.name || newCompanionName.trim();
    
    if (!displayName) {
      Alert.alert("エラー", "友人の名前を入力するか、Twitterユーザー名を検索してください");
      return;
    }
    
    const newCompanion: Companion = {
      id: Date.now().toString(),
      displayName: displayName,
      twitterUsername: lookedUpProfile?.username || newCompanionTwitter.trim().replace(/^@/, ""),
      twitterId: lookedUpProfile?.id,
      profileImage: lookedUpProfile?.profileImage,
    };
    setCompanions([...companions, newCompanion]);
    setNewCompanionName("");
    setNewCompanionTwitter("");
    setLookedUpProfile(null);
    setLookupError(null);
    setShowAddCompanionForm(false);
    setCompanionCount(companions.length + 1);
  };

  const handleRemoveCompanion = (id: string) => {
    const updated = companions.filter(c => c.id !== id);
    setCompanions(updated);
    setCompanionCount(Math.max(0, updated.length));
  };

  const handleSubmit = () => {
    if (!user) {
      login();
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    const companionData = companions.map(c => ({
      displayName: c.displayName,
      twitterUsername: c.twitterUsername || undefined,
    }));
    
    if (user) {
      setShowConfirmation(false);
      
      const twitterId = user.openId?.startsWith("twitter:") 
        ? user.openId.replace("twitter:", "") 
        : user.openId;
      
      setTimeout(() => {
        createParticipationMutation.mutate({
          challengeId,
          message,
          companionCount: companions.length,
          prefecture,
          gender: gender || "unspecified",
          twitterId,
          displayName: user.name || "ゲスト",
          username: user.username,
          profileImage: user.profileImage,
          followersCount: user.followersCount,
          companions: companionData,
        });
      }, 100);
    }
  };

  if (challengeLoading) {
    return <EventDetailSkeleton />;
  }

  if (!challenge) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
          <Text style={{ color: color.textSecondary }}>チャレンジが見つかりません</Text>
        </View>
      </ScreenContainer>
    );
  }

  const eventDate = new Date(challenge.eventDate);
  const isDateUndecided = eventDate.getFullYear() === 9999;
  const formattedDate = isDateUndecided ? "日程未定" : `${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;
  
  const goalConfig = goalTypeConfig[challenge.goalType || "attendance"] || goalTypeConfig.attendance;
  const unit = challenge.goalUnit || goalConfig.unit;
  const currentValue = challenge.currentValue || 0;
  const goalValue = challenge.goalValue || 100;
  const progress = Math.min((currentValue / goalValue) * 100, 100);
  const remaining = Math.max(goalValue - currentValue, 0);

  // 都道府県別の参加者数を集計
  const prefectureCounts: { [key: string]: number } = {};
  if (participations) {
    participations.forEach(p => {
      if (p.prefecture) {
        prefectureCounts[p.prefecture] = (prefectureCounts[p.prefecture] || 0) + (p.contribution || 1);
      }
    });
  }

  const handleShare = async () => {
    try {
      const shareMessage = `🎯 ${challenge.title}\n\n📊 現在 ${currentValue}/${goalValue}${unit}（${Math.round(progress)}%）\nあと${remaining}${unit}で目標達成！\n\n一緒に応援しよう！\n\n#KimitoLink #動員ちゃれんじ`;
      await Share.share({ message: shareMessage });
    } catch (error) {
      Alert.alert("エラー", "シェアに失敗しました");
    }
  };

  const handleTwitterShare = async () => {
    const text = `🎯 ${challenge.title}\n\n📊 現在 ${currentValue}/${goalValue}${unit}（${Math.round(progress)}%）\nあと${remaining}${unit}で目標達成！\n\n一緒に応援しよう！`;
    const shareUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/event/${challengeId}`
      : `https://doin-challenge.com/event/${challengeId}`;
    await shareToTwitter(text, shareUrl, ["動員ちゃれんじ", "KimitoLink"]);
  };

  const handleShareWithOgp = async () => {
    try {
      setIsGeneratingOgp(true);
      const result = await generateOgpMutation.mutateAsync({ challengeId });
      
      const shareMessage = `🎯 ${challenge.title}\n\n📊 現在 ${currentValue}/${goalValue}${unit}（${Math.round(progress)}%）\nあと${remaining}${unit}で目標達成！\n\n一緒に応援しよう！\n${result.url || ""}\n\n#KimitoLink #動員ちゃれんじ`;
      
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.error("OGP share error:", error);
      handleShare();
    } finally {
      setIsGeneratingOgp(false);
    }
  };

  // 現在のユーザーのTwitter IDを取得
  const currentUserTwitterId = user?.openId?.startsWith("twitter:") 
    ? user.openId.replace("twitter:", "") 
    : user?.openId;

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView ref={scrollViewRef} style={{ flex: 1, backgroundColor: colors.background }}>
          {/* ヘッダー */}
          <AppHeader 
            title="君斗りんくの動員ちゃれんじ" 
            showCharacters={false}
            showMenu={true}
          />

          {/* ヘッダー画像 */}
          <LinearGradient
            colors={[color.accentPrimary, color.accentAlt]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ marginHorizontal: 16, borderRadius: 16, padding: 20, position: "relative" }}
          >
            {/* 主催者用の編集アイコン */}
            {(() => {
              const userTwitterId = user?.openId?.startsWith("twitter:") 
                ? user.openId.replace("twitter:", "") 
                : user?.openId;
              const isOwner = userTwitterId && challenge?.hostTwitterId === userTwitterId;
              return isOwner ? (
                <Pressable
                  onPress={() => router.push({ pathname: "/edit-challenge/[id]", params: { id: challengeId.toString() } })}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 60,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                >
                  <MaterialIcons name="edit" size={20} color={color.textWhite} />
                </Pressable>
              ) : null;
            })()}
            {/* お気に入りボタン */}
            <Pressable
              onPress={() => toggleFavorite(challengeId)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <MaterialIcons
                name={isChallengeFavorite ? "star" : "star-outline"}
                size={24}
                color={isChallengeFavorite ? color.rankGold : color.textWhite}
              />
            </Pressable>
            {/* ホスト情報 */}
            <TwitterUserCard
              user={{
                twitterId: challenge.hostTwitterId || undefined,
                name: challenge.hostName,
                username: challenge.hostUsername || undefined,
                profileImage: challenge.hostProfileImage || undefined,
                followersCount: challenge.hostFollowersCount || undefined,
                description: challenge.hostDescription || undefined,
              }}
              size="large"
              showFollowers
              showDescription
              onPress={() => setShowHostProfileModal(true)}
              className="mb-4"
            />
            {/* フォローボタン */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 16, marginTop: -8 }}>
              {user && hostUserId && hostUserId !== user.id && (
                <Pressable
                  onPress={handleFollowToggle}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isFollowing ? "rgba(255,255,255,0.2)" : color.textWhite,
                  }}
                >
                  <Text style={{ 
                    color: isFollowing ? color.textWhite : color.accentPrimary, 
                    fontSize: 13, 
                    fontWeight: "bold" 
                  }}>
                    {isFollowing ? "フォロー中" : "フォロー"}
                  </Text>
                </Pressable>
              )}
            </View>

            <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "bold" }}>
              {challenge.title}
            </Text>
          </LinearGradient>

          {/* カウントダウンセクション */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <View
              style={{
                backgroundColor: color.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: color.border,
                overflow: "hidden",
              }}
            >
              {!isDateUndecided ? (
                <LinearGradient
                  colors={["rgba(236, 72, 153, 0.1)", "rgba(139, 92, 246, 0.1)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 4 }}
                >
                  <Countdown targetDate={challenge.eventDate} />
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                  <Text style={{ color: color.accentPrimary, fontSize: 14, fontWeight: "bold" }}>日程未定</Text>
                </View>
              )}
            </View>
          </View>

          {/* 進捗セクション */}
          <View style={{ padding: 16 }}>
            <View
              style={{
                backgroundColor: color.surface,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: color.border,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <Text style={{ color: color.textSecondary, fontSize: 14 }}>現在の達成状況</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={{ color: color.accentPrimary, fontSize: 48, fontWeight: "bold" }}>
                    {currentValue}
                  </Text>
                  <Text style={{ color: color.textHint, fontSize: 20, marginLeft: 4 }}>
                    / {goalValue}{unit}
                  </Text>
                </View>
              </View>

              {/* 進捗バー */}
              <View
                style={{
                  height: 12,
                  backgroundColor: color.border,
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <LinearGradient
                  colors={[color.accentPrimary, color.accentAlt]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    borderRadius: 6,
                  }}
                />
              </View>
              
              {progress >= 100 ? (
                <View style={{ alignItems: "center" }}>
                  <TalkingCharacter
                    size={80}
                    messages={ACHIEVEMENT_MESSAGES}
                    bubblePosition="top"
                  />
                  <Pressable
                    onPress={() => router.push(`/achievement/${challengeId}`)}
                    style={{
                      backgroundColor: color.accentPrimary,
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 24,
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                      🎉 達成記念ページを見る
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={{ color: color.textSecondary, fontSize: 14, textAlign: "center" }}>
                  あと<Text style={{ color: color.accentPrimary, fontWeight: "bold" }}>{remaining}{unit}</Text>で目標達成！
                </Text>
              )}

              {/* 地域別参加者マップ */}
              <JapanRegionBlocks 
                prefectureCounts={prefectureCounts} 
                onPrefecturePress={(prefName) => setSelectedPrefectureForModal(prefName)}
                onRegionPress={(regionName, prefectures) => setSelectedRegion({ name: regionName, prefectures })}
                userPrefecture={myParticipation?.prefecture || undefined}
              />

              {/* 動員までの軌跡グラフ */}
              <GrowthTrajectoryChart
                data={(() => {
                  if (!participations || participations.length === 0) return [];
                  
                  const dateMap = new Map<string, { count: number; milestone?: string }>();
                  let cumulativeCount = 0;
                  
                  const sortedParticipations = [...participations].sort((a, b) => 
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                  
                  sortedParticipations.forEach((p, index) => {
                    const dateKey = new Date(p.createdAt).toISOString().split('T')[0];
                    cumulativeCount += p.contribution || 1;
                    
                    let milestone: string | undefined;
                    if (cumulativeCount === 1) milestone = "最初の参加者!";
                    else if (cumulativeCount === 10) milestone = "10人達成!";
                    else if (cumulativeCount === 50) milestone = "50人達成!";
                    else if (cumulativeCount === 100) milestone = "100人達成!";
                    else if (cumulativeCount === 500) milestone = "500人達成!";
                    else if (cumulativeCount === 1000) milestone = "1000人達成!";
                    
                    dateMap.set(dateKey, { count: cumulativeCount, milestone });
                  });
                  
                  return Array.from(dateMap.entries()).map(([dateStr, data]) => ({
                    date: new Date(dateStr),
                    count: data.count,
                    milestone: data.milestone,
                  }));
                })()}
                targetCount={goalValue}
                title="動員までの軌跡"
              />
            </View>

            {/* イベント情報 */}
            <View
              style={{
                backgroundColor: color.surface,
                borderRadius: 16,
                padding: 16,
                marginTop: 16,
                borderWidth: 1,
                borderColor: color.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <MaterialIcons name="event" size={20} color={color.hostAccentLegacy} />
                <Text style={{ color: colors.foreground, fontSize: 16, marginLeft: 8 }}>
                  {formattedDate}
                </Text>
              </View>

              {challenge.venue && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <MaterialIcons name="place" size={20} color={color.hostAccentLegacy} />
                  <Text style={{ color: colors.foreground, fontSize: 16, marginLeft: 8 }}>
                    {challenge.venue}
                  </Text>
                </View>
              )}

              {challenge.description && (
                <Text style={{ color: color.textSecondary, fontSize: 15, lineHeight: 22 }}>
                  {challenge.description}
                </Text>
              )}
            </View>

            {/* チケット情報セクション */}
            {(challenge.ticketPresale || challenge.ticketDoor || challenge.ticketUrl) && (
              <View
                style={{
                  backgroundColor: color.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: color.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <MaterialIcons name="confirmation-number" size={20} color={color.accentPrimary} />
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                    チケット情報
                  </Text>
                </View>

                {challenge.ticketPresale && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ color: color.textSecondary, fontSize: 14 }}>前売り</Text>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                      ¥{challenge.ticketPresale.toLocaleString()}
                    </Text>
                  </View>
                )}

                {challenge.ticketDoor && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ color: color.textSecondary, fontSize: 14 }}>当日</Text>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                      ¥{challenge.ticketDoor.toLocaleString()}
                    </Text>
                  </View>
                )}

                {challenge.ticketUrl && (
                  <Pressable
                    onPress={() => Linking.openURL(challenge.ticketUrl!)}
                    style={{
                      backgroundColor: color.accentPrimary,
                      borderRadius: 12,
                      padding: 14,
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="open-in-new" size={18} color={colors.foreground} />
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                      チケットを購入する
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* ホスト用管理ボタン */}
            {user && challenge.hostUserId === user.id && (
              <View style={{ gap: 12, marginTop: 16 }}>
                <Pressable
                  onPress={() => router.push(`/dashboard/${challengeId}`)}
                  style={{
                    backgroundColor: color.successDark,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name="bar-chart" size={20} color={colors.foreground} />
                  <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                    統計ダッシュボード
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/manage-comments/${challengeId}`)}
                  style={{
                    backgroundColor: color.accentAlt,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name="star" size={20} color={colors.foreground} />
                  <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                    コメント管理（ピックアップ）
                  </Text>
                </Pressable>
                
                {progress >= 100 && (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        "達成記念ページを作成",
                        "目標達成を記念して、参加者全員の名前を掲載した記念ページを作成しますか？",
                        [
                          { text: "キャンセル", style: "cancel" },
                          {
                            text: "作成する",
                            onPress: async () => {
                              router.push(`/achievement/${challengeId}`);
                            },
                          },
                        ]
                      );
                    }}
                    style={{
                      backgroundColor: color.accentPrimary,
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="celebration" size={20} color={colors.foreground} />
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                      達成記念ページを作成
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => router.push(`/collaborators/${challengeId}`)}
                  style={{
                    backgroundColor: color.info,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name="group-add" size={20} color={colors.foreground} />
                  <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                    共同主催者管理
                  </Text>
                </Pressable>
              </View>
            )}

            {/* 友達を招待ボタン */}
            <Pressable
              onPress={() => router.push(`/invite/${challengeId}`)}
              style={{
                backgroundColor: color.hostAccentLegacy,
                borderRadius: 12,
                padding: 14,
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="person-add" size={20} color={colors.foreground} />
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                友達を招待する
              </Text>
            </Pressable>

            {/* チケット譲渡セクション */}
            <TicketTransferSection
              challengeId={challengeId}
              challengeTitle={challenge.title}
            />

            {/* 地域別マップ */}
            {participations && participations.length > 0 && (
              <RegionMap participations={participations as Participation[]} />
            )}

            {/* 一緒に参加している人 */}
            {participations && participations.length > 0 && (
              <ParticipantsList 
                participations={participations as Participation[]} 
                onFanPress={(fan) => setSelectedFan(fan)}
              />
            )}

            {/* 貢献度ランキング */}
            {participations && participations.length > 0 && (
              <ContributionRanking participations={participations as Participation[]} followerIds={followerIds || []} />
            )}

            {/* 参加者ランキング（トップ3） */}
            {participations && participations.length >= 3 && (
              <View style={{ marginTop: 16, marginHorizontal: 16 }}>
                <View style={{ backgroundColor: color.surface, borderRadius: 16, padding: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <MaterialIcons name="emoji-events" size={24} color={color.rankGold} />
                    <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>貢献トップ3</Text>
                  </View>
                  <TopThreeRanking participants={participations as Participation[]} />
                </View>
              </View>
            )}

            {/* 応援メッセージセクション（コンポーネント化） */}
            {participations && participations.length > 0 && (
              <View ref={messagesRef} style={{ marginTop: 16 }}>
                <MessagesSection
                  participations={participations as Participation[]}
                  challengeCompanions={challengeCompanions}
                  selectedGenderFilter={selectedGenderFilter}
                  onGenderFilterChange={setSelectedGenderFilter}
                  selectedPrefectureFilter={selectedPrefectureFilter}
                  onPrefectureFilterChange={setSelectedPrefectureFilter}
                  showPrefectureFilterList={showPrefectureFilterList}
                  onTogglePrefectureFilterList={() => setShowPrefectureFilterList(!showPrefectureFilterList)}
                  justSubmitted={justSubmitted}
                  currentUserId={user?.id}
                  currentUserTwitterId={currentUserTwitterId}
                  challengeId={challengeId}
                  onCheer={handleSendCheer}
                  onDM={(userId) => router.push(`/messages/${userId}?challengeId=${challengeId}` as never)}
                  onEdit={(participationId) => router.push({ pathname: "/edit-participation/[id]", params: { id: participationId.toString(), challengeId: challengeId.toString() } })}
                  onDelete={(participation) => {
                    setDeleteTargetParticipation(participation);
                    setShowDeleteParticipationModal(true);
                  }}
                />
              </View>
            )}

            {/* 参加表明フォーム */}
            {showForm ? (
              <View
                style={{
                  backgroundColor: color.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: color.border,
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
                  参加表明
                </Text>

                {/* ログインユーザーの場合はTwitterアカウント情報を表示 */}
                {user && (
                  <View style={{ marginBottom: 16, backgroundColor: colors.background, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: color.border }}>
                    <Text style={{ color: color.textSecondary, fontSize: 12, marginBottom: 8 }}>
                      参加者
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      {user.profileImage ? (
                        <Image
                          source={{ uri: user.profileImage }}
                          style={{ width: 48, height: 48, borderRadius: 24 }}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color.accentPrimary, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold" }}>
                            {(user.name || user.username || "ゲ")?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                          {user.name || user.username || "ゲスト"}
                        </Text>
                        {user.username && (
                          <Text style={{ color: color.textSecondary, fontSize: 14, marginTop: 2 }}>
                            @{user.username}
                          </Text>
                        )}
                        {user.followersCount !== undefined && user.followersCount > 0 && (
                          <Text style={{ color: color.accentPrimary, fontSize: 12, marginTop: 4 }}>
                            {user.followersCount.toLocaleString()} フォロワー
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {/* 未ログインの場合はログインを促す */}
                {!user && (
                  <View style={{ marginBottom: 16, backgroundColor: "rgba(236, 72, 153, 0.1)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: color.accentPrimary }}>
                    <Text style={{ color: color.accentPrimary, fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
                      ログインが必要です
                    </Text>
                    <Text style={{ color: color.textSecondary, fontSize: 13, marginBottom: 12 }}>
                      参加表明にはTwitterログインが必要です。
                    </Text>
                    <Pressable
                      onPress={() => login()}
                      style={{
                        backgroundColor: color.twitter,
                        borderRadius: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <MaterialIcons name="login" size={20} color={colors.foreground} />
                      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                        X（Twitter）でログイン
                      </Text>
                    </Pressable>
                  </View>
                )}

                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ color: color.textSecondary, fontSize: 14 }}>
                      都道府県
                    </Text>
                    <Text style={{ color: color.accentPrimary, fontSize: 12, marginLeft: 6, fontWeight: "bold" }}>
                      必須
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setShowPrefectureList(!showPrefectureList)}
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: prefecture ? color.success : color.accentPrimary,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: prefecture ? color.textWhite : color.textHint }}>
                      {prefecture || "選択してください"}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color={color.textHint} />
                  </Pressable>
                  {showPrefectureList && (
                    <View
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 8,
                        marginTop: 4,
                        maxHeight: 200,
                        borderWidth: 1,
                        borderColor: color.border,
                      }}
                    >
                      <ScrollView nestedScrollEnabled>
                        {prefectures.map((pref) => (
                          <Pressable
                            key={pref}
                            onPress={() => {
                              setPrefecture(pref);
                              setShowPrefectureList(false);
                            }}
                            style={{
                              padding: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: color.border,
                            }}
                          >
                            <Text style={{ color: colors.foreground }}>{pref}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* 性別選択（必須） */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ color: color.textSecondary, fontSize: 14 }}>
                      性別
                    </Text>
                    <Text style={{ color: color.accentPrimary, fontSize: 12, marginLeft: 6, fontWeight: "bold" }}>
                      必須
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Pressable
                      onPress={() => setGender("male")}
                      style={{
                        flex: 1,
                        backgroundColor: gender === "male" ? color.info : colors.background,
                        borderRadius: 12,
                        padding: 16,
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: gender === "male" ? color.info : gender === "" ? color.accentPrimary : color.border,
                      }}
                    >
                      <Text style={{ fontSize: 24, marginBottom: 4 }}>👨</Text>
                      <Text style={{ color: gender === "male" ? color.textWhite : color.textSecondary, fontSize: 14, fontWeight: "600" }}>
                        男性
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setGender("female")}
                      style={{
                        flex: 1,
                        backgroundColor: gender === "female" ? color.accentPrimary : colors.background,
                        borderRadius: 12,
                        padding: 16,
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: gender === "female" ? color.accentPrimary : gender === "" ? color.accentPrimary : color.border,
                      }}
                    >
                      <Text style={{ fontSize: 24, marginBottom: 4 }}>👩</Text>
                      <Text style={{ color: gender === "female" ? color.textWhite : color.textSecondary, fontSize: 14, fontWeight: "600" }}>
                        女性
                      </Text>
                    </Pressable>
                  </View>
                  {gender === "" && (
                    <Text style={{ color: color.danger, fontSize: 12, marginTop: 8 }}>
                      性別を選択してください
                    </Text>
                  )}
                </View>

                {/* 一緒に参加する友人セクション */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                      一緒に参加する友人（任意）
                    </Text>
                    <Pressable
                      onPress={() => setShowAddCompanionForm(true)}
                      style={{
                        backgroundColor: color.border,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <MaterialIcons name="person-add" size={16} color={color.accentPrimary} />
                      <Text style={{ color: color.accentPrimary, fontSize: 14, marginLeft: 6 }}>友人を追加</Text>
                    </Pressable>
                  </View>

                  {/* 友人追加フォーム */}
                  {showAddCompanionForm && (
                    <View style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: color.accentPrimary,
                    }}>
                      <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 4 }}>
                        Twitterユーザー名またはURL
                      </Text>
                      <Text style={{ color: color.textHint, fontSize: 12, marginBottom: 8 }}>
                        @username または https://x.com/username
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                        <TextInput
                          value={newCompanionTwitter}
                          onChangeText={(text) => {
                            setNewCompanionTwitter(text);
                            setLookedUpProfile(null);
                            setLookupError(null);
                          }}
                          placeholder="@idolfunch または https://x.com/idolfunch"
                          placeholderTextColor={color.textHint}
                          autoCapitalize="none"
                          style={{
                            flex: 1,
                            backgroundColor: color.surface,
                            borderRadius: 8,
                            padding: 12,
                            color: color.twitter,
                            borderWidth: 1,
                            borderColor: color.border,
                          }}
                        />
                        <Pressable
                          onPress={() => lookupTwitterProfile(newCompanionTwitter)}
                          disabled={isLookingUpTwitter || !newCompanionTwitter.trim()}
                          style={{
                            backgroundColor: isLookingUpTwitter || !newCompanionTwitter.trim() ? color.border : color.twitter,
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: colors.foreground, fontWeight: "bold" }}>
                            {isLookingUpTwitter ? "..." : "検索"}
                          </Text>
                        </Pressable>
                      </View>

                      {lookupError && (
                        <Text style={{ color: color.danger, fontSize: 12, marginBottom: 8 }}>
                          {lookupError}
                        </Text>
                      )}

                      {lookedUpProfile && (
                        <View style={{
                          backgroundColor: color.surface,
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: color.twitter,
                        }}>
                          <Image
                            source={{ uri: lookedUpProfile.profileImage }}
                            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                              {lookedUpProfile.name}
                            </Text>
                            <Text style={{ color: color.twitter, fontSize: 12 }}>
                              @{lookedUpProfile.username}
                            </Text>
                          </View>
                          <MaterialIcons name="check-circle" size={24} color={color.success} />
                        </View>
                      )}

                      <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 4, marginTop: 8 }}>
                        または名前を直接入力
                      </Text>
                      <TextInput
                        value={newCompanionName}
                        onChangeText={setNewCompanionName}
                        placeholder="友人の名前"
                        placeholderTextColor={color.textHint}
                        style={{
                          backgroundColor: color.surface,
                          borderRadius: 8,
                          padding: 12,
                          color: colors.foreground,
                          borderWidth: 1,
                          borderColor: color.border,
                          marginBottom: 12,
                        }}
                      />

                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <Pressable
                          onPress={() => {
                            setShowAddCompanionForm(false);
                            setNewCompanionName("");
                            setNewCompanionTwitter("");
                            setLookedUpProfile(null);
                            setLookupError(null);
                          }}
                          style={{
                            flex: 1,
                            backgroundColor: color.border,
                            borderRadius: 8,
                            padding: 12,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: color.textSecondary }}>キャンセル</Text>
                        </Pressable>
                        <Pressable
                          onPress={handleAddCompanion}
                          disabled={!lookedUpProfile && !newCompanionName.trim()}
                          style={{
                            flex: 1,
                            backgroundColor: (!lookedUpProfile && !newCompanionName.trim()) ? color.border : color.accentPrimary,
                            borderRadius: 8,
                            padding: 12,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: colors.foreground, fontWeight: "bold" }}>追加</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  {/* 登録済み友人リスト */}
                  {companions.length > 0 && (
                    <View style={{ gap: 8 }}>
                      {companions.map((companion) => (
                        <View
                          key={companion.id}
                          style={{
                            backgroundColor: colors.background,
                            borderRadius: 12,
                            padding: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: companion.profileImage ? color.twitter : color.border,
                          }}
                        >
                          {companion.profileImage ? (
                            <Image
                              source={{ uri: companion.profileImage }}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                marginRight: 12,
                              }}
                            />
                          ) : (
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: color.accentPrimary,
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 12,
                              }}
                            >
                              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                                {companion.displayName.charAt(0)}
                              </Text>
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                              {companion.displayName}
                            </Text>
                            {companion.twitterUsername && (
                              <Text style={{ color: color.textSecondary, fontSize: 12 }}>
                                @{companion.twitterUsername}
                              </Text>
                            )}
                          </View>
                          <Pressable
                            onPress={() => handleRemoveCompanion(companion.id)}
                            style={{ padding: 8 }}
                          >
                            <MaterialIcons name="close" size={20} color={color.textHint} />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 貢献度表示 */}
                  <View style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <Text style={{ color: color.textSecondary, fontSize: 14 }}>
                      あなたの貢献
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                      <Text style={{ color: color.accentPrimary, fontSize: 24, fontWeight: "bold" }}>
                        {1 + companions.length}
                      </Text>
                      <Text style={{ color: color.textSecondary, fontSize: 14, marginLeft: 4 }}>人</Text>
                    </View>
                  </View>
                  <Text style={{ color: color.textHint, fontSize: 11, marginTop: 8 }}>
                    ※ 自分 + 友人{companions.length}人 = {1 + companions.length}人の貢献になります
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 8 }}>
                    応援メッセージ（任意）
                  </Text>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="応援メッセージを書いてね"
                    placeholderTextColor={color.textHint}
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      padding: 12,
                      color: colors.foreground,
                      borderWidth: 1,
                      borderColor: color.border,
                      minHeight: 80,
                      textAlignVertical: "top",
                    }}
                  />
                </View>

                {/* 参加条件・お約束 */}
                <View
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: color.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ fontSize: 16 }}>🌈</Text>
                    <Text style={{ color: color.accentPrimary, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                      みんなで楽しく応援するためのお約束
                    </Text>
                  </View>
                  <View style={{ backgroundColor: color.surface, borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <Text style={{ color: color.textSecondary, fontSize: 12, lineHeight: 18 }}>
                      りんくからのお願いだよ～！{"\n"}
                      みんなで仲良く、楽しく応援していこうね♪
                    </Text>
                  </View>
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
                      <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
                        このサイトは「アイドル応援ちゃんねる」が愛情たっぷりで運営してるよ！
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
                      <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
                        素敵なコメントは、応援動画を作るときに使わせてもらうかも！
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
                      <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
                        アイドルちゃんを傷つけるコメントや、迷惑なコメントは絶対ダメだよ～！
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
                      <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
                        みんなの「応援のキモチ」で、アイドルちゃんたちをキラキラさせちゃおう！
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 動画利用許可チェックボックス */}
                <Pressable
                  onPress={() => setAllowVideoUse(!allowVideoUse)}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 20,
                    padding: 12,
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: color.border,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: allowVideoUse ? color.accentPrimary : color.textHint,
                      backgroundColor: allowVideoUse ? color.accentPrimary : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {allowVideoUse && (
                      <MaterialIcons name="check" size={18} color={colors.foreground} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                      応援動画への使用を許可する
                    </Text>
                    <Text style={{ color: color.textSecondary, fontSize: 12, marginTop: 4 }}>
                      あなたのコメントを応援動画に使用させていただく場合があります
                    </Text>
                  </View>
                </Pressable>

                {/* ボタン */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => setShowForm(false)}
                    style={{
                      flex: 1,
                      backgroundColor: color.border,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 16 }}>キャンセル</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={createParticipationMutation.isPending || createAnonymousMutation.isPending || !prefecture || !gender}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: "center",
                      overflow: "hidden",
                      opacity: (!prefecture || !gender) ? 0.5 : 1,
                    }}
                  >
                    <LinearGradient
                      colors={(!prefecture || !gender) ? [color.textHint, color.textDisabled] : [color.accentPrimary, color.accentAlt]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                      }}
                    />
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                      {!prefecture ? "都道府県を選択してください" : "参加表明する"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={{ gap: 12, marginTop: 16 }}>
                {/* シェア・リマインダーボタン */}
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <Pressable
                    onPress={handleShare}
                    style={{
                      flex: 1,
                      backgroundColor: color.surface,
                      borderRadius: 12,
                      padding: 14,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: color.border,
                    }}
                  >
                    <MaterialIcons name="share" size={18} color={colors.foreground} />
                    <Text style={{ color: colors.foreground, fontSize: 14, marginLeft: 6 }}>シェア</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleTwitterShare}
                    style={{
                      flex: 1,
                      backgroundColor: "#000",
                      borderRadius: 12,
                      padding: 14,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>𝕏</Text>
                    <Text style={{ color: colors.foreground, fontSize: 14, marginLeft: 6 }}>Xでシェア</Text>
                  </Pressable>
                </View>
                {/* リマインダーボタン */}
                {challenge.eventDate && (
                  <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    <ReminderButton
                      challengeId={challengeId}
                      challengeTitle={challenge.title}
                      eventDate={new Date(challenge.eventDate)}
                    />
                  </View>
                )}
                <Pressable
                  onPress={() => setShowForm(true)}
                  style={{
                    flex: 2,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[color.accentPrimary, color.accentAlt]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                  />
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                    参加表明する
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 参加表明確認モーダル（コンポーネント化） */}
      <ConfirmationModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={createParticipationMutation.isPending}
        user={user}
        prefecture={prefecture}
        companions={companions}
        message={message}
      />

      {/* シェア促進モーダル */}
      <SharePromptModal
        visible={showSharePrompt}
        onClose={() => {
          setShowSharePrompt(false);
          setLastParticipation(null);
        }}
        challengeTitle={challenge.title}
        hostName={challenge.hostName}
        challengeId={challengeId}
        participantName={lastParticipation?.name}
        participantUsername={lastParticipation?.username}
        participantImage={lastParticipation?.image}
        message={lastParticipation?.message}
        contribution={lastParticipation?.contribution}
      />

      {/* 都道府県別参加者モーダル */}
      <PrefectureParticipantsModal
        visible={!!selectedPrefectureForModal}
        onClose={() => setSelectedPrefectureForModal(null)}
        prefectureName={selectedPrefectureForModal || ""}
        participants={
          participations?.filter(p => {
            if (!selectedPrefectureForModal) return false;
            const normalize = (name: string) => {
              if (!name) return "";
              return name.replace(/(県|府|都|道)$/, "");
            };
            return normalize(p.prefecture || "") === normalize(selectedPrefectureForModal);
          }) || []
        }
      />

      {/* 地域別参加者モーダル */}
      <RegionParticipantsModal
        visible={!!selectedRegion}
        onClose={() => setSelectedRegion(null)}
        regionName={selectedRegion?.name || ""}
        prefectures={selectedRegion?.prefectures || []}
        participants={
          participations?.filter(p => {
            if (!selectedRegion) return false;
            const normalize = (name: string) => {
              if (!name) return "";
              return name.replace(/(県|府|都|道)$/, "");
            };
            const normalizedPref = normalize(p.prefecture || "");
            return selectedRegion.prefectures.some(rp => normalize(rp) === normalizedPref);
          }) || []
        }
      />

      {/* ホストプロフィールモーダル */}
      {challenge && (
        <HostProfileModal
          visible={showHostProfileModal}
          onClose={() => setShowHostProfileModal(false)}
          username={challenge.hostUsername || ""}
          displayName={challenge.hostName}
          profileImage={challenge.hostProfileImage || undefined}
        />
      )}

      {/* ファンプロフィールモーダル */}
      {selectedFan && (
        <FanProfileModal
          visible={!!selectedFan}
          onClose={() => setSelectedFan(null)}
          twitterId={selectedFan.twitterId}
          username={selectedFan.username}
          displayName={selectedFan.displayName}
          profileImage={selectedFan.profileImage}
        />
      )}

      {/* 参加表明削除確認モーダル（コンポーネント化） */}
      <DeleteParticipationModal
        visible={showDeleteParticipationModal}
        onClose={() => {
          setShowDeleteParticipationModal(false);
          setDeleteTargetParticipation(null);
        }}
        onConfirm={() => {
          if (deleteTargetParticipation) {
            deleteParticipationMutation.mutate({ id: deleteTargetParticipation.id });
          }
        }}
        isDeleting={deleteParticipationMutation.isPending}
        participation={deleteTargetParticipation}
      />
    </ScreenContainer>
  );
}
