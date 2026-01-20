/**
 * 目的セレクター
 * 
 * チャレンジの目的（ライブ/配信/生誕祭等）を選択するUI
 * カード形式で詳細な説明付きで選択できる
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { PURPOSES, type PurposeId } from "@/constants/event-categories";
import { createUI, createText } from "../theme/tokens";

interface PurposeSelectorProps {
  selectedPurpose: PurposeId | null;
  onSelect: (purposeId: PurposeId) => void;
}

export function PurposeSelector({ selectedPurpose, onSelect }: PurposeSelectorProps) {
  const colors = useColors();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
        目的
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12, opacity: 0.7 }}>
        チャレンジの目的を選択してください
      </Text>
      <View style={{ gap: 8 }}>
        {PURPOSES.map((purpose) => {
          const isSelected = selectedPurpose === purpose.id;
          return (
            <TouchableOpacity
              key={purpose.id}
              onPress={() => onSelect(purpose.id)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderRadius: 12,
                backgroundColor: isSelected ? `${colors.primary}15` : colors.background,
                borderWidth: 1.5,
                borderColor: isSelected ? colors.primary : createUI.inputBorder,
                minHeight: 56,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isSelected ? colors.primary : `${colors.muted}20`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>{purpose.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: isSelected ? colors.primary : colors.foreground,
                    fontSize: 14,
                    fontWeight: isSelected ? "600" : "500",
                    marginBottom: 2,
                  }}
                >
                  {purpose.label}
                </Text>
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                  numberOfLines={1}
                >
                  {purpose.description}
                </Text>
              </View>
              {isSelected && (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 14 }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
