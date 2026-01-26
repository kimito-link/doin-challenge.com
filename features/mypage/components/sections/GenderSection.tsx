/**
 * GenderSection Component
 * マイページの性別選択セクション
 */

import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { GenderSelector, type Gender } from "@/components/ui/gender-selector";
import { useColors } from "@/hooks/use-colors";

interface GenderSectionProps {
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
  disabled?: boolean;
}

export function GenderSection({ gender, onGenderChange, disabled }: GenderSectionProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        性別設定
      </Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        主催者カードで性別による色分けが表示されます
      </Text>
      
      <GenderSelector
        value={gender}
        onChange={onGenderChange}
        disabled={disabled}
      />
      
      {disabled && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            保存中...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as any,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
});
