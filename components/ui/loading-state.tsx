/**
 * ローディング状態表示コンポーネント
 * データ取得中の統一表示
 */

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";

export interface LoadingStateProps {
  /**
   * ローディングメッセージ
   */
  message?: string;
  
  /**
   * インジケーターのサイズ
   * @default "large"
   */
  size?: "small" | "large";
  
  /**
   * コンパクト表示
   * @default false
   */
  compact?: boolean;
  
  /**
   * インラインローディング（横並び）
   * @default false
   */
  inline?: boolean;
}

/**
 * ローディング状態表示コンポーネント
 * 
 * @example
 * // 基本的な使い方
 * <LoadingState message="読み込み中..." />
 * 
 * // コンパクト表示
 * <LoadingState message="更新中..." compact />
 * 
 * // インライン表示
 * <LoadingState message="処理中..." inline />
 */
export function LoadingState({
  message = "読み込み中...",
  size = "large",
  compact = false,
  inline = false,
}: LoadingStateProps) {
  const colors = useColors();

  if (inline) {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.inlineMessage, { color: colors.muted }]}>{message}</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.compactMessage, { color: colors.muted }]}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
    </View>
  );
}

/**
 * スケルトンスクリーン（プレースホルダー）
 */
export function SkeletonPlaceholder({
  width = "100%",
  height = 20,
  borderRadius = 4,
}: {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
}) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
        },
      ]}
    />
  );
}

/**
 * カードのスケルトン
 */
export function CardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <SkeletonPlaceholder width="100%" height={200} borderRadius={12} />
      <View style={styles.cardSkeletonContent}>
        <SkeletonPlaceholder width="80%" height={24} />
        <SkeletonPlaceholder width="60%" height={16} />
        <SkeletonPlaceholder width="40%" height={16} />
      </View>
    </View>
  );
}

/**
 * リストのスケルトン
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonPlaceholder width={48} height={48} borderRadius={24} />
          <View style={styles.listItemContent}>
            <SkeletonPlaceholder width="70%" height={16} />
            <SkeletonPlaceholder width="50%" height={14} />
          </View>
        </View>
      ))}
    </View>
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
  message: {
    fontSize: 16,
    textAlign: "center",
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  compactMessage: {
    fontSize: 14,
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineMessage: {
    fontSize: 14,
  },
  skeleton: {
    overflow: "hidden",
  },
  cardSkeleton: {
    gap: 12,
    padding: 16,
  },
  cardSkeletonContent: {
    gap: 8,
  },
  listSkeleton: {
    gap: 12,
    padding: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listItemContent: {
    flex: 1,
    gap: 8,
  },
});
