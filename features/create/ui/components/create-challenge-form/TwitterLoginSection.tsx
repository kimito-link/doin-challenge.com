// features/create/ui/components/create-challenge-form/TwitterLoginSection.tsx
// Twitterログインボタンセクション

import { Text, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { createFont } from "../../theme/tokens";
import { useColors } from "@/hooks/use-colors";
import type { TwitterLoginSectionProps } from "./types";

/**
 * Twitterログインボタンセクション
 * 未ログイン時に表示されるログインボタン
 */
export function TwitterLoginSection({ onLogin }: TwitterLoginSectionProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onLogin}
      style={({ pressed }) => ({
        backgroundColor: color.twitter,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <MaterialIcons name="login" size={20} color={color.textWhite} />
      <Text style={{ color: colors.foreground, fontSize: createFont.title, fontWeight: "bold", marginLeft: 8 }}>
        Twitterでログインして作成
      </Text>
    </Pressable>
  );
}
