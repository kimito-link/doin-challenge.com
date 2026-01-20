import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { prefectures } from "@/constants/prefectures";

export type Companion = {
  id: string;
  displayName: string;
  twitterUsername: string;
  twitterId?: string;
  profileImage?: string;
};

export type LookedUpProfile = {
  id: string;
  name: string;
  username: string;
  profileImage: string;
};

export type ParticipationFormProps = {
  // ユーザー情報
  user: {
    name?: string;
    username?: string;
    profileImage?: string;
    followersCount?: number;
  } | null;
  isLoggedIn: boolean;
  onLogin: () => void;
  
  // フォーム状態
  message: string;
  onMessageChange: (text: string) => void;
  prefecture: string;
  onPrefectureChange: (pref: string) => void;
  gender: "male" | "female" | "";
  onGenderChange: (gender: "male" | "female" | "") => void;
  allowVideoUse: boolean;
  onAllowVideoUseChange: (allow: boolean) => void;
  
  // 都道府県選択
  showPrefectureList: boolean;
  onTogglePrefectureList: () => void;
  
  // 友人追加
  companions: Companion[];
  showAddCompanionForm: boolean;
  onToggleAddCompanionForm: () => void;
  newCompanionName: string;
  onNewCompanionNameChange: (name: string) => void;
  newCompanionTwitter: string;
  onNewCompanionTwitterChange: (twitter: string) => void;
  isLookingUpTwitter: boolean;
  lookupError: string | null;
  lookedUpProfile: LookedUpProfile | null;
  onLookupTwitterProfile: (username: string) => void;
  onAddCompanion: () => void;
  onRemoveCompanion: (id: string) => void;
  onCancelAddCompanion: () => void;
  
  // 送信
  onSubmit: () => void;
  isSubmitting: boolean;
  
  // 編集モード
  isEditMode?: boolean;
  hasExistingParticipation?: boolean;
};

export function ParticipationForm({
  user,
  isLoggedIn,
  onLogin,
  message,
  onMessageChange,
  prefecture,
  onPrefectureChange,
  gender,
  onGenderChange,
  allowVideoUse,
  onAllowVideoUseChange,
  showPrefectureList,
  onTogglePrefectureList,
  companions,
  showAddCompanionForm,
  onToggleAddCompanionForm,
  newCompanionName,
  onNewCompanionNameChange,
  newCompanionTwitter,
  onNewCompanionTwitterChange,
  isLookingUpTwitter,
  lookupError,
  lookedUpProfile,
  onLookupTwitterProfile,
  onAddCompanion,
  onRemoveCompanion,
  onCancelAddCompanion,
  onSubmit,
  isSubmitting,
  isEditMode = false,
  hasExistingParticipation = false,
}: ParticipationFormProps) {
  const colors = useColors();

  // ログインしていない場合
  if (!isLoggedIn) {
    return (
      <View style={styles.loginPrompt}>
        <MaterialIcons name="person-add" size={48} color={color.accentPrimary} />
        <Text style={[styles.loginPromptTitle, { color: colors.foreground }]}>
          参加表明するにはログインが必要です
        </Text>
        <TouchableOpacity onPress={onLogin} style={styles.loginButton}>
          <LinearGradient
            colors={[color.accentPrimary, color.accentAlt]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButtonGradient}
          >
            <MaterialIcons name="login" size={20} color={colors.foreground} />
            <Text style={[styles.loginButtonText, { color: colors.foreground }]}>
              Xでログイン
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // 既に参加表明済みの場合
  if (hasExistingParticipation && !isEditMode) {
    return (
      <View style={styles.alreadyParticipated}>
        <MaterialIcons name="check-circle" size={48} color={color.success} />
        <Text style={[styles.alreadyParticipatedTitle, { color: colors.foreground }]}>
          参加表明済みです
        </Text>
        <Text style={styles.alreadyParticipatedSubtitle}>
          上のメッセージ一覧であなたの投稿を確認できます
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="edit" size={20} color={color.accentPrimary} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isEditMode ? "参加表明を編集" : "参加表明する"}
        </Text>
      </View>

      {/* ユーザー情報表示 */}
      <View style={styles.userInfo}>
        {user?.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            style={styles.userAvatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.userAvatarPlaceholder, { backgroundColor: color.accentPrimary }]}>
            <Text style={[styles.userAvatarText, { color: colors.foreground }]}>
              {(user?.name || user?.username || "ゲ")?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name || user?.username || "ゲスト"}
          </Text>
          {user?.username && (
            <Text style={styles.userHandle}>@{user.username}</Text>
          )}
          {user?.followersCount !== undefined && user.followersCount > 0 && (
            <Text style={styles.userFollowers}>
              {user.followersCount.toLocaleString()} フォロワー
            </Text>
          )}
        </View>
      </View>

      {/* 応援メッセージ入力 */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>
          応援メッセージ
        </Text>
        <TextInput
          value={message}
          onChangeText={onMessageChange}
          placeholder="推しへの熱い思いを書いてね！"
          placeholderTextColor={color.textHint}
          multiline
          numberOfLines={4}
          style={[styles.messageInput, { color: colors.foreground }]}
        />
      </View>

      {/* 都道府県選択 */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>
          都道府県
        </Text>
        <TouchableOpacity
          onPress={onTogglePrefectureList}
          style={styles.selectButton}
        >
          <Text style={{ color: prefecture ? colors.foreground : color.textHint }}>
            {prefecture || "選択してください"}
          </Text>
          <MaterialIcons
            name={showPrefectureList ? "expand-less" : "expand-more"}
            size={24}
            color={color.textSecondary}
          />
        </TouchableOpacity>
        
        {showPrefectureList && (
          <View style={styles.prefectureList}>
            <ScrollView style={styles.prefectureScroll} nestedScrollEnabled>
              <View style={styles.prefectureGrid}>
                {prefectures.map((pref) => (
                  <TouchableOpacity
                    key={pref}
                    onPress={() => {
                      onPrefectureChange(pref);
                      onTogglePrefectureList();
                    }}
                    style={[
                      styles.prefectureItem,
                      prefecture === pref && styles.prefectureItemActive,
                    ]}
                  >
                    <Text style={[
                      styles.prefectureItemText,
                      { color: prefecture === pref ? color.textWhite : colors.foreground }
                    ]}>
                      {pref}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* 性別選択 */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>
          性別（任意）
        </Text>
        <View style={styles.genderButtons}>
          <TouchableOpacity
            onPress={() => onGenderChange("male")}
            style={[
              styles.genderButton,
              gender === "male" && { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
            ]}
          >
            <Text style={[
              styles.genderButtonText,
              { color: gender === "male" ? color.textWhite : color.textSecondary }
            ]}>
              男性
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onGenderChange("female")}
            style={[
              styles.genderButton,
              gender === "female" && { backgroundColor: "#EC4899", borderColor: "#EC4899" },
            ]}
          >
            <Text style={[
              styles.genderButtonText,
              { color: gender === "female" ? color.textWhite : color.textSecondary }
            ]}>
              女性
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onGenderChange("")}
            style={[
              styles.genderButton,
              gender === "" && { backgroundColor: color.textHint, borderColor: color.textHint },
            ]}
          >
            <Text style={[
              styles.genderButtonText,
              { color: gender === "" ? color.textWhite : color.textSecondary }
            ]}>
              未設定
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 友人追加セクション */}
      <View style={styles.inputSection}>
        <View style={styles.companionHeader}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>
            一緒に参加する友人（{companions.length}人）
          </Text>
          <TouchableOpacity
            onPress={onToggleAddCompanionForm}
            style={styles.addCompanionButton}
          >
            <MaterialIcons name="person-add" size={20} color={color.accentPrimary} />
            <Text style={styles.addCompanionButtonText}>追加</Text>
          </TouchableOpacity>
        </View>

        {/* 友人追加フォーム */}
        {showAddCompanionForm && (
          <View style={styles.addCompanionForm}>
            <Text style={[styles.addCompanionLabel, { color: colors.foreground }]}>
              X（Twitter）ユーザー名で検索
            </Text>
            <View style={styles.twitterSearchRow}>
              <TextInput
                value={newCompanionTwitter}
                onChangeText={onNewCompanionTwitterChange}
                placeholder="@username"
                placeholderTextColor={color.textHint}
                style={[
                  styles.twitterSearchInput,
                  { color: colors.foreground },
                  lookedUpProfile && styles.twitterSearchInputSuccess,
                ]}
              />
              <TouchableOpacity
                onPress={() => onLookupTwitterProfile(newCompanionTwitter)}
                disabled={isLookingUpTwitter || !newCompanionTwitter.trim()}
                style={[
                  styles.twitterSearchButton,
                  { backgroundColor: isLookingUpTwitter ? color.border : color.twitter },
                  !newCompanionTwitter.trim() && styles.twitterSearchButtonDisabled,
                ]}
              >
                <Text style={[styles.twitterSearchButtonText, { color: colors.foreground }]}>
                  {isLookingUpTwitter ? "検索中..." : "検索"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* エラー表示 */}
            {lookupError && (
              <View style={styles.lookupError}>
                <MaterialIcons name="error-outline" size={20} color={color.danger} />
                <Text style={styles.lookupErrorText}>{lookupError}</Text>
              </View>
            )}

            {/* 取得したプロフィール表示 */}
            {lookedUpProfile && (
              <View style={styles.lookedUpProfile}>
                <Image
                  source={{ uri: lookedUpProfile.profileImage }}
                  style={styles.lookedUpProfileImage}
                />
                <View style={styles.lookedUpProfileInfo}>
                  <Text style={[styles.lookedUpProfileName, { color: colors.foreground }]}>
                    {lookedUpProfile.name}
                  </Text>
                  <Text style={styles.lookedUpProfileUsername}>
                    @{lookedUpProfile.username}
                  </Text>
                </View>
                <MaterialIcons name="check-circle" size={24} color={color.success} />
              </View>
            )}

            {/* 名前入力（Twitterがない場合のみ） */}
            {!lookedUpProfile && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>または名前で追加</Text>
                  <View style={styles.dividerLine} />
                </View>
                <Text style={[styles.addCompanionLabel, { color: colors.foreground }]}>
                  友人の名前
                </Text>
                <TextInput
                  value={newCompanionName}
                  onChangeText={onNewCompanionNameChange}
                  placeholder="ニックネーム"
                  placeholderTextColor={color.textHint}
                  style={[styles.nameInput, { color: colors.foreground }]}
                />
              </>
            )}

            <View style={styles.addCompanionActions}>
              <TouchableOpacity
                onPress={onCancelAddCompanion}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onAddCompanion}
                disabled={!lookedUpProfile && !newCompanionName.trim()}
                style={[
                  styles.confirmAddButton,
                  (!lookedUpProfile && !newCompanionName.trim()) && styles.confirmAddButtonDisabled,
                ]}
              >
                <Text style={[styles.confirmAddButtonText, { color: colors.foreground }]}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 登録済み友人リスト */}
        {companions.length > 0 && (
          <View style={styles.companionList}>
            {companions.map((companion) => (
              <View key={companion.id} style={[
                styles.companionItem,
                { backgroundColor: colors.background },
                companion.profileImage && styles.companionItemWithTwitter,
              ]}>
                {companion.profileImage ? (
                  <Image
                    source={{ uri: companion.profileImage }}
                    style={styles.companionAvatar}
                  />
                ) : (
                  <View style={[styles.companionAvatarPlaceholder, { backgroundColor: color.accentPrimary }]}>
                    <Text style={[styles.companionAvatarText, { color: colors.foreground }]}>
                      {companion.displayName.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.companionInfo}>
                  <Text style={[styles.companionName, { color: colors.foreground }]}>
                    {companion.displayName}
                  </Text>
                  {companion.twitterUsername && (
                    <Text style={styles.companionHandle}>@{companion.twitterUsername}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => onRemoveCompanion(companion.id)}
                  style={styles.removeCompanionButton}
                >
                  <MaterialIcons name="close" size={20} color={color.textHint} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 貢献度表示 */}
        <View style={[styles.contributionDisplay, { backgroundColor: colors.background }]}>
          <Text style={styles.contributionLabel}>あなたの貢献</Text>
          <View style={styles.contributionValue}>
            <Text style={styles.contributionNumber}>{1 + companions.length}</Text>
            <Text style={styles.contributionUnit}>人</Text>
          </View>
        </View>
      </View>

      {/* 動画使用許可 */}
      <TouchableOpacity
        onPress={() => onAllowVideoUseChange(!allowVideoUse)}
        style={styles.videoPermission}
      >
        <MaterialIcons
          name={allowVideoUse ? "check-box" : "check-box-outline-blank"}
          size={24}
          color={allowVideoUse ? color.accentPrimary : color.textSecondary}
        />
        <Text style={[styles.videoPermissionText, { color: colors.foreground }]}>
          応援動画への使用を許可する
        </Text>
      </TouchableOpacity>

      {/* 送信ボタン */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitting}
        style={styles.submitButton}
      >
        <LinearGradient
          colors={[color.accentPrimary, color.accentAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.submitButtonGradient, isSubmitting && styles.submitButtonDisabled]}
        >
          <MaterialIcons name="send" size={20} color={colors.foreground} />
          <Text style={[styles.submitButtonText, { color: colors.foreground }]}>
            {isSubmitting ? "送信中..." : isEditMode ? "更新する" : "参加表明する"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loginPrompt: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 32,
    marginTop: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  loginPromptTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  alreadyParticipated: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 32,
    marginTop: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.success,
  },
  alreadyParticipatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  alreadyParticipatedSubtitle: {
    color: color.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    padding: 12,
    backgroundColor: color.bg,
    borderRadius: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userHandle: {
    color: color.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  userFollowers: {
    color: color.accentPrimary,
    fontSize: 12,
    marginTop: 4,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: color.bg,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: color.border,
  },
  selectButton: {
    backgroundColor: color.bg,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  prefectureList: {
    backgroundColor: color.bg,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: color.border,
    maxHeight: 200,
  },
  prefectureScroll: {
    padding: 12,
  },
  prefectureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  prefectureItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: color.surface,
  },
  prefectureItemActive: {
    backgroundColor: color.accentPrimary,
  },
  prefectureItemText: {
    fontSize: 13,
  },
  genderButtons: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.bg,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  companionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addCompanionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addCompanionButtonText: {
    color: color.accentPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  addCompanionForm: {
    backgroundColor: color.bg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  addCompanionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  twitterSearchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  twitterSearchInput: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  twitterSearchInputSuccess: {
    borderColor: color.success,
  },
  twitterSearchButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  twitterSearchButtonDisabled: {
    opacity: 0.5,
  },
  twitterSearchButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  lookupError: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  lookupErrorText: {
    color: color.danger,
    fontSize: 14,
    marginLeft: 8,
  },
  lookedUpProfile: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.success,
  },
  lookedUpProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  lookedUpProfileInfo: {
    flex: 1,
  },
  lookedUpProfileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lookedUpProfileUsername: {
    color: color.twitter,
    fontSize: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: color.border,
  },
  dividerText: {
    color: color.textHint,
    fontSize: 12,
    marginHorizontal: 12,
  },
  nameInput: {
    backgroundColor: color.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 12,
  },
  addCompanionActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: color.border,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: color.textSecondary,
  },
  confirmAddButton: {
    flex: 1,
    backgroundColor: color.accentPrimary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  confirmAddButtonDisabled: {
    backgroundColor: color.border,
  },
  confirmAddButtonText: {
    fontWeight: "bold",
  },
  companionList: {
    gap: 8,
  },
  companionItem: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  companionItemWithTwitter: {
    borderColor: color.twitter,
  },
  companionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  companionAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  companionAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  companionInfo: {
    flex: 1,
  },
  companionName: {
    fontSize: 14,
    fontWeight: "600",
  },
  companionHandle: {
    color: color.textSecondary,
    fontSize: 12,
  },
  removeCompanionButton: {
    padding: 8,
  },
  contributionDisplay: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contributionLabel: {
    color: color.textSecondary,
    fontSize: 14,
  },
  contributionValue: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  contributionNumber: {
    color: color.accentPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  contributionUnit: {
    color: color.textSecondary,
    fontSize: 14,
    marginLeft: 4,
  },
  videoPermission: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  videoPermissionText: {
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
