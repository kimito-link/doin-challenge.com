/**
 * ホーム画面の空の状態表示コンポーネント
 * チャレンジがない場合に表示される
 */

import { ScrollView } from "react-native";
import { ExperienceBanner } from "./ExperienceBanner";
import { CatchCopySection } from "./CatchCopySection";
import { HostEmptyState } from "@/components/organisms/host-empty-state";

interface HomeEmptyStateProps {
  onGenerateSamples?: () => void;
}

export function HomeEmptyState({ onGenerateSamples: _onGenerateSamples }: HomeEmptyStateProps) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0D1117" }}>
      {/* デモ体験バナー（ログインなしでお試し） */}
      <ExperienceBanner />
      
      {/* LP風キャッチコピー（チャレンジがない時も表示） */}
      <CatchCopySection />
      
      {/* 主催者向け空状態画面 */}
      <HostEmptyState />
    </ScrollView>
  );
}
