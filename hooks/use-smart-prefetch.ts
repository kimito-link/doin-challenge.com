import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "expo-router";
import { trpc } from "@/lib/trpc";
import { userBehaviorTracker } from "@/lib/user-behavior-tracker";
import { useAuth } from "@/hooks/use-auth";

/**
 * スマートプリフェッチフック
 * ユーザーの行動パターンを学習し、次に表示される可能性が高い画面のデータを事前取得
 */

interface SmartPrefetchOptions {
  /** プリフェッチを有効にするかどうか */
  enabled?: boolean;
  /** プリフェッチする画面数（デフォルト: 3） */
  topN?: number;
  /** プリフェッチの遅延時間（ミリ秒、デフォルト: 1000） */
  delay?: number;
}

export function useSmartPrefetch(options: SmartPrefetchOptions = {}) {
  const { enabled = true, topN = 3, delay = 1000 } = options;
  const pathname = usePathname();
  const { user } = useAuth();
  const previousPathname = useRef<string | null>(null);
  const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const utils = trpc.useUtils();

  /**
   * ナビゲーションイベントを記録
   */
  const recordNavigation = useCallback(async () => {
    if (previousPathname.current && pathname && previousPathname.current !== pathname) {
      await userBehaviorTracker.recordNavigation(
        previousPathname.current,
        pathname,
        user?.userType as "host" | "fan" | undefined
      );
    }
    previousPathname.current = pathname;
  }, [pathname, user?.userType]);

  /**
   * 次に訪れる可能性が高い画面のデータをプリフェッチ
   */
  const prefetchNextScreens = useCallback(async () => {
    if (!enabled || !pathname) return;

    try {
      // 次に訪れる可能性が高い画面を予測
      const predictedScreens = await userBehaviorTracker.predictNextScreens(pathname, topN);

      if (predictedScreens.length === 0) {
        console.log("[SmartPrefetch] No predicted screens for", pathname);
        return;
      }

      console.log("[SmartPrefetch] Prefetching data for:", predictedScreens);

      // 各画面のデータをプリフェッチ
      predictedScreens.forEach((screen) => {
        prefetchScreenData(screen);
      });
    } catch (error) {
      console.error("[SmartPrefetch] Failed to prefetch:", error);
    }
  }, [enabled, pathname, topN]);

  /**
   * 画面ごとのデータをプリフェッチ
   */
  const prefetchScreenData = useCallback(
    (screen: string) => {
      // ホーム画面
      if (screen === "/(tabs)/index" || screen === "/") {
        utils.events.list.prefetch();
        console.log("[SmartPrefetch] Prefetched home data");
      }

      // マイページ
      if (screen === "/(tabs)/mypage") {
        if (user) {
          utils.events.list.prefetch();
          console.log("[SmartPrefetch] Prefetched mypage data");
        }
      }

      // ランキング画面
      if (screen === "/rankings") {
        utils.rankings.contribution.prefetch({ period: "all", limit: 50 });
        console.log("[SmartPrefetch] Prefetched rankings data");
      }

      // 通知画面
      if (screen === "/notifications") {
        if (user) {
          utils.notifications.list.prefetch({ limit: 20 });
          console.log("[SmartPrefetch] Prefetched notifications data");
        }
      }

      // メッセージ画面
      if (screen === "/messages/index") {
        if (user) {
          utils.dm.conversations.prefetch({ limit: 20 });
          console.log("[SmartPrefetch] Prefetched messages data");
        }
      }

      // イベント詳細画面（パターンから推測）
      if (screen.startsWith("/event/")) {
        // イベントIDを抽出してプリフェッチ
        const eventId = extractEventId(screen);
        if (eventId) {
          utils.events.getById.prefetch({ id: eventId });
          console.log("[SmartPrefetch] Prefetched event detail data for", eventId);
        }
      }
    },
    [utils, user]
  );

  /**
   * URLからイベントIDを抽出
   */
  const extractEventId = (screen: string): number | null => {
    const match = screen.match(/\/event\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  /**
   * ナビゲーション記録とプリフェッチを実行
   */
  useEffect(() => {
    if (!enabled) return;

    // ナビゲーションイベントを記録
    recordNavigation();

    // プリフェッチを遅延実行（ユーザーがアイドル状態になるまで待つ）
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchNextScreens();
    }, delay);

    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [enabled, pathname, recordNavigation, prefetchNextScreens, delay]);

  return {
    prefetchNextScreens,
    recordNavigation,
  };
}

/**
 * 特定の画面のデータを手動でプリフェッチするフック
 */
export function useManualPrefetch() {
  const utils = trpc.useUtils();

  const prefetchHome = useCallback(() => {
    utils.events.list.prefetch();
  }, [utils]);

  const prefetchMypage = useCallback(() => {
    utils.events.list.prefetch();
  }, [utils]);

  const prefetchRankings = useCallback(() => {
    utils.rankings.contribution.prefetch({ period: "all", limit: 50 });
  }, [utils]);

  const prefetchNotifications = useCallback(() => {
    utils.notifications.list.prefetch({ limit: 20 });
  }, [utils]);

  const prefetchMessages = useCallback(() => {
    utils.dm.conversations.prefetch({ limit: 20 });
  }, [utils]);

  const prefetchEventDetail = useCallback(
    (eventId: number) => {
      utils.events.getById.prefetch({ id: eventId });
    },
    [utils]
  );

  return {
    prefetchHome,
    prefetchMypage,
    prefetchRankings,
    prefetchNotifications,
    prefetchMessages,
    prefetchEventDetail,
  };
}
