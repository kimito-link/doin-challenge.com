/**
 * LoginButton Component
 * Xアカウント認証ボタン
 */

import { Button } from "@/components/ui/button";
import { mypageUI } from "../../ui/theme/tokens";

interface LoginButtonProps {
  isLoggingIn: boolean;
  onLogin: () => void;
}

export function LoginButton({ isLoggingIn, onLogin }: LoginButtonProps) {
  return (
    <Button
      onPress={onLogin}
      disabled={isLoggingIn}
      loading={isLoggingIn}
      icon="login"
      style={{
        backgroundColor: mypageUI.twitterBg,
        maxWidth: 400,
        width: "100%",
      }}
    >
      {isLoggingIn ? "認証中..." : "Xアカウントで認証しています"}
    </Button>
  );
}
