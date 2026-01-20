/**
 * 設定リンクアイテムコンポーネント
 * マイページの設定リンク（アチーブメント、通知、テーマなど）の共通コンポーネント
 */
import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

interface SettingsLinkItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  onPress: () => void;
}

export function SettingsLinkItem({ 
  icon, 
  iconColor, 
  title, 
  description, 
  onPress 
}: SettingsLinkItemProps) {
  const colors = useColors();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#1A1D21",
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2D3139",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: iconColor,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <MaterialIcons name={icon} size={24} color={colors.foreground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
          {title}
        </Text>
        <Text style={{ color: "#D1D5DB", fontSize: 12 }}>
          {description}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
