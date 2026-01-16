import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { AppHeader } from "@/components/app-header";

export default function ManageCommentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const challengeId = parseInt(id || "0", 10);
  const { user, isAuthenticated } = useAuth();
  
  const [selectedTab, setSelectedTab] = useState<"all" | "picked">("all");
  const [pickReason, setPickReason] = useState("");
  const [pickingId, setPickingId] = useState<number | null>(null);

  // チャレンジ情報を取得
  const { data: challenge } = trpc.events.getById.useQuery(
    { id: challengeId },
    { enabled: challengeId > 0 }
  );

  // 参加者一覧を取得
  const { data: participations, refetch: refetchParticipations } = trpc.participations.listByEvent.useQuery(
    { eventId: challengeId },
    { enabled: challengeId > 0 }
  );

  // ピックアップコメント一覧を取得
  const { data: pickedComments, refetch: refetchPicked } = trpc.pickedComments.list.useQuery(
    { challengeId },
    { enabled: challengeId > 0 }
  );

  const pickMutation = trpc.pickedComments.pick.useMutation({
    onSuccess: () => {
      refetchParticipations();
      refetchPicked();
      setPickingId(null);
      setPickReason("");
    },
  });

  const unpickMutation = trpc.pickedComments.unpick.useMutation({
    onSuccess: () => {
      refetchParticipations();
      refetchPicked();
    },
  });

  const markAsUsedMutation = trpc.pickedComments.markAsUsed.useMutation({
    onSuccess: () => {
      refetchPicked();
    },
  });

  // 権限チェック
  const isHost = challenge?.hostUserId === user?.id;
  const isAdmin = (user as any)?.role === "admin";
  const canManage = isHost || isAdmin;

  if (!isAuthenticated || !canManage) {
    return (
      <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <MaterialIcons name="lock" size={64} color="#6B7280" />
          <Text style={{ color: "#9CA3AF", fontSize: 16, marginTop: 16, textAlign: "center" }}>
            この機能はチャレンジの主催者または管理者のみ利用できます
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const pickedIds = new Set(pickedComments?.map((p: any) => p.participationId) || []);
  
  // コメントがあるものだけフィルタ
  const commentsWithMessage = participations?.filter(p => p.message && p.message.trim().length > 0) || [];

  const handlePick = (participationId: number) => {
    if (pickingId === participationId) {
      // ピックアップ実行
      pickMutation.mutate({
        participationId,
        challengeId,
        reason: pickReason || undefined,
      });
    } else {
      // ピックアップ理由入力モードに
      setPickingId(participationId);
      setPickReason("");
    }
  };

  const handleUnpick = (participationId: number) => {
    Alert.alert(
      "ピックアップ解除",
      "このコメントのピックアップを解除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "解除",
          style: "destructive",
          onPress: () => unpickMutation.mutate({ participationId, challengeId }),
        },
      ]
    );
  };

  const handleMarkAsUsed = (pickedId: number) => {
    markAsUsedMutation.mutate({ id: pickedId, challengeId });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <ScrollView style={{ flex: 1, backgroundColor: "#0D1117" }}>
        {/* ヘッダー */}
        <AppHeader 
          title="動員ちゃれんじ" 
          showCharacters={false}
          rightElement={
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8 }}>戻る</Text>
            </TouchableOpacity>
          }
        />
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              コメント管理
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }} numberOfLines={1}>
              {challenge?.title}
            </Text>
          </View>

          {/* タブ */}
          <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedTab("all")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: selectedTab === "all" ? "#EC4899" : "#1A1D21",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                すべて ({commentsWithMessage.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab("picked")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: selectedTab === "picked" ? "#EC4899" : "#1A1D21",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                ピックアップ ({pickedComments?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* コメント一覧 */}
        <View style={{ paddingHorizontal: 16 }}>
          {selectedTab === "all" ? (
            commentsWithMessage.length > 0 ? (
              commentsWithMessage.map((participation: any) => {
                const isPicked = pickedIds.has(participation.id);
                const isPickingThis = pickingId === participation.id;
                
                return (
                  <View
                    key={participation.id}
                    style={{
                      backgroundColor: isPicked ? "#1E2530" : "#1A1D21",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: isPicked ? 2 : 1,
                      borderColor: isPicked ? "#EC4899" : "#2D3139",
                    }}
                  >
                    {/* ユーザー情報 */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                      {participation.profileImage ? (
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
                            backgroundColor: "#EC4899",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "bold" }}>
                            {participation.displayName?.charAt(0) || "?"}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          {participation.isAnonymous ? "匿名" : participation.displayName}
                        </Text>
                        {participation.prefecture && (
                          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                            {participation.prefecture}
                          </Text>
                        )}
                      </View>
                      {isPicked && (
                        <View
                          style={{
                            backgroundColor: "#EC4899",
                            borderRadius: 4,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                            ピックアップ済
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* コメント */}
                    <Text style={{ color: "#E5E7EB", fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                      {participation.message}
                    </Text>

                    {/* ピックアップ理由入力 */}
                    {isPickingThis && (
                      <View style={{ marginBottom: 12 }}>
                        <TextInput
                          value={pickReason}
                          onChangeText={setPickReason}
                          placeholder="ピックアップ理由（任意）"
                          placeholderTextColor="#6B7280"
                          style={{
                            backgroundColor: "#0D1117",
                            borderRadius: 8,
                            padding: 12,
                            color: "#fff",
                            borderWidth: 1,
                            borderColor: "#EC4899",
                          }}
                          multiline
                        />
                      </View>
                    )}

                    {/* アクションボタン */}
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {isPicked ? (
                        <TouchableOpacity
                          onPress={() => handleUnpick(participation.id)}
                          style={{
                            flex: 1,
                            backgroundColor: "#374151",
                            borderRadius: 8,
                            paddingVertical: 10,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "bold" }}>
                            ピックアップ解除
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          {isPickingThis && (
                            <TouchableOpacity
                              onPress={() => setPickingId(null)}
                              style={{
                                flex: 1,
                                backgroundColor: "#374151",
                                borderRadius: 8,
                                paddingVertical: 10,
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ color: "#fff" }}>キャンセル</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => handlePick(participation.id)}
                            disabled={pickMutation.isPending}
                            style={{
                              flex: 1,
                              backgroundColor: "#EC4899",
                              borderRadius: 8,
                              paddingVertical: 10,
                              alignItems: "center",
                            }}
                          >
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>
                              {isPickingThis ? "確定" : "ピックアップ"}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <MaterialIcons name="chat-bubble-outline" size={64} color="#6B7280" />
                <Text style={{ color: "#9CA3AF", fontSize: 16, marginTop: 16 }}>
                  コメントがありません
                </Text>
              </View>
            )
          ) : (
            // ピックアップ済みタブ
            pickedComments && pickedComments.length > 0 ? (
              pickedComments.map((picked) => (
                <View
                  key={picked.id}
                  style={{
                    backgroundColor: "#1E2530",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: picked.isUsedInVideo ? "#4ADE80" : "#EC4899",
                  }}
                >
                  {/* ユーザー情報 */}
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    {picked.participation?.profileImage ? (
                      <Image
                        source={{ uri: picked.participation.profileImage }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: "#EC4899",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          {picked.participation?.displayName?.charAt(0) || "?"}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        {picked.participation?.isAnonymous ? "匿名" : picked.participation?.displayName}
                      </Text>
                      {picked.reason && (
                        <Text style={{ color: "#EC4899", fontSize: 12 }}>
                          理由: {picked.reason}
                        </Text>
                      )}
                    </View>
                    {picked.isUsedInVideo && (
                      <View
                        style={{
                          backgroundColor: "#4ADE80",
                          borderRadius: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        }}
                      >
                        <Text style={{ color: "#000", fontSize: 10, fontWeight: "bold" }}>
                          動画使用済
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* コメント */}
                  <Text style={{ color: "#E5E7EB", fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                    {picked.participation?.message}
                  </Text>

                  {/* アクションボタン */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleUnpick(picked.participationId)}
                      style={{
                        flex: 1,
                        backgroundColor: "#374151",
                        borderRadius: 8,
                        paddingVertical: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff" }}>解除</Text>
                    </TouchableOpacity>
                    {!picked.isUsedInVideo && (
                      <TouchableOpacity
                        onPress={() => handleMarkAsUsed(picked.id)}
                        style={{
                          flex: 1,
                          backgroundColor: "#4ADE80",
                          borderRadius: 8,
                          paddingVertical: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#000", fontWeight: "bold" }}>
                          動画使用済みにする
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <MaterialIcons name="star-outline" size={64} color="#6B7280" />
                <Text style={{ color: "#9CA3AF", fontSize: 16, marginTop: 16 }}>
                  ピックアップしたコメントはありません
                </Text>
              </View>
            )
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
