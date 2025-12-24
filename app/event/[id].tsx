import { FlatList, Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Share, Alert } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

type Participation = {
  id: number;
  displayName: string;
  username: string | null;
  profileImage: string | null;
  message: string | null;
  companionCount: number;
  isAnonymous: boolean;
  createdAt: Date;
};

function MessageCard({ participation }: { participation: Participation }) {
  const colors = useColors();
  
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        {participation.profileImage && !participation.isAnonymous ? (
          <Image
            source={{ uri: participation.profileImage }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.muted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {participation.displayName.charAt(0)}
            </Text>
          </View>
        )}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
            {participation.displayName}
          </Text>
          {participation.username && !participation.isAnonymous && (
            <Text style={{ color: "#DD6500", fontSize: 14 }}>
              @{participation.username}
              {participation.companionCount > 0 && ` +${participation.companionCount}人連れて行く！`}
            </Text>
          )}
        </View>
      </View>
      {participation.message && (
        <Text style={{ color: colors.foreground, fontSize: 15, lineHeight: 22 }}>
          {participation.message}
        </Text>
      )}
    </View>
  );
}

export default function EventDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companionCount, setCompanionCount] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const eventId = parseInt(id || "0", 10);
  
  const { data: event, isLoading: eventLoading } = trpc.events.getById.useQuery({ id: eventId });
  const { data: participations, isLoading: participationsLoading, refetch } = trpc.participations.listByEvent.useQuery({ eventId });
  
  const createParticipationMutation = trpc.participations.create.useMutation({
    onSuccess: () => {
      setMessage("");
      setShowForm(false);
      refetch();
    },
  });
  
  const createAnonymousMutation = trpc.participations.createAnonymous.useMutation({
    onSuccess: () => {
      setMessage("");
      setDisplayName("");
      setShowForm(false);
      refetch();
    },
  });

  const handleSubmit = () => {
    if (user) {
      createParticipationMutation.mutate({
        eventId,
        message,
        companionCount,
        displayName: user.name || "ゲスト",
      });
    } else {
      if (!displayName.trim()) return;
      createAnonymousMutation.mutate({
        eventId,
        displayName: displayName.trim(),
        message,
        companionCount,
      });
    }
  };

  if (eventLoading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!event) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>イベントが見つかりません</Text>
        </View>
      </ScreenContainer>
    );
  }

  const eventDate = new Date(event.eventDate);
  const formattedDate = `${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;

  const handleShare = async () => {
    try {
      const shareMessage = `🎉 ${event.hostName}さんの生誕祭！\n\n🎂 ${event.title}\n📅 ${formattedDate}${event.venue ? `\n📍 ${event.venue}` : ""}\n\n一緒にお祝いしよう！\n\n#KimitoLink #生誕祭 #${event.hostName}生誕祭`;
      
      const result = await Share.share({
        message: shareMessage,
      });
      
      if (result.action === Share.sharedAction) {
        console.log("Shared successfully");
      }
    } catch (error) {
      Alert.alert("エラー", "シェアに失敗しました");
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }}>
          {/* ヘッダー */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
              <Text style={{ color: colors.foreground, marginLeft: 8 }}>戻る</Text>
            </TouchableOpacity>
          </View>

          {/* イベント情報カード */}
          <View
            style={{
              backgroundColor: colors.surface,
              marginHorizontal: 16,
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
              {/* ホスト情報 */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                {event.hostProfileImage ? (
                  <Image
                    source={{ uri: event.hostProfileImage }}
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
                      {event.hostName.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold" }}>
                    {event.hostName}
                  </Text>
                  {event.hostUsername && (
                    <Text style={{ color: "#DD6500", fontSize: 14 }}>
                      @{event.hostUsername}
                    </Text>
                  )}
                  {event.hostFollowersCount !== null && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <MaterialIcons name="people" size={16} color={colors.muted} />
                      <Text style={{ color: colors.muted, fontSize: 14, marginLeft: 4 }}>
                        {event.hostFollowersCount.toLocaleString()} フォロワー
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* イベント詳細 */}
              <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
                {event.title}
              </Text>
              
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <MaterialIcons name="event" size={20} color="#DD6500" />
                <Text style={{ color: colors.foreground, fontSize: 16, marginLeft: 8 }}>
                  {formattedDate}
                </Text>
              </View>

              {event.venue && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <MaterialIcons name="place" size={20} color="#DD6500" />
                  <Text style={{ color: colors.foreground, fontSize: 16, marginLeft: 8 }}>
                    {event.venue}
                  </Text>
                </View>
              )}

              {event.description && (
                <Text style={{ color: colors.muted, fontSize: 15, marginTop: 8, lineHeight: 22 }}>
                  {event.description}
                </Text>
              )}

              {/* 参加者数 */}
              <View
                style={{
                  backgroundColor: "#00427B",
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 14 }}>参加表明</Text>
                <Text style={{ color: "#fff", fontSize: 32, fontWeight: "bold" }}>
                  {event.participantCount || 0}
                </Text>
                <Text style={{ color: "#fff", fontSize: 14 }}>人</Text>
              </View>

              {/* SNSシェアボタン */}
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  backgroundColor: "#DD6500",
                  borderRadius: 12,
                  padding: 14,
                  marginTop: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="share" size={20} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                  SNSでシェアして仲間を増やす
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 応援メッセージセクション */}
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <MaterialIcons name="message" size={24} color="#DD6500" />
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginLeft: 8 }}>
                みんなの応援メッセージ
              </Text>
            </View>

            {participationsLoading ? (
              <Text style={{ color: colors.muted, textAlign: "center" }}>読み込み中...</Text>
            ) : participations && participations.length > 0 ? (
              participations.map((p) => <MessageCard key={p.id} participation={p} />)
            ) : (
              <View style={{ alignItems: "center", padding: 32 }}>
                <MaterialIcons name="chat-bubble-outline" size={48} color={colors.muted} />
                <Text style={{ color: colors.muted, marginTop: 8 }}>
                  まだメッセージがありません
                </Text>
              </View>
            )}
          </View>

          {/* 参加登録フォーム */}
          {showForm && (
            <View
              style={{
                backgroundColor: colors.surface,
                margin: 16,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
                参加表明する
              </Text>

              {!user && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                    表示名 *
                  </Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="あなたの名前"
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
              )}

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  応援メッセージ（任意）
                </Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="お祝いのメッセージを書いてね"
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

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  一緒に参加する友人（任意）
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => setCompanionCount(Math.max(0, companionCount - 1))}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="remove" size={24} color={colors.foreground} />
                  </TouchableOpacity>
                  <Text style={{ color: colors.foreground, fontSize: 20, marginHorizontal: 16 }}>
                    {companionCount}人
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCompanionCount(companionCount + 1)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#DD6500",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!user && !displayName.trim()}
                style={{
                  backgroundColor: (!user && !displayName.trim()) ? colors.muted : "#DD6500",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                  参加表明する！
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* 参加ボタン（固定） */}
        {!showForm && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
              backgroundColor: colors.background,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={{
                backgroundColor: "#DD6500",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                参加表明する！
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
