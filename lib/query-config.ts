/**
 * React Query設定の最適化
 * 
 * キャッシング戦略:
 * - staleTime: データが「新鮮」とみなされる時間（この間は再フェッチしない）
 * - cacheTime: データがキャッシュに保持される時間
 * - refetchOnWindowFocus: ウィンドウフォーカス時の再フェッチ
 * - refetchOnReconnect: ネットワーク再接続時の再フェッチ
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // デフォルト: 10分間は新鮮とみなす（API呼び出しを大幅に削減）
      staleTime: 10 * 60 * 1000,
      
      // デフォルト: 60分間キャッシュに保持（メモリ効率とパフォーマンスのバランス）
      gcTime: 60 * 60 * 1000,
      
      // ウィンドウフォーカス時の再フェッチを無効化（モバイルアプリでは不要）
      refetchOnWindowFocus: false,
      
      // ネットワーク再接続時は再フェッチ（オフライン→オンライン時のデータ更新）
      refetchOnReconnect: true,
      
      // マウント時の再フェッチを無効化（staleTimeで制御）
      refetchOnMount: false,
      
      // エラー時のリトライ設定
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

/**
 * クエリキーの定義（型安全性とキャッシュ管理の一元化）
 */
export const queryKeys = {
  // ユーザー関連
  user: {
    me: ["user", "me"] as const,
    profile: (userId: string) => ["user", "profile", userId] as const,
  },
  
  // イベント関連
  event: {
    all: ["event"] as const,
    list: (filters?: Record<string, unknown>) => ["event", "list", filters] as const,
    detail: (eventId: string) => ["event", "detail", eventId] as const,
    participants: (eventId: string) => ["event", "participants", eventId] as const,
  },
  
  // チャレンジ関連
  challenge: {
    all: ["challenge"] as const,
    list: (filters?: Record<string, unknown>) => ["challenge", "list", filters] as const,
    detail: (challengeId: string) => ["challenge", "detail", challengeId] as const,
    myParticipations: ["challenge", "my-participations"] as const,
  },
  
  // 統計関連
  stats: {
    dashboard: ["stats", "dashboard"] as const,
    eventStats: (eventId: string) => ["stats", "event", eventId] as const,
  },
} as const;

/**
 * キャッシュ無効化ヘルパー
 */
export const invalidateQueries = {
  // ユーザー情報を無効化
  user: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.me }),
  
  // イベント一覧を無効化
  eventList: () => queryClient.invalidateQueries({ queryKey: queryKeys.event.all }),
  
  // 特定のイベント詳細を無効化
  eventDetail: (eventId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.event.detail(eventId) }),
  
  // チャレンジ一覧を無効化
  challengeList: () => queryClient.invalidateQueries({ queryKey: queryKeys.challenge.all }),
  
  // 自分の参加履歴を無効化
  myParticipations: () => 
    queryClient.invalidateQueries({ queryKey: queryKeys.challenge.myParticipations }),
};
