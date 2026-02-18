/**
 * FlatList最適化ヘルパー
 * パフォーマンスを向上させるための設定とユーティリティ
 */

import { Platform } from "react-native";
import type { FlatListProps } from "react-native";

/**
 * FlatListの最適化設定
 */
export interface FlatListOptimizationConfig {
  /** アイテムの高さ（固定の場合） */
  itemHeight?: number;
  /** ヘッダーの高さ */
  headerHeight?: number;
  /** フッターの高さ */
  footerHeight?: number;
  /** セパレーターの高さ */
  separatorHeight?: number;
  /** 初期表示数 */
  initialNumToRender?: number;
  /** ウィンドウサイズ（画面の何倍分をレンダリングするか） */
  windowSize?: number;
  /** 一度にレンダリングする最大数 */
  maxToRenderPerBatch?: number;
  /** バッチ更新の間隔（ms） */
  updateCellsBatchingPeriod?: number;
}

/**
 * FlatListの最適化プロパティを生成
 */
export function getOptimizedFlatListProps<T>(
  config: FlatListOptimizationConfig = {}
): Partial<FlatListProps<T>> {
  const {
    itemHeight,
    headerHeight = 0,
    footerHeight = 0,
    separatorHeight = 0,
    initialNumToRender = 10,
    windowSize = 5,
    maxToRenderPerBatch = 10,
    updateCellsBatchingPeriod = 50,
  } = config;

  const baseProps: Partial<FlatListProps<T>> = {
    // パフォーマンス設定
    initialNumToRender,
    windowSize,
    maxToRenderPerBatch,
    updateCellsBatchingPeriod,
    removeClippedSubviews: Platform.OS !== "web",
    
    // スクロール最適化
    onEndReachedThreshold: 0.5,
  };

  // 固定高さの場合、getItemLayoutを追加
  if (itemHeight) {
    baseProps.getItemLayout = (data, index) => ({
      length: itemHeight,
      offset: itemHeight * index + headerHeight,
      index,
    });
  }

  return baseProps;
}

/**
 * グリッドレイアウト用のFlatList最適化プロパティ
 */
export function getOptimizedGridFlatListProps<T>(
  itemHeight: number,
  numColumns: number,
  config: Omit<FlatListOptimizationConfig, "itemHeight"> = {}
): Partial<FlatListProps<T>> {
  const baseProps = getOptimizedFlatListProps<T>({
    ...config,
    itemHeight,
  });

  // グリッドの場合、getItemLayoutを調整
  if (itemHeight) {
    baseProps.getItemLayout = (data, index) => {
      const rowIndex = Math.floor(index / numColumns);
      return {
        length: itemHeight,
        offset: itemHeight * rowIndex + (config.headerHeight || 0),
        index,
      };
    };
  }

  return baseProps;
}

/**
 * 可変高さのアイテム用のキャッシュ
 */
export class ItemHeightCache {
  private cache = new Map<string | number, number>();
  private defaultHeight: number;

  constructor(defaultHeight: number = 100) {
    this.defaultHeight = defaultHeight;
  }

  set(key: string | number, height: number): void {
    this.cache.set(key, height);
  }

  get(key: string | number): number {
    return this.cache.get(key) || this.defaultHeight;
  }

  has(key: string | number): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * getItemLayoutを生成（キャッシュを使用）
   */
  createGetItemLayout(headerHeight: number = 0) {
    return (data: any[] | null | undefined, index: number) => {
      if (!data) {
        return {
          length: this.defaultHeight,
          offset: this.defaultHeight * index + headerHeight,
          index,
        };
      }

      let offset = headerHeight;
      for (let i = 0; i < index; i++) {
        const item = data[i];
        const key = item?.id || i;
        offset += this.get(key);
      }

      const item = data[index];
      const key = item?.id || index;
      const length = this.get(key);

      return {
        length,
        offset,
        index,
      };
    };
  }
}

/**
 * FlatListのパフォーマンスプリセット
 */
export const FLATLIST_PRESETS = {
  /** 短いリスト（< 50アイテム） */
  short: {
    initialNumToRender: 20,
    windowSize: 3,
    maxToRenderPerBatch: 20,
    updateCellsBatchingPeriod: 50,
  },
  /** 中程度のリスト（50-200アイテム） */
  medium: {
    initialNumToRender: 15,
    windowSize: 5,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
  },
  /** 長いリスト（200-1000アイテム） */
  long: {
    initialNumToRender: 10,
    windowSize: 5,
    maxToRenderPerBatch: 5,
    updateCellsBatchingPeriod: 100,
  },
  /** 非常に長いリスト（> 1000アイテム） */
  veryLong: {
    initialNumToRender: 5,
    windowSize: 3,
    maxToRenderPerBatch: 3,
    updateCellsBatchingPeriod: 100,
  },
} as const;

/**
 * リストの長さに応じて最適なプリセットを選択
 */
export function selectPreset(itemCount: number): FlatListOptimizationConfig {
  if (itemCount < 50) {
    return FLATLIST_PRESETS.short;
  } else if (itemCount < 200) {
    return FLATLIST_PRESETS.medium;
  } else if (itemCount < 1000) {
    return FLATLIST_PRESETS.long;
  } else {
    return FLATLIST_PRESETS.veryLong;
  }
}

/**
 * FlatListのメモリ使用量を推定
 */
export function estimateMemoryUsage(
  itemCount: number,
  averageItemSizeKB: number,
  windowSize: number = 5
): number {
  // 画面に表示されるアイテム数を推定（画面の高さ / アイテムの高さ）
  const itemsPerScreen = 10; // 仮定
  const renderedItems = itemsPerScreen * windowSize;
  const actualRenderedItems = Math.min(renderedItems, itemCount);

  return actualRenderedItems * averageItemSizeKB;
}
