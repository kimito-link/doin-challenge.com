import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useCallback } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  description?: string;
  presets?: number[];
}

/**
 * 数字入力ステッパーコンポーネント
 * 上下ボタンで数値を増減できる
 * プリセットボタンで素早く値を設定可能
 */
export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 100000,
  step = 10,
  unit = "人",
  label,
  description,
  presets = [50, 100, 200, 500, 1000],
}: NumberStepperProps) {
  const colors = useColors();

  const handleHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleIncrement = useCallback(() => {
    handleHaptic();
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  }, [value, step, max, onChange, handleHaptic]);

  const handleDecrement = useCallback(() => {
    handleHaptic();
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  }, [value, step, min, onChange, handleHaptic]);

  const handleLargeIncrement = useCallback(() => {
    handleHaptic();
    const largeStep = step * 10;
    const newValue = Math.min(value + largeStep, max);
    onChange(newValue);
  }, [value, step, max, onChange, handleHaptic]);

  const handleLargeDecrement = useCallback(() => {
    handleHaptic();
    const largeStep = step * 10;
    const newValue = Math.max(value - largeStep, min);
    onChange(newValue);
  }, [value, step, min, onChange, handleHaptic]);

  const handlePresetSelect = useCallback((preset: number) => {
    handleHaptic();
    onChange(preset);
  }, [onChange, handleHaptic]);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      )}
      
      {/* メインのステッパー部分 */}
      <View style={[styles.stepperContainer, { backgroundColor: colors.background, borderColor: "#2D3139" }]}>
        {/* 大きく減らすボタン */}
        <TouchableOpacity
          onPress={handleLargeDecrement}
          style={[styles.stepButton, styles.largeStepButton, { borderRightColor: "#2D3139" }]}
          activeOpacity={0.7}
          disabled={value <= min}
        >
          <MaterialIcons 
            name="keyboard-double-arrow-down" 
            size={24} 
            color={value <= min ? "#CBD5E0" : "#EC4899"} 
          />
        </TouchableOpacity>

        {/* 減らすボタン */}
        <TouchableOpacity
          onPress={handleDecrement}
          style={[styles.stepButton, { borderRightColor: "#2D3139" }]}
          activeOpacity={0.7}
          disabled={value <= min}
        >
          <MaterialIcons 
            name="remove" 
            size={28} 
            color={value <= min ? "#CBD5E0" : colors.foreground} 
          />
        </TouchableOpacity>

        {/* 数値表示 */}
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: colors.foreground }]}>
            {value.toLocaleString()}
          </Text>
          <Text style={[styles.unitText, { color: colors.muted }]}>{unit}</Text>
        </View>

        {/* 増やすボタン */}
        <TouchableOpacity
          onPress={handleIncrement}
          style={[styles.stepButton, { borderLeftColor: "#2D3139" }]}
          activeOpacity={0.7}
          disabled={value >= max}
        >
          <MaterialIcons 
            name="add" 
            size={28} 
            color={value >= max ? "#CBD5E0" : colors.foreground} 
          />
        </TouchableOpacity>

        {/* 大きく増やすボタン */}
        <TouchableOpacity
          onPress={handleLargeIncrement}
          style={[styles.stepButton, styles.largeStepButton, { borderLeftColor: "#2D3139" }]}
          activeOpacity={0.7}
          disabled={value >= max}
        >
          <MaterialIcons 
            name="keyboard-double-arrow-up" 
            size={24} 
            color={value >= max ? "#CBD5E0" : "#EC4899"} 
          />
        </TouchableOpacity>
      </View>

      {/* プリセットボタン */}
      {presets && presets.length > 0 && (
        <View style={styles.presetsContainer}>
          <Text style={[styles.presetsLabel, { color: colors.muted }]}>よく使う目標:</Text>
          <View style={styles.presetButtons}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => handlePresetSelect(preset)}
                style={[
                  styles.presetButton,
                  { 
                    backgroundColor: value === preset ? "#EC4899" : colors.background,
                    borderColor: value === preset ? "#EC4899" : "#2D3139",
                  }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.presetButtonText,
                  { color: value === preset ? "#fff" : colors.foreground }
                ]}>
                  {preset.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {description && (
        <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  stepButton: {
    width: 52,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderLeftWidth: 1,
  },
  largeStepButton: {
    backgroundColor: "rgba(236, 72, 153, 0.1)",
  },
  valueContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  valueText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  unitText: {
    fontSize: 14,
    marginTop: 2,
  },
  presetsContainer: {
    marginTop: 12,
  },
  presetsLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
    marginTop: 8,
  },
});
