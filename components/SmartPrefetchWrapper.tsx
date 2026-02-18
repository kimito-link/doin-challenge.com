import { useSmartPrefetch } from "@/hooks/use-smart-prefetch";

/**
 * スマートプリフェッチを有効化するラッパーコンポーネント
 * アプリ全体でユーザーの行動パターンを学習し、次に表示される可能性が高い画面のデータを事前取得
 */
export function SmartPrefetchWrapper({ children }: { children: React.ReactNode }) {
  // スマートプリフェッチを有効化
  useSmartPrefetch({
    enabled: true,
    topN: 3,
    delay: 1000,
  });

  return <>{children}</>;
}
