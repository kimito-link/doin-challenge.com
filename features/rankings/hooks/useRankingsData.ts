/**
 * useRankingsData Hook
 * ランキング画面のデータ取得・状態管理
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import type { PeriodType, RankingTabType, RankingItem } from "../types";

interface UseRankingsDataReturn {
  // Data
  contributionRanking: RankingItem[] | undefined;
  hostRanking: RankingItem[] | undefined;
  myPosition:
    | { position: number | null; totalContribution: number | null; participationCount?: number }
    | null
    | undefined;

  // State
  period: PeriodType;
  tab: RankingTabType;
  refreshing: boolean;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  hasData: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;

  // Current data
  data: RankingItem[] | undefined;

  // Actions
  setPeriod: (period: PeriodType) => void;
  setTab: (tab: RankingTabType) => void;
  onRefresh: () => Promise<void>;
}

export function useRankingsData(): UseRankingsDataReturn {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [tab, setTab] = useState<RankingTabType>("contribution");

  const {
    data: contributionRanking,
    isLoading: contributionLoading,
    isFetching: contributionFetching,
    refetch: refetchContribution,
  } = trpc.rankings.contribution.useQuery({ period, limit: 50 });
  const {
    data: hostRanking,
    isLoading: hostLoading,
    isFetching: hostFetching,
    refetch: refetchHost,
  } = trpc.rankings.hosts.useQuery({ limit: 50 });
  const { data: myPosition } = trpc.rankings.myPosition.useQuery({ period }, { enabled: !!user });

  const onRefresh = async () => {
    setRefreshing(true);
    if (tab === "contribution") {
      await refetchContribution();
    } else {
      await refetchHost();
    }
    setRefreshing(false);
  };

  // ローディング状態の分離
  const isLoading = useMemo(
    () => (tab === "contribution" ? contributionLoading : hostLoading),
    [tab, contributionLoading, hostLoading]
  );
  const isFetching = useMemo(
    () => (tab === "contribution" ? contributionFetching : hostFetching),
    [tab, contributionFetching, hostFetching]
  );
  const data = useMemo(
    () => (tab === "contribution" ? contributionRanking : hostRanking),
    [tab, contributionRanking, hostRanking]
  );
  const hasData = useMemo(() => !!data && data.length > 0, [data]);
  const isInitialLoading = useMemo(() => isLoading && !hasData, [isLoading, hasData]);
  const isRefreshing = useMemo(() => isFetching && hasData, [isFetching, hasData]);

  return {
    contributionRanking,
    hostRanking,
    myPosition,
    period,
    tab,
    refreshing,
    isLoading,
    isFetching,
    hasData,
    isInitialLoading,
    isRefreshing,
    data,
    setPeriod,
    setTab,
    onRefresh,
  };
}
