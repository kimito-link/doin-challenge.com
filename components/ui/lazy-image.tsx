/**
 * LazyImage - 遅延読み込み対応の画像コンポーネント
 * スケルトン表示、エラーハンドリング、キャッシュ最適化を含む
 */
import { useState, useCallback } from "react";
import { View, StyleSheet, type ViewStyle, type ImageStyle, type DimensionValue } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Skeleton } from "@/components/atoms/skeleton-loader";

interface LazyImageProps {
  source: ImageSource | string | null | undefined;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 遅延読み込み対応の画像コンポーネント
 * - 読み込み中はスケルトン表示
 * - エラー時はフォールバック表示
 * - expo-imageのキャッシュ機能を活用
 */
export function LazyImage({
  source,
  style,
  containerStyle,
  width = "100%",
  height = 100,
  borderRadius = 0,
  contentFit = "cover",
  placeholder,
  fallback,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // ソースがない場合はフォールバック表示
  if (!source) {
    return (
      <View style={[styles.container, containerStyle, { width, height, borderRadius }]}>
        {fallback || <Skeleton width={typeof width === "number" ? width : "100%"} height={typeof height === "number" ? height : 100} borderRadius={borderRadius} />}
      </View>
    );
  }

  // 文字列の場合はオブジェクトに変換
  const imageSource = typeof source === "string" ? { uri: source } : source;

  return (
    <View style={[styles.container, containerStyle, { width, height, borderRadius }]}>
      {/* スケルトン表示（読み込み中） */}
      {isLoading && !hasError && (
        <View style={[styles.placeholder, { borderRadius }]}>
          {placeholder || <Skeleton width="100%" height={typeof height === "number" ? height : 100} borderRadius={borderRadius} />}
        </View>
      )}

      {/* エラー時のフォールバック */}
      {hasError && (
        <View style={[styles.fallback, { borderRadius }]}>
          {fallback || <Skeleton width="100%" height={typeof height === "number" ? height : 100} borderRadius={borderRadius} />}
        </View>
      )}

      {/* 画像 */}
      {!hasError && (
        <Image
          source={imageSource}
          style={[
            styles.image,
            { borderRadius },
            style,
            isLoading && styles.hidden,
          ]}
          contentFit={contentFit}
          onLoad={handleLoad}
          onError={handleError}
          cachePolicy="memory-disk"
          recyclingKey={typeof source === "string" ? source : (source as any)?.uri}
          transition={200}
        />
      )}
    </View>
  );
}

/**
 * アバター用の遅延読み込み画像
 */
export function LazyAvatar({
  source,
  size = 40,
  style,
  fallbackIcon,
}: {
  source: ImageSource | string | null | undefined;
  size?: number;
  style?: ImageStyle;
  fallbackIcon?: React.ReactNode;
}) {
  return (
    <LazyImage
      source={source}
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
      fallback={fallbackIcon}
    />
  );
}

/**
 * サムネイル用の遅延読み込み画像
 */
export function LazyThumbnail({
  source,
  width = 120,
  height = 80,
  borderRadius = 8,
  style,
}: {
  source: ImageSource | string | null | undefined;
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ImageStyle;
}) {
  return (
    <LazyImage
      source={source}
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "relative",
  },
  placeholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  fallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  hidden: {
    opacity: 0,
  },
});
