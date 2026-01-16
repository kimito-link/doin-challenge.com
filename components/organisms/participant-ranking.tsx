import { View, Text, FlatList, StyleSheet, Platform } from "react-native";
import { useMemo, useCallback } from "react";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

interface Participant {
  id: number;
  userId: number | null;
  displayName: string;
  username: string | null;
  profileImage: string | null;
  contribution: number;
  companionCount: number;
  message: string | null;
  isAnonymous: boolean;
  createdAt: Date;
}

interface ParticipantRankingProps {
  participants: Participant[];
  maxDisplay?: number;
  showBadges?: boolean;
  title?: string;
}

// ランキングバッジの色
const RANK_COLORS = {
  1: { bg: "#FFD700", text: "#000", gradient: ["#FFD700", "#FFA500"] as const },
  2: { bg: "#C0C0C0", text: "#000", gradient: ["#E8E8E8", "#C0C0C0"] as const },
  3: { bg: "#CD7F32", text: "#fff", gradient: ["#CD7F32", "#8B4513"] as const },
};

// ランキングバッジのアイコン
const RANK_ICONS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

interface RankBadgeProps {
  rank: number;
}

function RankBadge({ rank }: RankBadgeProps) {
  if (rank <= 3) {
    const colors = RANK_COLORS[rank as 1 | 2 | 3];
    const icon = RANK_ICONS[rank as 1 | 2 | 3];
    
    return (
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topRankBadge}
      >
        <Text style={styles.topRankIcon}>{icon}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.rankBadge}>
      <Text style={styles.rankText}>{rank}</Text>
    </View>
  );
}

interface RankItemProps {
  participant: Participant;
  rank: number;
  showBadge: boolean;
}

function RankItem({ participant, rank, showBadge }: RankItemProps) {
  const isTopThree = rank <= 3;
  
  return (
    <View style={[styles.rankItem, isTopThree && styles.rankItemTop]}>
      {/* 順位バッジ */}
      <RankBadge rank={rank} />

      {/* プロフィール画像 */}
      <View style={[styles.avatarContainer, isTopThree && styles.avatarContainerTop]}>
        {participant.profileImage && !participant.isAnonymous ? (
          <Image
            source={{ uri: participant.profileImage }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialIcons
              name={participant.isAnonymous ? "person-off" : "person"}
              size={isTopThree ? 24 : 20}
              color="#6B7280"
            />
          </View>
        )}
        
        {/* トップ3のハイライト */}
        {isTopThree && (
          <View style={[styles.avatarRing, { borderColor: RANK_COLORS[rank as 1 | 2 | 3].bg }]} />
        )}
      </View>

      {/* ユーザー情報 */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, isTopThree && styles.userNameTop]} numberOfLines={1}>
          {participant.isAnonymous ? "匿名" : participant.displayName}
        </Text>
        {participant.username && !participant.isAnonymous && (
          <Text style={styles.userHandle} numberOfLines={1}>
            @{participant.username}
          </Text>
        )}
      </View>

      {/* 貢献数 */}
      <View style={styles.contributionContainer}>
        <Text style={[styles.contributionValue, isTopThree && styles.contributionValueTop]}>
          {participant.contribution}
        </Text>
        <Text style={styles.contributionLabel}>貢献</Text>
      </View>

      {/* バッジ表示（オプション） */}
      {showBadge && isTopThree && (
        <View style={[styles.achievementBadge, { backgroundColor: RANK_COLORS[rank as 1 | 2 | 3].bg }]}>
          <MaterialIcons name="star" size={12} color={RANK_COLORS[rank as 1 | 2 | 3].text} />
        </View>
      )}
    </View>
  );
}

/**
 * 参加者ランキングコンポーネント
 * 貢献数の多い順に参加者を表示
 */
export function ParticipantRanking({
  participants,
  maxDisplay = 10,
  showBadges = true,
  title = "貢献ランキング",
}: ParticipantRankingProps) {
  // 貢献数でソートしてランキングを作成
  const rankedParticipants = useMemo(() => {
    return [...participants]
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, maxDisplay)
      .map((p, index) => ({
        ...p,
        rank: index + 1,
      }));
  }, [participants, maxDisplay]);

  const renderItem = useCallback(
    ({ item }: { item: Participant & { rank: number } }) => (
      <RankItem
        participant={item}
        rank={item.rank}
        showBadge={showBadges}
      />
    ),
    [showBadges]
  );

  const keyExtractor = useCallback(
    (item: Participant & { rank: number }) => `rank-${item.id}`,
    []
  );

  if (rankedParticipants.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <MaterialIcons name="emoji-events" size={48} color="#4B5563" />
          <Text style={styles.emptyText}>まだ参加者がいません</Text>
        </View>
      </View>
    );
  }

  // 統計情報
  const totalContribution = participants.reduce((sum, p) => sum + p.contribution, 0);
  const avgContribution = participants.length > 0 
    ? (totalContribution / participants.length).toFixed(1) 
    : "0";

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statText}>
            平均: {avgContribution}貢献
          </Text>
        </View>
      </View>

      {/* ランキングリスト */}
      <FlatList
        data={rankedParticipants}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />

      {/* もっと見る（参加者が多い場合） */}
      {participants.length > maxDisplay && (
        <View style={styles.moreIndicator}>
          <Text style={styles.moreText}>
            他 {participants.length - maxDisplay}人の参加者
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * コンパクト版ランキング（トップ3のみ表示）
 */
export function TopThreeRanking({ participants }: { participants: Participant[] }) {
  const topThree = useMemo(() => {
    return [...participants]
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3);
  }, [participants]);

  if (topThree.length === 0) {
    return null;
  }

  return (
    <View style={styles.topThreeContainer}>
      {/* 2位（左） */}
      {topThree[1] && (
        <View style={styles.topThreeItem}>
          <View style={[styles.topThreeBadge, { backgroundColor: RANK_COLORS[2].bg }]}>
            <Text style={styles.topThreeBadgeText}>2</Text>
          </View>
          <View style={styles.topThreeAvatarSmall}>
            {topThree[1].profileImage && !topThree[1].isAnonymous ? (
              <Image
                source={{ uri: topThree[1].profileImage }}
                style={styles.topThreeAvatarImg}
                contentFit="cover"
              />
            ) : (
              <MaterialIcons name="person" size={24} color="#6B7280" />
            )}
          </View>
          <Text style={styles.topThreeName} numberOfLines={1}>
            {topThree[1].isAnonymous ? "匿名" : topThree[1].displayName}
          </Text>
          <Text style={styles.topThreeScore}>{topThree[1].contribution}</Text>
        </View>
      )}

      {/* 1位（中央・大きく） */}
      {topThree[0] && (
        <View style={[styles.topThreeItem, styles.topThreeItemFirst]}>
          <View style={[styles.topThreeBadge, styles.topThreeBadgeFirst, { backgroundColor: RANK_COLORS[1].bg }]}>
            <Text style={[styles.topThreeBadgeText, { color: RANK_COLORS[1].text }]}>1</Text>
          </View>
          <View style={styles.topThreeAvatarLarge}>
            {topThree[0].profileImage && !topThree[0].isAnonymous ? (
              <Image
                source={{ uri: topThree[0].profileImage }}
                style={styles.topThreeAvatarImgLarge}
                contentFit="cover"
              />
            ) : (
              <MaterialIcons name="person" size={32} color="#6B7280" />
            )}
          </View>
          <Text style={[styles.topThreeName, styles.topThreeNameFirst]} numberOfLines={1}>
            {topThree[0].isAnonymous ? "匿名" : topThree[0].displayName}
          </Text>
          <Text style={[styles.topThreeScore, styles.topThreeScoreFirst]}>
            {topThree[0].contribution}
          </Text>
        </View>
      )}

      {/* 3位（右） */}
      {topThree[2] && (
        <View style={styles.topThreeItem}>
          <View style={[styles.topThreeBadge, { backgroundColor: RANK_COLORS[3].bg }]}>
            <Text style={[styles.topThreeBadgeText, { color: RANK_COLORS[3].text }]}>3</Text>
          </View>
          <View style={styles.topThreeAvatarSmall}>
            {topThree[2].profileImage && !topThree[2].isAnonymous ? (
              <Image
                source={{ uri: topThree[2].profileImage }}
                style={styles.topThreeAvatarImg}
                contentFit="cover"
              />
            ) : (
              <MaterialIcons name="person" size={24} color="#6B7280" />
            )}
          </View>
          <Text style={styles.topThreeName} numberOfLines={1}>
            {topThree[2].isAnonymous ? "匿名" : topThree[2].displayName}
          </Text>
          <Text style={styles.topThreeScore}>{topThree[2].contribution}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1D21",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerStats: {
    backgroundColor: "#2D3139",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  listContent: {
    gap: 8,
  },
  rankItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  rankItemTop: {
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  topRankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  topRankIcon: {
    fontSize: 20,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2D3139",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "bold",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarContainerTop: {
    marginRight: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: "#2D3139",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  userNameTop: {
    fontSize: 15,
  },
  userHandle: {
    color: "#6B7280",
    fontSize: 12,
  },
  contributionContainer: {
    alignItems: "flex-end",
  },
  contributionValue: {
    color: "#DD6500",
    fontSize: 18,
    fontWeight: "bold",
  },
  contributionValueTop: {
    fontSize: 20,
  },
  contributionLabel: {
    color: "#6B7280",
    fontSize: 11,
  },
  achievementBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  moreIndicator: {
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2D3139",
    marginTop: 8,
  },
  moreText: {
    color: "#6B7280",
    fontSize: 13,
  },
  // トップ3表示用スタイル
  topThreeContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  topThreeItem: {
    alignItems: "center",
    width: 80,
  },
  topThreeItemFirst: {
    width: 100,
    marginBottom: 16,
  },
  topThreeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  topThreeBadgeFirst: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  topThreeBadgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  topThreeAvatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2D3139",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  topThreeAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2D3139",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  topThreeAvatarImg: {
    width: 48,
    height: 48,
  },
  topThreeAvatarImgLarge: {
    width: 64,
    height: 64,
  },
  topThreeName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
  },
  topThreeNameFirst: {
    fontSize: 14,
    fontWeight: "bold",
  },
  topThreeScore: {
    color: "#DD6500",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  topThreeScoreFirst: {
    fontSize: 18,
  },
});
