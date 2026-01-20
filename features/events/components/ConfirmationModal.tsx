import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import type { Companion } from "./ParticipationForm";

export type ConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  
  // ユーザー情報
  user: {
    name?: string;
    username?: string;
    profileImage?: string;
    followersCount?: number;
  } | null;
  
  // フォームデータ
  prefecture: string;
  companions: Companion[];
  message: string;
};

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  isSubmitting,
  user,
  prefecture,
  companions,
  message,
}: ConfirmationModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: color.surface }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            参加表明の確認
          </Text>
          <Text style={styles.subtitle}>
            以下の内容で参加表明します
          </Text>

          {/* 参加者情報 */}
          <View style={styles.userCard}>
            <Text style={styles.cardLabel}>参加者</Text>
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
          </View>

          {/* 都道府県 */}
          {prefecture && (
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Text style={styles.cardLabel}>都道府県</Text>
              <Text style={[styles.cardValue, { color: colors.foreground }]}>{prefecture}</Text>
            </View>
          )}

          {/* 友人 */}
          {companions.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Text style={styles.cardLabel}>一緒に参加する友人（{companions.length}人）</Text>
              <View style={styles.companionList}>
                {companions.map((c) => (
                  <View key={c.id} style={styles.companionItem}>
                    {c.profileImage ? (
                      <Image source={{ uri: c.profileImage }} style={styles.companionAvatar} />
                    ) : (
                      <View style={[styles.companionAvatarPlaceholder, { backgroundColor: color.accentAlt }]}>
                        <Text style={[styles.companionAvatarText, { color: colors.foreground }]}>
                          {c.displayName.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.companionName, { color: colors.foreground }]}>{c.displayName}</Text>
                    {c.twitterUsername && (
                      <Text style={styles.companionHandle}>@{c.twitterUsername}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 応援メッセージ */}
          {message && (
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Text style={styles.cardLabel}>応援メッセージ</Text>
              <Text style={[styles.messageText, { color: colors.foreground }]}>{message}</Text>
            </View>
          )}

          {/* 貢献度 */}
          <View style={[styles.contributionCard, { backgroundColor: colors.background }]}>
            <Text style={styles.contributionLabel}>あなたの貢献</Text>
            <View style={styles.contributionValue}>
              <Text style={styles.contributionNumber}>{1 + companions.length}</Text>
              <Text style={styles.contributionUnit}>人</Text>
            </View>
          </View>

          {/* ボタン */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>戻る</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isSubmitting}
              style={styles.confirmButton}
            >
              <LinearGradient
                colors={[color.accentPrimary, color.accentAlt]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.confirmButtonGradient, isSubmitting && styles.confirmButtonDisabled]}
              >
                <Text style={[styles.confirmButtonText, { color: colors.foreground }]}>
                  {isSubmitting ? "送信中..." : "参加表明する"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: color.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: color.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: color.bg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  cardLabel: {
    color: color.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  infoCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  cardValue: {
    fontSize: 16,
  },
  companionList: {
    gap: 8,
  },
  companionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  companionAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  companionAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  companionAvatarText: {
    fontSize: 10,
  },
  companionName: {
    fontSize: 14,
  },
  companionHandle: {
    color: color.textSecondary,
    fontSize: 12,
  },
  messageText: {
    fontSize: 14,
  },
  contributionCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: color.border,
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
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: color.border,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmButtonGradient: {
    padding: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
