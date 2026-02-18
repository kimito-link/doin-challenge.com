/**
 * エラー状態表示コンポーネント
 * ネットワークエラー、データ取得エラーなどの統一表示
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Button } from "./button";
import { useColors } from "@/hooks/use-colors";

export interface ErrorStateProps {
  /**
   * エラーメッセージ
   */
  message?: string;
  
  /**
   * エラータイトル
   */
  title?: string;
  
  /**
   * 再試行ボタンのコールバック
   */
  onRetry?: () => void;
  
  /**
   * 再試行ボタンのテキスト
   * @default "再試行"
   */
  retryText?: string;
  
  /**
   * アイコン
   * @default "error-outline"
   */
  icon?: keyof typeof MaterialIcons.glyphMap;
  
  /**
   * コンパクト表示
   * @default false
   */
  compact?: boolean;
}

/**
 * エラー状態表示コンポーネント
 * 
 * @example
 * // 基本的な使い方
 * <ErrorState 
 *   message="データの取得に失敗しました"
 *   onRetry={refetch}
 * />
 * 
 * // カスタムメッセージ
 * <ErrorState 
 *   title="接続エラー"
 *   message="インターネット接続を確認してください"
 *   onRetry={refetch}
 *   retryText="もう一度試す"
 * />
 */
export function ErrorState({
  message = "エラーが発生しました",
  title = "エラー",
  onRetry,
  retryText = "再試行",
  icon = "error-outline",
  compact = false,
}: ErrorStateProps) {
  const colors = useColors();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.surface }]}>
        <MaterialIcons name={icon} size={20} color={colors.error} />
        <Text style={[styles.compactMessage, { color: colors.muted }]}>{message}</Text>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onPress={onRetry}
          >
            {retryText}
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={64} color={colors.error} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      {onRetry && (
        <Button
          variant="primary"
          size="md"
          onPress={onRetry}
          style={styles.retryButton}
        >
          {retryText}
        </Button>
      )}
    </View>
  );
}

/**
 * ネットワークエラー専用コンポーネント
 */
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="接続エラー"
      message="インターネット接続を確認してください"
      icon="wifi-off"
      onRetry={onRetry}
    />
  );
}

/**
 * データ取得エラー専用コンポーネント
 */
export function DataErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="データ取得エラー"
      message="データの取得に失敗しました。もう一度お試しください。"
      icon="cloud-off"
      onRetry={onRetry}
    />
  );
}

/**
 * 権限エラー専用コンポーネント
 */
export function PermissionErrorState({ message }: { message?: string }) {
  return (
    <ErrorState
      title="アクセス権限がありません"
      message={message || "この操作を実行する権限がありません"}
      icon="lock"
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
  retryButton: {
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
