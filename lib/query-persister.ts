import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Persister, PersistedClient } from "@tanstack/react-query-persist-client";

/**
 * React QueryのキャッシュをAsyncStorageに永続化するためのPersister
 * 
 * これにより、以下の機能が有効になります：
 * - オフライン時でもキャッシュデータを表示
 * - アプリ再起動後もキャッシュが保持される
 * - ネットワーク接続が復帰したら自動的に再検証
 */
const STORAGE_KEY = "REACT_QUERY_OFFLINE_CACHE";

export const asyncStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : undefined;
  },
  removeClient: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
