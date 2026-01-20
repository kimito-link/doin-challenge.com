// features/home/components/RankingTop3.tsx
import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { homeText, homeUI } from "@/features/home/ui/theme/tokens";
import type { Challenge } from "@/types/challenge";
import { ChallengeCard } from "@/features/home/components/ChallengeCard";

type Props = {
  top3: Challenge[];
  onPress: (id: number) => void;
};

export function RankingTop3({ top3, onPress }: Props) {
  const colors = useColors();

  if (!top3?.length) return null;

  return (
    <View style={{ marginTop: 12, marginHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
        <MaterialIcons name="emoji-events" size={18} color={homeText.accent} />
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>今熱いチャレンジ</Text>
        <Text style={{ color: homeText.muted, fontSize: 12 }}>TOP3</Text>
      </View>

      {/* Top3は「探索カード」を再利用してOK（最小実装） */}
      <View style={{ gap: 10 }}>
        {top3.map((c, idx) => (
          <View
            key={c.id}
            style={{
              borderWidth: 1,
              borderColor: homeUI.border,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {/* 1列表示に寄せるため numColumns=1 を渡す */}
            <ChallengeCard
              challenge={c}
              onPress={() => onPress(c.id)}
              numColumns={1}
              colorIndex={idx}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
