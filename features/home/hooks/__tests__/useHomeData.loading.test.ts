/**
 * useHomeData Loading States Test
 * v6.59: スケルトンローディング改善のためのローディング状態テスト
 * 
 * 検証する契約:
 * - スケルトンは初回だけ（isInitialLoading）
 * - 更新中は小インジケータ（isRefreshing）
 * - 無限スクロールは別扱い（isLoadingMore）
 */

import { renderHook } from "@testing-library/react";
import { useHomeData } from "../useHomeData";
import { trpc } from "@/lib/trpc";

// tRPCクエリをモック
vi.mock("@/lib/trpc", () => ({
  trpc: {
    events: {
      listPaginated: {
        useInfiniteQuery: vi.fn(),
      },
    },
    search: {
      challengesPaginated: {
        useInfiniteQuery: vi.fn(),
      },
    },
    categories: {
      list: {
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
        })),
      },
    },
  },
}));

// AsyncStorageをモック
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
  },
}));

// NetInfoをモック
vi.mock("@react-native-community/netinfo", () => ({
  default: {
    fetch: vi.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: vi.fn(() => vi.fn()),
  },
}));

// use-offline-cacheをモック
vi.mock("@/hooks/use-offline-cache", () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true })),
}));

// use-prefetchをモック
vi.mock("@/hooks/use-prefetch", () => ({
  useTabPrefetch: vi.fn(() => ({ prefetchTab: vi.fn() })),
}));

// use-favoritesをモック
vi.mock("@/hooks/use-favorites", () => ({
  useFavorites: vi.fn(() => ({ favorites: [], toggleFavorite: vi.fn() })),
}));

// image-prefetchをモック
vi.mock("@/lib/image-prefetch", () => ({
  prefetchChallengeImages: vi.fn(),
}));

// offline-cacheをモック
vi.mock("@/lib/offline-cache", () => ({
  setCache: vi.fn(),
  getCache: vi.fn(() => null),
  CACHE_KEYS: { HOME_CHALLENGES: "home_challenges" },
}));

// data-prefetchをモック
vi.mock("@/lib/data-prefetch", () => ({
  setCachedData: vi.fn(),
  getCachedData: vi.fn(() => null),
  PREFETCH_KEYS: { HOME_CHALLENGES: "home_challenges" },
}));

describe("useHomeData - Loading States", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Case 1: 初回ロード中（データなし）
   * 期待: isInitialLoading=true, スケルトン表示
   */
  it("Case 1: 初回ロード中はisInitialLoading=trueでスケルトン表示", () => {
    // モック設定: データなし、API取得中
    (trpc.events.listPaginated.useInfiniteQuery as any).mockReturnValue({
      data: undefined, // データなし
      isLoading: true, // 初回ロード中
      isFetching: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    (trpc.search.challengesPaginated.useInfiniteQuery as any).mockReturnValue({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useHomeData({ searchQuery: "", filter: "all", categoryFilter: null }));

    // 初回ロード中の契約
    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.hasData).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
    
    // 後方互換性
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isDataLoading).toBe(true);
  });
});
