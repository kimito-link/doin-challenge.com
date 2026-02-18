/**
 * ネットワーク状態管理ヘルパー
 * オンライン/オフライン状態の検出と管理
 */

import { useEffect, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { logger } from "./logger";

/**
 * ネットワーク状態
 */
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

/**
 * ネットワーク状態を監視するフック
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });

      if (!state.isConnected) {
        logger.warn("Network disconnected");
      } else {
        logger.info("Network connected", { data: { type: state.type } });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}

/**
 * 現在のネットワーク状態を取得
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    };
  } catch (error) {
    logger.error("Failed to fetch network status", { data: { error } });
    return {
      isConnected: false,
      isInternetReachable: null,
      type: null,
    };
  }
}

/**
 * オンライン状態を監視するフック（シンプル版）
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
}

/**
 * ネットワーク接続を待つ
 */
export async function waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
}

/**
 * ネットワークタイプを取得
 */
export async function getNetworkType(): Promise<string | null> {
  try {
    const state = await NetInfo.fetch();
    return state.type;
  } catch (error) {
    logger.error("Failed to fetch network type", { data: { error } });
    return null;
  }
}

/**
 * Wi-Fi接続かどうかを確認
 */
export async function isWiFiConnected(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.type === "wifi" && (state.isConnected ?? false);
  } catch (error) {
    logger.error("Failed to check WiFi connection", { data: { error } });
    return false;
  }
}

/**
 * モバイルデータ接続かどうかを確認
 */
export async function isCellularConnected(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.type === "cellular" && (state.isConnected ?? false);
  } catch (error) {
    logger.error("Failed to check cellular connection", { data: { error } });
    return false;
  }
}
