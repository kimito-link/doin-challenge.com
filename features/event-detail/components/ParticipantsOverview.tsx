/**
 * ParticipantsOverview Component
 * 参加者一覧、ランキング、地域マップの概要表示
 */

import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";
import { useColors } from "@/hooks/use-colors";
import { TicketTransferSection } from "@/components/organisms/ticket-transfer-section";
import { TopThreeRanking } from "@/components/organisms/participant-ranking";
import {
  RegionMap,
  ParticipantsList,
  ContributionRanking,
} from "@/features/events/components";
import type { Participation } from "@/types/participation";
import type { FanProfile } from "../types";

interface ParticipantsOverviewProps {
  challengeId: number;
  challengeTitle: string;
  participations: Participation[] | undefined;
  followerIds: number[] | undefined;
  onFanPress: (fan: FanProfile) => void;
}

export function ParticipantsOverview({
  challengeId,
  challengeTitle,
  participations,
  followerIds,
  onFanPress,
}: ParticipantsOverviewProps) {
  const colors = useColors();
  
  if (!participations || participations.length === 0) {
    return (
      <TicketTransferSection
        challengeId={challengeId}
        challengeTitle={challengeTitle}
      />
    );
  }
  
  return (
    <>
      {/* チケット譲渡セクション */}
      <TicketTransferSection
        challengeId={challengeId}
        challengeTitle={challengeTitle}
      />

      {/* 地域別マップ */}
      <RegionMap participations={participations} />

      {/* 一緒に参加している人 */}
      <ParticipantsList 
        participations={participations} 
        onFanPress={(fan) => onFanPress({
          twitterId: fan.twitterId,
          username: fan.username,
          displayName: fan.displayName,
          profileImage: fan.profileImage,
        })}
      />

      {/* 貢献度ランキング */}
      <ContributionRanking 
        participations={participations} 
        followerIds={followerIds || []} 
      />

      {/* 参加者ランキング（トップ3） */}
      {participations.length >= 3 && (
        <View style={{ marginTop: 16, marginHorizontal: 16 }}>
          <View style={{ backgroundColor: color.surface, borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <MaterialIcons name="emoji-events" size={24} color={color.rankGold} />
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>貢献トップ3</Text>
            </View>
            <TopThreeRanking participants={participations} />
          </View>
        </View>
      )}
    </>
  );
}
