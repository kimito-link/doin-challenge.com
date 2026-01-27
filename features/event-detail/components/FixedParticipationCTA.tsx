/**
 * 固定参加表明CTAコンポーネント
 * スクロールしても常に表示される参加表明ボタン
 */
import { View, Text, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";


interface FixedParticipationCTAProps {
  onPress: () => void;
  isVisible: boolean; // 参加済みの場合はfalse
}

export function FixedParticipationCTA({ onPress, isVisible }: FixedParticipationCTAProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  if (!isVisible) {
    return null;
  }

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom + 8,
        paddingTop: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Pressable
        onPress={handlePress}
        accessibilityLabel="参加予定を表明"
        accessibilityRole="button"
        accessibilityHint="イベントへの参加予定を表明します"
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <LinearGradient
          colors={["#FF1493", "#8B008B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="event-available" size={24} color="#FFFFFF" />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "bold",
              marginLeft: 8,
            }}
          >
            参加予定を表明
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
