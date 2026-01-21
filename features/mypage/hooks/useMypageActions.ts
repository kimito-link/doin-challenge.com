/**
 * useMypageActions Hook
 * マイページのアクション（ナビゲーション、ログイン/ログアウト等）
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useFollowStatus } from "@/hooks/use-follow-status";
import { getRandomPattern } from "../components/LoginScreen";

interface UseMypageActionsOptions {
  user: any;
  isAuthenticated: boolean;
  login: () => Promise<void>;
}

interface UseMypageActionsReturn {
  // Login
  isLoggingIn: boolean;
  loginPattern: any;
  handleLogin: () => Promise<void>;
  setLoginPattern: (pattern: any) => void;
  
  // Logout
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  handleLogout: () => void;
  confirmLogout: () => void;
  
  // Account Switcher
  showAccountSwitcher: boolean;
  setShowAccountSwitcher: (show: boolean) => void;
  
  // Follow Status
  isFollowing: boolean | undefined;
  targetUsername: string;
  targetDisplayName: string;
  refreshing: boolean;
  
  // Navigation
  handleChallengePress: (challengeId: number) => void;
  navigateToAchievements: () => void;
  navigateToNotificationSettings: () => void;
  navigateToThemeSettings: () => void;
  navigateToApiUsage: () => void;
}

export function useMypageActions({
  user,
  isAuthenticated,
  login,
}: UseMypageActionsOptions): UseMypageActionsReturn {
  const router = useRouter();
  const { 
    isFollowing, 
    targetUsername, 
    targetDisplayName, 
    updateFollowStatus, 
    refreshFromServer, 
    refreshing, 
    checkFollowStatusFromServer, 
    checkingFollowStatus 
  } = useFollowStatus();
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginPattern, setLoginPattern] = useState(() => getRandomPattern());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  // ログイン時にフォロー状態を更新
  useEffect(() => {
    if (user?.isFollowingTarget !== undefined) {
      updateFollowStatus(user.isFollowingTarget, user.targetAccount);
    }
  }, [user?.isFollowingTarget, user?.targetAccount, updateFollowStatus]);

  // ログイン後に非同期でフォローステータスを確認
  const hasCheckedFollowStatus = useRef(false);
  useEffect(() => {
    if (hasCheckedFollowStatus.current || checkingFollowStatus) {
      return;
    }
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
      setTimeout(() => setIsLoggingIn(false), 3000);
    }
  };

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

  const navigateToAchievements = () => router.push("/achievements");
  const navigateToNotificationSettings = () => router.push("/notification-settings");
  const navigateToThemeSettings = () => router.push("/theme-settings");
  const navigateToApiUsage = () => router.push("/admin/api-usage");

  return {
    // Login
    isLoggingIn,
    loginPattern,
    handleLogin,
    setLoginPattern,
    
    // Logout
    showLogoutModal,
    setShowLogoutModal,
    handleLogout,
    confirmLogout,
    
    // Account Switcher
    showAccountSwitcher,
    setShowAccountSwitcher,
    
    // Follow Status
    isFollowing,
    targetUsername,
    targetDisplayName,
    refreshing,
    
    // Navigation
    handleChallengePress,
    navigateToAchievements,
    navigateToNotificationSettings,
    navigateToThemeSettings,
    navigateToApiUsage,
  };
}
