/**
 * useStatsData Hook
 * 統計画面のデータ取得・状態管理
 */

import { trpc } from "@/lib/trpc";
import type { UserStats } from "../types";

interface UseStatsDataReturn {
  // Data
  userStats: UserStats | undefined;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Actions
  refetch: () => void;
}

export function useStatsData(): UseStatsDataReturn {
  const { data: userStats, isLoading, isError, error, refetch } = trpc.stats.getUserStats.useQuery();

  return {
    userStats: userStats as UserStats | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
