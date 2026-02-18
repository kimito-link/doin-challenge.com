/**
 * Navigation Tracking Wrapper
 * アプリ全体でナビゲーショントラッキングを有効化
 */

import { useNavigationTracking } from "@/hooks/use-navigation-tracking";

export function NavigationTrackingWrapper({ children }: { children: React.ReactNode }) {
  // ナビゲーショントラッキングを有効化
  useNavigationTracking();

  return <>{children}</>;
}
