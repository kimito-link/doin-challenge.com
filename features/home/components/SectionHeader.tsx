/**
 * セクションヘッダーコンポーネント
 * ホーム画面の各セクションのタイトル表示に使用
 */

import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { homeText } from "@/features/home/ui/theme/tokens";
import { Button } from "@/components/ui/button";

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
        <Button 
          variant="ghost" 
          size="sm" 
          onPress={onSeeAll}
          style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 4 }}
        >
          <Text style={{ color: homeText.accent, fontSize: 14 }}>すべて見る</Text>
          <MaterialIcons name="chevron-right" size={20} color={homeText.accent} />
        </Button>
      )}
    </View>
  );
}
