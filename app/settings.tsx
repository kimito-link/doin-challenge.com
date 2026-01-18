import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { AppHeader } from "@/components/organisms/app-header";
import { useAuth } from "@/hooks/use-auth";
import { useAccounts } from "@/hooks/use-accounts";
import { useThemeContext, getThemeModeLabel, getThemeModeIcon } from "@/lib/theme-provider";
import { AccountSwitcher } from "@/components/organisms/account-switcher";
import { getSessionExpiryInfo, SessionExpiryInfo } from "@/lib/token-manager";
import { useTutorial } from "@/lib/tutorial-context";
import { useResponsive } from "@/hooks/use-responsive";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showAlert } from "@/lib/web-alert";

/**
 * 総合設定画面
 * テーマ設定、アカウント管理、その他の設定を統合
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { accounts, currentAccountId, deleteAccount } = useAccounts();
  const { themeMode, colorScheme } = useThemeContext();
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
    
    // 1分ごとに更新
    const interval = setInterval(fetchSessionExpiry, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleBack = useCallback(() => {
    handleHaptic();
    router.back();
  }, [router, handleHaptic]);

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

  // v5.37: キャッシュクリア機能
  const handleClearCache = useCallback(async () => {
    handleHaptic();
    try {
      // キャッシュ関連のキーを取得して削除
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

  // 他のアカウント（現在のアカウント以外）
  const otherAccounts = accounts.filter((a) => a.id !== currentAccountId);

  const handleTwitter = useCallback(() => {
    handleHaptic();
    Linking.openURL("https://twitter.com/doin_challenge");
  }, [handleHaptic]);

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* ヘッダー */}
      <AppHeader
        title="設定"
        showCharacters={true}
        showLogo={true}
        isDesktop={isDesktop}
        showLoginStatus={false}
        showMenu={true}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* アカウント管理セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>

          {/* 現在のアカウント */}
          {isAuthenticated && user ? (
            <View style={styles.currentAccount}>
              <View style={styles.accountRow}>
                {user.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <MaterialIcons name="person" size={24} color="#D1D5DB" />
                  </View>
                )}
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName} numberOfLines={1}>
                    {user.name || user.username || "ユーザー"}
                  </Text>
                  {user.username && (
                    <Text style={styles.accountUsername} numberOfLines={1}>
                      @{user.username}
                    </Text>
                  )}
                </View>
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>ログイン中</Text>
                </View>
              </View>
              
              {/* セッション有効期限表示 */}
              {sessionExpiry && (
                <View style={styles.sessionExpiryRow}>
                  <MaterialIcons 
                    name={sessionExpiry.isExpired ? "warning" : "schedule"} 
                    size={14} 
                    color={sessionExpiry.isExpired ? "#EF4444" : "#D1D5DB"} 
                  />
                  <Text style={[
                    styles.sessionExpiryText,
                    sessionExpiry.isExpired && styles.sessionExpiryExpired
                  ]}>
                    セッション有効期限: {sessionExpiry.formattedExpiry}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.notLoggedIn}>
              <MaterialIcons name="person-outline" size={32} color="#9CA3AF" />
              <Text style={styles.notLoggedInText}>ログインしていません</Text>
            </View>
          )}

          {/* アカウント切り替えボタン */}
          <TouchableOpacity
            onPress={handleAccountSwitch}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <MaterialIcons name="swap-horiz" size={24} color="#DD6500" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>アカウントを切り替え</Text>
              <Text style={styles.menuItemDescription}>
                {otherAccounts.length > 0
                  ? `${otherAccounts.length}件の保存済みアカウント`
                  : "別のアカウントでログイン"}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* 保存済みアカウント一覧（簡易表示） */}
          {otherAccounts.length > 0 && (
            <View style={styles.savedAccountsPreview}>
              <Text style={styles.savedAccountsLabel}>保存済みアカウント:</Text>
              <View style={styles.savedAccountsAvatars}>
                {otherAccounts.slice(0, 3).map((account) => (
                  <View key={account.id} style={styles.savedAccountAvatar}>
                    {account.profileImageUrl ? (
                      <Image
                        source={{ uri: account.profileImageUrl }}
                        style={styles.savedAccountAvatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.savedAccountAvatarImage, styles.avatarPlaceholder]}>
                        <MaterialIcons name="person" size={12} color="#D1D5DB" />
                      </View>
                    )}
                  </View>
                ))}
                {otherAccounts.length > 3 && (
                  <View style={styles.moreAccountsBadge}>
                    <Text style={styles.moreAccountsText}>+{otherAccounts.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ログアウトボタン */}
          {isAuthenticated && (
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.menuItem, styles.logoutItem]}
              activeOpacity={0.7}
            >
              <View style={[styles.menuItemIcon, styles.logoutIcon]}>
                <MaterialIcons name="logout" size={24} color="#EF4444" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, styles.logoutText]}>ログアウト</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* 表示設定セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>表示</Text>

          <TouchableOpacity
            onPress={handleThemeSettings}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <MaterialIcons
                name={getThemeModeIcon(themeMode) as any}
                size={24}
                color="#DD6500"
              />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>テーマ</Text>
              <Text style={styles.menuItemDescription}>
                {getThemeModeLabel(themeMode)} ({colorScheme === "dark" ? "ダーク" : "ライト"})
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* 通知設定セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>

          <TouchableOpacity
            onPress={handleNotificationSettings}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <MaterialIcons name="notifications" size={24} color="#DD6500" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>通知設定</Text>
              <Text style={styles.menuItemDescription}>
                プッシュ通知やリマインダーの設定
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* ヘルプセクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ヘルプ</Text>

          <TouchableOpacity
            onPress={handleHelp}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <MaterialIcons name="help-outline" size={24} color="#DD6500" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>使い方ガイド</Text>
              <Text style={styles.menuItemDescription}>
                アプリの使い方とよくある質問
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReplayTutorial}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: "rgba(236, 72, 153, 0.1)" }]}>
              <MaterialIcons name="replay" size={24} color="#EC4899" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>チュートリアルを見返す</Text>
              <Text style={styles.menuItemDescription}>
                はじめの説明をもう一度見る
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* v5.37: キャッシュクリアボタン */}
          <TouchableOpacity
            onPress={handleClearCache}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
              <MaterialIcons name="cached" size={24} color="#3B82F6" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>キャッシュをクリア</Text>
              <Text style={styles.menuItemDescription}>
                古いデータを削除して最新の情報を取得
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <View style={styles.footerLogoContainer}>
            <Image
              source={require("@/assets/images/logo/logo-color.jpg")}
              style={styles.footerLogo}
              contentFit="contain"
            />
            <Text style={styles.footerAppName}>動員ちゃれんじ</Text>
          </View>
          <Text style={styles.footerVersion}>v1.0.0</Text>
          <Text style={styles.footerSubtext}>設定はこのデバイスに保存されます</Text>
          
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={handleTwitter} style={styles.footerLink}>
              <MaterialIcons name="alternate-email" size={16} color="#1DA1F2" />
              <Text style={styles.footerLinkText}>@doin_challenge</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.footerCopyright}>
            © 2024 KimitoLink. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* アカウント切り替えモーダル */}
      <AccountSwitcher
        visible={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3139",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3139",
  },
  sectionTitle: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  currentAccount: {
    backgroundColor: "#1A1D21",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  accountUsername: {
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  notLoggedIn: {
    backgroundColor: "#1A1D21",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  notLoggedInText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1D21",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(221, 101, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemDescription: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 2,
  },
  savedAccountsPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  savedAccountsLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    marginRight: 8,
  },
  savedAccountsAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  savedAccountAvatar: {
    marginLeft: -8,
  },
  savedAccountAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#151718",
  },
  moreAccountsBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    borderWidth: 2,
    borderColor: "#151718",
  },
  moreAccountsText: {
    color: "#D1D5DB",
    fontSize: 10,
    fontWeight: "600",
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  logoutText: {
    color: "#EF4444",
  },
  sessionExpiryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2D3139",
  },
  sessionExpiryText: {
    color: "#D1D5DB",
    fontSize: 12,
    marginLeft: 6,
  },
  sessionExpiryExpired: {
    color: "#EF4444",
  },
  footer: {
    padding: 24,
    paddingTop: 32,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2D3139",
    marginTop: 16,
  },
  footerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  footerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  footerAppName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  footerVersion: {
    color: "#D1D5DB",
    fontSize: 12,
    marginBottom: 4,
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  footerSubtext: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 16,
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(29, 161, 242, 0.1)",
  },
  footerLinkText: {
    color: "#1DA1F2",
    fontSize: 13,
    marginLeft: 4,
  },
  footerCopyright: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 16,
  },
});
