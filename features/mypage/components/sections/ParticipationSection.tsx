/**
 * 参加チャレンジセクションコンポーネント
 * マイページで参加中のチャレンジ一覧を表示する
 */

import { View, Text, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { SectionHeader } from "@/components/ui";
import { mypageUI, mypageText } from "../../ui/theme/tokens";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FanEmptyState } from "@/components/organisms/fan-empty-state";
import { typography } from "@/theme/tokens";

interface Participation {
  id: number;
  challengeId: number;
  contribution?: number;
  event?: {
    title?: string;
  };
}

interface ParticipationSectionProps {
  participations: Participation[] | undefined;
  onChallengePress: (challengeId: number) => void;
}

export function ParticipationSection({ participations, onChallengePress }: ParticipationSectionProps) {
  const colors = useColors();

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
      <SectionHeader title="参加チャレンジ" />
      {participations && participations.length > 0 ? (
        <View style={{ gap: 12 }}>
          {participations.map((participation) => (
            <Pressable
              key={participation.id}
              onPress={() => onChallengePress(participation.challengeId)}
              style={{
                backgroundColor: mypageUI.cardBg,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: mypageUI.cardBorder,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                    {participation.event?.title || "チャレンジ"}
                  </Text>
                  <Text style={{ color: mypageText.muted, fontSize: 12, marginTop: 4 }}>
                    貢献度: {participation.contribution || 1}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={mypageText.muted} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <FanEmptyState />
      )}
    </View>
  );
}
