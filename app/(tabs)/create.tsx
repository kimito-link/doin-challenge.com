import { Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function CreateEventScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, login } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDateStr, setEventDateStr] = useState("");
  const [hostName, setHostName] = useState("");

  const createEventMutation = trpc.events.create.useMutation({
    onSuccess: (newEvent) => {
      Alert.alert("成功", "イベントを作成しました！", [
        {
          text: "OK",
          onPress: () => {
            router.push({
              pathname: "/event/[id]",
              params: { id: newEvent.id.toString() },
            });
          },
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("エラー", error.message);
    },
  });

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert("エラー", "イベントタイトルを入力してください");
      return;
    }
    if (!eventDateStr.trim()) {
      Alert.alert("エラー", "開催日を入力してください（例: 2025-01-15）");
      return;
    }
    if (!hostName.trim() && !user) {
      Alert.alert("エラー", "ホスト名を入力してください");
      return;
    }

    const eventDate = new Date(eventDateStr);
    if (isNaN(eventDate.getTime())) {
      Alert.alert("エラー", "日付の形式が正しくありません（例: 2025-01-15）");
      return;
    }

    createEventMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      venue: venue.trim() || undefined,
      eventDate: eventDate.toISOString(),
      hostName: user?.name || hostName.trim(),
      hostUsername: user?.username || undefined,
      hostProfileImage: user?.profileImage || undefined,
      hostFollowersCount: user?.followersCount || undefined,
    });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }}>
          {/* ヘッダー */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
            <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "bold" }}>
              イベント作成
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
              推しの生誕祭イベントを作成しよう
            </Text>
          </View>

          {/* キャラクター */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 16 }}>
            <Image source={characterImages.konta} style={{ width: 60, height: 60 }} contentFit="contain" />
            <View style={{ alignItems: "center", marginHorizontal: 8 }}>
              <Image source={characterImages.rinku} style={{ width: 80, height: 80 }} contentFit="contain" />
            </View>
            <Image source={characterImages.tanune} style={{ width: 60, height: 60 }} contentFit="contain" />
          </View>

          {/* フォーム */}
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
              {/* Twitterログインボタン */}
              {!user && (
                <TouchableOpacity
                  onPress={login}
                  style={{
                    backgroundColor: "#1DA1F2",
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <MaterialIcons name="login" size={20} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                    Twitterでログインして作成
                  </Text>
                </TouchableOpacity>
              )}

              {user && (
                <View
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  {user.profileImage ? (
                    <Image
                      source={{ uri: user.profileImage }}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#00427B",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                        {user.name?.charAt(0) || "?"}
                      </Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                      {user.name}
                    </Text>
                    {user.username && (
                      <Text style={{ color: "#DD6500", fontSize: 14 }}>
                        @{user.username}
                      </Text>
                    )}
                    {user.followersCount !== undefined && (
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {user.followersCount.toLocaleString()} フォロワー
                      </Text>
                    )}
                  </View>
                  <MaterialIcons name="check-circle" size={24} color="#22C55E" />
                </View>
              )}

              {!user && (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    <Text style={{ color: colors.muted, marginHorizontal: 16 }}>または</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                      ホスト名 *
                    </Text>
                    <TextInput
                      value={hostName}
                      onChangeText={setHostName}
                      placeholder="あなたの名前・アーティスト名"
                      placeholderTextColor={colors.muted}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 8,
                        padding: 12,
                        color: colors.foreground,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    />
                  </View>
                </>
              )}

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  イベントタイトル *
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="例: ○○ 生誕祭 2025"
                  placeholderTextColor={colors.muted}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  開催日 *
                </Text>
                <TextInput
                  value={eventDateStr}
                  onChangeText={setEventDateStr}
                  placeholder="2025-01-15"
                  placeholderTextColor={colors.muted}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  開催場所（任意）
                </Text>
                <TextInput
                  value={venue}
                  onChangeText={setVenue}
                  placeholder="例: 渋谷○○ホール"
                  placeholderTextColor={colors.muted}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  イベント説明（任意）
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="イベントの詳細を書いてね"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minHeight: 100,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleCreate}
                disabled={createEventMutation.isPending}
                style={{
                  backgroundColor: createEventMutation.isPending ? colors.muted : "#DD6500",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                  {createEventMutation.isPending ? "作成中..." : "イベントを作成"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
