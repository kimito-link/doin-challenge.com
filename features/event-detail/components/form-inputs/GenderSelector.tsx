/**
 * GenderSelector Component
 * 性別選択ラジオボタン
 */

import { View, Text, Pressable } from "react-native";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";

interface GenderSelectorProps {
  gender: "male" | "female" | "";
  setGender: (value: "male" | "female" | "") => void;
}

export function GenderSelector({ gender, setGender }: GenderSelectorProps) {
  const colors = useColors();
  
  return (
    <View style={{ marginBottom: 16 }}>
      {/* ラベル */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ color: color.textSecondary, fontSize: 14 }}>
          性別
        </Text>
        <Text style={{ color: color.accentPrimary, fontSize: 12, marginLeft: 6, fontWeight: "bold" }}>
          必須
        </Text>
      </View>

      {/* 選択ボタン */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* 男性 */}
        <Pressable
          onPress={() => setGender("male")}
          style={{
            flex: 1,
            backgroundColor: gender === "male" ? color.info : colors.background,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 2,
            borderColor: gender === "male" ? color.info : gender === "" ? color.accentPrimary : color.border,
          }}
        >
          <Text style={{ fontSize: 24, marginBottom: 4 }}>👨</Text>
          <Text style={{ color: gender === "male" ? color.textWhite : color.textSecondary, fontSize: 14, fontWeight: "600" }}>
            男性
          </Text>
        </Pressable>

        {/* 女性 */}
        <Pressable
          onPress={() => setGender("female")}
          style={{
            flex: 1,
            backgroundColor: gender === "female" ? color.accentPrimary : colors.background,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 2,
            borderColor: gender === "female" ? color.accentPrimary : gender === "" ? color.accentPrimary : color.border,
          }}
        >
          <Text style={{ fontSize: 24, marginBottom: 4 }}>👩</Text>
          <Text style={{ color: gender === "female" ? color.textWhite : color.textSecondary, fontSize: 14, fontWeight: "600" }}>
            女性
          </Text>
        </Pressable>
      </View>

      {/* バリデーションエラー */}
      {gender === "" && (
        <Text style={{ color: color.danger, fontSize: 12, marginTop: 8 }}>
          性別を選択してください
        </Text>
      )}
    </View>
  );
}
