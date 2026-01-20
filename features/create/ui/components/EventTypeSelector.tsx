/**
 * イベントタイプセレクター
 * 
 * ソロ/グループの選択UI
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { createUI } from "../theme/tokens";
import { eventTypeOptions } from "@/constants/goal-types";

interface EventTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function EventTypeSelector({ value, onChange }: EventTypeSelectorProps) {
  const colors = useColors();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
        イベントタイプ
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {eventTypeOptions.map((type) => (
          <TouchableOpacity
            key={type.id}
            onPress={() => onChange(type.id)}
            style={{
              flex: 1,
              backgroundColor: value === type.id ? type.color : colors.background,
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: value === type.id ? type.color : createUI.inputBorder,
            }}
          >
            <Text
              style={{
                color: value === type.id ? "#fff" : colors.muted,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
