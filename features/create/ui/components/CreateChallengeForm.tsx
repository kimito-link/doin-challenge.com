// features/create/ui/components/CreateChallengeForm.tsx
// v6.18: チャレンジ作成フォームコンポーネント
import { View, Text, TextInput, TouchableOpacity, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { DatePicker } from "@/components/molecules/date-picker";
import { NumberStepper } from "@/components/molecules/number-stepper";
import { TwitterUserCard } from "@/components/molecules/twitter-user-card";
import { InlineValidationError } from "@/components/molecules/inline-validation-error";
import {
  EventTypeSelector,
  GoalTypeSelector,
  CategorySelector,
  GenreSelector,
  PurposeSelector,
  TicketInfoSection,
  TemplateSaveSection,
} from "./index";
import type { CreateChallengeState, ValidationError } from "../../hooks/use-create-challenge";

type Props = {
  state: CreateChallengeState;
  updateField: <K extends keyof CreateChallengeState>(field: K, value: CreateChallengeState[K]) => void;
  handleGoalTypeChange: (id: string, unit: string) => void;
  handleCreate: () => void;
  validationErrors: ValidationError[];
  isPending: boolean;
  categoriesData?: Array<{ id: number; name: string; emoji?: string | null }>;
  isDesktop: boolean;
  titleInputRef: React.RefObject<View | null>;
  dateInputRef: React.RefObject<View | null>;
};

export function CreateChallengeForm({
  state,
  updateField,
  handleGoalTypeChange,
  handleCreate,
  validationErrors,
  isPending,
  categoriesData,
  isDesktop,
  titleInputRef,
  dateInputRef,
}: Props) {
  const router = useRouter();
  const colors = useColors();
  const { user, login } = useAuth();

  return (
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
          value={state.eventType}
          onChange={(v) => updateField("eventType", v)}
        />

        {/* カテゴリ選択 */}
        <CategorySelector
          categoryId={state.categoryId}
          categories={categoriesData}
          showList={state.showCategoryList}
          onToggleList={() => updateField("showCategoryList", !state.showCategoryList)}
          onSelect={(id) => {
            updateField("categoryId", id);
            updateField("showCategoryList", false);
          }}
        />

        {/* ジャンル選択 */}
        <GenreSelector
          selectedGenre={state.genre}
          onSelect={(v) => updateField("genre", v)}
        />

        {/* 目的選択 */}
        <PurposeSelector
          selectedPurpose={state.purpose}
          onSelect={(v) => updateField("purpose", v)}
        />

        {/* チャレンジ名 */}
        <View ref={titleInputRef} style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
            チャレンジ名 *
          </Text>
          <TextInput
            value={state.title}
            onChangeText={(v) => updateField("title", v)}
            placeholder="例: ○○ワンマンライブ動員チャレンジ"
            placeholderTextColor={color.textSecondary}
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: !state.title.trim() && state.showValidationError ? color.accentPrimary : color.border,
            }}
          />
          <InlineValidationError
            message="チャレンジ名を入れてね！"
            visible={state.showValidationError && !state.title.trim()}
            character="rinku"
          />
        </View>

        {/* 目標タイプ選択 */}
        <GoalTypeSelector
          goalType={state.goalType}
          goalUnit={state.goalUnit}
          onGoalTypeChange={handleGoalTypeChange}
          onGoalUnitChange={(v) => updateField("goalUnit", v)}
        />

        {/* 目標数値 */}
        <NumberStepper
          value={state.goalValue}
          onChange={(v) => updateField("goalValue", v)}
          min={1}
          max={100000}
          step={10}
          unit={state.goalUnit || "人"}
          label="目標数値 *"
          presets={state.goalType === "attendance" ? [50, 100, 200, 500, 1000] : state.goalType === "viewers" ? [100, 500, 1000, 5000, 10000] : [50, 100, 500, 1000, 5000]}
        />

        {/* 開催日 */}
        <View ref={dateInputRef} style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
            開催日
          </Text>
          <Pressable
            onPress={() => {
              if (state.eventDateStr === "9999-12-31") {
                updateField("eventDateStr", "");
              } else {
                updateField("eventDateStr", "9999-12-31");
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
                borderColor: state.eventDateStr === "9999-12-31" ? color.accentPrimary : color.textDisabled,
                backgroundColor: state.eventDateStr === "9999-12-31" ? color.accentPrimary : "transparent",
                marginRight: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {state.eventDateStr === "9999-12-31" && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.textWhite }} />
              )}
            </View>
            <Text style={{ color: colors.muted, fontSize: 14 }}>
              まだ決まっていない
            </Text>
          </Pressable>
          {state.eventDateStr === "9999-12-31" ? (
            <Text style={{ color: color.textSecondary, fontSize: 12 }}>
              ※ 日程が決まり次第、後から編集できます
            </Text>
          ) : (
            <View style={{ borderWidth: !state.eventDateStr.trim() && state.showValidationError ? 1 : 0, borderColor: color.accentPrimary, borderRadius: 8 }}>
              <DatePicker
                value={state.eventDateStr}
                onChange={(v) => updateField("eventDateStr", v)}
                placeholder="日付を選択"
              />
            </View>
          )}
        </View>

        {/* 開催場所 */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
            開催場所（任意）
          </Text>
          <Pressable
            onPress={() => updateField("venue", "まだ決まっていない")}
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
                borderColor: state.venue === "まだ決まっていない" ? color.accentPrimary : color.textDisabled,
                backgroundColor: state.venue === "まだ決まっていない" ? color.accentPrimary : "transparent",
                marginRight: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {state.venue === "まだ決まっていない" && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.textWhite }} />
              )}
            </View>
            <Text style={{ color: colors.muted, fontSize: 14 }}>
              まだ決まっていない
            </Text>
          </Pressable>
          {state.venue !== "まだ決まっていない" && (
            <TextInput
              value={state.venue}
              onChangeText={(v) => updateField("venue", v)}
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
          {state.venue === "まだ決まっていない" && (
            <Text style={{ color: color.textSecondary, fontSize: 12, marginTop: 4 }}>
              ※ 決まり次第、後から編集できます
            </Text>
          )}
        </View>

        {/* 外部URL */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
            外部URL（任意）
          </Text>
          <TextInput
            value={state.externalUrl}
            onChangeText={(v) => updateField("externalUrl", v)}
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
        {state.goalType === "attendance" && (
          <TicketInfoSection
            ticketPresale={state.ticketPresale}
            ticketDoor={state.ticketDoor}
            ticketUrl={state.ticketUrl}
            onTicketPresaleChange={(v) => updateField("ticketPresale", v)}
            onTicketDoorChange={(v) => updateField("ticketDoor", v)}
            onTicketUrlChange={(v) => updateField("ticketUrl", v)}
          />
        )}

        {/* チャレンジ説明 */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
            チャレンジ説明（任意）
          </Text>
          <TextInput
            value={state.description}
            onChangeText={(v) => updateField("description", v)}
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
            saveAsTemplate={state.saveAsTemplate}
            templateName={state.templateName}
            templateIsPublic={state.templateIsPublic}
            onSaveAsTemplateChange={(v) => updateField("saveAsTemplate", v)}
            onTemplateNameChange={(v) => updateField("templateName", v)}
            onTemplateIsPublicChange={(v) => updateField("templateIsPublic", v)}
          />
        )}

        {/* 作成ボタン */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={isPending}
          style={{
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={isPending ? [color.textHint, color.textHint] : [color.accentPrimary, color.accentAlt]}
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
            {isPending ? "作成中..." : "チャレンジを作成"}
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
  );
}
