/**
 * HomeListHeader Component
 * ホーム画面のFlatListヘッダー部分
 */

import { View, Text } from "react-native";
import { color } from "@/theme/tokens";
import { OnboardingSteps } from "@/components/organisms/onboarding-steps";
import { 
  SectionHeader,
  SearchBar,
  CategoryFilter,
  FilterButton,
  ResponsiveFilterRow,
  RankingTop3,
  SimpleRegionMap,
  ExperienceBanner,
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
  
  // Data
  top3: Challenge[];
  featuredChallenge: Challenge | null;
  displayChallengesCount: number;
  isDataLoading: boolean;
  
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
  top3,
  featuredChallenge,
  displayChallengesCount,
  isDataLoading,
  onChallengePress,
}: HomeListHeaderProps) {
  return (
    <>
      {/* チャレンジ一覧ヘッダー */}
      <SectionHeader title="📋 チャレンジ一覧" />

      {/* 検索バー */}
      <SearchBar
        value={searchQuery}
        onChangeText={(text) => {
          onSearchChange(text);
        }}
        onClear={onSearchClear}
      />
      
      {/* タイプフィルター */}
      <View style={{ marginTop: 16, marginHorizontal: 16 }}>
        <ResponsiveFilterRow itemCount={4}>
          <FilterButton label="すべて" active={filter === "all"} onPress={() => onFilterChange("all")} />
          <FilterButton label="⭐ お気に入り" active={filter === "favorites"} onPress={() => onFilterChange("favorites")} />
          <FilterButton label="グループ" active={filter === "group"} onPress={() => onFilterChange("group")} />
          <FilterButton label="ソロ" active={filter === "solo"} onPress={() => onFilterChange("solo")} />
        </ResponsiveFilterRow>
      </View>

      {/* カテゴリフィルター */}
      <CategoryFilter
        categories={categoriesData}
        selectedCategory={categoryFilter}
        onSelectCategory={onCategoryFilterChange}
      />

      {/* ランキングTop3 */}
      {!isSearching && top3.length > 0 && (
        <RankingTop3
          top3={top3}
          onPress={(id) => onChallengePress(id)}
          onQuickJoin={(id) => onChallengePress(id)}
        />
      )}

      {/* 簡易地域マップ */}
      {!isSearching && featuredChallenge && (
        <SimpleRegionMap
          totalCount={featuredChallenge.currentValue}
          onPress={() => onChallengePress(featuredChallenge.id)}
          challengeId={featuredChallenge.id}
        />
      )}

      {/* 3ステップ説明（初回訪問時のみ表示） */}
      {displayChallengesCount === 0 && !isDataLoading && (
        <OnboardingSteps />
      )}

      {/* デモ体験ボタン */}
      <ExperienceBanner />
      
      {/* データ読み込み中のインジケーター */}
      {isDataLoading && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: color.textMuted }}>読み込み中...</Text>
        </View>
      )}
    </>
  );
}
