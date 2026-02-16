/**
 * オフライン対応マネージャー
 * 
 * ネットワーク状態の監視とオフライン時のデータ同期
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

export interface PendingRequest {
  id: string;
  url: string;
  method: string;
  body?: unknown;
  timestamp: number;
}

const PENDING_REQUESTS_KEY = "pending_requests";

/**
 * ネットワーク状態を監視
 */
export function monitorNetworkStatus(callback: (isConnected: boolean) => void): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    callback(state.isConnected ?? false);
  });
  
  return unsubscribe;
}

/**
 * 現在のネットワーク状態を取得
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

/**
 * ペンディングリクエストを保存
 */
export async function savePendingRequest(request: Omit<PendingRequest, "id" | "timestamp">): Promise<void> {
  const pendingRequests = await getPendingRequests();
  
  const newRequest: PendingRequest = {
    ...request,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };
  
  pendingRequests.push(newRequest);
  await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(pendingRequests));
}

/**
 * ペンディングリクエストを取得
 */
export async function getPendingRequests(): Promise<PendingRequest[]> {
  const json = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
  if (!json) return [];
  
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * ペンディングリクエストを削除
 */
export async function removePendingRequest(id: string): Promise<void> {
  const pendingRequests = await getPendingRequests();
  const filtered = pendingRequests.filter((req) => req.id !== id);
  await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(filtered));
}

/**
 * すべてのペンディングリクエストをクリア
 */
export async function clearPendingRequests(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_REQUESTS_KEY);
}

/**
 * ペンディングリクエストを同期
 */
export async function syncPendingRequests(): Promise<{ success: number; failed: number }> {
  const online = await isOnline();
  if (!online) {
    return { success: 0, failed: 0 };
  }
  
  const pendingRequests = await getPendingRequests();
  let success = 0;
  let failed = 0;
  
  for (const request of pendingRequests) {
    try {
      await fetch(request.url, {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
      });
      
      await removePendingRequest(request.id);
      success++;
    } catch (error) {
      console.error("Failed to sync request:", error);
      failed++;
    }
  }
  
  return { success, failed };
}

/**
 * オフライン時のキャッシュ戦略
 */
export async function cacheData<T>(key: string, data: T, ttl = 3600000): Promise<void> {
  const cacheItem = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  
  await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
}

/**
 * キャッシュからデータを取得
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  const json = await AsyncStorage.getItem(`cache_${key}`);
  if (!json) return null;
  
  try {
    const cacheItem = JSON.parse(json);
    const now = Date.now();
    
    // TTLチェック
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return cacheItem.data as T;
  } catch {
    return null;
  }
}

/**
 * キャッシュをクリア
 */
export async function clearCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((key) => key.startsWith("cache_"));
  await AsyncStorage.multiRemove(cacheKeys);
}
