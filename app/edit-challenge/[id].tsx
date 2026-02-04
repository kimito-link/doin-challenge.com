import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { color, palette } from "@/theme/tokens";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { navigateBack } from "@/lib/navigation/app-routes";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { ResponsiveContainer } from "@/components/molecules/responsive-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/organisms/app-header";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/molecules/date-picker";
import { NumberStepper } from "@/components/molecules/number-stepper";
import { showAlert } from "@/lib/web-alert";

// キャラクター画像（りんく・こん太・たぬ姉のオリジナル画像を統一使用）
const characterImages = {
  rinku: require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png"),
  konta: require("@/assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png"),
  tanune: require("@/assets/images/characters/tanunee/tanuki-yukkuri-smile-mouth-open.png"),
};

// 目標タイプの設定
const goalTypes = [
  { id: "attendance", label: "会場参加", icon: "people", unit: "人", description: "ライブ・イベントの参加予定者数" },
  { id: "followers", label: "フォロワー", icon: "person-add", unit: "人", description: "SNSのフォロワー増加目標" },
  { id: "viewers", label: "同時視聴", icon: "visibility", unit: "人", description: "配信・プレミア公開の同接" },
  { id: "points", label: "ポイント", icon: "star", unit: "pt", description: "ミクチャ等のイベントポイント" },
  { id: "custom", label: "カスタム", icon: "flag", unit: "", description: "自由な目標を設定" },
];

// イベントタイプの設定
const eventTypes = [
  { id: "solo", label: "ソロ", color: color.accentPrimary },
  { id: "group", label: "グループ", color: color.accentAlt },
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

export default function EditChallengeScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const colors = useColors();
  const utils = trpc.useUtils();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [eventDateStr, setEventDateStr] = useState("");
  const [goalType, setGoalType] = useState("attendance");
  const [goalValue, setGoalValue] = useState(100);
  const [goalUnit, setGoalUnit] = useState("人");
  const [eventType, setEventType] = useState("solo");
  const [ticketPresale, setTicketPresale] = useState("");
  const [ticketDoor, setTicketDoor] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [showPrefectureList, setShowPrefectureList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // チャレンジデータを取得
  const { data: challenge, isLoading: isChallengeLoading } = trpc.events.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );

  // データが取得できたらフォームに反映
  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title || "");
      setDescription(challenge.description || "");
      setVenue(challenge.venue || "");
      setPrefecture(challenge.prefecture || "");
      setEventDateStr(challenge.eventDate ? new Date(challenge.eventDate).toISOString().split("T")[0] : "");
      setGoalType(challenge.goalType || "attendance");
      setGoalValue(challenge.goalValue || 100);
      setGoalUnit(challenge.goalUnit || "人");
      setEventType(challenge.eventType || "solo");
      setTicketPresale(challenge.ticketPresale?.toString() || "");
      setTicketDoor(challenge.ticketDoor?.toString() || "");
      setTicketUrl(challenge.ticketUrl || "");
      setExternalUrl(challenge.externalUrl || "");
      setIsLoading(false);
    }
  }, [challenge]);

  const updateChallengeMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      utils.events.getById.invalidate({ id: parseInt(id || "0") });
      showAlert("成功", "チャレンジを更新しました！", [
        {
          text: "OK",
          onPress: () => {
            navigateBack();
          },
        },
      ]);
    },
    onError: (error) => {
      showAlert("エラー", error.message);
    },
  });

  const handleUpdate = () => {
    if (!title.trim()) {
      showAlert("エラー", "タイトルを入力してください");
      return;
    }
    if (!eventDateStr.trim()) {
      showAlert("エラー", "開催日を入力してください");
      return;
    }
    if (!venue.trim()) {
      showAlert("エラー", "開催場所を入力してください");
      return;
    }

    const eventDate = new Date(eventDateStr);
    if (isNaN(eventDate.getTime())) {
      showAlert("エラー", "日付の形式が正しくありません");
      return;
    }

    updateChallengeMutation.mutate({
      id: parseInt(id || "0"),
      title: title.trim(),
      description: description.trim() || undefined,
      venue: venue.trim() || undefined,
      eventDate: eventDate.toISOString(),
      goalType: goalType as "attendance" | "followers" | "viewers" | "points" | "custom",
      goalValue: goalValue || 100,
      goalUnit: goalUnit || "人",
      eventType: eventType as "solo" | "group",
      externalUrl: externalUrl.trim() || undefined,
      ticketPresale: ticketPresale ? parseInt(ticketPresale) : undefined,
      ticketDoor: ticketDoor ? parseInt(ticketDoor) : undefined,
      ticketUrl: ticketUrl.trim() || undefined,
    });
  };

  const selectedGoalType = goalTypes.find(g => g.id === goalType);

  if (isChallengeLoading || isLoading) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted, marginTop: 16 }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={{ flex: 1, backgroundColor: colors.background }}
          showsHorizontalScrollIndicator={false}
          horizontal={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* ヘッダー */}
          <AppHeader 
            title="チャレンジを編集" 
            showCharacters={false}
            showLogo={false}
          />
          
          <ResponsiveContainer>
            <View style={{ padding: 20, gap: 24 }}>
              {/* タイトル */}
              <View style={{ gap: 8 }}>
                <Input
                  label="タイトル *"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="例: 君斗りんく生誕祭2025"
                />
              </View>

              {/* 説明 */}
              <View style={{ gap: 8 }}>
                <Input
                  label="説明"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="チャレンジの詳細を入力"
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                />
              </View>

              {/* 開催日 */}
              <View style={{ gap: 8 }}>
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                  開催日 <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <DatePicker
                  value={eventDateStr}
                  onChange={setEventDateStr}
                  placeholder="日付を選択"
                />
              </View>

              {/* 開催場所 */}
              <View style={{ gap: 8 }}>
                <Input
                  label="開催場所 *"
                  value={venue}
                  onChangeText={setVenue}
                  placeholder="例: 渋谷CLUB QUATTRO"
                />
              </View>

              {/* 目標タイプ */}
              <View style={{ gap: 8 }}>
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                  目標タイプ
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {goalTypes.map((type) => (
                    <Pressable
                      key={type.id}
                      onPress={() => {
                        setGoalType(type.id);
                        setGoalUnit(type.unit);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        backgroundColor: goalType === type.id ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: goalType === type.id ? colors.primary : colors.border,
                      }}
                    >
                      <MaterialIcons
                        name={type.icon as any}
                        size={18}
                        color={goalType === type.id ? color.textWhite : colors.muted}
                      />
                      <Text
                        style={{
                          color: goalType === type.id ? color.textWhite : colors.foreground,
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 目標値 */}
              <View style={{ gap: 8 }}>
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                  目標値
                </Text>
                <NumberStepper
                  value={goalValue}
                  onChange={setGoalValue}
                  min={1}
                  max={100000}
                  step={10}
                  unit={goalUnit}
                />
              </View>

              {/* チケット情報 */}
              <View style={{ gap: 16 }}>
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                  チケット情報（任意）
                </Text>
                
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>前売り</Text>
                    <NumberStepper
                      value={ticketPresale ? parseInt(ticketPresale) : 0}
                      onChange={(v) => setTicketPresale(v.toString())}
                      min={0}
                      max={100000}
                      step={500}
                      unit="円"
                    />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>当日</Text>
                    <NumberStepper
                      value={ticketDoor ? parseInt(ticketDoor) : 0}
                      onChange={(v) => setTicketDoor(v.toString())}
                      min={0}
                      max={100000}
                      step={500}
                      unit="円"
                    />
                  </View>
                </View>

                <Input
                  label="チケット購入URL（任意）"
                  value={ticketUrl}
                  onChangeText={setTicketUrl}
                  placeholder="チケット購入URL"
                />
              </View>

              {/* 外部URL */}
              <View style={{ gap: 8 }}>
                <Input
                  label="外部URL（任意）"
                  value={externalUrl}
                  onChangeText={setExternalUrl}
                  placeholder="イベント詳細ページのURL"
                />
              </View>

              {/* 更新ボタン */}
              <Pressable
                onPress={handleUpdate}
                disabled={updateChallengeMutation.isPending}
                style={{
                  marginTop: 16,
                  marginBottom: 40,
                }}
              >
                <LinearGradient
                  colors={[color.accentPrimary, color.accentAlt]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16,
                    padding: 18,
                    alignItems: "center",
                    opacity: updateChallengeMutation.isPending ? 0.7 : 1,
                  }}
                >
                  {updateChallengeMutation.isPending ? (
                    <ActivityIndicator color={color.textWhite} />
                  ) : (
                    <Text style={{ color: color.textWhite, fontSize: 18, fontWeight: "bold" }}>
                      更新する
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
