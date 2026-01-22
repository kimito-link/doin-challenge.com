// app/(tabs)/create.tsx
// v6.60: 作成完了モーダル（チェックリスト＋告知文コピー）追加
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useFollowStatus } from "@/hooks/use-follow-status";
import { useResponsive } from "@/hooks/use-responsive";
import { useColors } from "@/hooks/use-colors";
import { FollowPromptBanner } from "@/components/molecules/follow-gate";
import { AppHeader } from "@/components/organisms/app-header";
import { useCreateChallenge, CreateChallengeForm } from "@/features/create";
import { ChallengeCreatedModal } from "@/components/molecules/challenge-created-modal";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
};

export default function CreateChallengeScreen() {
  const { isAuthenticated } = useAuth();
  const { isFollowing, targetUsername, targetDisplayName } = useFollowStatus();
  const { isDesktop } = useResponsive();
  const colors = useColors();
  
  // カテゴリ一覧を取得
  const { data: categoriesData } = trpc.categories.list.useQuery();
  
  // チャレンジ作成フック
  const {
    state,
    updateField,
    handleGoalTypeChange,
    handleCreate,
    validationErrors,
    isPending,
    closeCreatedModal,
    resetForm,
    refs,
  } = useCreateChallenge();
  
  // モーダルを閉じてフォームをリセット
  const handleCloseModal = () => {
    closeCreatedModal();
    resetForm();
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={refs.scrollViewRef}
          style={{ flex: 1, backgroundColor: colors.background }}
          showsHorizontalScrollIndicator={false}
          horizontal={false}
          directionalLockEnabled={true}
          bounces={true}
          alwaysBounceHorizontal={false}
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
          <CreateChallengeForm
            state={state}
            updateField={updateField}
            handleGoalTypeChange={handleGoalTypeChange}
            handleCreate={handleCreate}
            validationErrors={validationErrors}
            isPending={isPending}
            categoriesData={categoriesData}
            isDesktop={isDesktop}
            titleInputRef={refs.titleInputRef}
            dateInputRef={refs.dateInputRef}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* 作成完了モーダル */}
      {state.createdChallenge && (
        <ChallengeCreatedModal
          visible={state.showCreatedModal}
          onClose={handleCloseModal}
          challengeId={state.createdChallenge.id}
          challengeTitle={state.createdChallenge.title}
          eventDate={state.createdChallenge.eventDate}
          venue={state.createdChallenge.venue}
          goalValue={state.createdChallenge.goalValue}
          goalUnit={state.createdChallenge.goalUnit}
          hostName={state.createdChallenge.hostName}
        />
      )}
    </ScreenContainer>
  );
}
