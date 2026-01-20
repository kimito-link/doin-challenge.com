import { Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Linking, Pressable } from "react-native";
import { color, palette } from "@/theme/tokens";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { ResponsiveContainer } from "@/components/molecules/responsive-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useFollowStatus } from "@/hooks/use-follow-status";
import { useResponsive } from "@/hooks/use-responsive";
import { useColors } from "@/hooks/use-colors";
import { FollowPromptBanner, FollowStatusBadge } from "@/components/molecules/follow-gate";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/organisms/app-header";
import { DatePicker } from "@/components/molecules/date-picker";
import { NumberStepper } from "@/components/molecules/number-stepper";
import { showAlert } from "@/lib/web-alert";
import { TwitterUserCard } from "@/components/molecules/twitter-user-card";
import { CharacterGroupValidationError } from "@/components/molecules/character-validation-error";
import { InlineValidationError } from "@/components/molecules/inline-validation-error";
import { goalTypeOptions, eventTypeOptions } from "@/constants/goal-types";
import { prefectures } from "@/constants/prefectures";
import {
  EventTypeSelector,
  GoalTypeSelector,
  CategorySelector,
  TicketInfoSection,
  TemplateSaveSection,
} from "@/features/create";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
};


export default function CreateChallengeScreen() {
  const router = useRouter();
  const { user, login, isAuthenticated } = useAuth();
  const { isFollowing, targetUsername, targetDisplayName } = useFollowStatus();
  const { isDesktop, isTablet } = useResponsive();
  const colors = useColors();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [eventDateStr, setEventDateStr] = useState("");
  const [hostName, setHostName] = useState("");
  const [goalType, setGoalType] = useState("attendance");
  const [goalValue, setGoalValue] = useState(100);
  const [goalUnit, setGoalUnit] = useState("人");
  const [eventType, setEventType] = useState("solo");
  const [ticketPresale, setTicketPresale] = useState("");
  const [ticketDoor, setTicketDoor] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [showPrefectureList, setShowPrefectureList] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateIsPublic, setTemplateIsPublic] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  
  // ScrollViewのref（バリデーションエラー時にスクロールするため）
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 各フィールドのref
  const titleInputRef = useRef<View>(null);
  const dateInputRef = useRef<View>(null);

  // カテゴリ一覧を取得
  const { data: categoriesData } = trpc.categories.list.useQuery();

  // バリデーションエラーを計算
  const validationErrors = useMemo(() => {
    const errors: Array<{ field: "title" | "date" | "host" | "general"; message?: string }> = [];
    
    if (!title.trim()) {
      errors.push({ field: "title" });
    }
    // 「まだ決まっていない」(9999-12-31)は有効な値として扱う
    if (!eventDateStr.trim() && eventDateStr !== "9999-12-31") {
      // 日付が未入力の場合はエラーにしない（任意にする）
    }
    if (!user?.twitterId) {
      errors.push({ field: "host" });
    }
    
    return errors;
  }, [title, eventDateStr, user]);
  
  // バリデーションエラー表示時にエラーのあるフィールドにスクロール
  useEffect(() => {
    if (showValidationError && scrollViewRef.current) {
      // 最初のエラーのあるフィールドにスクロール
      const firstError = validationErrors[0];
      if (firstError?.field === "title" && titleInputRef.current) {
        // タイトル入力欄にスクロール
        titleInputRef.current.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
          },
          () => {}
        );
      } else if (firstError?.field === "date" && dateInputRef.current) {
        // 日付入力欄にスクロール
        dateInputRef.current.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
          },
          () => {}
        );
      }
    }
  }, [showValidationError, validationErrors]);

  const createTemplateMutation = trpc.templates.create.useMutation({
    onSuccess: () => {
      showAlert("保存完了", "テンプレートを保存しました");
    },
  });

  const createChallengeMutation = trpc.events.create.useMutation({
    onSuccess: (newChallenge) => {
      setShowValidationError(false);
      showAlert("成功", "チャレンジを作成しました！", [
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
      // ユーザーフレンドリーなエラーメッセージを表示
      const errorMessage = error.message || "チャレンジの作成に失敗しました";
      showAlert("チャレンジ作成エラー", `${errorMessage}\n\n入力内容を確認して再度お試しください。`, [
        {
          text: "OK",
          style: "cancel",
        },
      ]);
    },
  });

  const handleCreate = () => {
    // バリデーションエラーがある場合はキャラクターエラーを表示
    if (validationErrors.length > 0) {
      setShowValidationError(true);
      return;
    }

    const eventDate = new Date(eventDateStr);
    if (isNaN(eventDate.getTime())) {
      showAlert("エラー", "日付の形式が正しくありません");
      return;
    }

    // テンプレートとして保存
    if (saveAsTemplate && templateName.trim()) {
      createTemplateMutation.mutate({
        name: templateName.trim(),
        description: description.trim() || undefined,
        goalType: goalType as "attendance" | "followers" | "viewers" | "points" | "custom",
        goalValue: goalValue || 100,
        goalUnit: goalUnit || "人",
        eventType: eventType as "solo" | "group",
        ticketPresale: ticketPresale ? parseInt(ticketPresale) : undefined,
        ticketDoor: ticketDoor ? parseInt(ticketDoor) : undefined,
        isPublic: templateIsPublic,
      });
    }

    setShowValidationError(false);
    
    createChallengeMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      venue: venue.trim() || undefined,
      eventDate: eventDate.toISOString(),
      hostTwitterId: user!.twitterId!, // Twitter IDを送信
      hostName: user!.name || hostName.trim(),
      hostUsername: user!.username || undefined,
      hostProfileImage: user!.profileImage || undefined,
      hostFollowersCount: user!.followersCount || undefined,
      hostDescription: user!.description || undefined,
      goalType: goalType as "attendance" | "followers" | "viewers" | "points" | "custom",
      goalValue: goalValue || 100,
      goalUnit: goalUnit || "人",
      eventType: eventType as "solo" | "group",
      categoryId: categoryId || undefined,
      externalUrl: externalUrl.trim() || undefined,
      ticketPresale: ticketPresale && ticketPresale !== "-1" ? parseInt(ticketPresale) : undefined,
      ticketDoor: ticketDoor && ticketDoor !== "-1" ? parseInt(ticketDoor) : undefined,
      ticketUrl: ticketUrl.trim() || undefined,
    });
  };

  // 入力が変更されたらバリデーションエラーを非表示にする
  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (showValidationError && text.trim()) {
      setShowValidationError(false);
    }
  };

  const handleDateChange = (date: string) => {
    setEventDateStr(date);
    if (showValidationError && date.trim()) {
      setShowValidationError(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
            ref={scrollViewRef}
            style={{ flex: 1, backgroundColor: colors.background }}
            showsHorizontalScrollIndicator={false}
            horizontal={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
          {/* ヘッダー */}
          <AppHeader 
            title="君斗りんくの動員ちゃれんじ" 
            showCharacters={false}
            isDesktop={isDesktop}
            showMenu={true}
          />
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "bold" }}>
              チャレンジ作成
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
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

          {/* フォロー促進バナー（未フォロー時のみ表示） */}
          {isAuthenticated && !isFollowing && (
            <FollowPromptBanner
              isFollowing={isFollowing}
              targetUsername={targetUsername}
              targetDisplayName={targetDisplayName}
            />
          )}

          {/* フォーム */}
          <View
            style={{
              backgroundColor: color.surface,
              marginHorizontal: isDesktop ? "auto" : 16,
              marginVertical: 16,
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: color.border,
              maxWidth: isDesktop ? 800 : undefined,
              width: isDesktop ? "100%" : undefined,
            }}
          >
            <LinearGradient
              colors={[color.accentPrimary, color.accentAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 4 }}
            />
            <View style={{ padding: 16 }}>
              {/* Twitterログインボタン */}
              {!user && (
                <TouchableOpacity
                  onPress={() => login()}
                  style={{
                    backgroundColor: color.twitter,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <MaterialIcons name="login" size={20} color={color.textWhite} />
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
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
                    borderWidth: 1,
                    borderColor: color.border,
                  }}
                >
                  <TwitterUserCard
                    user={{
                      name: user.name || "",
                      username: user.username || "",
                      profileImage: user.profileImage || "",
                      followersCount: user.followersCount,
                      description: user.description,
                    }}
                    showFollowers={true}
                    showDescription={false}
                  />
                </View>
              )}

              {/* イベントタイプ選択 */}
              <EventTypeSelector
                value={eventType}
                onChange={setEventType}
              />

              {/* カテゴリ選択 */}
              <CategorySelector
                categoryId={categoryId}
                categories={categoriesData}
                showList={showCategoryList}
                onToggleList={() => setShowCategoryList(!showCategoryList)}
                onSelect={(id) => {
                  setCategoryId(id);
                  setShowCategoryList(false);
                }}
              />

              {/* チャレンジ名 */}
              <View ref={titleInputRef} style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  チャレンジ名 *
                </Text>
                <TextInput
                  value={title}
                  onChangeText={handleTitleChange}
                  placeholder="例: ○○ワンマンライブ動員チャレンジ"
                  placeholderTextColor={color.textSecondary}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: !title.trim() && showValidationError ? color.accentPrimary : color.border,
                  }}
                />
                <InlineValidationError
                  message="チャレンジ名を入れてね！"
                  visible={showValidationError && !title.trim()}
                  character="rinku"
                />
              </View>

              {/* 目標タイプ選択 */}
              <GoalTypeSelector
                goalType={goalType}
                goalUnit={goalUnit}
                onGoalTypeChange={(id, unit) => {
                  setGoalType(id);
                  setGoalUnit(unit);
                }}
                onGoalUnitChange={setGoalUnit}
              />

              {/* 目標数値 */}
              <NumberStepper
                value={goalValue}
                onChange={setGoalValue}
                min={1}
                max={100000}
                step={10}
                unit={goalUnit || "人"}
                label="目標数値 *"
                presets={goalType === "attendance" ? [50, 100, 200, 500, 1000] : goalType === "viewers" ? [100, 500, 1000, 5000, 10000] : [50, 100, 500, 1000, 5000]}
              />

              <View ref={dateInputRef} style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  開催日
                </Text>
                <Pressable
                  onPress={() => {
                    if (eventDateStr === "9999-12-31") {
                      setEventDateStr("");
                    } else {
                      setEventDateStr("9999-12-31");
                    }
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: eventDateStr === "9999-12-31" ? color.accentPrimary : color.textDisabled,
                      backgroundColor: eventDateStr === "9999-12-31" ? color.accentPrimary : "transparent",
                      marginRight: 8,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {eventDateStr === "9999-12-31" && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.textWhite }} />
                    )}
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 14 }}>
                    まだ決まっていない
                  </Text>
                </Pressable>
                {eventDateStr === "9999-12-31" ? (
                  <Text style={{ color: color.textSecondary, fontSize: 12 }}>
                    ※ 日程が決まり次第、後から編集できます
                  </Text>
                ) : (
                  <View style={{ borderWidth: !eventDateStr.trim() && showValidationError ? 1 : 0, borderColor: color.accentPrimary, borderRadius: 8 }}>
                    <DatePicker
                      value={eventDateStr}
                      onChange={handleDateChange}
                      placeholder="日付を選択"
                    />
                  </View>
                )}
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  開催場所（任意）
                </Text>
                <Pressable
                  onPress={() => setVenue("まだ決まっていない")}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: venue === "まだ決まっていない" ? color.accentPrimary : color.textDisabled,
                      backgroundColor: venue === "まだ決まっていない" ? color.accentPrimary : "transparent",
                      marginRight: 8,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {venue === "まだ決まっていない" && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.textWhite }} />
                    )}
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 14 }}>
                    まだ決まっていない
                  </Text>
                </Pressable>
                {venue !== "まだ決まっていない" && (
                  <TextInput
                    value={venue}
                    onChangeText={setVenue}
                    placeholder="例: 渋谷○○ホール / YouTube / ミクチャ"
                    placeholderTextColor={color.textSecondary}
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      padding: 12,
                      color: colors.foreground,
                      borderWidth: 1,
                      borderColor: color.border,
                    }}
                  />
                )}
                {venue === "まだ決まっていない" && (
                  <Text style={{ color: color.textSecondary, fontSize: 12, marginTop: 4 }}>
                    ※ 決まり次第、後から編集できます
                  </Text>
                )}
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  外部URL（任意）
                </Text>
                <TextInput
                  value={externalUrl}
                  onChangeText={setExternalUrl}
                  placeholder="YouTubeプレミア公開URL等"
                  placeholderTextColor={color.textSecondary}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: color.border,
                  }}
                />
              </View>

              {/* チケット情報セクション */}
              {goalType === "attendance" && (
                <TicketInfoSection
                  ticketPresale={ticketPresale}
                  ticketDoor={ticketDoor}
                  ticketUrl={ticketUrl}
                  onTicketPresaleChange={setTicketPresale}
                  onTicketDoorChange={setTicketDoor}
                  onTicketUrlChange={setTicketUrl}
                />
              )}

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
                  チャレンジ説明（任意）
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="チャレンジの詳細を書いてね"
                  placeholderTextColor={color.textSecondary}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: color.border,
                    minHeight: 100,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              {/* テンプレート保存オプション */}
              {user && (
                <TemplateSaveSection
                  saveAsTemplate={saveAsTemplate}
                  templateName={templateName}
                  templateIsPublic={templateIsPublic}
                  onSaveAsTemplateChange={setSaveAsTemplate}
                  onTemplateNameChange={setTemplateName}
                  onTemplateIsPublicChange={setTemplateIsPublic}
                />
              )}

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
                  colors={createChallengeMutation.isPending ? [color.textHint, color.textHint] : [color.accentPrimary, color.accentAlt]}
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
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                  {createChallengeMutation.isPending ? "作成中..." : "チャレンジを作成"}
                </Text>
              </TouchableOpacity>

              {/* テンプレート一覧へのリンク */}
              <TouchableOpacity
                onPress={() => router.push("/templates" as never)}
                style={{
                  marginTop: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: color.accentAlt, fontSize: 14 }}>
                  📁 テンプレートから作成
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
