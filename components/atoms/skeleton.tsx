import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";
import { color } from "@/theme/tokens";
import { SKELETON_CONFIG } from "@/constants/skeleton-config";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * 改善されたスケルトンローダー
 * 
 * UI/UXガイドに基づく設計:
 * - 体感速度向上: コンテンツの形をしたプレースホルダー
 * - 滑らかなアニメーション: シマーエフェクト
 * - 一貫したデザイン: 統一されたスタイル
 */
export function Skeleton({
  width = "100%" as `${number}%`,
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: SKELETON_CONFIG.animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: SKELETON_CONFIG.animationDuration,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SKELETON_CONFIG.backgroundOpacity, SKELETON_CONFIG.highlightOpacity],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * カードスケルトン
 */
export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={120} borderRadius={12} />
      <View style={styles.cardContent}>
        <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
        <Skeleton width="80%" height={14} />
      </View>
    </View>
  );
}

/**
 * リストアイテムスケルトン
 */
export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={18} style={{ marginBottom: 6 }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}

/**
 * チャレンジカードスケルトン
 */
export function ChallengeCardSkeleton() {
  return (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="60%" height={16} style={{ marginBottom: 4 }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={80} borderRadius={12} style={{ marginTop: 12 }} />
      <View style={styles.challengeFooter}>
        <Skeleton width="30%" height={24} borderRadius={12} />
        <Skeleton width="25%" height={24} borderRadius={12} />
      </View>
    </View>
  );
}

/**
 * プロフィールスケルトン
 */
export function ProfileSkeleton() {
  return (
    <View style={styles.profile}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton width="50%" height={24} style={{ marginTop: 16 }} />
      <Skeleton width="30%" height={16} style={{ marginTop: 8 }} />
      <View style={styles.profileStats}>
        <View style={styles.profileStat}>
          <Skeleton width={40} height={24} />
          <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.profileStat}>
          <Skeleton width={40} height={24} />
          <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.profileStat}>
          <Skeleton width={40} height={24} />
          <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: color.border,
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: color.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  challengeCard: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  profile: {
    alignItems: "center",
    padding: 24,
  },
  profileStats: {
    flexDirection: "row",
    marginTop: 24,
    gap: 32,
  },
  profileStat: {
    alignItems: "center",
  },
});
