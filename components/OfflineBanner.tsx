import { View, Text } from "react-native";
import { useNetworkStatus } from "@/hooks/use-network-status";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

/**
 * オフライン状態を表示するバナー
 * ネットワークが切断されたときに画面上部に表示される
 */
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(300)}
      className="absolute top-0 left-0 right-0 z-50 bg-warning px-4 py-3"
    >
      <Text className="text-center text-sm font-semibold text-background">
        オフラインです。キャッシュされたデータを表示しています。
      </Text>
    </Animated.View>
  );
}
