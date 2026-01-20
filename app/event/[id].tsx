import { Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Share, Dimensions, Linking, Modal } from "react-native";
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
} from "@/features/events/components";

const { width: screenWidth } = Dimensions.get("window");

type Participation = {
  id: number;
  userId: number | null;
  twitterId: string | null;
  displayName: string;
  username: string | null;
  profileImage: string | null;
  message: string | null;
  companionCount: number;
  contribution: number;
  prefecture: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  followersCount?: number | null;
  gender?: "male" | "female" | "unspecified" | null;
};

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // 編集モード
  const [editingParticipationId, setEditingParticipationId] = useState<number | null>(null); // 編集中の参加表明ID
  const scrollViewRef = useRef<ScrollView>(null);
  const messagesRef = useRef<View>(null);
  
  // 友人追加用のstate
  type Companion = {
    id: string;
    displayName: string;
    twitterUsername: string;
    twitterId?: string;
    profileImage?: string;
  };
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [showAddCompanionForm, setShowAddCompanionForm] = useState(false);
  const [newCompanionName, setNewCompanionName] = useState("");
  const [newCompanionTwitter, setNewCompanionTwitter] = useState("");
  const [isLookingUpTwitter, setIsLookingUpTwitter] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookedUpProfile, setLookedUpProfile] = useState<{
    id: string;
    name: string;
    username: string;
    profileImage: string;
  } | null>(null);

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

  // v5.86: 参加表明削除モーダル用のstate
  const [showDeleteParticipationModal, setShowDeleteParticipationModal] = useState(false);
  const [deleteTargetParticipation, setDeleteTargetParticipation] = useState<Participation | null>(null);

  const challengeId = parseInt(id || "0", 10);
  
  // v5.61: お気に入り機能
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

  // v5.86: 参加表明削除mutation
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
      // 参加者情報を保存
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
      
      // 参加表明完了フラグをセット（応援メッセージセクションへスクロール用）
      setJustSubmitted(true);
      
      // データを再取得して最新状態を反映
      await refetch();
      
      // 応援メッセージセクションへスクロール（データ取得後に実行）
      setTimeout(() => {
        // messagesRefの位置を取得してスクロール
        messagesRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 50, animated: true });
          },
          () => {
            // フォールバック: ページ下部へスクロール
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        );
      }, 600);
      
      // シェア促進モーダルを表示（少し遅らせて反映を見せてから）
      setTimeout(() => {
        setShowSharePrompt(true);
      }, 2000);
    },
    onError: (error) => {
      console.error("Participation error:", error);
      // ユーザーフレンドリーなエラーメッセージを表示
      const errorMessage = error.message || "参加表明の登録に失敗しました";
      Alert.alert(
        "参加表明エラー",
        errorMessage,
        [
          {
            text: "もう一度試す",
            onPress: () => {
              // 再試行ロジックはフォームを開いたままにする
            },
          },
          {
            text: "閉じる",
            style: "cancel",
          },
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
      // シェア促進モーダルを表示
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

  const handleSendCheer = (participationId: number, toUserId?: number) => {
    if (!user) {
      Alert.alert("ログインが必要です", "エールを送るにはログインしてください");
      return;
    }
    sendCheerMutation.mutate({
      toParticipationId: participationId,
      toUserId,
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
        // 名前を自動入力
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
    // Twitterプロフィールがあればその名前を使用
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
    // companionCountも更新
    setCompanionCount(companions.length + 1);
  };

  const handleRemoveCompanion = (id: string) => {
    const updated = companions.filter(c => c.id !== id);
    setCompanions(updated);
    setCompanionCount(Math.max(0, updated.length));
  };

  const handleSubmit = () => {
    if (!user) {
      // 未ログインの場合は直接ログイン画面に遷移
      login();
      return;
    }
    // 確認画面を表示
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    // 友人データを整形
    const companionData = companions.map(c => ({
      displayName: c.displayName,
      twitterUsername: c.twitterUsername || undefined,
    }));
    
    if (user) {
      // まず確認画面を閉じる
      setShowConfirmation(false);
      
      // openIdからtwitterIdを抽出（形式: "twitter:{twitterId}"）
      const twitterId = user.openId?.startsWith("twitter:") 
        ? user.openId.replace("twitter:", "") 
        : user.openId;
      
      // 少し遅らせて送信（モーダルが閉じてから）
      setTimeout(() => {
        createParticipationMutation.mutate({
          challengeId,
          message,
          companionCount: companions.length,
          prefecture,
          gender: gender || "unspecified", // v5.86: 性別を送信
          twitterId, // Twitter IDを送信
          displayName: user.name || "ゲスト",
          username: user.username,
          profileImage: user.profileImage,
          followersCount: user.followersCount, // フォロワー数も送信
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
    // URLを含めることでOGPが表示される
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
      // フォールバックとして通常のシェアを実行
      handleShare();
    } finally {
      setIsGeneratingOgp(false);
    }
  };

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
            {/* v5.86: 主催者用の編集アイコン */}
            {(() => {
              const userTwitterId = user?.openId?.startsWith("twitter:") 
                ? user.openId.replace("twitter:", "") 
                : user?.openId;
              const isOwner = userTwitterId && challenge?.hostTwitterId === userTwitterId;
              return isOwner ? (
                <TouchableOpacity
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
                </TouchableOpacity>
              ) : null;
            })()}
            {/* v5.61: お気に入りボタン */}
            <TouchableOpacity
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
            </TouchableOpacity>
            {/* ホスト情報（クリックでプロフィールモーダル表示） */}
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
            {/* フォローボタン（別の行に移動） */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 16, marginTop: -8 }}>
              {/* フォローボタン */}
              {user && hostUserId && hostUserId !== user.id && (
                <TouchableOpacity
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
                </TouchableOpacity>
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
                  {/* 達成お祝いキャラクター */}
                  <TalkingCharacter
                    size={80}
                    messages={ACHIEVEMENT_MESSAGES}
                    bubblePosition="top"
                  />
                  <TouchableOpacity
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
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={{ color: color.textSecondary, fontSize: 14, textAlign: "center" }}>
                  あと<Text style={{ color: color.accentPrimary, fontWeight: "bold" }}>{remaining}{unit}</Text>で目標達成！
                </Text>
              )}

              {/* 地域別参加者マップ（47都道府県デフォルメ地図） */}
              <JapanDeformedMap 
                prefectureCounts={prefectureCounts} 
                onPrefecturePress={(prefName) => setSelectedPrefectureForModal(prefName)}
                onRegionPress={(regionName, prefectures) => setSelectedRegion({ name: regionName, prefectures })}
              />

              {/* 動員までの軌跡グラフ */}
              <GrowthTrajectoryChart
                data={(() => {
                  // 参加者データから時系列データを生成
                  if (!participations || participations.length === 0) return [];
                  
                  // 日付ごとに参加者を集計
                  const dateMap = new Map<string, { count: number; milestone?: string }>();
                  let cumulativeCount = 0;
                  
                  // 参加者を日付順にソート
                  const sortedParticipations = [...participations].sort((a, b) => 
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                  
                  sortedParticipations.forEach((p, index) => {
                    const dateKey = new Date(p.createdAt).toISOString().split('T')[0];
                    cumulativeCount += p.contribution || 1;
                    
                    // マイルストーンを設定
                    let milestone: string | undefined;
                    if (cumulativeCount === 1) milestone = "最初の参加者!";
                    else if (cumulativeCount === 10) milestone = "10人達成!";
                    else if (cumulativeCount === 50) milestone = "50人達成!";
                    else if (cumulativeCount === 100) milestone = "100人達成!";
                    else if (cumulativeCount === 500) milestone = "500人達成!";
                    else if (cumulativeCount === 1000) milestone = "1000人達成!";
                    
                    dateMap.set(dateKey, { count: cumulativeCount, milestone });
                  });
                  
                  // Mapを配列に変換
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

                <View style={{ flexDirection: "row", gap: 16 }}>
                  {challenge.ticketPresale && (
                    <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: color.textSecondary, fontSize: 12, marginBottom: 4 }}>前売り券</Text>
                      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>
                        ¥{challenge.ticketPresale.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {challenge.ticketDoor && (
                    <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: color.textSecondary, fontSize: 12, marginBottom: 4 }}>当日券</Text>
                      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>
                        ¥{challenge.ticketDoor.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                {challenge.ticketUrl && (
                  <TouchableOpacity
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
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ホスト用管理ボタン */}
            {user && challenge.hostUserId === user.id && (
              <View style={{ gap: 12, marginTop: 16 }}>
                <TouchableOpacity
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
                </TouchableOpacity>
                <TouchableOpacity
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
                </TouchableOpacity>
                
                {/* 達成記念ページ作成ボタン（目標達成時のみ） */}
                {progress >= 100 && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "達成記念ページを作成",
                        "目標達成を記念して、参加者全員の名前を掲載した記念ページを作成しますか？",
                        [
                          { text: "キャンセル", style: "cancel" },
                          {
                            text: "作成する",
                            onPress: async () => {
                              // TODO: 達成記念ページ作成APIを呼び出す
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
                  </TouchableOpacity>
                )}
                <TouchableOpacity
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
                </TouchableOpacity>
              </View>
            )}

            {/* 友達を招待ボタン */}
            <TouchableOpacity
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
            </TouchableOpacity>

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

            {/* 応援メッセージ */}
            {participations && participations.length > 0 && (
              <View ref={messagesRef} style={{ marginTop: 16 }}>
                {/* 参加表明完了時のハイライト表示 */}
                {justSubmitted && (
                  <View style={{
                    backgroundColor: color.successDark,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                    borderWidth: 3,
                    borderColor: color.emerald400,
                    shadowColor: color.successDark,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        justifyContent: "center",
                        alignItems: "center",
                      }}>
                        <MaterialIcons name="check-circle" size={32} color={colors.foreground} />
                      </View>
                      <View style={{ marginLeft: 16, flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold" }}>
                          🎉 参加表明完了！
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 4 }}>
                          あなたの応援メッセージが反映されました
                        </Text>
                      </View>
                    </View>
                    <View style={{
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderRadius: 12,
                      padding: 12,
                    }}>
                      <Text style={{ color: colors.foreground, fontSize: 14, textAlign: "center" }}>
                        ⬇️ 下にスクロールしてあなたの投稿を確認してね！
                      </Text>
                    </View>
                  </View>
                )}
                {/* 男女比表示 */}
                {(() => {
                  const maleCount = participations.filter((p: Participation) => p.gender === "male").length;
                  const femaleCount = participations.filter((p: Participation) => p.gender === "female").length;
                  const unspecifiedCount = participations.filter((p: Participation) => !p.gender || p.gender === "unspecified").length;
                  const total = participations.length;
                  const malePercent = total > 0 ? Math.round((maleCount / total) * 100) : 0;
                  const femalePercent = total > 0 ? Math.round((femaleCount / total) * 100) : 0;
                  const unspecifiedPercent = total > 0 ? Math.round((unspecifiedCount / total) * 100) : 0;
                  
                  return (
                    <View style={{
                      backgroundColor: color.surface,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: color.border,
                    }}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <MaterialIcons name="people" size={16} color={color.accentPrimary} />
                        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                          男女比
                        </Text>
                      </View>
                      
                      {/* バー表示 */}
                      <View style={{
                        flexDirection: "row",
                        height: 24,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: colors.background,
                        marginBottom: 8,
                      }}>
                        {maleCount > 0 && (
                          <View style={{
                            width: `${malePercent}%`,
                            backgroundColor: color.info,
                            justifyContent: "center",
                            alignItems: "center",
                          }}>
                            {malePercent >= 15 && (
                              <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>
                                {malePercent}%
                              </Text>
                            )}
                          </View>
                        )}
                        {femaleCount > 0 && (
                          <View style={{
                            width: `${femalePercent}%`,
                            backgroundColor: color.accentPrimary,
                            justifyContent: "center",
                            alignItems: "center",
                          }}>
                            {femalePercent >= 15 && (
                              <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>
                                {femalePercent}%
                              </Text>
                            )}
                          </View>
                        )}
                        {unspecifiedCount > 0 && (
                          <View style={{
                            width: `${unspecifiedPercent}%`,
                            backgroundColor: color.textHint,
                            justifyContent: "center",
                            alignItems: "center",
                          }}>
                            {unspecifiedPercent >= 15 && (
                              <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>
                                {unspecifiedPercent}%
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                      
                      {/* 凡例 */}
                      <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color.info, marginRight: 6 }} />
                          <Text style={{ color: color.textSecondary, fontSize: 12 }}>男性 {maleCount}人</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color.accentPrimary, marginRight: 6 }} />
                          <Text style={{ color: color.textSecondary, fontSize: 12 }}>女性 {femaleCount}人</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color.textHint, marginRight: 6 }} />
                          <Text style={{ color: color.textSecondary, fontSize: 12 }}>未設定 {unspecifiedCount}人</Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                    応援メッセージ ({participations.length}件)
                  </Text>
                  
                  {/* 地域フィルター */}
                  <TouchableOpacity
                    onPress={() => setShowPrefectureFilterList(!showPrefectureFilterList)}
                    style={{
                      backgroundColor: color.surface,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: selectedPrefectureFilter !== "all" ? color.accentPrimary : color.border,
                    }}
                  >
                    <MaterialIcons name="filter-list" size={16} color={selectedPrefectureFilter !== "all" ? color.accentPrimary : color.textSecondary} />
                    <Text style={{ color: selectedPrefectureFilter !== "all" ? color.accentPrimary : color.textSecondary, fontSize: 12, marginLeft: 4 }}>
                      {selectedPrefectureFilter === "all" ? "地域" : selectedPrefectureFilter}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 地域フィルターリスト */}
                {showPrefectureFilterList && (
                  <View style={{ backgroundColor: color.surface, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: color.border }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                      <TouchableOpacity
                        onPress={() => { setSelectedPrefectureFilter("all"); setShowPrefectureFilterList(false); }}
                        style={{
                          backgroundColor: selectedPrefectureFilter === "all" ? color.accentPrimary : color.border,
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: colors.foreground, fontSize: 12 }}>すべて</Text>
                      </TouchableOpacity>
                      {regionGroups.map((region) => (
                        <TouchableOpacity
                          key={region.name}
                          onPress={() => { setSelectedPrefectureFilter(region.name); setShowPrefectureFilterList(false); }}
                          style={{
                            backgroundColor: selectedPrefectureFilter === region.name ? color.accentPrimary : color.border,
                            borderRadius: 16,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            marginRight: 8,
                          }}
                        >
                          <Text style={{ color: colors.foreground, fontSize: 12 }}>{region.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {prefectures.map((pref) => (
                        <TouchableOpacity
                          key={pref}
                          onPress={() => { setSelectedPrefectureFilter(pref); setShowPrefectureFilterList(false); }}
                          style={{
                            backgroundColor: selectedPrefectureFilter === pref ? color.accentPrimary : color.bg,
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                          }}
                        >
                          <Text style={{ color: selectedPrefectureFilter === pref ? color.textWhite : color.textSecondary, fontSize: 11 }}>{pref}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* フィルター適用済みメッセージ一覧 */}
                {participations
                  .filter((p: any) => {
                    if (selectedPrefectureFilter === "all") return true;
                    // 地域グループでフィルター
                    const region = regionGroups.find(r => r.name === selectedPrefectureFilter);
                    if (region) return (region.prefectures as readonly string[]).includes(p.prefecture || "");
                    // 都道府県でフィルター
                    return p.prefecture === selectedPrefectureFilter;
                  })
                  .map((p: any) => {
                    // この参加者の友人をフィルター
                    const participantCompanions = challengeCompanions?.filter(
                      (c: any) => c.participationId === p.id
                    ) || [];
                    // v5.86: twitterIdでも本人確認
                    const userTwitterId = user?.openId?.startsWith("twitter:") 
                      ? user.openId.replace("twitter:", "") 
                      : user?.openId;
                    const isOwnPost = Boolean((user && p.userId === user.id) || (userTwitterId && p.twitterId === userTwitterId));
                    return (
                      <View key={p.id} style={isOwnPost && justSubmitted ? {
                        borderWidth: 3,
                        borderColor: color.successDark,
                        borderRadius: 16,
                        marginBottom: 8,
                        shadowColor: color.successDark,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      } : undefined}>
                        {isOwnPost && justSubmitted && (
                          <View style={{
                            backgroundColor: color.successDark,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderTopLeftRadius: 13,
                            borderTopRightRadius: 13,
                            flexDirection: "row",
                            alignItems: "center",
                          }}>
                            <MaterialIcons name="star" size={18} color={colors.foreground} />
                            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                              ✨ あなたの参加表明が反映されました！
                            </Text>
                          </View>
                        )}
                        <MessageCard 
                          participation={p as Participation} 
                          onCheer={() => handleSendCheer(p.id, p.userId)}
                          onDM={(userId) => router.push(`/messages/${userId}?challengeId=${challengeId}` as never)}
                          challengeId={challengeId}
                          companions={participantCompanions}
                          isOwnPost={isOwnPost}
                          onEdit={() => router.push({ pathname: "/edit-participation/[id]", params: { id: p.id.toString(), challengeId: challengeId.toString() } })}
                          onDelete={() => {
                            setDeleteTargetParticipation(p);
                            setShowDeleteParticipationModal(true);
                          }}
                        />
                      </View>
                    );
                  })}
                
                {participations.filter((p: any) => {
                  if (selectedPrefectureFilter === "all") return true;
                  const region = regionGroups.find(r => r.name === selectedPrefectureFilter);
                  if (region) return (region.prefectures as readonly string[]).includes(p.prefecture || "");
                  return p.prefecture === selectedPrefectureFilter;
                }).length === 0 && selectedPrefectureFilter !== "all" && (
                  <View style={{ alignItems: "center", paddingVertical: 24 }}>
                    <MaterialIcons name="search-off" size={48} color={color.textHint} />
                    <Text style={{ color: color.textSecondary, fontSize: 14, marginTop: 8 }}>
                      {selectedPrefectureFilter}からの参加者はまだいません
                    </Text>
                  </View>
                )}
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
                      {/* Twitterアイコン */}
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
                    <TouchableOpacity
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
                    </TouchableOpacity>
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
                  <TouchableOpacity
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
                  </TouchableOpacity>
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
                          <TouchableOpacity
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
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* v5.86: 性別選択（必須） */}
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
                    <TouchableOpacity
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
                    </TouchableOpacity>
                    <TouchableOpacity
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
                    </TouchableOpacity>
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
                    <TouchableOpacity
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
                    </TouchableOpacity>
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
                      {/* Twitterユーザー名入力（優先） */}
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
                            borderColor: lookedUpProfile ? color.success : color.border,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() => lookupTwitterProfile(newCompanionTwitter)}
                          disabled={isLookingUpTwitter || !newCompanionTwitter.trim()}
                          style={{
                            backgroundColor: isLookingUpTwitter ? color.border : color.twitter,
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            justifyContent: "center",
                            alignItems: "center",
                            opacity: !newCompanionTwitter.trim() ? 0.5 : 1,
                          }}
                        >
                          {isLookingUpTwitter ? (
                            <Text style={{ color: color.textSecondary, fontSize: 14 }}>検索中...</Text>
                          ) : (
                            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold" }}>検索</Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* エラー表示 */}
                      {lookupError && (
                        <View style={{
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 12,
                          flexDirection: "row",
                          alignItems: "center",
                        }}>
                          <MaterialIcons name="error-outline" size={20} color={color.danger} />
                          <Text style={{ color: color.danger, fontSize: 14, marginLeft: 8 }}>{lookupError}</Text>
                        </View>
                      )}

                      {/* 取得したプロフィール表示 */}
                      {lookedUpProfile && (
                        <View style={{
                          backgroundColor: "rgba(34, 197, 94, 0.1)",
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: color.success,
                        }}>
                          <Image
                            source={{ uri: lookedUpProfile.profileImage }}
                            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                              {lookedUpProfile.name}
                            </Text>
                            <Text style={{ color: color.twitter, fontSize: 14 }}>
                              @{lookedUpProfile.username}
                            </Text>
                          </View>
                          <MaterialIcons name="check-circle" size={24} color={color.success} />
                        </View>
                      )}

                      {/* 名前入力（Twitterがない場合のみ必須） */}
                      {!lookedUpProfile && (
                        <>
                          <View style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                            marginVertical: 12,
                          }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: color.border }} />
                            <Text style={{ color: color.textHint, fontSize: 12, marginHorizontal: 12 }}>
                              または名前で追加
                            </Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: color.border }} />
                          </View>
                          <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 8 }}>
                            友人の名前
                          </Text>
                          <TextInput
                            value={newCompanionName}
                            onChangeText={setNewCompanionName}
                            placeholder="ニックネーム"
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
                        </>
                      )}

                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <TouchableOpacity
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
                        </TouchableOpacity>
                        <TouchableOpacity
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
                        </TouchableOpacity>
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
                          <TouchableOpacity
                            onPress={() => handleRemoveCompanion(companion.id)}
                            style={{ padding: 8 }}
                          >
                            <MaterialIcons name="close" size={20} color={color.textHint} />
                          </TouchableOpacity>
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

                {/* 参加条件 */}
                <View
                  style={{
                    backgroundColor: user?.isFollowingTarget ? color.successDark : color.twitter,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons name={user?.isFollowingTarget ? "check-circle" : "favorite"} size={20} color={colors.foreground} />
                  <Text style={{ color: colors.foreground, fontSize: 12, marginLeft: 8, flex: 1 }}>
                    {user?.isFollowingTarget 
                      ? `@${user?.targetAccount?.username || "idolfunch"} をフォロー中 ✨`
                      : "@idolfunch をフォローすると特典がもらえるかも？"}
                  </Text>
                  {!user?.isFollowingTarget && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL("https://twitter.com/idolfunch")}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "bold" }}>フォロー</Text>
                    </TouchableOpacity>
                  )}
                  {user?.isFollowingTarget && (
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "bold" }}>フォロー中</Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
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
                  </TouchableOpacity>
                  <TouchableOpacity
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
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ gap: 12, marginTop: 16 }}>
                {/* シェア・リマインダーボタン */}
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <TouchableOpacity
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
                  </TouchableOpacity>
                  <TouchableOpacity
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
                  </TouchableOpacity>
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
                <TouchableOpacity
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
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 参加表明確認モーダル */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}>
          <View style={{
            backgroundColor: color.surface,
            borderRadius: 16,
            padding: 20,
            width: "100%",
            maxWidth: 400,
            borderWidth: 1,
            borderColor: color.border,
          }}>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>
              この内容でいいですか？
            </Text>

            {/* 参加者情報 */}
            <View style={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: color.border,
            }}>
              <Text style={{ color: color.textSecondary, fontSize: 12, marginBottom: 8 }}>参加者</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    contentFit="cover"
                  />
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color.accentPrimary, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold" }}>
                      {(user?.name || user?.username || "ゲ")?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                    {user?.name || user?.username || "ゲスト"}
                  </Text>
                  {user?.username && (
                    <Text style={{ color: color.textSecondary, fontSize: 14, marginTop: 2 }}>
                      @{user.username}
                    </Text>
                  )}
                  {user?.followersCount !== undefined && user.followersCount > 0 && (
                    <Text style={{ color: color.accentPrimary, fontSize: 12, marginTop: 4 }}>
                      {user.followersCount.toLocaleString()} フォロワー
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* 都道府県 */}
            {prefecture && (
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: color.border,
              }}>
                <Text style={{ color: color.textSecondary, fontSize: 12, marginBottom: 4 }}>都道府県</Text>
                <Text style={{ color: colors.foreground, fontSize: 16 }}>{prefecture}</Text>
              </View>
            )}

            {/* 友人 */}
            {companions.length > 0 && (
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: color.border,
              }}>
                <Text style={{ color: color.textSecondary, fontSize: 12, marginBottom: 8 }}>一緒に参加する友人（{companions.length}人）</Text>
                <View style={{ gap: 8 }}>
                  {companions.map((c) => (
                    <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {c.profileImage ? (
                        <Image source={{ uri: c.profileImage }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                      ) : (
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color.accentAlt, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ color: colors.foreground, fontSize: 10 }}>{c.displayName.charAt(0)}</Text>
                        </View>
                      )}
                      <Text style={{ color: colors.foreground, fontSize: 14 }}>{c.displayName}</Text>
                      {c.twitterUsername && (
                        <Text style={{ color: color.textSecondary, fontSize: 12 }}>@{c.twitterUsername}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 応援メッセージ */}
            {message && (
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: color.border,
              }}>
                <Text style={{ color: color.textSecondary, fontSize: 12, marginBottom: 4 }}>応援メッセージ</Text>
                <Text style={{ color: colors.foreground, fontSize: 14 }}>{message}</Text>
              </View>
            )}

            {/* 貢献度 */}
            <View style={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: color.border,
            }}>
              <Text style={{ color: color.textSecondary, fontSize: 14 }}>あなたの貢献</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ color: color.accentPrimary, fontSize: 24, fontWeight: "bold" }}>
                  {1 + companions.length}
                </Text>
                <Text style={{ color: color.textSecondary, fontSize: 14, marginLeft: 4 }}>人</Text>
              </View>
            </View>

            {/* ボタン */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowConfirmation(false)}
                style={{
                  flex: 1,
                  backgroundColor: color.border,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 16 }}>戻る</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmSubmit}
                disabled={createParticipationMutation.isPending}
                style={{
                  flex: 1,
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
                  {createParticipationMutation.isPending ? "送信中..." : "参加表明する"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            // 都道府県名の正規化（「県」「府」「都」「道」の有無を吸収）
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

      {/* v5.86: 参加表明削除確認モーダル */}
      <Modal
        visible={showDeleteParticipationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteParticipationModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}>
          <View style={{
            backgroundColor: color.surface,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 400,
            borderWidth: 1,
            borderColor: color.border,
          }}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <MaterialIcons name="warning" size={48} color={color.danger} />
              <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold", marginTop: 12 }}>
                参加表明を取り消しますか？
              </Text>
              <Text style={{ color: color.textSecondary, fontSize: 14, textAlign: "center", marginTop: 8 }}>
                この操作は取り消すことができません。
              </Text>
            </View>

            {deleteTargetParticipation && (
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: color.border,
              }}>
                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                  {deleteTargetParticipation.displayName}
                </Text>
                {deleteTargetParticipation.message && (
                  <Text style={{ color: color.textSecondary, fontSize: 13, marginTop: 4 }} numberOfLines={2}>
                    {deleteTargetParticipation.message}
                  </Text>
                )}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteParticipationModal(false);
                  setDeleteTargetParticipation(null);
                }}
                style={{
                  flex: 1,
                  backgroundColor: color.border,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 16 }}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (deleteTargetParticipation) {
                    deleteParticipationMutation.mutate({ id: deleteTargetParticipation.id });
                  }
                }}
                disabled={deleteParticipationMutation.isPending}
                style={{
                  flex: 1,
                  backgroundColor: color.danger,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  opacity: deleteParticipationMutation.isPending ? 0.5 : 1,
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                  {deleteParticipationMutation.isPending ? "削除中..." : "取り消す"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
