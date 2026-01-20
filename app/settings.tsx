// app/settings.tsx
// v6.18: リファクタリング済み設定画面
import { useState, useCallback, useEffect } from "react";
import { ScrollView, Platform, Linking } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/organisms/screen-container";
import { AppHeader } from "@/components/organisms/app-header";
import { AccountSwitcher } from "@/components/organisms/account-switcher";
import { useAuth } from "@/hooks/use-auth";
import { useAccounts } from "@/hooks/use-accounts";
import { useThemeContext, getThemeModeIcon } from "@/lib/theme-provider";
import { getSessionExpiryInfo, SessionExpiryInfo } from "@/lib/token-manager";
import { useTutorial } from "@/lib/tutorial-context";
import { useResponsive } from "@/hooks/use-responsive";
import { showAlert } from "@/lib/web-alert";

import {
  AccountSection,
  DisplaySection,
  NotificationSection,
  HelpSection,
  SettingsFooter,
  settingsStyles as styles,
} from "@/features/settings";

/**
 * 総合設定画面
 * テーマ設定、アカウント管理、その他の設定を統合
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { accounts, currentAccountId } = useAccounts();
  const { themeMode } = useThemeContext();
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<SessionExpiryInfo | null>(null);
  const { resetTutorial } = useTutorial();
  const { isDesktop } = useResponsive();

  // セッション有効期限を取得・更新
  useEffect(() => {
    const fetchSessionExpiry = async () => {
      if (isAuthenticated) {
        const expiry = await getSessionExpiryInfo();
        setSessionExpiry(expiry);
      } else {
        setSessionExpiry(null);
      }
    };
    
    fetchSessionExpiry();
    const interval = setInterval(fetchSessionExpiry, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleThemeSettings = useCallback(() => {
    handleHaptic();
    router.push("/theme-settings");
  }, [router, handleHaptic]);

  const handleNotificationSettings = useCallback(() => {
    handleHaptic();
    router.push("/notification-settings");
  }, [router, handleHaptic]);

  const handleAccountSwitch = useCallback(() => {
    handleHaptic();
    setShowAccountSwitcher(true);
  }, [handleHaptic]);

  const handleLogout = useCallback(() => {
    handleHaptic();
    router.push("/logout");
  }, [router, handleHaptic]);

  const handleHelp = useCallback(() => {
    handleHaptic();
    router.push("/help");
  }, [router, handleHaptic]);

  const handleReplayTutorial = useCallback(async () => {
    handleHaptic();
    await resetTutorial();
  }, [handleHaptic, resetTutorial]);

  const handleClearCache = useCallback(async () => {
    handleHaptic();
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith('prefetch:') || 
        key.startsWith('offline_cache_') || 
        key.startsWith('cache_expiry_') ||
        key.startsWith('api_cache:')
      );
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
      
      showAlert("キャッシュをクリアしました", cacheKeys.length + "件のキャッシュデータを削除しました。最新のデータを取得するには、ホーム画面を下に引っ張って更新してください。");
    } catch (error) {
      console.error("Failed to clear cache:", error);
      showAlert("エラー", "キャッシュのクリアに失敗しました");
    }
  }, [handleHaptic]);

  const handleTwitter = useCallback(() => {
    handleHaptic();
    Linking.openURL("https://twitter.com/doin_challenge");
  }, [handleHaptic]);

  // 他のアカウント（現在のアカウント以外）
  const otherAccounts = accounts.filter((a) => a.id !== currentAccountId);

  return (
    <ScreenContainer containerClassName="bg-background">
      <AppHeader
        title="設定"
        showCharacters={true}
        showLogo={true}
        isDesktop={isDesktop}
        showLoginStatus={false}
        showMenu={true}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <AccountSection
          user={user}
          isAuthenticated={isAuthenticated}
          sessionExpiry={sessionExpiry}
          otherAccounts={otherAccounts}
          onAccountSwitch={handleAccountSwitch}
          onLogout={handleLogout}
        />

        <DisplaySection
          themeIcon={getThemeModeIcon(themeMode)}
          onThemeSettings={handleThemeSettings}
        />

        <NotificationSection
          onNotificationSettings={handleNotificationSettings}
        />

        <HelpSection
          onHelp={handleHelp}
          onReplayTutorial={handleReplayTutorial}
          onClearCache={handleClearCache}
        />

        <SettingsFooter onTwitter={handleTwitter} />
      </ScrollView>

      <AccountSwitcher
        visible={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
      />
    </ScreenContainer>
  );
}
