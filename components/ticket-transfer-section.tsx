import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, Alert, Linking, FlatList } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

type PriceType = "face_value" | "negotiable" | "free";

const priceTypeLabels: Record<PriceType, string> = {
  face_value: "定価",
  negotiable: "相談",
  free: "無料",
};

const priceTypeColors: Record<PriceType, string> = {
  face_value: "#10B981",
  negotiable: "#F59E0B",
  free: "#EC4899",
};

type TicketTransfer = {
  id: number;
  userId: number;
  userName: string | null;
  userUsername: string | null;
  userImage: string | null;
  ticketCount: number;
  priceType: string;
  comment: string | null;
  status: string;
  createdAt: Date;
};

type TicketWaitlist = {
  id: number;
  userId: number;
  userName: string | null;
  userUsername: string | null;
  userImage: string | null;
  desiredCount: number;
  createdAt: Date;
};

interface TicketTransferSectionProps {
  challengeId: number;
  challengeTitle: string;
}

export function TicketTransferSection({ challengeId, challengeTitle }: TicketTransferSectionProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"transfers" | "waitlist">("transfers");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  
  // 譲渡投稿一覧
  const { data: transfers, refetch: refetchTransfers } = trpc.ticketTransfer.listByChallenge.useQuery(
    { challengeId },
    { enabled: challengeId > 0 }
  );
  
  // 待機リスト
  const { data: waitlist, refetch: refetchWaitlist } = trpc.ticketWaitlist.listByChallenge.useQuery(
    { challengeId },
    { enabled: challengeId > 0 }
  );
  
  // 自分が待機リストに登録しているか
  const { data: isInWaitlist, refetch: refetchIsInWaitlist } = trpc.ticketWaitlist.isInWaitlist.useQuery(
    { challengeId },
    { enabled: !!user && challengeId > 0 }
  );
  
  // 譲渡投稿作成
  const createTransferMutation = trpc.ticketTransfer.create.useMutation({
    onSuccess: () => {
      Alert.alert("投稿完了", "チケット譲渡の投稿が完了しました");
      setShowCreateModal(false);
      refetchTransfers();
    },
    onError: (error) => {
      Alert.alert("エラー", error.message || "投稿に失敗しました");
    },
  });
  
  // 待機リスト登録
  const addToWaitlistMutation = trpc.ticketWaitlist.add.useMutation({
    onSuccess: () => {
      Alert.alert("登録完了", "待機リストに登録しました。新しい譲渡投稿があれば通知します。");
      setShowWaitlistModal(false);
      refetchWaitlist();
      refetchIsInWaitlist();
    },
    onError: (error) => {
      Alert.alert("エラー", error.message || "登録に失敗しました");
    },
  });
  
  // 待機リスト解除
  const removeFromWaitlistMutation = trpc.ticketWaitlist.remove.useMutation({
    onSuccess: () => {
      Alert.alert("解除完了", "待機リストから解除しました");
      refetchWaitlist();
      refetchIsInWaitlist();
    },
  });
  
  // 譲渡投稿キャンセル
  const cancelTransferMutation = trpc.ticketTransfer.cancel.useMutation({
    onSuccess: () => {
      Alert.alert("キャンセル完了", "譲渡投稿をキャンセルしました");
      refetchTransfers();
    },
  });

  const handleOpenDM = (username: string | null) => {
    if (!username) {
      Alert.alert("エラー", "このユーザーにはDMを送れません");
      return;
    }
    Linking.openURL(`https://twitter.com/messages/compose?recipient_id=${username}`);
  };

  return (
    <View style={{ marginTop: 24 }}>
      {/* セクションヘッダー */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <MaterialIcons name="swap-horiz" size={24} color="#EC4899" />
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 8 }}>
          チケット譲渡
        </Text>
      </View>
      
      {/* 説明文 */}
      <View style={{
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#2D3139",
      }}>
        <Text style={{ color: "#9CA3AF", fontSize: 12, lineHeight: 18 }}>
          急な予定変更でライブに行けなくなった方と、チケットを探している方をつなぐコーナーです。
          連絡はX（Twitter）のDMで行ってください。
        </Text>
      </View>
      
      {/* タブ */}
      <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
        <TouchableOpacity
          onPress={() => setActiveTab("transfers")}
          style={{
            flex: 1,
            backgroundColor: activeTab === "transfers" ? "#EC4899" : "#1A1D21",
            borderRadius: 8,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: activeTab === "transfers" ? "bold" : "normal" }}>
            譲りたい ({transfers?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("waitlist")}
          style={{
            flex: 1,
            backgroundColor: activeTab === "waitlist" ? "#8B5CF6" : "#1A1D21",
            borderRadius: 8,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: activeTab === "waitlist" ? "bold" : "normal" }}>
            欲しい ({waitlist?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* アクションボタン */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {activeTab === "transfers" ? (
          <TouchableOpacity
            onPress={() => {
              if (!user) {
                Alert.alert("ログインが必要です", "チケット譲渡の投稿にはログインが必要です");
                return;
              }
              setShowCreateModal(true);
            }}
            style={{
              flex: 1,
              backgroundColor: "#EC4899",
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}>
              チケットを譲る
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (!user) {
                Alert.alert("ログインが必要です", "待機リスト登録にはログインが必要です");
                return;
              }
              if (isInWaitlist) {
                Alert.alert(
                  "待機リストから解除",
                  "待機リストから解除しますか？",
                  [
                    { text: "キャンセル", style: "cancel" },
                    { text: "解除する", onPress: () => removeFromWaitlistMutation.mutate({ challengeId }) },
                  ]
                );
              } else {
                setShowWaitlistModal(true);
              }
            }}
            style={{
              flex: 1,
              backgroundColor: isInWaitlist ? "#6B7280" : "#8B5CF6",
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name={isInWaitlist ? "notifications-off" : "notifications"} size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}>
              {isInWaitlist ? "待機リスト解除" : "チケットが欲しい"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 一覧 */}
      {activeTab === "transfers" ? (
        transfers && transfers.length > 0 ? (
          <View style={{ gap: 12 }}>
            {transfers.map((transfer: TicketTransfer) => (
              <View
                key={transfer.id}
                style={{
                  backgroundColor: "#1A1D21",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#2D3139",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  {transfer.userImage ? (
                    <Image
                      source={{ uri: transfer.userImage }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  ) : (
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#EC4899",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                        {(transfer.userName || "?")[0]}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                      {transfer.userName || "匿名"}
                    </Text>
                    {transfer.userUsername && (
                      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                        @{transfer.userUsername}
                      </Text>
                    )}
                  </View>
                  <View style={{
                    backgroundColor: priceTypeColors[transfer.priceType as PriceType] || "#6B7280",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                      {priceTypeLabels[transfer.priceType as PriceType] || transfer.priceType}
                    </Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <MaterialIcons name="confirmation-number" size={16} color="#EC4899" />
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
                    {transfer.ticketCount}枚
                  </Text>
                </View>
                
                {transfer.comment && (
                  <Text style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 12 }}>
                    {transfer.comment}
                  </Text>
                )}
                
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {transfer.userUsername && (
                    <TouchableOpacity
                      onPress={() => handleOpenDM(transfer.userUsername)}
                      style={{
                        flex: 1,
                        backgroundColor: "#000",
                        borderRadius: 8,
                        padding: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>𝕏</Text>
                      <Text style={{ color: "#fff", fontSize: 12, marginLeft: 6 }}>DMで連絡</Text>
                    </TouchableOpacity>
                  )}
                  {user && transfer.userId === user.id && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "投稿をキャンセル",
                          "この譲渡投稿をキャンセルしますか？",
                          [
                            { text: "いいえ", style: "cancel" },
                            { text: "キャンセルする", onPress: () => cancelTransferMutation.mutate({ id: transfer.id }) },
                          ]
                        );
                      }}
                      style={{
                        backgroundColor: "#EF4444",
                        borderRadius: 8,
                        padding: 10,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 12 }}>取消</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <MaterialIcons name="confirmation-number" size={48} color="#4B5563" />
            <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 12, textAlign: "center" }}>
              現在、チケット譲渡の投稿はありません
            </Text>
          </View>
        )
      ) : (
        waitlist && waitlist.length > 0 ? (
          <View style={{ gap: 12 }}>
            {waitlist.map((item: TicketWaitlist) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#1A1D21",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#2D3139",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {item.userImage ? (
                  <Image
                    source={{ uri: item.userImage }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#8B5CF6",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                      {(item.userName || "?")[0]}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                    {item.userName || "匿名"}
                  </Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                    {item.desiredCount}枚希望
                  </Text>
                </View>
                {item.userUsername && (
                  <TouchableOpacity
                    onPress={() => handleOpenDM(item.userUsername)}
                    style={{
                      backgroundColor: "#000",
                      borderRadius: 8,
                      padding: 8,
                      paddingHorizontal: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>𝕏</Text>
                    <Text style={{ color: "#fff", fontSize: 11, marginLeft: 4 }}>DM</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <MaterialIcons name="people" size={48} color="#4B5563" />
            <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 12, textAlign: "center" }}>
              現在、チケットを探している人はいません
            </Text>
          </View>
        )
      )}
      
      {/* 譲渡投稿作成モーダル */}
      <CreateTransferModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => createTransferMutation.mutate({ challengeId, ...data })}
        isLoading={createTransferMutation.isPending}
        userUsername={user?.username}
      />
      
      {/* 待機リスト登録モーダル */}
      <WaitlistModal
        visible={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
        onSubmit={(data) => addToWaitlistMutation.mutate({ challengeId, ...data })}
        isLoading={addToWaitlistMutation.isPending}
        userUsername={user?.username}
      />
    </View>
  );
}

// 譲渡投稿作成モーダル
function CreateTransferModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
  userUsername,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { ticketCount: number; priceType: PriceType; comment?: string; userUsername?: string }) => void;
  isLoading: boolean;
  userUsername?: string;
}) {
  const [ticketCount, setTicketCount] = useState(1);
  const [priceType, setPriceType] = useState<PriceType>("face_value");
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit({
      ticketCount,
      priceType,
      comment: comment.trim() || undefined,
      userUsername,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}>
        <View style={{
          backgroundColor: "#1A1D21",
          borderRadius: 16,
          padding: 20,
          width: "100%",
          maxWidth: 400,
          borderWidth: 1,
          borderColor: "#2D3139",
        }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            チケットを譲る
          </Text>
          
          {/* 枚数 */}
          <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>枚数</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setTicketCount(n)}
                style={{
                  flex: 1,
                  backgroundColor: ticketCount === n ? "#EC4899" : "#0D1117",
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: ticketCount === n ? "#EC4899" : "#2D3139",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: ticketCount === n ? "bold" : "normal" }}>
                  {n}枚
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* 価格タイプ */}
          <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>価格</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {(["face_value", "negotiable", "free"] as PriceType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setPriceType(type)}
                style={{
                  flex: 1,
                  backgroundColor: priceType === type ? priceTypeColors[type] : "#0D1117",
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: priceType === type ? priceTypeColors[type] : "#2D3139",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: priceType === type ? "bold" : "normal" }}>
                  {priceTypeLabels[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* コメント */}
          <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>コメント（任意）</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="例: 急な仕事で行けなくなりました..."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: "#0D1117",
              borderRadius: 8,
              padding: 12,
              color: "#fff",
              borderWidth: 1,
              borderColor: "#2D3139",
              minHeight: 80,
              textAlignVertical: "top",
              marginBottom: 16,
            }}
          />
          
          {/* 注意事項 */}
          <View style={{
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
          }}>
            <Text style={{ color: "#F59E0B", fontSize: 12, lineHeight: 18 }}>
              ⚠️ 連絡はX（Twitter）のDMで行われます。{"\n"}
              金銭のやり取りは当事者間で行ってください。
            </Text>
          </View>
          
          {/* ボタン */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#2D3139",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: "#EC4899",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                {isLoading ? "投稿中..." : "投稿する"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// 待機リスト登録モーダル
function WaitlistModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
  userUsername,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { desiredCount: number; userUsername?: string }) => void;
  isLoading: boolean;
  userUsername?: string;
}) {
  const [desiredCount, setDesiredCount] = useState(1);

  const handleSubmit = () => {
    onSubmit({
      desiredCount,
      userUsername,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}>
        <View style={{
          backgroundColor: "#1A1D21",
          borderRadius: 16,
          padding: 20,
          width: "100%",
          maxWidth: 400,
          borderWidth: 1,
          borderColor: "#2D3139",
        }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            チケットを探す
          </Text>
          
          <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 16 }}>
            待機リストに登録すると、新しい譲渡投稿があった時に通知を受け取れます。
          </Text>
          
          {/* 希望枚数 */}
          <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>希望枚数</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setDesiredCount(n)}
                style={{
                  flex: 1,
                  backgroundColor: desiredCount === n ? "#8B5CF6" : "#0D1117",
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: desiredCount === n ? "#8B5CF6" : "#2D3139",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: desiredCount === n ? "bold" : "normal" }}>
                  {n}枚
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* ボタン */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#2D3139",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: "#8B5CF6",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                {isLoading ? "登録中..." : "登録する"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
