import { Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
};

// 目標タイプの設定
const goalTypes = [
  { id: "attendance", label: "動員", icon: "people", unit: "人", description: "ライブ・イベントの参加者数" },
  { id: "followers", label: "フォロワー", icon: "person-add", unit: "人", description: "SNSのフォロワー増加目標" },
  { id: "viewers", label: "同時視聴", icon: "visibility", unit: "人", description: "配信・プレミア公開の同接" },
  { id: "points", label: "ポイント", icon: "star", unit: "pt", description: "ミクチャ等のイベントポイント" },
  { id: "custom", label: "カスタム", icon: "flag", unit: "", description: "自由な目標を設定" },
];

// イベントタイプの設定
const eventTypes = [
  { id: "solo", label: "ソロ", color: "#EC4899" },
  { id: "group", label: "グループ", color: "#8B5CF6" },
];

// 都道府県リスト
const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県", "オンライン"
];

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { user, login } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [eventDateStr, setEventDateStr] = useState("");
  const [hostName, setHostName] = useState("");
  const [goalType, setGoalType] = useState("attendance");
  const [goalValue, setGoalValue] = useState("100");
  const [goalUnit, setGoalUnit] = useState("人");
  const [eventType, setEventType] = useState("solo");
  const [ticketPresale, setTicketPresale] = useState("");
  const [ticketDoor, setTicketDoor] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [showPrefectureList, setShowPrefectureList] = useState(false);

  const createChallengeMutation = trpc.events.create.useMutation({
    onSuccess: (newChallenge) => {
      Alert.alert("成功", "チャレンジを作成しました！", [
        {
          text: "OK",
          onPress: () => {
            router.push({
              pathname: "/event/[id]",
              params: { id: newChallenge.id.toString() },
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
      Alert.alert("エラー", "チャレンジ名を入力してください");
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

    createChallengeMutation.mutate({
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

  const selectedGoalType = goalTypes.find(g => g.id === goalType);

  return (
    <ScreenContainer containerClassName="bg-[#0D1117]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1, backgroundColor: "#0D1117" }}>
          {/* ヘッダー */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
              チャレンジ作成
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}>
              目標を設定してファンと一緒に達成しよう
            </Text>
          </View>

          {/* キャラクター */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 16 }}>
            <Image source={characterImages.konta} style={{ width: 50, height: 50 }} contentFit="contain" />
            <View style={{ alignItems: "center", marginHorizontal: 8 }}>
              <Image source={characterImages.rinku} style={{ width: 70, height: 70 }} contentFit="contain" />
            </View>
            <Image source={characterImages.tanune} style={{ width: 50, height: 50 }} contentFit="contain" />
          </View>

          {/* フォーム */}
          <View
            style={{
              backgroundColor: "#1A1D21",
              margin: 16,
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#2D3139",
            }}
          >
            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
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
                    backgroundColor: "#0D1117",
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
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                      {user.name}
                    </Text>
                    {user.username && (
                      <Text style={{ color: "#DD6500", fontSize: 14 }}>
                        @{user.username}
                      </Text>
                    )}
                    {user.followersCount !== undefined && (
                      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
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
                    <View style={{ flex: 1, height: 1, backgroundColor: "#2D3139" }} />
                    <Text style={{ color: "#6B7280", marginHorizontal: 16 }}>または</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: "#2D3139" }} />
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                      ホスト名 *
                    </Text>
                    <TextInput
                      value={hostName}
                      onChangeText={setHostName}
                      placeholder="あなたの名前・アーティスト名"
                      placeholderTextColor="#6B7280"
                      style={{
                        backgroundColor: "#0D1117",
                        borderRadius: 8,
                        padding: 12,
                        color: "#fff",
                        borderWidth: 1,
                        borderColor: "#2D3139",
                      }}
                    />
                  </View>
                </>
              )}

              {/* 目標タイプ選択 */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                  目標タイプ *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {goalTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => {
                        setGoalType(type.id);
                        setGoalUnit(type.unit);
                      }}
                      style={{
                        backgroundColor: goalType === type.id ? "#DD6500" : "#0D1117",
                        borderRadius: 8,
                        padding: 12,
                        marginRight: 8,
                        alignItems: "center",
                        minWidth: 80,
                        borderWidth: 1,
                        borderColor: goalType === type.id ? "#DD6500" : "#2D3139",
                      }}
                    >
                      <MaterialIcons 
                        name={type.icon as any} 
                        size={24} 
                        color={goalType === type.id ? "#fff" : "#9CA3AF"} 
                      />
                      <Text style={{ 
                        color: goalType === type.id ? "#fff" : "#9CA3AF", 
                        fontSize: 12, 
                        marginTop: 4 
                      }}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {selectedGoalType && (
                  <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 8 }}>
                    {selectedGoalType.description}
                  </Text>
                )}
              </View>

              {/* イベントタイプ選択 */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                  イベントタイプ *
                </Text>
                <View style={{ flexDirection: "row" }}>
                  {eventTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setEventType(type.id)}
                      style={{
                        backgroundColor: eventType === type.id ? type.color : "#0D1117",
                        borderRadius: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        marginRight: 12,
                        borderWidth: 1,
                        borderColor: eventType === type.id ? type.color : "#2D3139",
                      }}
                    >
                      <Text style={{ 
                        color: "#fff", 
                        fontSize: 14, 
                        fontWeight: eventType === type.id ? "bold" : "normal" 
                      }}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                  チャレンジ名 *
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="例: ○○ ワンマンライブ 動員100人チャレンジ"
                  placeholderTextColor="#6B7280"
                  style={{
                    backgroundColor: "#0D1117",
                    borderRadius: 8,
                    padding: 12,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2D3139",
                  }}
                />
              </View>

              {/* 目標数値 */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                  目標数値 *
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    value={goalValue}
                    onChangeText={setGoalValue}
                    placeholder="100"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                    style={{
                      backgroundColor: "#0D1117",
                      borderRadius: 8,
                      padding: 12,
                      color: "#fff",
                      borderWidth: 1,
                      borderColor: "#2D3139",
                      flex: 1,
                    }}
                  />
                  <Text style={{ color: "#fff", fontSize: 16, marginLeft: 12 }}>
                    {goalUnit || "人"}
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                  開催日 *
                </Text>
                <TextInput
                  value={eventDateStr}
                  onChangeText={setEventDateStr}
                  placeholder="2025-01-15"
                  placeholderTextColor="#6B7280"
                  style={{
                    backgroundColor: "#0D1117",
                    borderRadius: 8,
                    padding: 12,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2D3139",
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                  開催場所（任意）
                </Text>
                <TextInput
                  value={venue}
                  onChangeText={setVenue}
                  placeholder="例: 渋谷○○ホール / YouTube / ミクチャ"
                  placeholderTextColor="#6B7280"
                  style={{
                    backgroundColor: "#0D1117",
                    borderRadius: 8,
                    padding: 12,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2D3139",
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                  外部URL（任意）
                </Text>
                <TextInput
                  value={externalUrl}
                  onChangeText={setExternalUrl}
                  placeholder="YouTubeプレミア公開URL等"
                  placeholderTextColor="#6B7280"
                  style={{
                    backgroundColor: "#0D1117",
                    borderRadius: 8,
                    padding: 12,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2D3139",
                  }}
                />
              </View>

              {/* チケット情報セクション */}
              {goalType === "attendance" && (
                <View
                  style={{
                    backgroundColor: "#0D1117",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#2D3139",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <MaterialIcons name="confirmation-number" size={20} color="#EC4899" />
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 }}>
                      チケット情報（任意）
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 4 }}>
                        前売り券
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextInput
                          value={ticketPresale}
                          onChangeText={setTicketPresale}
                          placeholder="3000"
                          placeholderTextColor="#6B7280"
                          keyboardType="numeric"
                          style={{
                            backgroundColor: "#1A1D21",
                            borderRadius: 8,
                            padding: 10,
                            color: "#fff",
                            borderWidth: 1,
                            borderColor: "#2D3139",
                            flex: 1,
                          }}
                        />
                        <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 8 }}>円</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 4 }}>
                        当日券
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextInput
                          value={ticketDoor}
                          onChangeText={setTicketDoor}
                          placeholder="3500"
                          placeholderTextColor="#6B7280"
                          keyboardType="numeric"
                          style={{
                            backgroundColor: "#1A1D21",
                            borderRadius: 8,
                            padding: 10,
                            color: "#fff",
                            borderWidth: 1,
                            borderColor: "#2D3139",
                            flex: 1,
                          }}
                        />
                        <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 8 }}>円</Text>
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 4 }}>
                      チケット購入URL
                    </Text>
                    <TextInput
                      value={ticketUrl}
                      onChangeText={setTicketUrl}
                      placeholder="https://tiget.net/events/..."
                      placeholderTextColor="#6B7280"
                      style={{
                        backgroundColor: "#1A1D21",
                        borderRadius: 8,
                        padding: 10,
                        color: "#fff",
                        borderWidth: 1,
                        borderColor: "#2D3139",
                      }}
                    />
                  </View>
                </View>
              )}

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 8 }}>
                  チャレンジ説明（任意）
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="チャレンジの詳細を書いてね"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: "#0D1117",
                    borderRadius: 8,
                    padding: 12,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2D3139",
                    minHeight: 100,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleCreate}
                disabled={createChallengeMutation.isPending}
                style={{
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={createChallengeMutation.isPending ? ["#6B7280", "#6B7280"] : ["#EC4899", "#8B5CF6"]}
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
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                  {createChallengeMutation.isPending ? "作成中..." : "チャレンジを作成"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
