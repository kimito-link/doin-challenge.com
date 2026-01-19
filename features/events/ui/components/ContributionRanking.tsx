// features/events/ui/components/ContributionRanking.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import type { FanVM } from "../../mappers/participationVM";

export type RankingItemVM = {
  key: string;
  rank: number;
  twitterId: string;
  displayName: string;
  username?: string | null;
  profileImage?: string | null;
  valueText: string; // "3人" / "10pt" など表示済み
};

export type ContributionRankingProps = {
  ranking: RankingItemVM[];
  onPressFan?: (fan: FanVM) => void;
  maxItems?: number;
};

export function ContributionRanking(props: ContributionRankingProps) {
  const { ranking, onPressFan, maxItems = 10 } = props;
  const colors = useColors();

  if (!ranking.length) {
    return (
      <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          ランキングはまだありません
        </Text>
      </View>
    );
  }

  const displayRanking = ranking.slice(0, maxItems);

  // 順位に応じた色を取得
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "#FFD700"; // 金
      case 2: return "#C0C0C0"; // 銀
      case 3: return "#CD7F32"; // 銅
      default: return colors.muted;
    }
  };

  return (
    <View style={styles.container}>
      {displayRanking.map((item) => {
        const fan: FanVM = {
          twitterId: item.twitterId,
          username: item.username ?? null,
          displayName: item.displayName,
          profileImage: item.profileImage ?? null,
        };

        return (
          <TouchableOpacity
            key={item.key}
            disabled={!onPressFan}
            onPress={() => onPressFan?.(fan)}
            style={[
              styles.card,
              { 
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }
            ]}
            activeOpacity={onPressFan ? 0.7 : 1}
          >
            {/* 順位 */}
            <View style={styles.rankContainer}>
              <Text style={[
                styles.rank, 
                { color: getRankColor(item.rank) }
              ]}>
                {item.rank}
              </Text>
            </View>

            {/* アバター */}
            {item.profileImage ? (
              <Image 
                source={{ uri: item.profileImage }} 
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { borderColor: colors.border }]} />
            )}

            {/* 名前 */}
            <View style={styles.content}>
              <Text style={[styles.displayName, { color: colors.foreground }]}>
                {item.displayName}
              </Text>
              {!!item.username && (
                <Text style={[styles.username, { color: colors.muted }]}>
                  @{item.username}
                </Text>
              )}
            </View>

            {/* 貢献度 */}
            <Text style={[styles.value, { color: colors.primary }]}>
              {item.valueText}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  emptyContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  rankContainer: {
    width: 28,
    alignItems: "center",
  },
  rank: {
    fontSize: 16,
    fontWeight: "700",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  displayName: {
    fontSize: 14,
    fontWeight: "600",
  },
  username: {
    marginTop: 2,
    fontSize: 12,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
});
