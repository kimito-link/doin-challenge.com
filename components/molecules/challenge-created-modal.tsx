/**
 * チャレンジ作成完了モーダル
 * 
 * GPTの提案に基づく「判断材料になる状態」のための主催者向けチェックリスト＋告知文コピー機能
 * - 作成完了を祝う演出
 * - 次にやるべきことのチェックリスト
 * - 告知文テンプレートのワンタップコピー
 */

import { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { navigate } from "@/lib/navigation";

interface ChallengeCreatedModalProps {
  visible: boolean;
  onClose: () => void;
  challengeId: number;
  challengeTitle: string;
  eventDate: string;
  venue?: string;
  goalValue?: number;
  goalUnit?: string;
  hostName: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  action?: () => void;
  actionLabel?: string;
}

export function ChallengeCreatedModal({
  visible,
  onClose,
  challengeId,
  challengeTitle,
  eventDate,
  venue,
  goalValue,
  goalUnit = "人",
  hostName,
}: ChallengeCreatedModalProps) {
  const colors = useColors();
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}(${weekday})`;
  };

  // 告知文テンプレート生成
  const generateAnnouncementText = (type: "twitter" | "instagram" | "line") => {
    const dateStr = formatDate(eventDate);
    const venueStr = venue ? `📍${venue}` : "";
    const goalStr = goalValue ? `目標${goalValue}${goalUnit}` : "";
    const url = `https://doin-challenge.com/event/${challengeId}`;

    switch (type) {
      case "twitter":
        return `【参加者募集中🎉】

${challengeTitle}
${dateStr} ${venueStr}

${goalStr ? `${goalStr}達成を目指しています！` : "みんなの参加を待ってます！"}

参加表明はこちらから👇
${url}

#動員チャレンジ #${hostName}`;

      case "instagram":
        return `【参加者募集中🎉】

${challengeTitle}
${dateStr} ${venueStr}

${goalStr ? `${goalStr}達成を目指しています！` : "みんなの参加を待ってます！"}

プロフィールのリンクから参加表明できます✨

#動員チャレンジ #${hostName.replace(/\s/g, "")}`;

      case "line":
        return `【参加者募集中】

${challengeTitle}
${dateStr} ${venueStr}

${goalStr ? `${goalStr}達成を目指してます！` : "みんなの参加待ってます！"}

参加表明はこちら↓
${url}`;
    }
  };

  // コピー処理
  const handleCopy = async (type: "twitter" | "instagram" | "line") => {
    const text = generateAnnouncementText(type);
    await Clipboard.setStringAsync(text);
    setCopiedTemplate(type);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  // チェックリストアイテム
  const checklistItems: ChecklistItem[] = [
    {
      id: "share_twitter",
      label: "Twitterで告知",
      description: "フォロワーに参加を呼びかけよう",
      icon: "twitter",
      action: () => handleCopy("twitter"),
      actionLabel: "告知文をコピー",
    },
    {
      id: "share_instagram",
      label: "Instagramで告知",
      description: "ストーリーズやフィードで拡散",
      icon: "instagram",
      action: () => handleCopy("instagram"),
      actionLabel: "告知文をコピー",
    },
    {
      id: "share_line",
      label: "LINEで告知",
      description: "グループやオープンチャットで共有",
      icon: "line",
      action: () => handleCopy("line"),
      actionLabel: "告知文をコピー",
    },
    {
      id: "check_dashboard",
      label: "参加状況を確認",
      description: "参加者数をリアルタイムでチェック",
      icon: "chart-simple",
      action: () => {
        onClose();
        navigate.toDashboard(challengeId);
      },
      actionLabel: "確認する",
    },
  ];

  // チェック切り替え
  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // 詳細ページへ移動
  const handleGoToDetail = () => {
    onClose();
    navigate.toEventDetail(challengeId);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.8)" }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + "20" }]}>
              <FontAwesome6 name="check" size={32} color={colors.success} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              チャレンジを作成しました！
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              次のステップで参加者を集めましょう
            </Text>
          </View>

          {/* チャレンジ情報 */}
          <View style={[styles.challengeInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.challengeTitle, { color: colors.foreground }]} numberOfLines={2}>
              {challengeTitle}
            </Text>
            <View style={styles.challengeMeta}>
              <View style={styles.metaItem}>
                <FontAwesome6 name="calendar" size={12} color={colors.muted} />
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  {formatDate(eventDate)}
                </Text>
              </View>
              {venue && (
                <View style={styles.metaItem}>
                  <FontAwesome6 name="location-dot" size={12} color={colors.muted} />
                  <Text style={[styles.metaText, { color: colors.muted }]} numberOfLines={1}>
                    {venue}
                  </Text>
                </View>
              )}
              {goalValue && (
                <View style={styles.metaItem}>
                  <FontAwesome6 name="bullseye" size={12} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    目標{goalValue}{goalUnit}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* チェックリスト */}
          <ScrollView style={styles.checklist} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              📋 やることリスト
            </Text>
            {checklistItems.map((item) => (
              <View
                key={item.id}
                style={[styles.checklistItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Pressable
                  style={styles.checkboxArea}
                  onPress={() => toggleCheck(item.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: checkedItems.has(item.id) ? colors.success : colors.border },
                      checkedItems.has(item.id) && { backgroundColor: colors.success },
                    ]}
                  >
                    {checkedItems.has(item.id) && (
                      <FontAwesome6 name="check" size={10} color="#fff" />
                    )}
                  </View>
                  <View style={styles.checklistContent}>
                    <View style={styles.checklistLabelRow}>
                      <FontAwesome6
                        name={item.icon as any}
                        size={14}
                        color={checkedItems.has(item.id) ? colors.muted : colors.primary}
                        style={styles.checklistIcon}
                      />
                      <Text
                        style={[
                          styles.checklistLabel,
                          { color: colors.foreground },
                          checkedItems.has(item.id) && styles.checkedLabel,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <Text style={[styles.checklistDescription, { color: colors.muted }]}>
                      {item.description}
                    </Text>
                  </View>
                </Pressable>
                {item.action && (
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
                    onPress={item.action}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                      {copiedTemplate === item.id ? "✓ コピー完了" : item.actionLabel}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </ScrollView>

          {/* フッターボタン */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleGoToDetail}
            >
              <Text style={styles.primaryButtonText}>チャレンジページを見る</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.muted }]}>
                閉じる
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  challengeInfo: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  challengeMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  checklist: {
    paddingHorizontal: 24,
    maxHeight: 300,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  checklistItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  checkboxArea: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checklistContent: {
    flex: 1,
  },
  checklistLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  checklistIcon: {
    marginRight: 8,
  },
  checklistLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  checkedLabel: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  checklistDescription: {
    fontSize: 12,
    marginLeft: 22,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
  },
});
