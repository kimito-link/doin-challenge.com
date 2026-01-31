/**
 * TwitterSearchForm Component
 * Twitter検索フォーム（ユーザー名入力、検索、結果表示）
 */

import { View, Text, Pressable, TextInput } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import type { LookedUpProfile } from "../../types";

interface TwitterSearchFormProps {
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
}

export function TwitterSearchForm({
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
}: TwitterSearchFormProps) {
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
      {/* Twitter検索入力 */}
      <TwitterInput
        value={newCompanionTwitter}
        onChange={(text) => {
          setNewCompanionTwitter(text);
          setLookedUpProfile(null);
          setLookupError(null);
        }}
        isLoading={isLookingUpTwitter}
        onSearch={() => onLookup(newCompanionTwitter)}
      />

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
      <DirectNameInput
        value={newCompanionName}
        onChange={setNewCompanionName}
      />

      {/* ボタン */}
      <FormButtons
        onCancel={onCancel}
        onAdd={onAdd}
        isAddDisabled={!lookedUpProfile && !newCompanionName.trim()}
      />
    </View>
  );
}

// Twitter入力フィールド
function TwitterInput({
  value,
  onChange,
  isLoading,
  onSearch,
}: {
  value: string;
  onChange: (text: string) => void;
  isLoading: boolean;
  onSearch: () => void;
}) {
  const colors = useColors();
  
  return (
    <>
      <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 4 }}>
        Twitterユーザー名またはURL
      </Text>
      <Text style={{ color: color.textHint, fontSize: 12, marginBottom: 8 }}>
        @username または https://x.com/username
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
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
          onPress={onSearch}
          disabled={isLoading || !value.trim()}
          style={{
            backgroundColor: isLoading || !value.trim() ? color.border : color.twitter,
            borderRadius: 8,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.foreground, fontWeight: "bold" }}>
            {isLoading ? "..." : "検索"}
          </Text>
        </Pressable>
      </View>
    </>
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

// 名前直接入力
function DirectNameInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const colors = useColors();
  
  return (
    <>
      <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 4, marginTop: 8 }}>
        または名前を直接入力
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
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
    </>
  );
}

// フォームボタン
function FormButtons({
  onCancel,
  onAdd,
  isAddDisabled,
}: {
  onCancel: () => void;
  onAdd: () => void;
  isAddDisabled: boolean;
}) {
  const colors = useColors();
  
  return (
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
        disabled={isAddDisabled}
        style={{
          flex: 1,
          backgroundColor: isAddDisabled ? color.border : color.accentPrimary,
          borderRadius: 8,
          padding: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.foreground, fontWeight: "bold" }}>追加</Text>
      </Pressable>
    </View>
  );
}
