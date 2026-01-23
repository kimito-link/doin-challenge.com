/**
 * ログイン成功モーダルラッパー
 * 
 * v6.63: 初回ログイン時は RoleSelectionModal、2回目以降は WelcomeModal を表示
 */
import { useLoginSuccess } from "@/lib/login-success-context";
import { WelcomeModal } from "./welcome-modal";
import { RoleSelectionModal } from "./role-selection-modal";

export function LoginSuccessModalWrapper() {
  const { 
    showLoginSuccess, 
    userName, 
    userProfileImage, 
    prefecture,
    isFirstLogin,
    dismissLoginSuccess 
  } = useLoginSuccess();

  // 初回ログイン時は役割選択モーダルを表示
  if (isFirstLogin) {
    return (
      <RoleSelectionModal
        visible={showLoginSuccess}
        onClose={dismissLoginSuccess}
        userName={userName || undefined}
        userProfileImage={userProfileImage || undefined}
      />
    );
  }

  // 2回目以降はウェルカムモーダルを表示
  return (
    <WelcomeModal
      visible={showLoginSuccess}
      onClose={dismissLoginSuccess}
      userName={userName || undefined}
      userProfileImage={userProfileImage || undefined}
      prefecture={prefecture || undefined}
    />
  );
}
