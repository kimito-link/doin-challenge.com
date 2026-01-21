/**
 * HomeListFooter Component
 * ホーム画面のFlatListフッター部分
 */

import { View, Text } from "react-native";
import { color } from "@/theme/tokens";
import { CachedDataIndicator } from "@/components/organisms/offline-banner";
import { SyncStatusIndicator } from "@/components/atoms/sync-status-indicator";
import { 
  FeaturedChallenge, 
  EngagementSection, 
  CatchCopySection,
} from "./index";
import { RecommendedHostsSection } from "./sections/RecommendedHostsSection";
import type { Challenge } from "@/types/challenge";

interface HomeListFooterProps {
  // Data
  featuredChallenge: Challenge | null;
  effectiveChallenges: Challenge[] | null;
  
  // States
  isSearching: boolean;
  isOffline: boolean;
  isStaleData: boolean;
  
  // Pagination
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isFetchingNextSearchPage: boolean;
  hasNextSearchPage: boolean;
  
  // Handlers
  onChallengePress: (id: number) => void;
}

export function HomeListFooter({
  featuredChallenge,
  effectiveChallenges,
  isSearching,
  isOffline,
  isStaleData,
  isFetchingNextPage,
  hasNextPage,
  isFetchingNextSearchPage,
  hasNextSearchPage,
  onChallengePress,
}: HomeListFooterProps) {
  return (
    <>
      {/* ページネーションインジケーター */}
      {(isSearching ? isFetchingNextSearchPage : isFetchingNextPage) ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: color.textMuted }}>読み込み中...</Text>
        </View>
      ) : (isSearching ? hasNextSearchPage : hasNextPage) ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: color.textMuted }}>スクロールしてもっと見る</Text>
        </View>
      ) : null}
      
      {/* 注目のチャレンジ */}
      {featuredChallenge && !isSearching && (
        <FeaturedChallenge 
          challenge={featuredChallenge} 
          onPress={() => onChallengePress(featuredChallenge.id)} 
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
        <EngagementSection challenges={effectiveChallenges} />
      )}

      {/* おすすめ主催者セクション */}
      {!isSearching && <RecommendedHostsSection />}

      {/* LP風キャッチコピー */}
      {!isSearching && <CatchCopySection />}
    </>
  );
}
