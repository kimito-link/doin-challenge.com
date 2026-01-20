/**
 * 主催チャレンジセクションコンポーネント
 * マイページで主催しているチャレンジ一覧を表示する
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
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
            <TouchableOpacity
              key={challenge.id}
              onPress={() => onChallengePress(challenge.id)}
              style={{
                backgroundColor: "#1A1D21",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: "#DD6500",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <View style={{ backgroundColor: "#DD6500", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 }}>
                      <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "bold" }}>主催</Text>
                    </View>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                      {challenge.title}
                    </Text>
                  </View>
                  <Text style={{ color: "#D1D5DB", fontSize: 12 }}>
                    {challenge.currentCount || 0} / {challenge.goalCount || 0} 人
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#1A1D21",
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#2D3139",
          }}
        >
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🎯</Text>
          <Text style={{ color: "#D1D5DB", fontSize: 14 }}>
            まだチャレンジを主催していません
          </Text>
        </View>
      )}
    </View>
  );
}
