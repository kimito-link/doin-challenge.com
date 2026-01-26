/**
 * EventDescription Component
 * イベントの説明文 - 下部用
 */

import { View, Text } from "react-native";
import { color } from "@/theme/tokens";

interface EventDescriptionProps {
  description?: string;
}

export function EventDescription({ description }: EventDescriptionProps) {
  if (!description) return null;
  
  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <Text style={{ color: color.textSecondary, fontSize: 15, lineHeight: 22 }}>
        {description}
      </Text>
    </View>
  );
}
