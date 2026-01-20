// features/events/hooks/useEventDetailScreen.ts
// イベント詳細画面用のカスタムフック（GPTテンプレートベース）

import { useState, useMemo, useCallback, useRef } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { lookupTwitterUser, getErrorMessage } from "@/lib/api";

import { toEventDetailVM, type EventDetailVM } from "../mappers/eventDetailVM";
import { 
  toParticipationVMList, 
  toCompanionVMList,
  toFanVM,
  type ParticipationVM, 
  type CompanionVM,
  type FanVM,
} from "../mappers/participationVM";
import { regionGroups, normalizePrefecture } from "../utils/prefectures";
import type { ProgressItemVM } from "../ui/components/ProgressGrid";
import type { RegionGroupVM } from "../ui/components/RegionMap";
import type { RankingItemVM } from "../ui/components/ContributionRanking";
import type { MessageVM } from "../ui/components/MessageCard";

// ========================================
// 型定義
// ========================================

/**
 * フォーム入力状態
 */
export type ParticipationFormState = {
  message: string;
  displayName: string;
  companionCount: number;
  prefecture: string;
  gender: "male" | "female" | "unspecified" | "";
  allowVideoUse: boolean;
  companions: CompanionInput[];
};

export type CompanionInput = {
  id: string;
  displayName: string;
  twitterUsername: string;
  twitterId?: string;
  profileImage?: string;
};

/**
 * UI制御状態
 */
export type UiState = {
  showForm: boolean;
  showPrefectureList: boolean;
  showPrefectureFilterList: boolean;
  showConfirmation: boolean;
  justSubmitted: boolean;
  isEditMode: boolean;
  editingParticipationId: number | null;
  selectedPrefectureFilter: string;
  showAddCompanionForm: boolean;
  newCompanionName: string;
  newCompanionTwitter: string;
  isLookingUpTwitter: boolean;
  lookupError: string | null;
  lookedUpProfile: {
    id: string;
    name: string;
    username: string;
    profileImage: string;
  } | null;
};

/**
 * モーダル表示状態
 */
export type ModalState = {
  showSharePrompt: boolean;
  showHostProfileModal: boolean;
  showDeleteParticipationModal: boolean;
  selectedPrefectureForModal: string | null;
  selectedRegion: { name: string; prefectures: string[] } | null;
};

/**
 * モーダルターゲット
 */
export type ModalTargets = {
  selectedFan: FanVM | null;
  deleteTargetParticipation: ParticipationVM | null;
  lastParticipation: {
    name: string;
    username?: string;
    image?: string;
    message?: string;
    contribution: number;
  } | null;
};

/**
 * ステータス
 */
export type UseEventDetailScreenStatus = {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isMutating: boolean;
  isGeneratingOgp: boolean;
};

/**
 * アクション
 */
export type UseEventDetailScreenActions = {
  // フォーム操作
  setMessage: (v: string) => void;
  setDisplayName: (v: string) => void;
  setCompanionCount: (v: number) => void;
  setPrefecture: (v: string) => void;
  setGender: (v: "male" | "female" | "unspecified" | "") => void;
  setAllowVideoUse: (v: boolean) => void;
  
  // UI操作
  openParticipationForm: () => void;
  closeParticipationForm: () => void;
  openEditMode: (participation: ParticipationVM) => void;
  togglePrefectureList: () => void;
  togglePrefectureFilterList: () => void;
  setSelectedPrefectureFilter: (v: string) => void;
  
  // 友人追加
  openAddCompanionForm: () => void;
  closeAddCompanionForm: () => void;
  setNewCompanionName: (v: string) => void;
  setNewCompanionTwitter: (v: string) => void;
  lookupTwitterProfile: (input: string) => Promise<void>;
  addCompanion: () => void;
  removeCompanion: (id: string) => void;
  
  // モーダル操作
  openSharePrompt: () => void;
  closeSharePrompt: () => void;
  openHostProfile: () => void;
  closeHostProfile: () => void;
  openFanProfile: (fan: FanVM) => void;
  closeFanProfile: () => void;
  openPrefectureParticipants: (prefecture: string) => void;
  closePrefectureParticipants: () => void;
  openRegionParticipants: (region: RegionGroupVM) => void;
  closeRegionParticipants: () => void;
  openDeleteParticipation: (participation: ParticipationVM) => void;
  closeDeleteParticipation: () => void;
  
  // ミューテーション
  submitParticipation: () => void;
  submitAnonymousParticipation: () => void;
  updateParticipation: () => void;
  deleteParticipation: () => void;
  toggleFollow: () => void;
  toggleFavorite: () => void;
  sendCheer: (participationId: number, toUserId?: number) => void;
  generateOgp: () => Promise<string | null>;
  
  // ナビゲーション
  goBack: () => void;
  
  // Ref
  scrollViewRef: React.RefObject<ScrollView | null>;
  messagesRef: React.RefObject<View | null>;
};

/**
 * フック返り値
 */
export type UseEventDetailScreenResult = {
  vm: EventDetailVM | undefined;
  participations: ParticipationVM[];
  companions: CompanionVM[];
  myParticipation: ParticipationVM | null;
  
  // 集計済みVM
  progressItems: ProgressItemVM[];
  regions: RegionGroupVM[];
  ranking: RankingItemVM[];
  messages: MessageVM[];
  momentum: { recent24h: number; recent1h: number; isHot: boolean };
  
  // フォロー関連
  isFollowingHost: boolean;
  followerIdSet: Set<string>;
  isFavorite: boolean;
  
  // 状態
  form: ParticipationFormState;
  ui: UiState;
  modals: ModalState;
  targets: ModalTargets;
  status: UseEventDetailScreenStatus;
  actions: UseEventDetailScreenActions;
};

// ========================================
// フック本体
// ========================================

export function useEventDetailScreen(challengeId: number): UseEventDetailScreenResult {
  const router = useRouter();
  const { user, login } = useAuth();
  const { isFavorite: checkFavorite, toggleFavorite: toggleFav } = useFavorites();
  
  // Refs
  const scrollViewRef = useRef<ScrollView | null>(null);
  const messagesRef = useRef<View | null>(null);
  
  // ========================================
  // フォーム状態
  // ========================================
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companionCount, setCompanionCount] = useState(0);
  const [prefecture, setPrefecture] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unspecified" | "">("");
  const [allowVideoUse, setAllowVideoUse] = useState(true);
  const [companions, setCompanions] = useState<CompanionInput[]>([]);
  
  // ========================================
  // UI状態
  // ========================================
  const [showForm, setShowForm] = useState(false);
  const [showPrefectureList, setShowPrefectureList] = useState(false);
  const [showPrefectureFilterList, setShowPrefectureFilterList] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingParticipationId, setEditingParticipationId] = useState<number | null>(null);
  const [selectedPrefectureFilter, setSelectedPrefectureFilter] = useState("all");
  
  // 友人追加UI
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
  
  // ========================================
  // モーダル状態
  // ========================================
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [showHostProfileModal, setShowHostProfileModal] = useState(false);
  const [showDeleteParticipationModal, setShowDeleteParticipationModal] = useState(false);
  const [selectedPrefectureForModal, setSelectedPrefectureForModal] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<{ name: string; prefectures: string[] } | null>(null);
  const [selectedFan, setSelectedFan] = useState<FanVM | null>(null);
  const [deleteTargetParticipation, setDeleteTargetParticipation] = useState<ParticipationVM | null>(null);
  const [lastParticipation, setLastParticipation] = useState<{
    name: string;
    username?: string;
    image?: string;
    message?: string;
    contribution: number;
  } | null>(null);
  const [isGeneratingOgp, setIsGeneratingOgp] = useState(false);
  
  // ========================================
  // tRPC Queries
  // ========================================
  const { 
    data: challengeData, 
    isLoading: challengeLoading,
    isError: challengeError,
    error: challengeErrorData,
  } = trpc.events.getById.useQuery(
    { id: challengeId },
    { enabled: challengeId > 0 }
  );
  
  const { 
    data: participationsData, 
    isLoading: participationsLoading,
    refetch: refetchParticipations,
  } = trpc.participations.listByEvent.useQuery(
    { eventId: challengeId },
    { enabled: challengeId > 0 }
  );
  
  const { data: challengeCompanions } = trpc.companions.forChallenge.useQuery(
    { challengeId },
    { enabled: challengeId > 0 }
  );
  
  const hostUserId = challengeData?.hostUserId;
  
  const { data: isFollowingData } = trpc.follows.isFollowing.useQuery(
    { followeeId: hostUserId! },
    { enabled: !!user && !!hostUserId && hostUserId !== user.id }
  );
  
  const { data: followerIdsData } = trpc.follows.followerIds.useQuery(
    { userId: hostUserId! },
    { enabled: !!hostUserId }
  );
  
  // ========================================
  // tRPC Mutations
  // ========================================
  const followMutation = trpc.follows.follow.useMutation({
    onSuccess: () => {
      Alert.alert("フォローしました", "新着チャレンジの通知を受け取れます");
    },
  });
  
  const unfollowMutation = trpc.follows.unfollow.useMutation();
  
  const generateOgpMutation = trpc.ogp.generateChallengeOgp.useMutation();
  
  const deleteParticipationMutation = trpc.participations.delete.useMutation({
    onSuccess: async () => {
      Alert.alert("参加取消", "参加表明を取り消しました");
      setShowDeleteParticipationModal(false);
      setDeleteTargetParticipation(null);
      await refetchParticipations();
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
      resetForm();
      setJustSubmitted(true);
      await refetchParticipations();
      
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
      Alert.alert("参加表明エラー", error.message || "参加表明の登録に失敗しました");
    },
  });
  
  const createAnonymousMutation = trpc.participations.createAnonymous.useMutation({
    onSuccess: () => {
      resetForm();
      refetchParticipations();
      setShowSharePrompt(true);
    },
  });
  
  const updateParticipationMutation = trpc.participations.update.useMutation({
    onSuccess: async () => {
      resetForm();
      setIsEditMode(false);
      setEditingParticipationId(null);
      await refetchParticipations();
      Alert.alert("更新完了", "参加表明を更新しました");
    },
    onError: (error) => {
      Alert.alert("更新に失敗しました", error.message || "もう一度お試しください");
    },
  });
  
  const sendCheerMutation = trpc.cheers.send.useMutation({
    onSuccess: () => {
      Alert.alert("👏", "エールを送りました！");
    },
    onError: (error) => {
      Alert.alert("エラー", error.message || "エールの送信に失敗しました");
    },
  });
  
  // ========================================
  // ヘルパー関数
  // ========================================
  const resetForm = useCallback(() => {
    setMessage("");
    setDisplayName("");
    setCompanionCount(0);
    setPrefecture("");
    setGender("");
    setCompanions([]);
    setShowForm(false);
  }, []);
  
  // ========================================
  // データ変換（VM化）
  // ========================================
  const vm = useMemo(() => {
    if (!challengeData) return undefined;
    return toEventDetailVM(challengeData as any);
  }, [challengeData]);
  
  const participations = useMemo(() => {
    if (!participationsData) return [];
    return toParticipationVMList(participationsData as any);
  }, [participationsData]);
  
  const companionsVM = useMemo(() => {
    if (!challengeCompanions) return [];
    return toCompanionVMList(challengeCompanions as any);
  }, [challengeCompanions]);
  
  // 自分の参加表明
  const myParticipation = useMemo(() => {
    if (!user || !participations.length) return null;
    const twitterId = user.openId?.startsWith("twitter:") 
      ? user.openId.replace("twitter:", "") 
      : user.openId;
    return participations.find(p => p.twitterId === twitterId) || null;
  }, [user, participations]);
  
  // 勢い計算
  const momentum = useMemo(() => {
    if (!participations.length) return { recent24h: 0, recent1h: 0, isHot: false };
    const now = new Date();
    const recent24h = participations.filter(p => {
      return (now.getTime() - p.createdAt.getTime()) < 24 * 60 * 60 * 1000;
    }).length;
    const recent1h = participations.filter(p => {
      return (now.getTime() - p.createdAt.getTime()) < 60 * 60 * 1000;
    }).length;
    return {
      recent24h,
      recent1h,
      isHot: recent24h >= 5 || recent1h >= 2,
    };
  }, [participations]);
  
  // 進捗グリッド
  const progressItems = useMemo((): ProgressItemVM[] => {
    const participantCount = participations.length;
    const goalTarget = vm?.goalTarget ?? 0;
    const progressPercent = goalTarget > 0 
      ? Math.min(100, Math.round((participantCount / goalTarget) * 100)) 
      : 0;
    
    // 都道府県数
    const prefectureSet = new Set(
      participations
        .map(p => p.prefectureNormalized)
        .filter(Boolean)
    );
    
    // 総貢献度（参加者 + 同行者）
    const totalContribution = participations.reduce(
      (sum, p) => sum + 1 + (p.companionCount || 0), 
      0
    );
    
    return [
      {
        key: "participants",
        label: "参加者",
        valueText: `${participantCount}人`,
        subText: goalTarget > 0 ? `目標: ${goalTarget}人` : undefined,
      },
      {
        key: "progress",
        label: "達成率",
        valueText: `${progressPercent}%`,
        subText: goalTarget > 0 && participantCount < goalTarget 
          ? `あと${goalTarget - participantCount}人` 
          : undefined,
      },
      {
        key: "prefectures",
        label: "都道府県",
        valueText: `${prefectureSet.size}`,
        subText: "地域から参加",
      },
      {
        key: "contribution",
        label: "総動員",
        valueText: `${totalContribution}人`,
        subText: "参加者+同行者",
      },
    ];
  }, [participations, vm]);
  
  // 地域グループ（参加者数付き）
  const regions = useMemo((): RegionGroupVM[] => {
    const countsByPref = new Map<string, number>();
    for (const p of participations) {
      const key = p.prefectureNormalized;
      if (!key) continue;
      countsByPref.set(key, (countsByPref.get(key) ?? 0) + 1);
    }
    
    return regionGroups.map((r) => {
      const count = r.prefectures.reduce((sum, pref) => {
        const key = normalizePrefecture(pref);
        return sum + (countsByPref.get(key) ?? 0);
      }, 0);
      
      return {
        id: r.id,
        name: r.name,
        prefectures: r.prefectures,
        count,
        countText: count > 0 ? `${count}人` : undefined,
      };
    });
  }, [participations]);
  
  // 貢献ランキング
  const ranking = useMemo((): RankingItemVM[] => {
    const rows = [...participations]
      .map((p) => {
        // 貢献度 = 1（自分） + 同行者数
        const value = 1 + (p.companionCount || 0);
        return { p, value };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    return rows.map(({ p, value }, idx) => ({
      key: p.id,
      rank: idx + 1,
      twitterId: p.twitterId,
      displayName: p.displayName,
      username: p.username ?? undefined,
      profileImage: p.profileImage ?? undefined,
      valueText: `${value}人`,
    }));
  }, [participations]);
  
  // メッセージ一覧
  const messages = useMemo((): MessageVM[] => {
    return participations
      .filter((p) => !!p.message)
      .map((p) => ({
        id: `p-${p.id}`,
        twitterId: p.twitterId,
        displayName: p.displayName,
        username: p.username ?? undefined,
        profileImage: p.profileImage ?? undefined,
        message: p.message ?? "",
        createdAtText: p.createdAtText ?? undefined,
      }));
  }, [participations]);
  
  // フォロワーIDセット
  const followerIdSet = useMemo(() => {
    return new Set((followerIdsData ?? []).map(String));
  }, [followerIdsData]);
  
  // ========================================
  // アクション
  // ========================================
  const lookupTwitterProfileAction = useCallback(async (input: string) => {
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
      setLookupError("検索に失敗しました");
      setLookedUpProfile(null);
    } finally {
      setIsLookingUpTwitter(false);
    }
  }, [newCompanionName]);
  
  const addCompanion = useCallback(() => {
    if (!newCompanionName.trim()) {
      Alert.alert("名前を入力してください");
      return;
    }
    
    const newCompanion: CompanionInput = {
      id: Date.now().toString(),
      displayName: newCompanionName.trim(),
      twitterUsername: newCompanionTwitter.trim().replace("@", ""),
      twitterId: lookedUpProfile?.id,
      profileImage: lookedUpProfile?.profileImage,
    };
    
    setCompanions(prev => [...prev, newCompanion]);
    setNewCompanionName("");
    setNewCompanionTwitter("");
    setLookedUpProfile(null);
    setShowAddCompanionForm(false);
  }, [newCompanionName, newCompanionTwitter, lookedUpProfile]);
  
  const removeCompanion = useCallback((id: string) => {
    setCompanions(prev => prev.filter(c => c.id !== id));
  }, []);
  
  const submitParticipation = useCallback(() => {
    if (!user) {
      Alert.alert("ログインが必要です", "参加表明するにはログインしてください");
      return;
    }
    
    // tRPCの型定義に合わせて必須フィールドを追加
    const twitterId = user.openId?.startsWith("twitter:") 
      ? user.openId.replace("twitter:", "") 
      : user.openId;
    
    createParticipationMutation.mutate({
      challengeId,
      displayName: user.name || "",
      twitterId: twitterId || undefined,
      username: user.username || undefined,
      profileImage: user.profileImage || undefined,
      followersCount: user.followersCount || undefined,
      message: message.trim() || undefined,
      companionCount: companions.length,
      prefecture: prefecture || undefined,
      gender: gender || undefined,
      companions: companions.map(c => ({
        displayName: c.displayName,
        twitterUsername: c.twitterUsername || undefined,
        twitterId: c.twitterId,
        profileImage: c.profileImage,
      })),
    });
  }, [user, challengeId, message, companions, prefecture, gender, createParticipationMutation]);
  
  const submitAnonymousParticipation = useCallback(() => {
    if (!displayName.trim()) {
      Alert.alert("名前を入力してください");
      return;
    }
    
    createAnonymousMutation.mutate({
      challengeId,
      displayName: displayName.trim(),
      message: message.trim() || undefined,
      companionCount: companions.length,
      prefecture: prefecture || undefined,
      companions: companions.map(c => ({
        displayName: c.displayName,
        twitterUsername: c.twitterUsername || undefined,
        twitterId: c.twitterId,
        profileImage: c.profileImage,
      })),
    });
  }, [challengeId, displayName, message, companions, prefecture, createAnonymousMutation]);
  
  const updateParticipation = useCallback(() => {
    if (!editingParticipationId) return;
    
    updateParticipationMutation.mutate({
      id: editingParticipationId,
      message: message.trim() || undefined,
      companionCount: companions.length,
      prefecture: prefecture || undefined,
      gender: (gender || undefined) as "male" | "female" | "unspecified" | undefined,
      companions: companions.map(c => ({
        displayName: c.displayName,
        twitterUsername: c.twitterUsername || undefined,
        twitterId: c.twitterId,
        profileImage: c.profileImage,
      })),
    });
  }, [editingParticipationId, message, companions, prefecture, gender, allowVideoUse, updateParticipationMutation]);
  
  const deleteParticipation = useCallback(() => {
    if (!deleteTargetParticipation) return;
    deleteParticipationMutation.mutate({ id: parseInt(deleteTargetParticipation.id) });
  }, [deleteTargetParticipation, deleteParticipationMutation]);
  
  const toggleFollow = useCallback(() => {
    if (!user) {
      Alert.alert("ログインが必要です", "フォローするにはログインしてください");
      return;
    }
    if (!hostUserId) return;
    
    if (isFollowingData) {
      unfollowMutation.mutate({ followeeId: hostUserId });
    } else {
      followMutation.mutate({
        followeeId: hostUserId,
        followeeName: challengeData?.hostName,
        followeeImage: challengeData?.hostProfileImage || undefined,
      });
    }
  }, [user, hostUserId, isFollowingData, challengeData, followMutation, unfollowMutation]);
  
  const toggleFavorite = useCallback(() => {
    toggleFav(challengeId);
  }, [challengeId, toggleFav]);
  
  const sendCheer = useCallback((participationId: number, toUserId?: number) => {
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
  }, [user, challengeId, sendCheerMutation]);
  
  const generateOgp = useCallback(async (): Promise<string | null> => {
    if (!challengeData) return null;
    
    setIsGeneratingOgp(true);
    try {
      const result = await generateOgpMutation.mutateAsync({
        challengeId,
      });
      return result.url ?? null;
    } catch (error) {
      console.error("OGP generation error:", error);
      return null;
    } finally {
      setIsGeneratingOgp(false);
    }
  }, [challengeData, challengeId, participations.length, generateOgpMutation]);
  
  const openEditMode = useCallback((participation: ParticipationVM) => {
    setMessage(participation.message || "");
    setPrefecture(participation.prefecture || "");
    setGender((participation.gender || "") as "male" | "female" | "unspecified" | "");
    setCompanionCount(participation.companionCount);
    setIsEditMode(true);
    setEditingParticipationId(parseInt(participation.id));
    setShowForm(true);
  }, []);
  
  const goBack = useCallback(() => {
    router.back();
  }, [router]);
  
  // ========================================
  // 返り値
  // ========================================
  const form: ParticipationFormState = {
    message,
    displayName,
    companionCount,
    prefecture,
    gender,
    allowVideoUse,
    companions,
  };
  
  const ui: UiState = {
    showForm,
    showPrefectureList,
    showPrefectureFilterList,
    showConfirmation,
    justSubmitted,
    isEditMode,
    editingParticipationId,
    selectedPrefectureFilter,
    showAddCompanionForm,
    newCompanionName,
    newCompanionTwitter,
    isLookingUpTwitter,
    lookupError,
    lookedUpProfile,
  };
  
  const modals: ModalState = {
    showSharePrompt,
    showHostProfileModal,
    showDeleteParticipationModal,
    selectedPrefectureForModal,
    selectedRegion,
  };
  
  const targets: ModalTargets = {
    selectedFan,
    deleteTargetParticipation,
    lastParticipation,
  };
  
  const status: UseEventDetailScreenStatus = {
    isLoading: challengeLoading || participationsLoading,
    isError: challengeError,
    errorMessage: challengeErrorData?.message ?? null,
    isMutating: createParticipationMutation.isPending || 
                createAnonymousMutation.isPending || 
                updateParticipationMutation.isPending ||
                deleteParticipationMutation.isPending,
    isGeneratingOgp,
  };
  
  const actions: UseEventDetailScreenActions = {
    // フォーム操作
    setMessage,
    setDisplayName,
    setCompanionCount,
    setPrefecture,
    setGender,
    setAllowVideoUse,
    
    // UI操作
    openParticipationForm: () => setShowForm(true),
    closeParticipationForm: () => {
      setShowForm(false);
      setIsEditMode(false);
      setEditingParticipationId(null);
    },
    openEditMode,
    togglePrefectureList: () => setShowPrefectureList(prev => !prev),
    togglePrefectureFilterList: () => setShowPrefectureFilterList(prev => !prev),
    setSelectedPrefectureFilter,
    
    // 友人追加
    openAddCompanionForm: () => setShowAddCompanionForm(true),
    closeAddCompanionForm: () => {
      setShowAddCompanionForm(false);
      setNewCompanionName("");
      setNewCompanionTwitter("");
      setLookedUpProfile(null);
      setLookupError(null);
    },
    setNewCompanionName,
    setNewCompanionTwitter,
    lookupTwitterProfile: lookupTwitterProfileAction,
    addCompanion,
    removeCompanion,
    
    // モーダル操作
    openSharePrompt: () => setShowSharePrompt(true),
    closeSharePrompt: () => setShowSharePrompt(false),
    openHostProfile: () => setShowHostProfileModal(true),
    closeHostProfile: () => setShowHostProfileModal(false),
    openFanProfile: (fan) => setSelectedFan(fan),
    closeFanProfile: () => setSelectedFan(null),
    openPrefectureParticipants: (pref) => setSelectedPrefectureForModal(pref),
    closePrefectureParticipants: () => setSelectedPrefectureForModal(null),
    openRegionParticipants: (region) => setSelectedRegion({ name: region.name, prefectures: region.prefectures }),
    closeRegionParticipants: () => setSelectedRegion(null),
    openDeleteParticipation: (p) => {
      setDeleteTargetParticipation(p);
      setShowDeleteParticipationModal(true);
    },
    closeDeleteParticipation: () => {
      setDeleteTargetParticipation(null);
      setShowDeleteParticipationModal(false);
    },
    
    // ミューテーション
    submitParticipation,
    submitAnonymousParticipation,
    updateParticipation,
    deleteParticipation,
    toggleFollow,
    toggleFavorite,
    sendCheer,
    generateOgp,
    
    // ナビゲーション
    goBack,
    
    // Ref
    scrollViewRef,
    messagesRef,
  };
  
  return {
    vm,
    participations,
    companions: companionsVM,
    myParticipation,
    progressItems,
    regions,
    ranking,
    messages,
    momentum,
    isFollowingHost: isFollowingData ?? false,
    followerIdSet,
    isFavorite: checkFavorite(challengeId),
    form,
    ui,
    modals,
    targets,
    status,
    actions,
  };
}
