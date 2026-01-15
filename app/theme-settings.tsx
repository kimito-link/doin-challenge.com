import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ThemeSettingsPanel } from "@/components/theme-settings";

/**
 * テーマ設定画面
 * ライト/ダーク/システム設定の切り替え
 */
export default function ThemeSettingsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer containerClassName="bg-[#151718]">
      <ThemeSettingsPanel onClose={() => router.back()} />
    </ScreenContainer>
  );
}
