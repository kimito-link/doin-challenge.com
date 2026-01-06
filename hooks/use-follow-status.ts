import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FOLLOW_STATUS_KEY = "twitter_follow_status";
const TARGET_USERNAME = "idolfunch";
const TARGET_DISPLAY_NAME = "君斗りんく";

interface FollowStatusData {
  isFollowing: boolean;
  targetUsername: string;
  targetDisplayName: string;
  targetTwitterId?: string;
  lastCheckedAt?: string;
}

/**
 * Twitterフォロー状態を管理するカスタムフック
 */
export function useFollowStatus() {
  const [followStatus, setFollowStatus] = useState<FollowStatusData>({
    isFollowing: false,
    targetUsername: TARGET_USERNAME,
    targetDisplayName: TARGET_DISPLAY_NAME,
  });
  const [loading, setLoading] = useState(true);

  // ローカルストレージからフォロー状態を読み込む
  const loadFollowStatus = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FOLLOW_STATUS_KEY);
      if (stored) {
        const data = JSON.parse(stored) as FollowStatusData;
        setFollowStatus(data);
      }
    } catch (error) {
      console.error("[useFollowStatus] Failed to load follow status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // フォロー状態を保存する
  const saveFollowStatus = useCallback(async (data: FollowStatusData) => {
    try {
      await AsyncStorage.setItem(FOLLOW_STATUS_KEY, JSON.stringify(data));
      setFollowStatus(data);
    } catch (error) {
      console.error("[useFollowStatus] Failed to save follow status:", error);
    }
  }, []);

  // フォロー状態を更新する（ログイン時にサーバーから取得した情報で更新）
  const updateFollowStatus = useCallback(
    async (isFollowing: boolean, targetUser?: { id: string; name: string; username: string }) => {
      const data: FollowStatusData = {
        isFollowing,
        targetUsername: targetUser?.username || TARGET_USERNAME,
        targetDisplayName: targetUser?.name || TARGET_DISPLAY_NAME,
        targetTwitterId: targetUser?.id,
        lastCheckedAt: new Date().toISOString(),
      };
      await saveFollowStatus(data);
    },
    [saveFollowStatus]
  );

  // フォロー状態をクリアする（ログアウト時）
  const clearFollowStatus = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(FOLLOW_STATUS_KEY);
      setFollowStatus({
        isFollowing: false,
        targetUsername: TARGET_USERNAME,
        targetDisplayName: TARGET_DISPLAY_NAME,
      });
    } catch (error) {
      console.error("[useFollowStatus] Failed to clear follow status:", error);
    }
  }, []);

  // 初期読み込み
  useEffect(() => {
    loadFollowStatus();
  }, [loadFollowStatus]);

  return {
    ...followStatus,
    loading,
    updateFollowStatus,
    clearFollowStatus,
    refresh: loadFollowStatus,
  };
}

/**
 * プレミアム機能のリスト
 */
export const PREMIUM_FEATURES = [
  {
    id: "create_challenge",
    name: "チャレンジ作成",
    description: "新しいチャレンジを作成できます",
    icon: "add-circle",
    isPremium: true,
  },
  {
    id: "statistics",
    name: "統計ダッシュボード",
    description: "詳細な統計情報を閲覧できます",
    icon: "analytics",
    isPremium: true,
  },
  {
    id: "collaboration",
    name: "コラボ機能",
    description: "他のホストと共同でチャレンジを開催できます",
    icon: "people",
    isPremium: true,
  },
  {
    id: "export",
    name: "データエクスポート",
    description: "参加者データをエクスポートできます",
    icon: "download",
    isPremium: true,
  },
  {
    id: "templates",
    name: "テンプレート保存",
    description: "チャレンジ設定をテンプレートとして保存できます",
    icon: "bookmark",
    isPremium: true,
  },
] as const;

/**
 * 機能がプレミアム限定かどうかをチェック
 */
export function isPremiumFeature(featureId: string): boolean {
  const feature = PREMIUM_FEATURES.find((f) => f.id === featureId);
  return feature?.isPremium ?? false;
}
