/**
 * フィルターボタンコンポーネント
 * ホーム画面でチャレンジのフィルタリングに使用
 */

import { TouchableOpacity, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface FilterButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterButton({ label, active, onPress }: FilterButtonProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        // UXガイドライン: 最小44pxのタップエリア
        minHeight: 44,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 22,
        backgroundColor: active ? "#DD6500" : "#2D3139",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: active ? "bold" : "normal" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
