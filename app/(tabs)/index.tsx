import { FlatList, Text, View, TouchableOpacity, RefreshControl, ScrollView, TextInput, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, useMemo, useEffect } from "react";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { ResponsiveContainer } from "@/components/molecules/responsive-container";
import { OnboardingSteps } from "@/components/organisms/onboarding-steps";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useResponsive, useGridColumns } from "@/hooks/use-responsive";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Countdown } from "@/components/atoms/countdown";
import { PressableCard } from "@/components/molecules/pressable-card";
import { AppHeader } from "@/components/organisms/app-header";
import { CachedDataIndicator } from "@/components/organisms/offline-banner";
import { useNetworkStatus } from "@/hooks/use-offline-cache";
import { setCache, getCache, CACHE_KEYS } from "@/lib/offline-cache";
import { setCachedData, getCachedData, PREFETCH_KEYS } from "@/lib/data-prefetch";
import { useTabPrefetch } from "@/hooks/use-prefetch";
import { ChallengeCardSkeleton, Skeleton } from "@/components/atoms/skeleton-loader";
import { OptimizedAvatar } from "@/components/molecules/optimized-image";
import { LazyAvatar } from "@/components/molecules/lazy-image";
import { prefetchChallengeImages } from "@/lib/image-prefetch";
import { SimpleRefreshControl } from "@/components/molecules/enhanced-refresh-control";
import { AnimatedCard } from "@/components/molecules/animated-pressable";
import { ColorfulChallengeCard } from "@/components/molecules/colorful-challenge-card";
import { FloatingActionButton } from "@/components/atoms/floating-action-button";
import { EncouragementModal, useEncouragementModal } from "@/components/molecules/encouragement-modal";
import { FilterTabs } from "@/components/molecules/filter-tabs";
import { SyncStatusIndicator } from "@/components/atoms/sync-status-indicator";
import { BlinkingLink } from "@/components/atoms/blinking-character";
import { HostEmptyState } from "@/components/organisms/host-empty-state";
import { TutorialHighlightTarget } from "@/components/atoms/tutorial-highlight-target";
import { useTutorial } from "@/lib/tutorial-context";
import { useFavorites } from "@/hooks/use-favorites";
import { useExperience } from "@/lib/experience-context";
import { goalTypeConfig } from "@/constants/goal-types";
import { regionGroups } from "@/constants/prefectures";
import { 
  FeaturedChallenge, 
  ChallengeCard, 
  EngagementSection, 
  CatchCopySection, 
  FeatureListSection, 
  ExperienceBanner 
} from "@/features/home";
import type { Challenge, FilterType } from "@/types/challenge";
import { eventTypeBadge } from "@/types/challenge";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
  // メインキャラクター（全身）
  linkFull: require("@/assets/images/characters/KimitoLink.png"),
  linkIdol: require("@/assets/images/characters/idolKimitoLink.png"),
  // ゆっくりキャラクター
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
  kontaYukkuri: require("@/assets/images/characters/konta/kitsune-yukkuri-normal.png"),
  tanuneYukkuri: require("@/assets/images/characters/tanunee/tanuki-yukkuri-normal-mouth-open.png"),
};

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-color.jpg");

// 注目のチャレンジセクション
// FeaturedChallengeはfeatures/homeからインポート済み

// 盛り上がりセクション

// 盛り上がりセクション

// おすすめ主催者セクション（遅延読み込み）
function RecommendedHostsSection() {
  const colors = useColors();
  const router = useRouter();
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // 500ms後に読み込み開始（初期表示を優先）
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  const { data: hosts, isLoading } = trpc.profiles.recommendedHosts.useQuery(
    { limit: 5 },
    { enabled: shouldLoad } // 遅延読み込み
  );

  if (!shouldLoad || isLoading || !hosts || hosts.length === 0) return null;

  return (
    <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
      <View style={{ 
        backgroundColor: "#1A1D21", 
        borderRadius: 16, 
        padding: 16,
        borderWidth: 1,
        borderColor: "#2D3139",
      }}>
        <Text style={{ color: "#8B5CF6", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
          ✨ おすすめの主催者
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {hosts.map((host) => (
              <TouchableOpacity
                key={host.userId}
                onPress={() => router.push({ pathname: "/profile/[userId]", params: { userId: host.userId.toString() } })}
                style={{ alignItems: "center", width: 80 }}
              >
                <OptimizedAvatar
                  source={host.profileImage ? { uri: host.profileImage } : undefined}
                  size={56}
                  fallbackColor="#8B5CF6"
                  fallbackText={(host.name || "?").charAt(0)}
                />
                <Text style={{ color: colors.foreground, fontSize: 12, marginTop: 6, textAlign: "center" }} numberOfLines={1}>
                  {host.name || "主催者"}
                </Text>
                {host.username && (
                  <Text style={{ color: "#D1D5DB", fontSize: 10 }} numberOfLines={1}>
                    @{host.username}
                  </Text>
                )}
                <Text style={{ color: "#8B5CF6", fontSize: 9, marginTop: 2 }}>
                  {host.challengeCount}チャレンジ
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// りんくちゃんの語りかけセクション（LP風メッセージ）


function FilterButton({ 
  label, 
  active, 
  onPress 
}: { 
  label: string; 
  active: boolean; 
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        // UXガイドライン: 最小44pxのタップエリア
        minHeight: 44,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 22,
        backgroundColor: active ? "#DD6500" : "#2D3139",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: active ? "bold" : "normal" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// 空の状態表示コンポーネント（改善版）
function EmptyState({ onGenerateSamples: _onGenerateSamples }: { onGenerateSamples: () => void }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0D1117" }}>
      {/* デモ体験バナー（ログインなしでお試し） */}
      <ExperienceBanner />
      
      {/* LP風キャッチコピー（チャレンジがない時も表示） */}
      <CatchCopySection />
      
      {/* 主催者向け空状態画面 */}
      <HostEmptyState />
    </ScrollView>
  );
}

// セクションヘッダー
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const colors = useColors();
  return (
    <View style={{ 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 8,
    }}>
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#DD6500", fontSize: 14 }}>すべて見る</Text>
          <MaterialIcons name="chevron-right" size={20} color="#DD6500" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isDesktop, isTablet, width } = useResponsive();
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 2;
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  // v5.60: カラフルカード表示モード（しゃべった！風）
  const [useColorfulCards, setUseColorfulCards] = useState(true);
  
  // v5.60: 励ましメッセージモーダル
  const encouragementModal = useEncouragementModal();
  
  // v5.61: お気に入り機能
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  
  const { isOffline } = useNetworkStatus();
  
  // v5.34: タブ切り替え前に他のタブのデータをプリフェッチ
  useTabPrefetch("home");
  
  const [cachedChallenges, setCachedChallenges] = useState<Challenge[] | null>(null);
  const [isStaleData, setIsStaleData] = useState(false);
  const [hasInitialCache, setHasInitialCache] = useState(false);

  // 初回ロード時にキャッシュから即座に表示（ローディングなし）
  useEffect(() => {
    const loadInitialCache = async () => {
      const cached = await getCachedData<Challenge[]>(PREFETCH_KEYS.CHALLENGES);
      if (cached && cached.data.length > 0) {
        setCachedChallenges(cached.data);
        setIsStaleData(cached.isStale);
        setHasInitialCache(true);
      }
    };
    loadInitialCache();
  }, []);

  // 無限スクロール対応のページネーションクエリ
  const {
    data: paginatedData,
    isLoading: isApiLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = trpc.events.listPaginated.useInfiniteQuery(
    { limit: 20, filter: filter as "all" | "solo" | "group" },
    {
      enabled: !isOffline,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      // キャッシュがある場合は即座に表示（バックグラウンドで更新）
      staleTime: 2 * 60 * 1000, // 2分間はキャッシュを新鮮とみなす
    }
  );

  // ページネーションデータをフラットな配列に変換
  const apiChallenges = paginatedData?.pages.flatMap((page) => page.items) ?? [];
  
  // キャッシュ優先表示: APIデータがあればそれを使用、なければキャッシュを使用
  const challenges = apiChallenges.length > 0 ? apiChallenges : (cachedChallenges ?? []);
  
  // ローディング状態: データがあればローディングを表示しない（スケルトンを最小化）
  // キャッシュがあるか、APIデータがあれば即座に表示
  // v5.33: 初回表示を高速化 - スケルトンは最小限にし、UIを先に表示
  const isLoading = false; // スケルトンを表示しない（UIを即座に表示）
  const isDataLoading = challenges.length === 0 && isApiLoading && !hasInitialCache;
  // 検索結果の無限スクロール対応
  const {
    data: searchPaginatedData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    refetch: refetchSearch,
  } = trpc.search.challengesPaginated.useInfiniteQuery(
    { query: searchQuery, limit: 20 },
    {
      enabled: searchQuery.length > 0 && !isOffline,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );

  // 検索結果をフラットな配列に変換
  const searchResults = searchPaginatedData?.pages.flatMap((page) => page.items) ?? [];
  const { data: categoriesData } = trpc.categories.list.useQuery(undefined, {
    enabled: !isOffline,
  });

  // チャレンジデータをキャッシュに保存（両方のキャッシュシステムに保存）
  useEffect(() => {
    if (apiChallenges && apiChallenges.length > 0) {
      // 既存のオフラインキャッシュ
      setCache(CACHE_KEYS.challenges, apiChallenges);
      // 新しいプリフェッチキャッシュ（即座表示用）
      setCachedData(PREFETCH_KEYS.CHALLENGES, apiChallenges);
      setIsStaleData(false);
    }
  }, [apiChallenges]);

  // チャレンジの画像をプリフェッチ（事前読み込み）
  useEffect(() => {
    if (challenges && challenges.length > 0) {
      // 最初の10件の画像をプリフェッチ
      prefetchChallengeImages(challenges.slice(0, 10));
    }
  }, [challenges]);

  // オフライン時はキャッシュから読み込み
  useEffect(() => {
    if (isOffline) {
      getCache<Challenge[]>(CACHE_KEYS.challenges).then((cached) => {
        if (cached) {
          setCachedChallenges(cached.data);
          setIsStaleData(cached.isStale);
        }
      });
    } else {
      setCachedChallenges(null);
    }
  }, [isOffline]);

  // オンライン時はAPIデータ、オフライン時はキャッシュデータを使用
  const effectiveChallenges = isOffline ? cachedChallenges : challenges;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleChallengePress = (challengeId: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: challengeId.toString() },
    });
  };

  // フィルター適用
  // v5.61: お気に入りフィルターを追加
  const displayChallenges = isSearching && searchResults 
    ? searchResults.filter((c: Challenge & { categoryId?: number | null }) => {
        if (filter === "favorites" && !isFavorite(c.id)) return false;
        if (filter !== "all" && filter !== "favorites" && c.eventType !== filter) return false;
        if (categoryFilter && c.categoryId !== categoryFilter) return false;
        return true;
      })
    : (effectiveChallenges?.filter((c: Challenge & { categoryId?: number | null }) => {
        if (filter === "favorites" && !isFavorite(c.id)) return false;
        if (filter !== "all" && filter !== "favorites" && c.eventType !== filter) return false;
        if (categoryFilter && c.categoryId !== categoryFilter) return false;
        return true;
      }) || []);

  // 注目のチャレンジ（最も進捗が高いもの、または最も参加者が多いもの）
  const featuredChallenge = useMemo(() => {
    if (!effectiveChallenges || effectiveChallenges.length === 0) return null;
    return effectiveChallenges.reduce((best, current) => {
      const bestProgress = best.currentValue / best.goalValue;
      const currentProgress = current.currentValue / current.goalValue;
      // 進捗率が高い、または参加者が多いものを選択
      if (currentProgress > bestProgress || (currentProgress === bestProgress && current.currentValue > best.currentValue)) {
        return current;
      }
      return best;
    });
  }, [challenges]);

  // チャレンジ一覧（注目のチャレンジを除く）
  const otherChallenges = useMemo(() => {
    if (!displayChallenges || displayChallenges.length === 0) return [];
    if (!featuredChallenge) return displayChallenges;
    return displayChallenges.filter(c => c.id !== featuredChallenge.id);
  }, [displayChallenges, featuredChallenge]);

  // ヘッダーコンポーネント（FlatListのListHeaderComponent用）
  // v5.33: 初期表示を高速化 - 検索バーとフィルターを最初に表示
  const ListHeader = () => (
    <>
      {/* チャレンジ一覧ヘッダー（最初に表示） */}
      <SectionHeader title="📋 チャレンジ一覧" />

      {/* 検索バー */}
      <View style={{ marginHorizontal: 16, marginTop: 8 }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#1A1D21",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: searchQuery ? "#DD6500" : "#2D3139",
        }}>
          <MaterialIcons name="search" size={20} color="#D1D5DB" />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setIsSearching(text.length > 0);
            }}
            placeholder="チャレンジを検索..."
            placeholderTextColor="#D1D5DB"
            style={{
              flex: 1,
              marginLeft: 8,
              color: colors.foreground,
              fontSize: 14,
              paddingVertical: 8,
            }}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            textContentType="none"
            keyboardType="default"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setIsSearching(false); }}>
              <MaterialIcons name="close" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* タイプフィルター */}
      <View style={{ flexDirection: "row", marginTop: 16, marginHorizontal: 16, flexWrap: "wrap", gap: 8 }}>
        <FilterButton label="すべて" active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterButton label="⭐ お気に入り" active={filter === "favorites"} onPress={() => setFilter("favorites")} />
        <FilterButton label="グループ" active={filter === "group"} onPress={() => setFilter("group")} />
        <FilterButton label="ソロ" active={filter === "solo"} onPress={() => setFilter("solo")} />
      </View>

      {/* カテゴリフィルター */}
      {categoriesData && categoriesData.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          style={{ marginTop: 8, marginHorizontal: 16 }}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <TouchableOpacity
            onPress={() => setCategoryFilter(null)}
            activeOpacity={0.7}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: categoryFilter === null ? "#8B5CF6" : "#1E293B",
              marginRight: 8,
              flexDirection: "row",
              alignItems: "center",
              minHeight: 36,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 12 }}>全カテゴリ</Text>
          </TouchableOpacity>
          {categoriesData.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoryFilter(cat.id)}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: categoryFilter === cat.id ? "#8B5CF6" : "#1E293B",
                marginRight: 8,
                flexDirection: "row",
                alignItems: "center",
                minHeight: 36,
              }}
            >
              <Text style={{ marginRight: 4 }}>{cat.icon}</Text>
              <Text style={{ color: colors.foreground, fontSize: 12 }}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 3ステップ説明（初回訪問時のみ表示） */}
      {!isLoading && displayChallenges.length === 0 && (
        <OnboardingSteps />
      )}

      {/* デモ体験ボタン（常に表示） */}
      <ExperienceBanner />
      
      {/* データ読み込み中のインジケーター */}
      {isDataLoading && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "#D1D5DB" }}>読み込み中...</Text>
        </View>
      )}
    </>
  );
  
  // フッターコンポーネント（チャレンジ一覧の後に表示）
  // v5.33: 重いセクションをフッターに移動して初期表示を高速化
  const ListFooterSections = () => (
    <>
      {/* 注目のチャレンジ */}
      {featuredChallenge && !isSearching && (
        <FeaturedChallenge 
          challenge={featuredChallenge as Challenge} 
          onPress={() => handleChallengePress(featuredChallenge.id)} 
        />
      )}

      {/* オフラインキャッシュインジケーター */}
      {isOffline && isStaleData && (
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <CachedDataIndicator isStale={isStaleData} />
        </View>
      )}

      {/* オフライン同期インジケーター */}
      <SyncStatusIndicator />

      {/* 盛り上がりセクション */}
      {effectiveChallenges && effectiveChallenges.length > 0 && !isSearching && (
        <EngagementSection challenges={effectiveChallenges as Challenge[]} />
      )}

      {/* おすすめ主催者セクション */}
      {!isSearching && <RecommendedHostsSection />}

      {/* LP風キャッチコピー */}
      {!isSearching && <CatchCopySection />}
    </>
  );

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* ヘッダー */}
      <AppHeader 
        title="君斗りんくの動員ちゃれんじ" 
        showCharacters={true}
        isDesktop={isDesktop}
        showMenu={true}
      />

      {/* v5.34: スケルトンを完全に削除し、常にFlatListを表示 */}
      {displayChallenges.length > 0 || isDataLoading ? (
        <FlatList
          key={`grid-${numColumns}`}
          data={isSearching ? displayChallenges : otherChallenges}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          ListHeaderComponent={ListHeader}
          renderItem={({ item, index }) => {
            // v5.60: カラフルカードと通常カードの切り替え
            // v5.61: お気に入り機能を追加
            const cardProps = {
              challenge: item as Challenge,
              onPress: () => handleChallengePress(item.id),
              numColumns,
              colorIndex: index,
              isFavorite: isFavorite(item.id),
              onToggleFavorite: toggleFavorite,
            };
            // 最初のアイテムのみチュートリアルハイライト対象
            if (index === 0) {
              return (
                <TutorialHighlightTarget tutorialStep={1} userType="fan" style={{ flex: 1 }}>
                  {useColorfulCards ? (
                    <ColorfulChallengeCard {...cardProps} />
                  ) : (
                    <ChallengeCard {...cardProps} />
                  )}
                </TutorialHighlightTarget>
              );
            }
            return useColorfulCards ? (
              <ColorfulChallengeCard {...cardProps} />
            ) : (
              <ChallengeCard {...cardProps} />
            );
          }}
          refreshControl={
            <SimpleRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          // 無限スクロール設定
          onEndReached={() => {
            if (isSearching) {
              if (hasNextSearchPage && !isFetchingNextSearchPage) {
                fetchNextSearchPage();
              }
            } else {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <>
              {/* ページネーションインジケーター */}
              {(isSearching ? isFetchingNextSearchPage : isFetchingNextPage) ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#D1D5DB" }}>読み込み中...</Text>
                </View>
              ) : (isSearching ? hasNextSearchPage : hasNextPage) ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#D1D5DB" }}>スクロールしてもっと見る</Text>
                </View>
              ) : null}
              {/* 追加セクション（チャレンジ一覧の後に表示） */}
              <ListFooterSections />
            </>
          }
          contentContainerStyle={{ 
            paddingHorizontal: isDesktop ? 24 : 8, 
            paddingBottom: 100,
            backgroundColor: "#0D1117",
            maxWidth: isDesktop ? 1200 : undefined,
            alignSelf: isDesktop ? "center" : undefined,
            width: isDesktop ? "100%" : undefined,
          }}
          style={{ backgroundColor: "#0D1117" }}
          columnWrapperStyle={{ justifyContent: "flex-start", gap: isDesktop ? 16 : 8 }}
          // パフォーマンス最適化
          windowSize={5}
          maxToRenderPerBatch={6}
          initialNumToRender={6}
          removeClippedSubviews={Platform.OS !== "web"}
          updateCellsBatchingPeriod={50}
        />
      ) : (
        <EmptyState onGenerateSamples={refetch} />
      )}

      {/* v5.60: FABボタン（チャレンジ作成へ） */}
      <FloatingActionButton
        onPress={() => router.push("/(tabs)/create")}
        icon="add"
        gradientColors={["#EC4899", "#8B5CF6"]}
        size="large"
      />

      {/* v5.60: 励ましメッセージモーダル */}
      <EncouragementModal
        visible={encouragementModal.visible}
        onClose={encouragementModal.hide}
        type={encouragementModal.type}
        customMessage={encouragementModal.customMessage}
        customEmoji={encouragementModal.customEmoji}
      />
    </ScreenContainer>
  );
}
