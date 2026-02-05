/**
 * 統計画面
 * ユーザーの統計情報を表示
 */

import {
  StatsLoadingState,
  StatsErrorState,
  StatsEmptyState,
  StatsContent,
  useStatsData,
} from "@/features/stats";

export default function StatsScreen() {
  const { userStats, isLoading, isError, error, refetch } = useStatsData();

  if (isLoading) {
    return <StatsLoadingState />;
  }

  if (isError) {
    const errorMessage = error?.message || "統計データを読み込めませんでした";
    return <StatsErrorState errorMessage={errorMessage} onRetry={refetch} />;
  }

  if (!userStats) {
    return <StatsEmptyState />;
  }

  return <StatsContent userStats={userStats} />;
}
