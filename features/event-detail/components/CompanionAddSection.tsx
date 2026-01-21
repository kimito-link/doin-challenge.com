/**
 * CompanionAddSection Component
 * 友人追加部分（友人リスト、追加フォーム、Twitter検索）
 * 
 * 分割されたサブコンポーネント:
 * - TwitterSearchForm: Twitter検索フォーム
 * - CompanionList: 友人リスト
 * - ContributionDisplay: 貢献人数表示
 */

import { View, Text, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import type { Companion, LookedUpProfile } from "../types";
import {
  TwitterSearchForm,
  CompanionList,
  ContributionDisplay,
} from "./companion";

interface CompanionAddSectionProps {
  companions: Companion[];
  showAddCompanionForm: boolean;
  setShowAddCompanionForm: (value: boolean) => void;
  newCompanionName: string;
  setNewCompanionName: (value: string) => void;
  newCompanionTwitter: string;
  setNewCompanionTwitter: (value: string) => void;
  isLookingUpTwitter: boolean;
  lookupError: string | null;
  lookedUpProfile: LookedUpProfile | null;
  setLookedUpProfile: (value: LookedUpProfile | null) => void;
  setLookupError: (value: string | null) => void;
  onAddCompanion: () => void;
  onRemoveCompanion: (id: string) => void;
  onLookupTwitterProfile: (input: string) => Promise<void>;
}

export function CompanionAddSection({
  companions,
  showAddCompanionForm,
  setShowAddCompanionForm,
  newCompanionName,
  setNewCompanionName,
  newCompanionTwitter,
  setNewCompanionTwitter,
  isLookingUpTwitter,
  lookupError,
  lookedUpProfile,
  setLookedUpProfile,
  setLookupError,
  onAddCompanion,
  onRemoveCompanion,
  onLookupTwitterProfile,
}: CompanionAddSectionProps) {
  const colors = useColors();

  // フォームをキャンセルしてリセット
  const handleCancelForm = () => {
    setShowAddCompanionForm(false);
    setNewCompanionName("");
    setNewCompanionTwitter("");
    setLookedUpProfile(null);
    setLookupError(null);
  };
  
  return (
    <View style={{ marginBottom: 16 }}>
      {/* ヘッダー */}
      <SectionHeader onAddClick={() => setShowAddCompanionForm(true)} />

      {/* 友人追加フォーム */}
      {showAddCompanionForm && (
        <TwitterSearchForm
          newCompanionName={newCompanionName}
          setNewCompanionName={setNewCompanionName}
          newCompanionTwitter={newCompanionTwitter}
          setNewCompanionTwitter={setNewCompanionTwitter}
          isLookingUpTwitter={isLookingUpTwitter}
          lookupError={lookupError}
          lookedUpProfile={lookedUpProfile}
          setLookedUpProfile={setLookedUpProfile}
          setLookupError={setLookupError}
          onAdd={onAddCompanion}
          onCancel={handleCancelForm}
          onLookup={onLookupTwitterProfile}
        />
      )}

      {/* 登録済み友人リスト */}
      <CompanionList
        companions={companions}
        onRemoveCompanion={onRemoveCompanion}
      />

      {/* 貢献人数表示 */}
      <ContributionDisplay companionCount={companions.length} />
    </View>
  );
}

// セクションヘッダー
function SectionHeader({ onAddClick }: { onAddClick: () => void }) {
  const colors = useColors();
  
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
        一緒に参加する友人（任意）
      </Text>
      <Pressable
        onPress={onAddClick}
        style={{
          backgroundColor: color.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <MaterialIcons name="person-add" size={16} color={color.accentPrimary} />
        <Text style={{ color: color.accentPrimary, fontSize: 14, marginLeft: 6 }}>友人を追加</Text>
      </Pressable>
    </View>
  );
}
