/**
 * 主催チャレンジセクションコンポーネント
 * マイページで主催しているチャレンジ一覧を表示する
 */

import { View, Text, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { mypageUI, mypageText } from "../../ui/theme/tokens";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface Challenge {
  id: number;
  title: string;
  currentCount?: number;
  goalCount?: number;
}

interface HostedChallengeSectionProps {
  challenges: Challenge[] | undefined;
  onChallengePress: (challengeId: number) => void;
}

export function HostedChallengeSection({ challenges, onChallengePress }: HostedChallengeSectionProps) {
  const colors = useColors();

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 100 }}>
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        主催チャレンジ
      </Text>
      
      {challenges && challenges.length > 0 ? (
        <View style={{ gap: 12 }}>
          {challenges.map((challenge) => (
            <Pressable
              key={challenge.id}
              onPress={() => onChallengePress(challenge.id)}
              style={{
                backgroundColor: mypageUI.cardBg,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: mypageUI.hostBorder,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <View style={{ backgroundColor: mypageUI.hostBadgeBg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 }}>
                      <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>主催</Text>
                    </View>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                      {challenge.title}
                    </Text>
                  </View>
                  <Text style={{ color: mypageText.muted, fontSize: 12 }}>
                    {challenge.currentCount || 0} / {challenge.goalCount || 0} 人
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={mypageText.muted} />
              </View>
            </Pressable>
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
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🎯</Text>
          <Text style={{ color: mypageText.muted, fontSize: 14 }}>
            まだチャレンジを主催していません
          </Text>
        </View>
      )}
    </View>
  );
}
