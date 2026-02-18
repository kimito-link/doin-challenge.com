/**
 * Navigation Tracking Hook
 * 画面遷移をトラッキングし、AsyncStorageに保存
 */

import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NAVIGATION_LOG_KEY = "@navigation_log";
const MAX_LOG_ENTRIES = 1000; // 最大保存件数

export interface NavigationEvent {
  id: string;
  from: string | null;
  to: string;
  timestamp: number;
  duration: number | null; // 前の画面での滞在時間（ミリ秒）
}

/**
 * ナビゲーショントラッキングフック
 * 画面遷移を自動的にトラッキングし、AsyncStorageに保存
 */
export function useNavigationTracking() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);
  const enterTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const trackNavigation = async () => {
      const now = Date.now();
      const from = previousPathRef.current;
      const to = pathname;
      const duration = from ? now - enterTimeRef.current : null;

      // ナビゲーションイベントを作成
      const event: NavigationEvent = {
        id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
        from,
        to,
        timestamp: now,
        duration,
      };

      try {
        // 既存のログを取得
        const existingLogJson = await AsyncStorage.getItem(NAVIGATION_LOG_KEY);
        const existingLog: NavigationEvent[] = existingLogJson
          ? JSON.parse(existingLogJson)
          : [];

        // 新しいイベントを追加
        const updatedLog = [...existingLog, event];

        // 最大件数を超えた場合、古いエントリを削除
        if (updatedLog.length > MAX_LOG_ENTRIES) {
          updatedLog.splice(0, updatedLog.length - MAX_LOG_ENTRIES);
        }

        // 保存
        await AsyncStorage.setItem(NAVIGATION_LOG_KEY, JSON.stringify(updatedLog));
      } catch (error) {
        console.error("ナビゲーショントラッキングエラー:", error);
      }

      // 現在のパスと時刻を保存
      previousPathRef.current = to;
      enterTimeRef.current = now;
    };

    trackNavigation();
  }, [pathname]);
}

/**
 * ナビゲーションログを取得
 */
export async function getNavigationLog(): Promise<NavigationEvent[]> {
  try {
    const logJson = await AsyncStorage.getItem(NAVIGATION_LOG_KEY);
    return logJson ? JSON.parse(logJson) : [];
  } catch (error) {
    console.error("ナビゲーションログ取得エラー:", error);
    return [];
  }
}

/**
 * ナビゲーションログをクリア
 */
export async function clearNavigationLog(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NAVIGATION_LOG_KEY);
  } catch (error) {
    console.error("ナビゲーションログクリアエラー:", error);
  }
}

/**
 * ナビゲーション統計を計算
 */
export interface NavigationStats {
  totalTransitions: number;
  uniqueScreens: number;
  mostVisitedScreens: Array<{ screen: string; count: number }>;
  averageDuration: number;
  transitionMatrix: Record<string, Record<string, number>>;
}

export async function getNavigationStats(): Promise<NavigationStats> {
  const log = await getNavigationLog();

  if (log.length === 0) {
    return {
      totalTransitions: 0,
      uniqueScreens: 0,
      mostVisitedScreens: [],
      averageDuration: 0,
      transitionMatrix: {},
    };
  }

  // 画面ごとの訪問回数をカウント
  const screenCounts: Record<string, number> = {};
  const transitionMatrix: Record<string, Record<string, number>> = {};
  let totalDuration = 0;
  let durationCount = 0;

  log.forEach((event) => {
    // 訪問回数をカウント
    screenCounts[event.to] = (screenCounts[event.to] || 0) + 1;

    // 遷移マトリックスを構築
    if (event.from) {
      if (!transitionMatrix[event.from]) {
        transitionMatrix[event.from] = {};
      }
      transitionMatrix[event.from][event.to] =
        (transitionMatrix[event.from][event.to] || 0) + 1;
    }

    // 平均滞在時間を計算
    if (event.duration !== null) {
      totalDuration += event.duration;
      durationCount++;
    }
  });

  // 最も訪問された画面をソート
  const mostVisitedScreens = Object.entries(screenCounts)
    .map(([screen, count]) => ({ screen, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalTransitions: log.length,
    uniqueScreens: Object.keys(screenCounts).length,
    mostVisitedScreens,
    averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
    transitionMatrix,
  };
}
