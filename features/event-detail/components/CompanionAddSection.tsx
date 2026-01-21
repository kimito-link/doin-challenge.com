/**
 * CompanionAddSection Component
 * 友人追加部分（友人リスト、追加フォーム、Twitter検索）
 */

import { View, Text, Pressable, TextInput } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import type { Companion, LookedUpProfile } from "../types";

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
  
  return (
    <View style={{ marginBottom: 16 }}>
      {/* ヘッダー */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
          一緒に参加する友人（任意）
        </Text>
        <Pressable
          onPress={() => setShowAddCompanionForm(true)}
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

      {/* 友人追加フォーム */}
      {showAddCompanionForm && (
        <CompanionAddForm
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
          onCancel={() => {
            setShowAddCompanionForm(false);
            setNewCompanionName("");
            setNewCompanionTwitter("");
            setLookedUpProfile(null);
            setLookupError(null);
          }}
          onLookup={onLookupTwitterProfile}
        />
      )}

      {/* 登録済み友人リスト */}
      {companions.length > 0 && (
        <View style={{ gap: 8 }}>
          {companions.map((companion) => (
            <CompanionItem
              key={companion.id}
              companion={companion}
              onRemove={() => onRemoveCompanion(companion.id)}
            />
          ))}
        </View>
      )}

      {/* 貢献人数表示 */}
      <ContributionDisplay companionCount={companions.length} />
    </View>
  );
}

// 友人追加フォーム
function CompanionAddForm({
  newCompanionName,
  setNewCompanionName,
  newCompanionTwitter,
  setNewCompanionTwitter,
  isLookingUpTwitter,
  lookupError,
  lookedUpProfile,
  setLookedUpProfile,
  setLookupError,
  onAdd,
  onCancel,
  onLookup,
}: {
  newCompanionName: string;
  setNewCompanionName: (value: string) => void;
  newCompanionTwitter: string;
  setNewCompanionTwitter: (value: string) => void;
  isLookingUpTwitter: boolean;
  lookupError: string | null;
  lookedUpProfile: LookedUpProfile | null;
  setLookedUpProfile: (value: LookedUpProfile | null) => void;
  setLookupError: (value: string | null) => void;
  onAdd: () => void;
  onCancel: () => void;
  onLookup: (input: string) => Promise<void>;
}) {
  const colors = useColors();
  
  return (
    <View style={{
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: color.accentPrimary,
    }}>
      {/* Twitter検索 */}
      <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 4 }}>
        Twitterユーザー名またはURL
      </Text>
      <Text style={{ color: color.textHint, fontSize: 12, marginBottom: 8 }}>
        @username または https://x.com/username
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          value={newCompanionTwitter}
          onChangeText={(text) => {
            setNewCompanionTwitter(text);
            setLookedUpProfile(null);
            setLookupError(null);
          }}
          placeholder="@idolfunch または https://x.com/idolfunch"
          placeholderTextColor={color.textHint}
          autoCapitalize="none"
          style={{
            flex: 1,
            backgroundColor: color.surface,
            borderRadius: 8,
            padding: 12,
            color: color.twitter,
            borderWidth: 1,
            borderColor: color.border,
          }}
        />
        <Pressable
          onPress={() => onLookup(newCompanionTwitter)}
          disabled={isLookingUpTwitter || !newCompanionTwitter.trim()}
          style={{
            backgroundColor: isLookingUpTwitter || !newCompanionTwitter.trim() ? color.border : color.twitter,
            borderRadius: 8,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.foreground, fontWeight: "bold" }}>
            {isLookingUpTwitter ? "..." : "検索"}
          </Text>
        </Pressable>
      </View>

      {/* エラー表示 */}
      {lookupError && (
        <Text style={{ color: color.danger, fontSize: 12, marginBottom: 8 }}>
          {lookupError}
        </Text>
      )}

      {/* 検索結果表示 */}
      {lookedUpProfile && (
        <LookedUpProfileDisplay profile={lookedUpProfile} />
      )}

      {/* 名前直接入力 */}
      <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 4, marginTop: 8 }}>
        または名前を直接入力
      </Text>
      <TextInput
        value={newCompanionName}
        onChangeText={setNewCompanionName}
        placeholder="友人の名前"
        placeholderTextColor={color.textHint}
        style={{
          backgroundColor: color.surface,
          borderRadius: 8,
          padding: 12,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: color.border,
          marginBottom: 12,
        }}
      />

      {/* ボタン */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={onCancel}
          style={{
            flex: 1,
            backgroundColor: color.border,
            borderRadius: 8,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: color.textSecondary }}>キャンセル</Text>
        </Pressable>
        <Pressable
          onPress={onAdd}
          disabled={!lookedUpProfile && !newCompanionName.trim()}
          style={{
            flex: 1,
            backgroundColor: (!lookedUpProfile && !newCompanionName.trim()) ? color.border : color.accentPrimary,
            borderRadius: 8,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.foreground, fontWeight: "bold" }}>追加</Text>
        </Pressable>
      </View>
    </View>
  );
}

// 検索結果表示
function LookedUpProfileDisplay({ profile }: { profile: LookedUpProfile }) {
  const colors = useColors();
  
  return (
    <View style={{
      backgroundColor: color.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: color.twitter,
    }}>
      <Image
        source={{ uri: profile.profileImage }}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontWeight: "600" }}>
          {profile.name}
        </Text>
        <Text style={{ color: color.twitter, fontSize: 12 }}>
          @{profile.username}
        </Text>
      </View>
      <MaterialIcons name="check-circle" size={24} color={color.success} />
    </View>
  );
}

// 友人アイテム
function CompanionItem({
  companion,
  onRemove,
}: {
  companion: Companion;
  onRemove: () => void;
}) {
  const colors = useColors();
  
  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: companion.profileImage ? color.twitter : color.border,
      }}
    >
      {companion.profileImage ? (
        <Image
          source={{ uri: companion.profileImage }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
          }}
        />
      ) : (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: color.accentPrimary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
            {companion.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontWeight: "600" }}>
          {companion.displayName}
        </Text>
        {companion.twitterUsername && (
          <Text style={{ color: color.twitter, fontSize: 12 }}>
            @{companion.twitterUsername}
          </Text>
        )}
      </View>
      <Pressable onPress={onRemove}>
        <MaterialIcons name="close" size={20} color={color.textHint} />
      </Pressable>
    </View>
  );
}

// 貢献人数表示
function ContributionDisplay({ companionCount }: { companionCount: number }) {
  const colors = useColors();
  
  return (
    <>
      <View style={{
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Text style={{ color: color.textSecondary, fontSize: 14 }}>貢献人数</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={{ color: color.accentPrimary, fontSize: 24, fontWeight: "bold" }}>
            {1 + companionCount}
          </Text>
          <Text style={{ color: color.textSecondary, fontSize: 14, marginLeft: 4 }}>人</Text>
        </View>
      </View>
      <Text style={{ color: color.textHint, fontSize: 11, marginTop: 8 }}>
        ※ 自分 + 友人{companionCount}人 = {1 + companionCount}人の貢献になります
      </Text>
    </>
  );
}
