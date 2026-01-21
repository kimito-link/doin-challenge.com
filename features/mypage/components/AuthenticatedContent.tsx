/**
 * AuthenticatedContent Component
 * マイページのログイン済みユーザー向けコンテンツ
 */

import { View, ScrollView } from "react-native";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { FollowPromptBanner } from "@/components/molecules/follow-gate";
import { TutorialResetButton } from "@/components/molecules/tutorial-reset-button";
import { ProfileCard } from "./ProfileCard";
import { SettingsLinkItem } from "./SettingsLinkItem";
import { BadgeSection } from "./sections/BadgeSection";
import { ParticipationSection } from "./sections/ParticipationSection";
import { HostedChallengeSection } from "./sections/HostedChallengeSection";

interface AuthenticatedContentProps {
  // User data
  user: any;
  totalContribution: number;
  participationsCount: number;
  challengesCount: number;
  invitationStats: any;
  
  // Follow status
  isFollowing: boolean | undefined;
  targetUsername: string;
  targetDisplayName: string;
  refreshing: boolean;
  onRelogin: () => Promise<void>;
  
  // Data
  myBadges: any[] | undefined;
  myParticipations: any[] | undefined;
  myChallenges: any[] | undefined;
  
  // Handlers
  onAccountSwitch: () => void;
  onLogout: () => void;
  onChallengePress: (id: number) => void;
  onNavigateToAchievements: () => void;
  onNavigateToNotificationSettings: () => void;
  onNavigateToThemeSettings: () => void;
  onNavigateToApiUsage: () => void;
}

export function AuthenticatedContent({
  user,
  totalContribution,
  participationsCount,
  challengesCount,
  invitationStats,
  isFollowing,
  targetUsername,
  targetDisplayName,
  refreshing,
  onRelogin,
  myBadges,
  myParticipations,
  myChallenges,
  onAccountSwitch,
  onLogout,
  onChallengePress,
  onNavigateToAchievements,
  onNavigateToNotificationSettings,
  onNavigateToThemeSettings,
  onNavigateToApiUsage,
}: AuthenticatedContentProps) {
  const colors = useColors();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* プロフィールカード */}
      <ProfileCard
        user={user}
        isFollowing={isFollowing ?? false}
        totalContribution={totalContribution}
        participationsCount={participationsCount}
        challengesCount={challengesCount}
        invitationStats={invitationStats}
        onAccountSwitch={onAccountSwitch}
        onLogout={onLogout}
      />

      {/* フォロー促進バナー（未フォロー時のみ表示） */}
      {!isFollowing && (
        <FollowPromptBanner
          isFollowing={isFollowing ?? false}
          targetUsername={targetUsername}
          targetDisplayName={targetDisplayName}
          onRelogin={onRelogin}
          refreshing={refreshing}
        />
      )}

      {/* 設定リンク */}
      <SettingsLinkItem
        icon="emoji-events"
        iconColor={color.rankGold}
        title="アチーブメント"
        description="実績を解除してポイントを獲得しよう"
        onPress={onNavigateToAchievements}
      />
      <SettingsLinkItem
        icon="notifications"
        iconColor={color.hostAccentLegacy}
        title="通知設定"
        description="目標達成やマイルストーンの通知を管理"
        onPress={onNavigateToNotificationSettings}
      />
      <SettingsLinkItem
        icon="palette"
        iconColor={color.accentAlt}
        title="テーマ設定"
        description="ライト/ダークモードを切り替え"
        onPress={onNavigateToThemeSettings}
      />

      {/* チュートリアル再表示 */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <TutorialResetButton />
      </View>

      <SettingsLinkItem
        icon="analytics"
        iconColor={color.info}
        title="API使用量"
        description="Twitter APIのレート制限状況"
        onPress={onNavigateToApiUsage}
      />

      {/* バッジセクション */}
      <BadgeSection badges={myBadges} />

      {/* 参加チャレンジセクション */}
      <ParticipationSection 
        participations={myParticipations} 
        onChallengePress={onChallengePress} 
      />

      {/* 主催チャレンジセクション */}
      <HostedChallengeSection 
        challenges={myChallenges} 
        onChallengePress={onChallengePress} 
      />
    </ScrollView>
  );
}
