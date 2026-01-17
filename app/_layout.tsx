import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { LoginSuccessProvider } from "@/lib/login-success-context";
import { LoginSuccessModalWrapper } from "@/components/molecules/login-success-modal-wrapper";
import { OfflineBanner } from "@/components/organisms/offline-banner";
import { ToastProvider } from "@/components/atoms/toast";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { preloadCriticalImages } from "@/lib/image-preload";
import { registerServiceWorker } from "@/lib/service-worker";
import { initAutoSync } from "@/lib/offline-sync";
import { startNetworkMonitoring, stopNetworkMonitoring } from "@/lib/api";
import { initSyncHandlers } from "@/lib/sync-handlers";
import { AutoLoginProvider } from "@/lib/auto-login-provider";
import { TutorialProvider, useTutorial } from "@/lib/tutorial-context";
import { TutorialOverlay } from "@/components/organisms/tutorial-overlay";
import { UserTypeSelector } from "@/components/organisms/user-type-selector";
import { LoginPromptModal } from "@/components/organisms/login-prompt-modal";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

/**
 * チュートリアルUI（ユーザータイプ選択 + チュートリアルオーバーレイ）
 */
function TutorialUI() {
  const tutorial = useTutorial();

  return (
    <>
      {/* ユーザータイプ選択画面 */}
      <UserTypeSelector
        visible={tutorial.showUserTypeSelector}
        onSelect={tutorial.selectUserType}
        onSkip={tutorial.skipTutorial}
      />
      
      {/* チュートリアルオーバーレイ */}
      {tutorial.currentStep && (
        <TutorialOverlay
          step={tutorial.currentStep}
          stepNumber={tutorial.currentStepIndex + 1}
          totalSteps={tutorial.totalSteps}
          onNext={tutorial.nextStep}
          onComplete={tutorial.completeTutorial}
          visible={tutorial.isActive}
        />
      )}
      
      {/* チュートリアル完了後のログイン誘導モーダル */}
      <LoginPromptModal
        visible={tutorial.showLoginPrompt}
        onLogin={tutorial.dismissLoginPrompt}
        onSkip={tutorial.dismissLoginPrompt}
      />
    </>
  );
}

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
    // 重要な画像をプリロード（キャラクター等）
    preloadCriticalImages();
    // Service Workerを登録（Webのみ）
    registerServiceWorker();
    // オフライン同期ハンドラーを初期化
    initSyncHandlers();
    // オンライン復帰時の自動同期を初期化
    const unsubscribeSync = initAutoSync();
    // APIオフラインキューのネットワーク監視を開始
    startNetworkMonitoring();
    return () => {
      unsubscribeSync();
      stopNetworkMonitoring();
    };
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // v5.36: キャッシュ期間を延長。2回目以降の表示を瞬時に
            // Cache data for 30 minutes (stale-while-revalidate)
            staleTime: 30 * 60 * 1000,
            // Keep cached data for 2 hours
            gcTime: 2 * 60 * 60 * 1000,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1, overflow: "hidden" }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AutoLoginProvider>
            <LoginSuccessProvider>
              <TutorialProvider>
                <ToastProvider>
                  {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
                  {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="oauth/callback" />
                  </Stack>
                  <StatusBar style="auto" />
                  <LoginSuccessModalWrapper />
                  <OfflineBanner />
                  <TutorialUI />
                </ToastProvider>
              </TutorialProvider>
            </LoginSuccessProvider>
          </AutoLoginProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
