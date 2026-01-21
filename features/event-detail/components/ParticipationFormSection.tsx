/**
 * ParticipationFormSection Component
 * 参加表明フォーム全体
 */

import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { prefectures } from "@/constants/prefectures";
import type { Companion, LookedUpProfile } from "../types";

interface ParticipationFormSectionProps {
  // User
  user: {
    id?: number;
    name?: string | null;
    username?: string | null;
    profileImage?: string | null;
    followersCount?: number | null;
  } | null;
  login: () => void;
  
  // Form state
  message: string;
  setMessage: (value: string) => void;
  prefecture: string;
  setPrefecture: (value: string) => void;
  gender: "male" | "female" | "";
  setGender: (value: "male" | "female" | "") => void;
  allowVideoUse: boolean;
  setAllowVideoUse: (value: boolean) => void;
  showPrefectureList: boolean;
  setShowPrefectureList: (value: boolean) => void;
  
  // Companion state
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
  
  // Actions
  onSubmit: () => void;
  onCancel: () => void;
  onAddCompanion: () => void;
  onRemoveCompanion: (id: string) => void;
  onLookupTwitterProfile: (input: string) => Promise<void>;
  
  // State
  isSubmitting: boolean;
}

export function ParticipationFormSection({
  user,
  login,
  message,
  setMessage,
  prefecture,
  setPrefecture,
  gender,
  setGender,
  allowVideoUse,
  setAllowVideoUse,
  showPrefectureList,
  setShowPrefectureList,
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
  onSubmit,
  onCancel,
  onAddCompanion,
  onRemoveCompanion,
  onLookupTwitterProfile,
  isSubmitting,
}: ParticipationFormSectionProps) {
  const colors = useColors();
  
  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
        参加表明
      </Text>

      {/* ログインユーザーの場合はTwitterアカウント情報を表示 */}
      {user && (
        <View style={{ marginBottom: 16, backgroundColor: colors.background, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: color.border }}>
          <Text style={{ color: color.textSecondary, fontSize: 12, marginBottom: 8 }}>
            参加者
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {user.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                contentFit="cover"
              />
            ) : (
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color.accentPrimary, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold" }}>
                  {(user.name || user.username || "ゲ")?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                {user.name || user.username || "ゲスト"}
              </Text>
              {user.username && (
                <Text style={{ color: color.textSecondary, fontSize: 14, marginTop: 2 }}>
                  @{user.username}
                </Text>
              )}
            {user.followersCount != null && user.followersCount > 0 && (
              <Text style={{ color: color.accentPrimary, fontSize: 12, marginTop: 4 }}>
                {user.followersCount.toLocaleString()} フォロワー
              </Text>
            )}
            </View>
          </View>
        </View>
      )}

      {/* 未ログインの場合はログインを促す */}
      {!user && (
        <View style={{ marginBottom: 16, backgroundColor: "rgba(236, 72, 153, 0.1)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: color.accentPrimary }}>
          <Text style={{ color: color.accentPrimary, fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
            ログインが必要です
          </Text>
          <Text style={{ color: color.textSecondary, fontSize: 13, marginBottom: 12 }}>
            参加表明にはTwitterログインが必要です。
          </Text>
          <Pressable
            onPress={() => login()}
            style={{
              backgroundColor: color.twitter,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <MaterialIcons name="login" size={20} color={colors.foreground} />
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
              X（Twitter）でログイン
            </Text>
          </Pressable>
        </View>
      )}

      {/* 都道府県選択 */}
      <PrefectureSelector
        prefecture={prefecture}
        setPrefecture={setPrefecture}
        showPrefectureList={showPrefectureList}
        setShowPrefectureList={setShowPrefectureList}
      />

      {/* 性別選択 */}
      <GenderSelector gender={gender} setGender={setGender} />

      {/* 友人追加セクション */}
      <CompanionSection
        companions={companions}
        showAddCompanionForm={showAddCompanionForm}
        setShowAddCompanionForm={setShowAddCompanionForm}
        newCompanionName={newCompanionName}
        setNewCompanionName={setNewCompanionName}
        newCompanionTwitter={newCompanionTwitter}
        setNewCompanionTwitter={setNewCompanionTwitter}
        isLookingUpTwitter={isLookingUpTwitter}
        lookupError={lookupError}
        lookedUpProfile={lookedUpProfile}
        setLookedUpProfile={setLookedUpProfile}
        setLookupError={setLookupError}
        onAddCompanion={onAddCompanion}
        onRemoveCompanion={onRemoveCompanion}
        onLookupTwitterProfile={onLookupTwitterProfile}
      />

      {/* 応援メッセージ */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 8 }}>
          応援メッセージ（任意）
        </Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="応援メッセージを書いてね"
          placeholderTextColor={color.textHint}
          multiline
          numberOfLines={3}
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 12,
            color: colors.foreground,
            borderWidth: 1,
            borderColor: color.border,
            minHeight: 80,
            textAlignVertical: "top",
          }}
        />
      </View>

      {/* 参加条件・お約束 */}
      <TermsSection />

      {/* 動画利用許可チェックボックス */}
      <VideoPermissionCheckbox
        allowVideoUse={allowVideoUse}
        setAllowVideoUse={setAllowVideoUse}
      />

      {/* ボタン */}
      <FormButtons
        prefecture={prefecture}
        gender={gender}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </View>
  );
}

// サブコンポーネント: 都道府県選択
function PrefectureSelector({
  prefecture,
  setPrefecture,
  showPrefectureList,
  setShowPrefectureList,
}: {
  prefecture: string;
  setPrefecture: (value: string) => void;
  showPrefectureList: boolean;
  setShowPrefectureList: (value: boolean) => void;
}) {
  const colors = useColors();
  
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ color: color.textSecondary, fontSize: 14 }}>
          都道府県
        </Text>
        <Text style={{ color: color.accentPrimary, fontSize: 12, marginLeft: 6, fontWeight: "bold" }}>
          必須
        </Text>
      </View>
      <Pressable
        onPress={() => setShowPrefectureList(!showPrefectureList)}
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: prefecture ? color.success : color.accentPrimary,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: prefecture ? color.textWhite : color.textHint }}>
          {prefecture || "選択してください"}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={color.textHint} />
      </Pressable>
      {showPrefectureList && (
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 200,
            borderWidth: 1,
            borderColor: color.border,
          }}
        >
          <ScrollView nestedScrollEnabled>
            {prefectures.map((pref) => (
              <Pressable
                key={pref}
                onPress={() => {
                  setPrefecture(pref);
                  setShowPrefectureList(false);
                }}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: color.border,
                }}
              >
                <Text style={{ color: colors.foreground }}>{pref}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// サブコンポーネント: 性別選択
function GenderSelector({
  gender,
  setGender,
}: {
  gender: "male" | "female" | "";
  setGender: (value: "male" | "female" | "") => void;
}) {
  const colors = useColors();
  
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ color: color.textSecondary, fontSize: 14 }}>
          性別
        </Text>
        <Text style={{ color: color.accentPrimary, fontSize: 12, marginLeft: 6, fontWeight: "bold" }}>
          必須
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => setGender("male")}
          style={{
            flex: 1,
            backgroundColor: gender === "male" ? color.info : colors.background,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 2,
            borderColor: gender === "male" ? color.info : gender === "" ? color.accentPrimary : color.border,
          }}
        >
          <Text style={{ fontSize: 24, marginBottom: 4 }}>👨</Text>
          <Text style={{ color: gender === "male" ? color.textWhite : color.textSecondary, fontSize: 14, fontWeight: "600" }}>
            男性
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setGender("female")}
          style={{
            flex: 1,
            backgroundColor: gender === "female" ? color.accentPrimary : colors.background,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 2,
            borderColor: gender === "female" ? color.accentPrimary : gender === "" ? color.accentPrimary : color.border,
          }}
        >
          <Text style={{ fontSize: 24, marginBottom: 4 }}>👩</Text>
          <Text style={{ color: gender === "female" ? color.textWhite : color.textSecondary, fontSize: 14, fontWeight: "600" }}>
            女性
          </Text>
        </Pressable>
      </View>
      {gender === "" && (
        <Text style={{ color: color.danger, fontSize: 12, marginTop: 8 }}>
          性別を選択してください
        </Text>
      )}
    </View>
  );
}

// サブコンポーネント: 友人追加
function CompanionSection({
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
}: {
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
}) {
  const colors = useColors();
  
  return (
    <View style={{ marginBottom: 16 }}>
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
            {1 + companions.length}
          </Text>
          <Text style={{ color: color.textSecondary, fontSize: 14, marginLeft: 4 }}>人</Text>
        </View>
      </View>
      <Text style={{ color: color.textHint, fontSize: 11, marginTop: 8 }}>
        ※ 自分 + 友人{companions.length}人 = {1 + companions.length}人の貢献になります
      </Text>
    </View>
  );
}

// サブコンポーネント: 友人追加フォーム
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

      {lookupError && (
        <Text style={{ color: color.danger, fontSize: 12, marginBottom: 8 }}>
          {lookupError}
        </Text>
      )}

      {lookedUpProfile && (
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
            source={{ uri: lookedUpProfile.profileImage }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontWeight: "600" }}>
              {lookedUpProfile.name}
            </Text>
            <Text style={{ color: color.twitter, fontSize: 12 }}>
              @{lookedUpProfile.username}
            </Text>
          </View>
          <MaterialIcons name="check-circle" size={24} color={color.success} />
        </View>
      )}

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

// サブコンポーネント: 友人アイテム
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

// サブコンポーネント: 参加条件・お約束
function TermsSection() {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 16 }}>🌈</Text>
        <Text style={{ color: color.accentPrimary, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
          みんなで楽しく応援するためのお約束
        </Text>
      </View>
      <View style={{ backgroundColor: color.surface, borderRadius: 8, padding: 12, marginBottom: 12 }}>
        <Text style={{ color: color.textSecondary, fontSize: 12, lineHeight: 18 }}>
          りんくからのお願いだよ～！{"\n"}
          みんなで仲良く、楽しく応援していこうね♪
        </Text>
      </View>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
          <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
            このサイトは「アイドル応援ちゃんねる」が愛情たっぷりで運営してるよ！
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
          <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
            素敵なコメントは、応援動画を作るときに使わせてもらうかも！
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
          <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
            アイドルちゃんを傷つけるコメントや、迷惑なコメントは絶対ダメだよ～！
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
          <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
            みんなの「応援のキモチ」で、アイドルちゃんたちをキラキラさせちゃおう！
          </Text>
        </View>
      </View>
    </View>
  );
}

// サブコンポーネント: 動画利用許可チェックボックス
function VideoPermissionCheckbox({
  allowVideoUse,
  setAllowVideoUse,
}: {
  allowVideoUse: boolean;
  setAllowVideoUse: (value: boolean) => void;
}) {
  const colors = useColors();
  
  return (
    <Pressable
      onPress={() => setAllowVideoUse(!allowVideoUse)}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: allowVideoUse ? color.accentPrimary : color.textHint,
          backgroundColor: allowVideoUse ? color.accentPrimary : "transparent",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        {allowVideoUse && (
          <MaterialIcons name="check" size={18} color={colors.foreground} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
          応援動画への使用を許可する
        </Text>
        <Text style={{ color: color.textSecondary, fontSize: 12, marginTop: 4 }}>
          あなたのコメントを応援動画に使用させていただく場合があります
        </Text>
      </View>
    </Pressable>
  );
}

// サブコンポーネント: フォームボタン
function FormButtons({
  prefecture,
  gender,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  prefecture: string;
  gender: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const colors = useColors();
  const isDisabled = isSubmitting || !prefecture || !gender;
  
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: color.border,
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.foreground, fontSize: 16 }}>キャンセル</Text>
      </Pressable>
      <Pressable
        onPress={onSubmit}
        disabled={isDisabled}
        style={{
          flex: 1,
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          overflow: "hidden",
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <LinearGradient
          colors={isDisabled ? [color.textHint, color.textDisabled] : [color.accentPrimary, color.accentAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
          {!prefecture ? "都道府県を選択してください" : "参加表明する"}
        </Text>
      </Pressable>
    </View>
  );
}
