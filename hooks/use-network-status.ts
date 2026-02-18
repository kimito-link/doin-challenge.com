import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";

/**
 * ネットワーク状態を監視するフック
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      // Web環境
      const handleOnline = () => {
        setIsOnline(true);
        setIsConnecting(false);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setIsConnecting(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 初期状態を設定
      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    } else {
      // React Native環境
      const unsubscribe = NetInfo.addEventListener((state) => {
        const online = state.isConnected === true && state.isInternetReachable !== false;
        setIsOnline(online);
        setIsConnecting(false);
      });

      // 初期状態を取得
      NetInfo.fetch().then((state) => {
        const online = state.isConnected === true && state.isInternetReachable !== false;
        setIsOnline(online);
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  return { isOnline, isConnecting };
}
