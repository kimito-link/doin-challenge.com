/**
 * features/settings/components/SettingsSections.tsx
 * v6.36: テーマ切り替え機能を削除（ダークモードのみに固定）
 */
import { View, Text } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { settingsStyles as styles } from "./SettingsSections.styles";
import { Button } from "@/components/ui/button";
import type { SessionExpiryInfo } from "@/lib/token-manager";
import { AppFooter } from "@/components/atoms/app-footer";

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

// メニューアイテムコンポーネント（共通化）
function MenuItem({
  icon,
  iconColor = color.hostAccentLegacy,
  iconBgColor,
  title,
  description,
  onPress,
  danger = false,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      onPress={onPress}
      fullWidth
      style={[styles.menuItem, danger && styles.logoutItem]}
    >
      <View style={[styles.menuItemIcon, iconBgColor && { backgroundColor: iconBgColor }, danger && styles.logoutIcon]}>
        <MaterialIcons name={icon} size={24} color={danger ? color.danger : iconColor} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, danger && styles.logoutText]}>{title}</Text>
        {description && <Text style={styles.menuItemDescription}>{description}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={24} color={color.textSubtle} />
    </Button>
  );
}

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
      <MenuItem
        icon="swap-horiz"
        title="アカウントを切り替え"
        description={otherAccounts.length > 0
          ? `${otherAccounts.length}件の保存済みアカウント`
          : "別のアカウントでログイン"}
        onPress={onAccountSwitch}
      />

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
        <MenuItem
          icon="logout"
          title="ログアウト"
          onPress={onLogout}
          danger
        />
      )}
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

      <MenuItem
        icon="notifications"
        title="通知設定"
        description="プッシュ通知やリマインダーの設定"
        onPress={onNotificationSettings}
      />
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

      <MenuItem
        icon="help-outline"
        title="使い方ガイド"
        description="アプリの使い方とよくある質問"
        onPress={onHelp}
      />

      <MenuItem
        icon="replay"
        iconColor={color.accentPrimary}
        iconBgColor="rgba(236, 72, 153, 0.1)"
        title="チュートリアルを見返す"
        description="はじめの説明をもう一度見る"
        onPress={onReplayTutorial}
      />

      <MenuItem
        icon="cached"
        iconColor={color.info}
        iconBgColor="rgba(59, 130, 246, 0.1)"
        title="キャッシュをクリア"
        description="古いデータを削除して最新の情報を取得"
        onPress={onClearCache}
      />
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
        <AppFooter 
        showLogo 
        showAppName 
        showVersion 
        showSubtext 
        showCopyright 
      />
      
      <View style={styles.footerLinks}>
        <Button variant="ghost" onPress={onTwitter} style={styles.footerLink}>
          <MaterialIcons name="alternate-email" size={16} color={color.twitter} />
          <Text style={styles.footerLinkText}>@doin_challenge</Text>
        </Button>
      </View>
    </View>
  );
}
