/**
 * プリフェッチフック
 * タブ切り替え前に次の画面のデータを事前読み込み
 * v5.34: 初期表示高速化のために追加
 */
import { useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

/**
 * ホーム画面のデータをプリフェッチ
 */
export function usePrefetchHome() {
  const utils = trpc.useUtils();
  
  const prefetch = useCallback(async () => {
    try {
      // チャレンジ一覧をプリフェッチ
      await utils.events.listPaginated.prefetchInfinite(
        { limit: 20, filter: "all" },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          initialCursor: 0,
        }
      );
      // カテゴリ一覧をプリフェッチ
      await utils.categories.list.prefetch();
    } catch (error) {
      // プリフェッチエラーは無視（バックグラウンド処理）
      console.debug("[Prefetch] Home prefetch failed:", error);
    }
  }, [utils]);
  
  return { prefetch };
}

/**
 * マイページのデータをプリフェッチ
 */
export function usePrefetchMypage() {
  const utils = trpc.useUtils();
  
  const prefetch = useCallback(async () => {
    try {
      // ユーザーの参加チャレンジをプリフェッチ
      await utils.participations.myParticipations.prefetch();
      // ユーザーの作成チャレンジをプリフェッチ
      await utils.events.myEvents.prefetch();
    } catch (error) {
      console.debug("[Prefetch] Mypage prefetch failed:", error);
    }
  }, [utils]);
  
  return { prefetch };
}

/**
 * チャレンジ作成画面のデータをプリフェッチ
 */
export function usePrefetchCreate() {
  const utils = trpc.useUtils();
  
  const prefetch = useCallback(async () => {
    try {
      // カテゴリ一覧をプリフェッチ
      await utils.categories.list.prefetch();
      // テンプレート一覧をプリフェッチ
      await utils.templates.list.prefetch();
    } catch (error) {
      console.debug("[Prefetch] Create prefetch failed:", error);
    }
  }, [utils]);
  
  return { prefetch };
}

/**
 * タブ切り替え時のプリフェッチを自動実行
 * 現在のタブに応じて、他のタブのデータを事前読み込み
 */
export function useTabPrefetch(currentTab: "home" | "create" | "mypage") {
  const { prefetch: prefetchHome } = usePrefetchHome();
  const { prefetch: prefetchMypage } = usePrefetchMypage();
  const { prefetch: prefetchCreate } = usePrefetchCreate();
  
  useEffect(() => {
    // 現在のタブ以外のデータをプリフェッチ（遅延実行）
    const timer = setTimeout(() => {
      switch (currentTab) {
        case "home":
          // ホームにいる時は、マイページと作成画面をプリフェッチ
          prefetchMypage();
          prefetchCreate();
          break;
        case "create":
          // 作成画面にいる時は、ホームとマイページをプリフェッチ
          prefetchHome();
          prefetchMypage();
          break;
        case "mypage":
          // マイページにいる時は、ホームと作成画面をプリフェッチ
          prefetchHome();
          prefetchCreate();
          break;
      }
    }, 1000); // 1秒後にプリフェッチ開始（初期表示を優先）
    
    return () => clearTimeout(timer);
  }, [currentTab, prefetchHome, prefetchMypage, prefetchCreate]);
}
