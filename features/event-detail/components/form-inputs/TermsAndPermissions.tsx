/**
 * TermsAndPermissions Component
 * お約束・動画許可・メッセージ入力
 */

import { View, Text, Pressable, TextInput } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";

interface TermsAndPermissionsProps {
  message: string;
  setMessage: (value: string) => void;
  allowVideoUse: boolean;
  setAllowVideoUse: (value: boolean) => void;
}

export function TermsAndPermissions({
  message,
  setMessage,
  allowVideoUse,
  setAllowVideoUse,
}: TermsAndPermissionsProps) {
  return (
    <View>
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
      {/* ヘッダー */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 16 }}>🌈</Text>
        <Text style={{ color: color.accentPrimary, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
          みんなで楽しく応援するためのお約束
        </Text>
      </View>

      {/* メッセージ */}
      <View style={{ backgroundColor: color.surface, borderRadius: 8, padding: 12, marginBottom: 12 }}>
        <Text style={{ color: color.textSecondary, fontSize: 12, lineHeight: 18 }}>
          りんくからのお願いだよ～！{"\n"}
          みんなで仲良く、楽しく応援していこうね♪
        </Text>
      </View>

      {/* ルールリスト */}
      <View style={{ gap: 8 }}>
        <TermsItem text="このサイトは「アイドル応援ちゃんねる」が愛情たっぷりで運営してるよ！" />
        <TermsItem text="素敵なコメントは、応援動画を作るときに使わせてもらうかも！" />
        <TermsItem text="アイドルちゃんを傷つけるコメントや、迷惑なコメントは絶対ダメだよ～！" />
        <TermsItem text="みんなの「応援のキモチ」で、アイドルちゃんたちをキラキラさせちゃおう！" />
      </View>
    </View>
  );
}

// ルールアイテム
function TermsItem({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <Text style={{ color: color.accentPrimary, marginRight: 8 }}>✱</Text>
      <Text style={{ color: color.textSecondary, fontSize: 11, flex: 1, lineHeight: 16 }}>
        {text}
      </Text>
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
      {/* チェックボックス */}
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

      {/* ラベル */}
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
