/**
 * UserInfoSection Component
 * ユーザー情報表示・ログイン促進
 */

import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";

interface UserInfoSectionProps {
  user: {
    id?: number;
    name?: string | null;
    username?: string | null;
    profileImage?: string | null;
    followersCount?: number | null;
  } | null;
  login: () => void;
}

export function UserInfoSection({ user, login }: UserInfoSectionProps) {
  if (user) {
    return <UserInfoDisplay user={user} />;
  }
  return <LoginPrompt login={login} />;
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
