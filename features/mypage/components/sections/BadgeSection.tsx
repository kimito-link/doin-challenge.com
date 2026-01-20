/**
 * バッジセクションコンポーネント
 * マイページで獲得バッジを表示する
 */

import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { mypageUI, mypageText } from "../../ui/theme/tokens";

interface Badge {
  id: number;
  badge?: {
    icon?: string;
    name?: string;
  };
}

interface BadgeSectionProps {
  badges: Badge[] | undefined;
}

export function BadgeSection({ badges }: BadgeSectionProps) {
  const colors = useColors();

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        獲得バッジ
      </Text>
      
      {badges && badges.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {badges.map((userBadge) => (
            <View
              key={userBadge.id}
              style={{
                backgroundColor: mypageUI.cardBg,
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
                width: 80,
                borderWidth: 1,
                borderColor: mypageUI.cardBorder,
              }}
            >
              <Text style={{ fontSize: 32 }}>{userBadge.badge?.icon || "🏅"}</Text>
              <Text style={{ color: mypageText.muted, fontSize: 10, marginTop: 4, textAlign: "center" }}>
                {userBadge.badge?.name || "バッジ"}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: mypageUI.cardBg,
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
            borderWidth: 1,
            borderColor: mypageUI.cardBorder,
          }}
        >
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🏅</Text>
          <Text style={{ color: mypageText.muted, fontSize: 14 }}>
            まだバッジを獲得していません
          </Text>
        </View>
      )}
    </View>
  );
}
