import { Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useResponsive } from "@/hooks/use-responsive";

interface Step {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: "login",
    title: "ログイン",
    description: "Twitterで簡単ログイン",
  },
  {
    icon: "add-circle",
    title: "参加",
    description: "チャレンジに参加する",
  },
  {
    icon: "emoji-events",
    title: "達成",
    description: "みんなで目標達成！",
  },
];

export function OnboardingSteps() {
  const { isDesktop, isTablet } = useResponsive();
  const iconSize = isDesktop ? 32 : 28;
  const containerPadding = isDesktop ? 24 : 16;

  return (
    <View
      style={{
        backgroundColor: "#1A1D21",
        borderRadius: 16,
        padding: containerPadding,
        marginHorizontal: isDesktop ? 24 : 16,
        marginTop: 16,
        marginBottom: 8,
        maxWidth: isDesktop ? 1152 : undefined,
        alignSelf: isDesktop ? "center" : undefined,
        width: isDesktop ? "100%" : undefined,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: isDesktop ? 18 : 16,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        はじめての方へ
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "flex-start",
        }}
      >
        {steps.map((step, index) => (
          <View key={index} style={{ alignItems: "center", flex: 1 }}>
            {/* ステップ番号とアイコン */}
            <View
              style={{
                width: isDesktop ? 64 : 56,
                height: isDesktop ? 64 : 56,
                borderRadius: isDesktop ? 32 : 28,
                backgroundColor: "#DD6500",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <MaterialIcons name={step.icon} size={iconSize} color="#fff" />
            </View>
            {/* ステップ番号 */}
            <View
              style={{
                position: "absolute",
                top: -4,
                right: isDesktop ? "30%" : "25%",
                backgroundColor: "#00427B",
                width: 20,
                height: 20,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                {index + 1}
              </Text>
            </View>
            {/* タイトル */}
            <Text
              style={{
                color: "#fff",
                fontSize: isDesktop ? 15 : 14,
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              {step.title}
            </Text>
            {/* 説明 */}
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: isDesktop ? 13 : 11,
                textAlign: "center",
              }}
            >
              {step.description}
            </Text>
            {/* 矢印（最後以外） */}
            {index < steps.length - 1 && (
              <View
                style={{
                  position: "absolute",
                  right: isDesktop ? -16 : -12,
                  top: isDesktop ? 20 : 16,
                }}
              >
                <MaterialIcons
                  name="chevron-right"
                  size={isDesktop ? 28 : 24}
                  color="#4B5563"
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
