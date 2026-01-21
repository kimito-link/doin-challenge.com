/**
 * FormInputSection Component
 * フォーム入力部分（都道府県、性別、メッセージ、動画許可、お約束）
 */

import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { prefectures } from "@/constants/prefectures";

interface FormInputSectionProps {
  // User info display
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
}

export function FormInputSection({
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
}: FormInputSectionProps) {
  const colors = useColors();
  
  return (
    <View>
      {/* ログインユーザーの場合はTwitterアカウント情報を表示 */}
      {user && (
        <UserInfoDisplay user={user} />
      )}

      {/* 未ログインの場合はログインを促す */}
      {!user && (
        <LoginPrompt login={login} />
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

      {/* 応援メッセージ */}
      <MessageInput message={message} setMessage={setMessage} />

      {/* 参加条件・お約束 */}
      <TermsSection />

      {/* 動画利用許可チェックボックス */}
      <VideoPermissionCheckbox
        allowVideoUse={allowVideoUse}
        setAllowVideoUse={setAllowVideoUse}
      />
    </View>
  );
}

// ユーザー情報表示
function UserInfoDisplay({
  user,
}: {
  user: {
    name?: string | null;
    username?: string | null;
    profileImage?: string | null;
    followersCount?: number | null;
  };
}) {
  const colors = useColors();
  
  return (
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
  );
}

// ログイン促進
function LoginPrompt({ login }: { login: () => void }) {
  const colors = useColors();
  
  return (
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
  );
}

// 都道府県選択
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

// 性別選択
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

// 応援メッセージ入力
function MessageInput({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (value: string) => void;
}) {
  const colors = useColors();
  
  return (
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
  );
}

// 参加条件・お約束
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

// 動画利用許可チェックボックス
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
