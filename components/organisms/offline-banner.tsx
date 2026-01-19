import { View, Text, StyleSheet, Animated } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { addNetworkListener, initNetworkMonitoring } from "@/lib/offline-cache";

/**
 * オフライン状態を表示するバナー
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // ネットワーク監視を初期化
    initNetworkMonitoring();

    // ネットワーク状態変更リスナーを追加
    const unsubscribe = addNetworkListener((isConnected) => {
      setIsOffline(!isConnected);
      
      if (!isConnected) {
        // オフラインになったらバナーを表示
        setShowBanner(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      } else {
        // オンラインに戻ったらバナーを非表示
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowBanner(false);
        });
      }
    });

    return unsubscribe;
  }, [slideAnim]);

  if (!showBanner) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <MaterialIcons name="wifi-off" size={16} color="#fff" />
      <Text style={styles.text}>
        オフラインです。一部の機能が制限されます。
      </Text>
    </Animated.View>
  );
}

/**
 * オフライン時のプレースホルダー
 */
export function OfflinePlaceholder({ message }: { message?: string }) {
  return (
    <View style={styles.placeholder}>
      <MaterialIcons name="cloud-off" size={48} color="#CBD5E0" />
      <Text style={styles.placeholderTitle}>オフラインです</Text>
      <Text style={styles.placeholderText}>
        {message || "インターネット接続を確認してください"}
      </Text>
    </View>
  );
}

/**
 * キャッシュからのデータ表示インジケーター
 */
export function CachedDataIndicator({ isStale }: { isStale: boolean }) {
  if (!isStale) return null;

  return (
    <View style={styles.cachedIndicator}>
      <MaterialIcons name="history" size={12} color="#F59E0B" />
      <Text style={styles.cachedText}>キャッシュデータを表示中</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 1000,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  placeholderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  placeholderText: {
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  cachedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cachedText: {
    color: "#F59E0B",
    fontSize: 10,
  },
});
