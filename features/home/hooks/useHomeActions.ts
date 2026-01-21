/**
 * useHomeActions Hook
 * ホーム画面のアクション（ナビゲーション、削除等）
 */

import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { showAlert } from "@/lib/web-alert";

interface UseHomeActionsOptions {
  refetch: () => Promise<void>;
}

interface UseHomeActionsReturn {
  handleChallengePress: (challengeId: number) => void;
  handleChallengeEdit: (challengeId: number) => void;
  handleChallengeDelete: (challengeId: number) => void;
  handleCreateChallenge: () => void;
  isDeleting: boolean;
}

export function useHomeActions({ refetch }: UseHomeActionsOptions): UseHomeActionsReturn {
  const router = useRouter();
  
  // チャレンジ削除ミューテーション
  const deleteChallengeMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      refetch();
      showAlert("削除完了", "チャレンジを削除しました");
    },
    onError: (error) => {
      showAlert("エラー", error.message || "削除に失敗しました");
    },
  });

  const handleChallengePress = (challengeId: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: challengeId.toString() },
    });
  };

  const handleChallengeEdit = (challengeId: number) => {
    router.push({
      pathname: "/event/edit/[id]" as any,
      params: { id: challengeId.toString() },
    });
  };

  const handleChallengeDelete = (challengeId: number) => {
    showAlert(
      "チャレンジを削除",
      "このチャレンジを削除しますか？\n参加者のデータも全て削除されます。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: () => deleteChallengeMutation.mutate({ id: challengeId }),
        },
      ]
    );
  };

  const handleCreateChallenge = () => {
    router.push("/(tabs)/create");
  };

  return {
    handleChallengePress,
    handleChallengeEdit,
    handleChallengeDelete,
    handleCreateChallenge,
    isDeleting: deleteChallengeMutation.isPending,
  };
}
