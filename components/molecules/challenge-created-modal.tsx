/**
 * チャレンジ作成完了モーダル
 * 
 * v6.64: 視認性向上版
 * - 黒ベースUI統一
 * - チェックリストの視認性向上（大きなアイコン、明確な階層）
 * - 「次にやること」が一目で分かるデザイン
 * - 進捗インジケーター追加
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
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { color } from "@/theme/tokens";
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
  iconFamily: "fa6" | "material";
  priority: "high" | "medium" | "low";
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
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["日", "月", "火", "水", "木", "土"];
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

  // チェックリストアイテム（優先度順）
  const checklistItems: ChecklistItem[] = [
    {
      id: "share_twitter",
      label: "Xで告知する",
      description: "今すぐフォロワーに参加を呼びかけよう",
      icon: "twitter",
      iconFamily: "fa6",
      priority: "high",
      action: () => handleCopy("twitter"),
      actionLabel: "告知文をコピー",
    },
    {
      id: "check_dashboard",
      label: "ダッシュボードを確認",
      description: "参加状況をリアルタイムでチェック",
      icon: "chart-simple",
      iconFamily: "fa6",
      priority: "high",
      action: () => {
        onClose();
        navigate.toDashboard(challengeId);
      },
      actionLabel: "確認する",
    },
    {
      id: "share_instagram",
      label: "Instagramで告知",
      description: "ストーリーズやフィードで拡散",
      icon: "instagram",
      iconFamily: "fa6",
      priority: "medium",
      action: () => handleCopy("instagram"),
      actionLabel: "告知文をコピー",
    },
    {
      id: "share_line",
      label: "LINEで共有",
      description: "グループやオープンチャットで共有",
      icon: "line",
      iconFamily: "fa6",
      priority: "low",
      action: () => handleCopy("line"),
      actionLabel: "告知文をコピー",
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

  // 進捗計算
  const progress = checkedItems.size / checklistItems.length;
  const completedCount = checkedItems.size;
  const totalCount = checklistItems.length;

  // 詳細ページへ移動
  const handleGoToDetail = () => {
    onClose();
    navigate.toEventDetail(challengeId);
  };

  // 優先度に応じた左ボーダー色
  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return color.accentPrimary; // ピンク
      case "medium":
        return color.accentAlt; // 紫
      case "low":
        return color.textMuted;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <View style={styles.successIcon}>
              <MaterialIcons name="celebration" size={36} color={color.accentPrimary} />
            </View>
            <Text style={styles.title}>
              チャレンジを作成しました！
            </Text>
            <Text style={styles.subtitle}>
              参加者を集めるために、次のステップを実行しましょう
            </Text>
          </View>

          {/* チャレンジ情報カード */}
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle} numberOfLines={2}>
              {challengeTitle}
            </Text>
            <View style={styles.challengeMeta}>
              <View style={styles.metaItem}>
                <FontAwesome6 name="calendar" size={12} color={color.textMuted} />
                <Text style={styles.metaText}>
                  {formatDate(eventDate)}
                </Text>
              </View>
              {venue && (
                <View style={styles.metaItem}>
                  <FontAwesome6 name="location-dot" size={12} color={color.textMuted} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {venue}
                  </Text>
                </View>
              )}
              {goalValue && (
                <View style={styles.metaItem}>
                  <FontAwesome6 name="bullseye" size={12} color={color.accentPrimary} />
                  <Text style={[styles.metaText, { color: color.accentPrimary }]}>
                    目標{goalValue}{goalUnit}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 進捗インジケーター */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                次にやること
              </Text>
              <Text style={styles.progressCount}>
                {completedCount}/{totalCount} 完了
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          {/* チェックリスト */}
          <ScrollView style={styles.checklist} showsVerticalScrollIndicator={false}>
            {checklistItems.map((item, index) => {
              const isChecked = checkedItems.has(item.id);
              const priorityColor = getPriorityColor(item.priority);
              
              return (
                <View
                  key={item.id}
                  style={[
                    styles.checklistItem,
                    { borderLeftColor: priorityColor },
                    isChecked && styles.checklistItemChecked,
                  ]}
                >
                  <Pressable
                    style={styles.checkboxArea}
                    onPress={() => toggleCheck(item.id)}
                  >
                    {/* 番号/チェックマーク */}
                    <View
                      style={[
                        styles.stepNumber,
                        isChecked && styles.stepNumberChecked,
                      ]}
                    >
                      {isChecked ? (
                        <FontAwesome6 name="check" size={12} color="#fff" />
                      ) : (
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      )}
                    </View>

                    {/* コンテンツ */}
                    <View style={styles.checklistContent}>
                      <View style={styles.checklistLabelRow}>
                        <FontAwesome6
                          name={item.icon as any}
                          size={16}
                          color={isChecked ? color.textMuted : priorityColor}
                          style={styles.checklistIcon}
                        />
                        <Text
                          style={[
                            styles.checklistLabel,
                            isChecked && styles.checkedLabel,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.priority === "high" && !isChecked && (
                          <View style={styles.priorityBadge}>
                            <Text style={styles.priorityBadgeText}>重要</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.checklistDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </Pressable>

                  {/* アクションボタン */}
                  {item.action && !isChecked && (
                    <Pressable
                      style={[styles.actionButton, { borderColor: priorityColor }]}
                      onPress={() => {
                        item.action?.();
                        toggleCheck(item.id);
                      }}
                    >
                      <Text style={[styles.actionButtonText, { color: priorityColor }]}>
                        {copiedTemplate === item.id ? "✓ コピー完了" : item.actionLabel}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* フッターボタン */}
          <View style={styles.footer}>
            <Pressable
              style={styles.primaryButton}
              onPress={handleGoToDetail}
            >
              <Text style={styles.primaryButtonText}>チャレンジページを見る</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>
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
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  container: {
    backgroundColor: color.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: "92%",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${color.accentPrimary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: color.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  challengeInfo: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 20,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: color.textPrimary,
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
    color: color.textMuted,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: color.textPrimary,
  },
  progressCount: {
    fontSize: 14,
    color: color.accentPrimary,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: color.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: color.accentPrimary,
    borderRadius: 3,
  },
  checklist: {
    paddingHorizontal: 24,
    maxHeight: 280,
  },
  checklistItem: {
    backgroundColor: color.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
    borderLeftWidth: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  checklistItemChecked: {
    opacity: 0.6,
    borderLeftColor: color.success,
  },
  checkboxArea: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberChecked: {
    backgroundColor: color.success,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: color.textPrimary,
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
    width: 20,
  },
  checklistLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: color.textPrimary,
    flex: 1,
  },
  checkedLabel: {
    textDecorationLine: "line-through",
    color: color.textMuted,
  },
  priorityBadge: {
    backgroundColor: `${color.accentPrimary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: color.accentPrimary,
  },
  checklistDescription: {
    fontSize: 12,
    color: color.textMuted,
    marginLeft: 28,
    lineHeight: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
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
    backgroundColor: color.accentPrimary,
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
    borderColor: color.border,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: color.textMuted,
  },
});
