/**
 * EventBasicInfo Component
 * イベントの基本情報（日時、会場のみ）- ファーストビュー用
 */

import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";

interface EventBasicInfoProps {
  formattedDate: string;
  venue?: string;
}

export function EventBasicInfo({ formattedDate, venue }: EventBasicInfoProps) {
  const colors = useColors();
  
  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      {/* 日時 */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: venue ? 8 : 0 }}>
        <MaterialIcons name="event" size={18} color={color.hostAccentLegacy} />
        <Text style={{ color: colors.foreground, fontSize: 15, marginLeft: 8, fontWeight: "500" }}>
          {formattedDate}
        </Text>
      </View>

      {/* 会場 */}
      {venue && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="place" size={18} color={color.hostAccentLegacy} />
          <Text style={{ color: colors.foreground, fontSize: 15, marginLeft: 8, fontWeight: "500" }}>
            {venue}
          </Text>
        </View>
      )}
    </View>
  );
}
