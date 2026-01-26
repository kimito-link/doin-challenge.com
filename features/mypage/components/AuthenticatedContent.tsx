/**
 * AuthenticatedContent Component
 * マイページのログイン済みユーザー向けコンテンツ
 */

import { View, ScrollView } from "react-native";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/atoms/toast";
import type { Gender } from "@/components/ui/gender-selector";
import { FollowPromptBanner } from "@/components/molecules/follow-gate";
import { TutorialResetButton } from "@/components/molecules/tutorial-reset-button";
import { ProfileCard } from "./ProfileCard";
import { SettingsLinkItem } from "./SettingsLinkItem";
import { BadgeSection } from "./sections/BadgeSection";
import { FavoriteSection } from "./sections/FavoriteSection";
import { ParticipationSection } from "./sections/ParticipationSection";
import { HostedChallengeSection } from "./sections/HostedChallengeSection";
import { RoleSection } from "./sections/RoleSection";
import { GenderSection } from "./sections/GenderSection";

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
  onRefreshFollowStatus?: () => Promise<void>;
  
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
  onRefreshFollowStatus,
  myBadges,
  myParticipations,
  myChallenges,
  onAccountSwitch,
  onLogout,
  onChallengePress,
  onNavigateToAchievements,
  onNavigateToNotificationSettings,
  onNavigateToApiUsage,
}: AuthenticatedContentProps) {
  const colors = useColors();
  const utils = trpc.useUtils();
  const toast = useToast();

  // 性別更新のmutation
  const updateGender = trpc.profiles.updateGender.useMutation({
    // 楽観更新
    onMutate: async ({ gender }) => {
      await utils.auth.me.cancel();
      const prev = utils.auth.me.getData();
      utils.auth.me.setData(undefined, (old) => old ? { ...old, gender } : old);
      return { prev };
    },
    // 失敗したら戻す
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.auth.me.setData(undefined, ctx.prev);
      toast.showError("性別の更新に失敗しました");
    },
    // 成功時
    onSuccess: () => {
      toast.showSuccess("性別を更新しました");
    },
    // 成功/失敗どちらでも最終的に整合
    onSettled: async () => {
      await utils.auth.me.invalidate();
    },
  });

  // 性別変更ハンドラー
  const handleGenderChange = (next: Gender) => {
    // 二重送信防止
    if (updateGender.isPending) return;
    
    // Gender型をAPIの期待する型に変換
    const apiGender: "male" | "female" | "other" | null = 
      next === "" || next === "unspecified" ? null : next;
    
    updateGender.mutate({ gender: apiGender });
  };

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

      {/* 役割セクション（ファン/主催者） */}
      <RoleSection
        participationsCount={participationsCount}
        totalContribution={totalContribution}
        challengesCount={challengesCount}
        isAdmin={user?.isAdmin ?? false}
      />

      {/* 性別設定セクション */}
      <GenderSection
        gender={user?.gender ?? null}
        onGenderChange={handleGenderChange}
        disabled={updateGender.isPending}
      />

      {/* フォロー促進バナー（未フォロー時のみ表示） */}
      {!isFollowing && (
        <FollowPromptBanner
          isFollowing={isFollowing ?? false}
          targetUsername={targetUsername}
          targetDisplayName={targetDisplayName}
          onRelogin={onRelogin}
          onRefreshFollowStatus={onRefreshFollowStatus}
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
      {/* チュートリアル再表示 */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <TutorialResetButton />
      </View>

      {/* バッジセクション */}
      <BadgeSection badges={myBadges} />

      {/* 気になるイベントリスト */}
      <FavoriteSection />

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
