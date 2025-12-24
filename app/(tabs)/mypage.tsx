import { FlatList, Text, View, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
};

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-maru-orange.jpg");

export default function MyPageScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  
  const { data: myEvents } = trpc.events.myEvents.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    Alert.alert(
      "ログアウト",
      "ログアウトしますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "ログアウト", style: "destructive", onPress: logout },
      ]
    );
  };

  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: eventId.toString() },
    });
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* ヘッダー */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "bold" }}>
          マイページ
        </Text>
      </View>

      {!isAuthenticated ? (
        // 未ログイン状態
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Image
            source={logoImage}
            style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 24 }}
          />
          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            ログインしてください
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 24 }}>
            Twitterでログインすると{"\n"}フォロワー数などの情報を自動取得できます
          </Text>
          
          <TouchableOpacity
            onPress={login}
            style={{
              backgroundColor: "#1DA1F2",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 32,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="login" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
              Twitterでログイン
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", marginTop: 32 }}>
            <Image source={characterImages.rinku} style={{ width: 60, height: 60 }} contentFit="contain" />
            <Image source={characterImages.konta} style={{ width: 60, height: 60, marginLeft: -12 }} contentFit="contain" />
            <Image source={characterImages.tanune} style={{ width: 60, height: 60, marginLeft: -12 }} contentFit="contain" />
          </View>
        </View>
      ) : (
        // ログイン済み状態
        <View style={{ flex: 1 }}>
          {/* プロフィールカード */}
          <View
            style={{
              backgroundColor: colors.surface,
              margin: 16,
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <LinearGradient
              colors={["#00427B", "#DD6500"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 4 }}
            />
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: "#00427B",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
                      {user?.name?.charAt(0) || "?"}
                    </Text>
                  </View>
                )}
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold" }}>
                    {user?.name || "ゲスト"}
                  </Text>
                  {user?.username && (
                    <Text style={{ color: "#DD6500", fontSize: 14 }}>
                      @{user.username}
                    </Text>
                  )}
                  {user?.followersCount !== undefined && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <MaterialIcons name="people" size={16} color={colors.muted} />
                      <Text style={{ color: colors.muted, fontSize: 14, marginLeft: 4 }}>
                        {user.followersCount.toLocaleString()} フォロワー
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="logout" size={20} color={colors.error} />
                <Text style={{ color: colors.error, fontSize: 14, marginLeft: 8 }}>
                  ログアウト
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 自分のイベント一覧 */}
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              作成したイベント
            </Text>

            {myEvents && myEvents.length > 0 ? (
              <FlatList
                data={myEvents}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const eventDate = new Date(item.eventDate);
                  const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
                  
                  return (
                    <TouchableOpacity
                      onPress={() => handleEventPress(item.id)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                          {item.title}
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
                          {formattedDate} {item.venue && `・ ${item.venue}`}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View style={{ alignItems: "center", padding: 32 }}>
                <MaterialIcons name="event" size={48} color={colors.muted} />
                <Text style={{ color: colors.muted, marginTop: 8, textAlign: "center" }}>
                  まだイベントを作成していません
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
