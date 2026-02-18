/**
 * 画像キャッシュユーティリティ
 * expo-imageのキャッシュ管理とプリロード
 */

import { Image } from "expo-image";
import { Platform } from "react-native";
import { logger } from "./logger";

/**
 * 画像をプリロード
 */
export async function preloadImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  try {
    await Promise.all(
      urls.map((url) =>
        Image.prefetch(url, {
          cachePolicy: "memory-disk",
        })
      )
    );
    logger.debug(`Preloaded ${urls.length} images`);
  } catch (error) {
    logger.error("Failed to preload images", { data: { error } });
  }
}

/**
 * 画像キャッシュをクリア
 */
export async function clearImageCache(): Promise<void> {
  try {
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
    logger.info("Image cache cleared");
  } catch (error) {
    logger.error("Failed to clear image cache", { data: { error } });
  }
}

/**
 * メモリキャッシュのみクリア
 */
export async function clearMemoryCache(): Promise<void> {
  try {
    await Image.clearMemoryCache();
    logger.debug("Memory cache cleared");
  } catch (error) {
    logger.error("Failed to clear memory cache", { data: { error } });
  }
}

/**
 * ディスクキャッシュのみクリア
 */
export async function clearDiskCache(): Promise<void> {
  try {
    await Image.clearDiskCache();
    logger.debug("Disk cache cleared");
  } catch (error) {
    logger.error("Failed to clear disk cache", { data: { error } });
  }
}

/**
 * 画像URLを最適化（サイズ指定、フォーマット変換など）
 */
export function optimizeImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
  }
): string {
  // Twitter画像の最適化
  if (url.includes("pbs.twimg.com")) {
    // _normal (48x48) を _400x400 に変更
    if (url.includes("_normal")) {
      return url.replace("_normal", "_400x400");
    }
    // _bigger (73x73) を _400x400 に変更
    if (url.includes("_bigger")) {
      return url.replace("_bigger", "_400x400");
    }
  }

  // その他のCDNの最適化は将来的に追加
  return url;
}

/**
 * 画像のプリフェッチ戦略
 */
export interface ImagePrefetchStrategy {
  /** 即座にプリフェッチする画像（重要度: 高） */
  immediate: string[];
  /** 遅延プリフェッチする画像（重要度: 中） */
  deferred: string[];
  /** バックグラウンドでプリフェッチする画像（重要度: 低） */
  background: string[];
}

/**
 * 戦略的に画像をプリフェッチ
 */
export async function prefetchWithStrategy(
  strategy: ImagePrefetchStrategy
): Promise<void> {
  // 即座にプリフェッチ
  if (strategy.immediate.length > 0) {
    await preloadImages(strategy.immediate);
  }

  // 遅延プリフェッチ（100ms後）
  if (strategy.deferred.length > 0) {
    setTimeout(() => {
      preloadImages(strategy.deferred);
    }, 100);
  }

  // バックグラウンドプリフェッチ（1秒後）
  if (strategy.background.length > 0) {
    setTimeout(() => {
      preloadImages(strategy.background);
    }, 1000);
  }
}

/**
 * チャレンジカード用の画像プリフェッチ
 */
export function prefetchChallengeImages(
  challenges: Array<{ hostProfileImage?: string | null }>
): void {
  const urls = challenges
    .map((c) => c.hostProfileImage)
    .filter((url): url is string => !!url)
    .map((url) => optimizeImageUrl(url));

  if (urls.length > 0) {
    // 最初の10枚は即座に、残りは遅延
    const strategy: ImagePrefetchStrategy = {
      immediate: urls.slice(0, 10),
      deferred: urls.slice(10, 30),
      background: urls.slice(30),
    };

    prefetchWithStrategy(strategy);
  }
}

/**
 * キャッシュサイズの推定（Web環境のみ）
 */
export async function estimateCacheSize(): Promise<number | null> {
  if (Platform.OS !== "web" || !navigator.storage) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || null;
  } catch (error) {
    logger.error("Failed to estimate cache size", { data: { error } });
    return null;
  }
}
