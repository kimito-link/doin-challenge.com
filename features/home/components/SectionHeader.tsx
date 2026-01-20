/**
 * セクションヘッダーコンポーネント
 * ホーム画面の各セクションのタイトル表示に使用
 */

import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { homeText } from "@/features/home/ui/theme/tokens";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <View style={{ 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 8,
    }}>
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: homeText.accent, fontSize: 14 }}>すべて見る</Text>
          <MaterialIcons name="chevron-right" size={20} color={homeText.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}
