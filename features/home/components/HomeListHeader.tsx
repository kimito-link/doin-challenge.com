/**
 * HomeListHeader Component
 * ホーム画面のFlatListヘッダー部分
 * v6.27: タブナビゲーション追加、UI改善
 */

import { View, Text } from "react-native";
import { color } from "@/theme/tokens";
import { OnboardingSteps } from "@/components/organisms/onboarding-steps";
import { ChallengeCardSkeleton } from "@/components/atoms/skeleton-loader";
import { 
  SectionHeader,
  SearchBar,
  CategoryFilter,
  RankingTop3,
  SimpleRegionMap,
  ExperienceBanner,
  HomeTabNavigation,
  type HomeTabType,
} from "./index";
import type { Challenge, FilterType } from "@/types/challenge";

interface HomeListHeaderProps {
  // Search
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchClear: () => void;
  isSearching: boolean;
  
  // Filters
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  categoryFilter: number | null;
  onCategoryFilterChange: (categoryId: number | null) => void;
  categoriesData: any;
  
  // Tab
  activeTab?: HomeTabType;
  onTabChange?: (tab: HomeTabType) => void;
  tabCounts?: {
    all: number;
    solo: number;
    group: number;
    favorite: number;
  };
  
  // Data
  top3: Challenge[];
  featuredChallenge: Challenge | null;
  displayChallengesCount: number;
  isDataLoading: boolean;
  totalChallengesCount?: number;
  
  // Handlers
  onChallengePress: (id: number) => void;
}

export function HomeListHeader({
  searchQuery,
  onSearchChange,
  onSearchClear,
  isSearching,
  filter,
  onFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoriesData,
  activeTab = "all",
  onTabChange,
  tabCounts,
  top3,
  featuredChallenge,
  displayChallengesCount,
  isDataLoading,
  totalChallengesCount = 0,
  onChallengePress,
}: HomeListHeaderProps) {
  // フィルターが適用されているかどうか
  const isFilterApplied = filter !== "all" || categoryFilter !== null;
  // フィルター適用後に該当なしの場合
  const noResultsAfterFilter = isFilterApplied && displayChallengesCount === 0 && totalChallengesCount > 0 && !isDataLoading;
  // タブ変更時にフィルターも連動
  const handleTabChange = (tab: HomeTabType) => {
    onTabChange?.(tab);
    // タブに応じてフィルターを変更
    if (tab === "solo") {
      onFilterChange("solo");
    } else if (tab === "group") {
      onFilterChange("group");
    } else if (tab === "favorite") {
      onFilterChange("favorites");
    } else {
      onFilterChange("all");
    }
  };

  return (
    <>
      {/* 検索バー */}
      <SearchBar
        value={searchQuery}
        onChangeText={(text) => {
          onSearchChange(text);
        }}
        onClear={onSearchClear}
      />

      {/* タブナビゲーション */}
      {onTabChange && (
        <HomeTabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={tabCounts}
        />
      )}

      {/* カテゴリフィルター */}
      <CategoryFilter
        categories={categoriesData}
        selectedCategory={categoryFilter}
        onSelectCategory={onCategoryFilterChange}
      />

      {/* フィルター適用後に該当なしの場合のメッセージ */}
      {noResultsAfterFilter && (
        <View style={{ padding: 32, alignItems: "center" }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>
            {filter === "favorites" ? "⭐" : filter === "solo" ? "👤" : filter === "group" ? "👥" : "🔍"}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 16, textAlign: "center", marginBottom: 8 }}>
            {filter === "favorites" 
              ? "お気に入りのチャレンジはまだありません"
              : filter === "solo"
              ? "ソロチャレンジはまだありません"
              : filter === "group"
              ? "グループチャレンジはまだありません"
              : categoryFilter
              ? "このカテゴリのチャレンジはまだありません"
              : "該当するチャレンジがありません"}
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 14, textAlign: "center" }}>
            {filter === "favorites" 
              ? "チャレンジの☆ボタンを押してお気に入りに追加しよう"
              : "「総合」タブで全てのチャレンジを見る"}
          </Text>
        </View>
      )}

      {/* ランキングTop3（フィルター適用後に該当なしでない場合のみ表示） */}
      {!isSearching && !noResultsAfterFilter && top3.length > 0 && (
        <RankingTop3
          top3={top3}
          onPress={(id) => onChallengePress(id)}
          onQuickJoin={(id) => onChallengePress(id)}
        />
      )}

      {/* 4位以降のヘッダー */}
      {!isSearching && !noResultsAfterFilter && top3.length > 0 && (
        <SectionHeader title="📋 4位以降のチャレンジ" />
      )}

      {/* 簡易地域マップ */}
      {!isSearching && !noResultsAfterFilter && featuredChallenge && (
        <SimpleRegionMap
          totalCount={featuredChallenge.currentValue}
          onPress={() => onChallengePress(featuredChallenge.id)}
          challengeId={featuredChallenge.id}
        />
      )}

      {/* 3ステップ説明（初回訪問時のみ表示） */}
      {displayChallengesCount === 0 && !isDataLoading && !noResultsAfterFilter && (
        <OnboardingSteps />
      )}

      {/* デモ体験ボタン（フィルター適用時は非表示） */}
      {!isFilterApplied && <ExperienceBanner />}
      
      {/* データ読み込み中のスケルトン表示 */}
      {isDataLoading && (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
        </View>
      )}
    </>
  );
}
