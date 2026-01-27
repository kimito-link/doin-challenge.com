import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { color } from "@/theme/tokens";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";

/**
 * テスト通知送信画面
 * 開発者が通知の動作を確認するための画面
 */
export default function TestNotificationsScreen() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<number>(1);
  const [sending, setSending] = useState(false);

  const sendTestNotification = trpc.notifications.sendTestNotification.useMutation();

  const handleSendTest = async (type: "goal" | "milestone" | "participant") => {
    if (sending) return;

    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await sendTestNotification.mutateAsync({
        challengeId: selectedChallengeId,
        type,
      });

      Alert.alert(
        "送信完了",
        `${result.sentCount}人のユーザーに通知を送信しました。`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Failed to send test notification:", error);
      Alert.alert(
        "送信失敗",
        "通知の送信に失敗しました。",
        [{ text: "OK" }]
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>テスト通知送信</Text>
          <Text style={styles.headerDescription}>
            通知の動作を確認するためのテスト送信画面です
          </Text>
        </View>

        {/* チャレンジID選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>チャレンジID</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>現在: {selectedChallengeId}</Text>
            <Text style={styles.inputHint}>
              ※ 実装時に選択UIを追加してください
            </Text>
          </View>
        </View>

        {/* 通知タイプ選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知タイプ</Text>

          <Pressable
            onPress={() => handleSendTest("goal")}
            disabled={sending}
            style={({ pressed }) => [
              styles.testButton,
              { backgroundColor: color.warning },
              pressed && styles.buttonPressed,
              sending && styles.buttonDisabled,
            ]}
          >
            <MaterialIcons name="emoji-events" size={24} color={color.textWhite} />
            <View style={styles.buttonText}>
              <Text style={styles.buttonTitle}>目標達成</Text>
              <Text style={styles.buttonDescription}>
                「🏆 目標達成！」の通知を送信
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleSendTest("milestone")}
            disabled={sending}
            style={({ pressed }) => [
              styles.testButton,
              { backgroundColor: color.successDark },
              pressed && styles.buttonPressed,
              sending && styles.buttonDisabled,
            ]}
          >
            <MaterialIcons name="flag" size={24} color={color.textWhite} />
            <View style={styles.buttonText}>
              <Text style={styles.buttonTitle}>マイルストーン</Text>
              <Text style={styles.buttonDescription}>
                「🚩 マイルストーン達成！」の通知を送信
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleSendTest("participant")}
            disabled={sending}
            style={({ pressed }) => [
              styles.testButton,
              { backgroundColor: color.info },
              pressed && styles.buttonPressed,
              sending && styles.buttonDisabled,
            ]}
          >
            <MaterialIcons name="person-add" size={24} color={color.textWhite} />
            <View style={styles.buttonText}>
              <Text style={styles.buttonTitle}>新規参加者</Text>
              <Text style={styles.buttonDescription}>
                「🎉 新しい参加者！」の通知を送信
              </Text>
            </View>
          </Pressable>
        </View>

        {/* 注意事項 */}
        <View style={styles.notice}>
          <MaterialIcons name="info" size={20} color={color.warning} />
          <Text style={styles.noticeText}>
            通知は、該当するチャレンジで通知設定を有効にしているユーザーにのみ送信されます。
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.surfaceDark,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: color.textWhite,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: color.textMuted,
    lineHeight: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: color.textMuted,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: color.surface,
    padding: 16,
    borderRadius: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: color.textWhite,
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    color: color.textSubtle,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    marginLeft: 12,
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: color.textWhite,
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: color.warning,
    lineHeight: 18,
  },
});
