import { View, ActivityIndicator } from "react-native";
import { color } from "@/theme/tokens";

/**
 * React.lazy用のローディングコンポーネント
 * 遅延読み込み中に表示されるフォールバックUI
 */
export function LazyLoading() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color.bg,
      }}
    >
      <ActivityIndicator size="large" color={color.accentPrimary} />
    </View>
  );
}
