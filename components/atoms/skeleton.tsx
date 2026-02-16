/**
 * ローディングスケルトンコンポーネント
 * 
 * データ読み込み中に表示するプレースホルダー
 * ユーザーに読み込み状態を視覚的にフィードバック
 */

import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  /**
   * スケルトンの幅（Tailwindクラス）
   */
  width?: string;
  /**
   * スケルトンの高さ（Tailwindクラス）
   */
  height?: string;
  /**
   * 角丸（Tailwindクラス）
   */
  rounded?: string;
  /**
   * 追加のクラス名
   */
  className?: string;
}

/**
 * ローディングスケルトン
 * 
 * 使用例:
 * ```tsx
 * <Skeleton width="w-full" height="h-20" rounded="rounded-lg" />
 * ```
 */
export function Skeleton({
  width = "w-full",
  height = "h-4",
  rounded = "rounded",
  className,
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={cn(
        "bg-muted",
        width,
        height,
        rounded,
        className
      )}
      style={animatedStyle}
    />
  );
}

/**
 * テキストスケルトン
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? "w-3/4" : "w-full"}
          height="h-4"
          rounded="rounded"
        />
      ))}
    </View>
  );
}

/**
 * カードスケルトン
 */
export function CardSkeleton() {
  return (
    <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
      <Skeleton width="w-full" height="h-32" rounded="rounded-lg" />
      <Skeleton width="w-3/4" height="h-6" rounded="rounded" />
      <TextSkeleton lines={2} />
    </View>
  );
}

/**
 * リストスケルトン
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
}

/**
 * アバタースケルトン
 */
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      width={`w-[${size}px]`}
      height={`h-[${size}px]`}
      rounded="rounded-full"
    />
  );
}
