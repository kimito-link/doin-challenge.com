/**
 * 空の状態表示コンポーネント
 * データがない場合の統一表示
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Button } from "./button";
import { useColors } from "@/hooks/use-colors";

export interface EmptyStateProps {
  /**
   * メッセージ
   */
  message?: string;
  
  /**
   * タイトル
   */
  title?: string;
  
  /**
   * アクションボタンのコールバック
   */
  onAction?: () => void;
  
  /**
   * アクションボタンのテキスト
   */
  actionText?: string;
  
  /**
   * アイコン
   * @default "inbox"
   */
  icon?: keyof typeof MaterialIcons.glyphMap;
  
  /**
   * コンパクト表示
   * @default false
   */
  compact?: boolean;
}

/**
 * 空の状態表示コンポーネント
 * 
 * @example
 * // 基本的な使い方
 * <EmptyState 
 *   message="まだチャレンジがありません"
 *   actionText="チャレンジを作成"
 *   onAction={handleCreate}
 * />
 * 
 * // カスタムアイコン
 * <EmptyState 
 *   title="お気に入りがありません"
 *   message="気になるチャレンジをお気に入りに追加しましょう"
 *   icon="favorite-border"
 * />
 */
export function EmptyState({
  message = "データがありません",
  title = "空です",
  onAction,
  actionText = "追加",
  icon = "inbox",
  compact = false,
}: EmptyStateProps) {
  const colors = useColors();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.surface }]}>
        <MaterialIcons name={icon} size={20} color={colors.muted} />
        <Text style={[styles.compactMessage, { color: colors.muted }]}>{message}</Text>
        {onAction && (
          <Button
            variant="ghost"
            size="sm"
            onPress={onAction}
          >
            {actionText}
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={64} color={colors.muted} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      {onAction && (
        <Button
          variant="primary"
          size="md"
          onPress={onAction}
          style={styles.actionButton}
        >
          {actionText}
        </Button>
      )}
    </View>
  );
}

/**
 * チャレンジがない状態
 */
export function NoChallengesState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      title="チャレンジがありません"
      message="新しいチャレンジを作成して、ファンと一緒に目標を達成しましょう"
      icon="event"
      actionText="チャレンジを作成"
      onAction={onAction}
    />
  );
}

/**
 * 検索結果がない状態
 */
export function NoSearchResultsState({ query }: { query?: string }) {
  return (
    <EmptyState
      title="検索結果がありません"
      message={query ? `「${query}」に一致するチャレンジが見つかりませんでした` : "検索条件を変更してお試しください"}
      icon="search-off"
    />
  );
}

/**
 * お気に入りがない状態
 */
export function NoFavoritesState() {
  return (
    <EmptyState
      title="お気に入りがありません"
      message="気になるチャレンジをお気に入りに追加しましょう"
      icon="favorite-border"
    />
  );
}

/**
 * 参加履歴がない状態
 */
export function NoParticipationsState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      title="参加履歴がありません"
      message="チャレンジに参加して、目標達成に貢献しましょう"
      icon="event-available"
      actionText="チャレンジを探す"
      onAction={onAction}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 8,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  compactMessage: {
    flex: 1,
    fontSize: 14,
  },
});
