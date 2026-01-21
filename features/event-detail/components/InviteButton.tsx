/**
 * InviteButton Component
 * 友達を招待するボタン
 */

import { Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";

interface InviteButtonProps {
  challengeId: number;
}

export function InviteButton({ challengeId }: InviteButtonProps) {
  const colors = useColors();
  const router = useRouter();
  
  return (
    <Pressable
      onPress={() => router.push(`/invite/${challengeId}`)}
      style={{
        backgroundColor: color.hostAccentLegacy,
        borderRadius: 12,
        padding: 14,
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialIcons name="person-add" size={20} color={colors.foreground} />
      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
        友達を招待する
      </Text>
    </Pressable>
  );
}
