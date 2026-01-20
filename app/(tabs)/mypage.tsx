import { Text, View, ScrollView } from "react-native";
import { color, palette } from "@/theme/tokens";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useFollowStatus } from "@/hooks/use-follow-status";
import { useResponsive } from "@/hooks/use-responsive";
import { useColors } from "@/hooks/use-colors";
import { FollowPromptBanner } from "@/components/molecules/follow-gate";
import { AppHeader } from "@/components/organisms/app-header";
import { LogoutConfirmModal } from "@/components/molecules/logout-confirm-modal";
import { MypageSkeleton } from "@/components/organisms/mypage-skeleton";
import { AccountSwitcher } from "@/components/organisms/account-switcher";
import { TutorialResetButton } from "@/components/molecules/tutorial-reset-button";
import { 
  LoginScreen, 
  ProfileCard, 
  SettingsLinkItem, 
  loginPatterns, 
  getRandomPattern,
  BadgeSection,
  ParticipationSection,
  HostedChallengeSection
} from "@/features/mypage";



export default function MyPageScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  const { isFollowing, targetUsername, targetDisplayName, updateFollowStatus, refreshFromServer, refreshing, checkFollowStatusFromServer, checkingFollowStatus } = useFollowStatus();
  const { isDesktop, isTablet } = useResponsive();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginPattern, setLoginPattern] = useState(() => getRandomPattern());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  // v5.87: 性別編集用のstate
  const [editingParticipationId, setEditingParticipationId] = useState<number | null>(null);
  const [editGender, setEditGender] = useState<"male" | "female" | "">("")
  const [showGenderEditModal, setShowGenderEditModal] = useState(false);

  // ログイン時にフォロー状態を更新
  useEffect(() => {
    if (user?.isFollowingTarget !== undefined) {
      updateFollowStatus(user.isFollowingTarget, user.targetAccount);
    }
  }, [user?.isFollowingTarget, user?.targetAccount, updateFollowStatus]);

  // ログイン後に非同期でフォローステータスを確認（ログイン高速化のため）
  // 無限ループを防ぐため、一度だけチェックする
  const hasCheckedFollowStatus = useRef(false);
  useEffect(() => {
    // 既にチェック済み、またはチェック中の場合はスキップ
    if (hasCheckedFollowStatus.current || checkingFollowStatus) {
      return;
    }
    // ログイン済みでフォローステータスが未確認の場合のみチェック
    if (isAuthenticated && user && user.isFollowingTarget === undefined) {
      console.log("[MyPage] Checking follow status in background (once)...");
      hasCheckedFollowStatus.current = true;
      checkFollowStatusFromServer();
    }
  }, [isAuthenticated, user, checkingFollowStatus, checkFollowStatusFromServer]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      // Webではリダイレクトするので、ここには戻ってこない
      // Nativeではブラウザが開くので、少し待ってからリセット
      setTimeout(() => setIsLoggingIn(false), 3000);
    }
  };
  
  const { data: myChallenges } = trpc.events.myEvents.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myParticipations } = trpc.participations.myParticipations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myBadges } = trpc.badges.myBadges.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // v6.08: 招待実績を取得
  const { data: invitationStats } = trpc.invitations.myStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/logout");
  };

  const handleChallengePress = (challengeId: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: challengeId.toString() },
    });
  };

  // 総貢献度を計算
  const totalContribution = myParticipations?.reduce((sum, p) => sum + (p.contribution || 1), 0) || 0;

  if (loading) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <AppHeader 
          title="君斗りんくの動員ちゃれんじ" 
          showCharacters={false}
          isDesktop={isDesktop}
          showMenu={true}
        />
        <MypageSkeleton />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* ヘッダー */}
      <AppHeader 
        title="君斗りんくの動員ちゃれんじ" 
        showCharacters={false}
        isDesktop={isDesktop}
        showMenu={true}
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "bold" }}>
          マイページ
        </Text>
      </View>

      {!isAuthenticated ? (
        // 未ログイン状態 - LoginScreenコンポーネントを使用
        <LoginScreen
          isLoggingIn={isLoggingIn}
          loginPattern={loginPattern}
          onLogin={handleLogin}
          onPatternChange={setLoginPattern}
        />
      ) : (
        // ログイン済み状態
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* プロフィールカード */}
          <ProfileCard
            user={user}
            isFollowing={isFollowing}
            totalContribution={totalContribution}
            participationsCount={myParticipations?.length || 0}
            challengesCount={myChallenges?.length || 0}
            invitationStats={invitationStats}
            onAccountSwitch={() => setShowAccountSwitcher(true)}
            onLogout={handleLogout}
          />

          {/* フォロー促進バナー（未フォロー時のみ表示） */}
          {!isFollowing && (
            <FollowPromptBanner
              isFollowing={isFollowing}
              targetUsername={targetUsername}
              targetDisplayName={targetDisplayName}
              onRelogin={login}
              refreshing={refreshing}
            />
          )}

          {/* 設定リンク */}
          <SettingsLinkItem
            icon="emoji-events"
            iconColor={color.rankGold}
            title="アチーブメント"
            description="実績を解除してポイントを獲得しよう"
            onPress={() => router.push("/achievements")}
          />
          <SettingsLinkItem
            icon="notifications"
            iconColor={color.hostAccentLegacy}
            title="通知設定"
            description="目標達成やマイルストーンの通知を管理"
            onPress={() => router.push("/notification-settings")}
          />
          <SettingsLinkItem
            icon="palette"
            iconColor={color.accentAlt}
            title="テーマ設定"
            description="ライト/ダークモードを切り替え"
            onPress={() => router.push("/theme-settings")}
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
            onPress={() => router.push("/admin/api-usage")}
          />

          {/* バッジセクション */}
          <BadgeSection badges={myBadges} />

          {/* 参加チャレンジセクション */}
          <ParticipationSection 
            participations={myParticipations} 
            onChallengePress={handleChallengePress} 
          />

          {/* 主催チャレンジセクション */}
          <HostedChallengeSection 
            challenges={myChallenges} 
            onChallengePress={handleChallengePress} 
          />
        </ScrollView>
      )}

      {/* ログアウト確認モーダル */}
      <LogoutConfirmModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

      {/* アカウント切り替えモーダル */}
      <AccountSwitcher
        visible={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
      />
    </ScreenContainer>
  );
}
