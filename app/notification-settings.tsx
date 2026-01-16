import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { NotificationSettingsPanel } from "@/components/organisms/notification-settings";

/**
 * 通知設定画面
 * プッシュ通知の各種設定を管理
 */
export default function NotificationSettingsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer containerClassName="bg-background">
      <NotificationSettingsPanel onClose={() => router.back()} />
    </ScreenContainer>
  );
}
