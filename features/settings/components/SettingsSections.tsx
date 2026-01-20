// features/settings/components/SettingsSections.tsx
// v6.18: 設定画面のセクションコンポーネント
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { settingsStyles as styles } from "../styles";
import type { SessionExpiryInfo } from "@/lib/token-manager";

type User = {
  id: number;
  name?: string | null;
  username?: string | null;
  profileImage?: string | null;
};

type Account = {
  id: string;
  profileImageUrl?: string | null;
};

// アカウントセクション
export function AccountSection({
  user,
  isAuthenticated,
  sessionExpiry,
  otherAccounts,
  onAccountSwitch,
  onLogout,
}: {
  user: User | null;
  isAuthenticated: boolean;
  sessionExpiry: SessionExpiryInfo | null;
  otherAccounts: Account[];
  onAccountSwitch: () => void;
  onLogout: () => void;
}) {
  return (
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
                <MaterialIcons name="person" size={24} color={color.textMuted} />
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
          
          {sessionExpiry && (
            <View style={styles.sessionExpiryRow}>
              <MaterialIcons 
                name={sessionExpiry.isExpired ? "warning" : "schedule"} 
                size={14} 
                color={sessionExpiry.isExpired ? color.danger : color.textMuted} 
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
          <MaterialIcons name="person-outline" size={32} color={color.textSubtle} />
          <Text style={styles.notLoggedInText}>ログインしていません</Text>
        </View>
      )}

      {/* アカウント切り替えボタン */}
      <TouchableOpacity
        onPress={onAccountSwitch}
        style={styles.menuItem}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemIcon}>
          <MaterialIcons name="swap-horiz" size={24} color={color.hostAccentLegacy} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>アカウントを切り替え</Text>
          <Text style={styles.menuItemDescription}>
            {otherAccounts.length > 0
              ? `${otherAccounts.length}件の保存済みアカウント`
              : "別のアカウントでログイン"}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
      </TouchableOpacity>

      {/* 保存済みアカウント一覧 */}
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
                    <MaterialIcons name="person" size={12} color={color.textMuted} />
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
          onPress={onLogout}
          style={[styles.menuItem, styles.logoutItem]}
          activeOpacity={0.7}
        >
          <View style={[styles.menuItemIcon, styles.logoutIcon]}>
            <MaterialIcons name="logout" size={24} color={color.danger} />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={[styles.menuItemTitle, styles.logoutText]}>ログアウト</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// 表示設定セクション
export function DisplaySection({
  themeIcon,
  onThemeSettings,
}: {
  themeIcon: string;
  onThemeSettings: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>表示</Text>

      <TouchableOpacity
        onPress={onThemeSettings}
        style={styles.menuItem}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemIcon}>
          <MaterialIcons name={themeIcon as any} size={24} color={color.hostAccentLegacy} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>テーマ設定</Text>
          <Text style={styles.menuItemDescription}>ダークモード</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
      </TouchableOpacity>
    </View>
  );
}

// 通知設定セクション
export function NotificationSection({
  onNotificationSettings,
}: {
  onNotificationSettings: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>通知</Text>

      <TouchableOpacity
        onPress={onNotificationSettings}
        style={styles.menuItem}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemIcon}>
          <MaterialIcons name="notifications" size={24} color={color.hostAccentLegacy} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>通知設定</Text>
          <Text style={styles.menuItemDescription}>
            プッシュ通知やリマインダーの設定
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
      </TouchableOpacity>
    </View>
  );
}

// ヘルプセクション
export function HelpSection({
  onHelp,
  onReplayTutorial,
  onClearCache,
}: {
  onHelp: () => void;
  onReplayTutorial: () => void;
  onClearCache: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ヘルプ</Text>

      <TouchableOpacity
        onPress={onHelp}
        style={styles.menuItem}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemIcon}>
          <MaterialIcons name="help-outline" size={24} color={color.hostAccentLegacy} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>使い方ガイド</Text>
          <Text style={styles.menuItemDescription}>
            アプリの使い方とよくある質問
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onReplayTutorial}
        style={styles.menuItem}
        activeOpacity={0.7}
      >
        <View style={[styles.menuItemIcon, { backgroundColor: "rgba(236, 72, 153, 0.1)" }]}>
          <MaterialIcons name="replay" size={24} color={color.accentPrimary} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>チュートリアルを見返す</Text>
          <Text style={styles.menuItemDescription}>
            はじめの説明をもう一度見る
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onClearCache}
        style={styles.menuItem}
        activeOpacity={0.7}
      >
        <View style={[styles.menuItemIcon, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
          <MaterialIcons name="cached" size={24} color={color.info} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>キャッシュをクリア</Text>
          <Text style={styles.menuItemDescription}>
            古いデータを削除して最新の情報を取得
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
      </TouchableOpacity>
    </View>
  );
}

// フッター
export function SettingsFooter({
  onTwitter,
}: {
  onTwitter: () => void;
}) {
  return (
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
        <TouchableOpacity onPress={onTwitter} style={styles.footerLink}>
          <MaterialIcons name="alternate-email" size={16} color={color.twitter} />
          <Text style={styles.footerLinkText}>@doin_challenge</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerCopyright}>
        © 2024 KimitoLink. All rights reserved.
      </Text>
    </View>
  );
}
