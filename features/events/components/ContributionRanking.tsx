/**
 * 貢献度ランキングコンポーネント
 * 参加者の貢献度をランキング形式で表示
 */
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { OptimizedAvatar } from "@/components/molecules/optimized-image";
import type { Participation } from "@/types/participation";

interface ContributionRankingProps {
  /** 参加者リスト */
  participations: Participation[];
  /** フォロワーのユーザーIDリスト（優先表示用） */
  followerIds?: number[];
  /** 表示する最大人数（デフォルト: 5） */
  maxDisplay?: number;
}

export function ContributionRanking({
  participations,
  followerIds = [],
  maxDisplay = 5,
}: ContributionRankingProps) {
  const colors = useColors();
  const router = useRouter();
  const followerSet = new Set(followerIds);

  // フォロワーを優先表示（同じ貢献度の場合フォロワーが上）
  const sorted = [...participations]
    .sort((a, b) => {
      const aContrib = b.contribution || 1;
      const bContrib = a.contribution || 1;
      if (aContrib !== bContrib) return aContrib - bContrib;
      // 同じ貢献度の場合、フォロワーを優先
      const aIsFollower = a.userId ? followerSet.has(a.userId) : false;
      const bIsFollower = b.userId ? followerSet.has(b.userId) : false;
      if (aIsFollower && !bIsFollower) return -1;
      if (!aIsFollower && bIsFollower) return 1;
      return 0;
    })
    .slice(0, maxDisplay);

  if (sorted.length === 0) return null;

  // ランキングの色（金・銀・銅）
  const getRankColor = (index: number) => {
    if (index === 0) return "#FFD700";
    if (index === 1) return "#C0C0C0";
    if (index === 2) return "#CD7F32";
    return "#2D3139";
  };

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
        貢献度ランキング
      </Text>
      {sorted.map((p, index) => (
        <View
          key={p.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1A1D21",
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            borderWidth: index === 0 ? 2 : 1,
            borderColor: index === 0 ? "#FFD700" : "#2D3139",
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: getRankColor(index),
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ color: index < 3 ? "#000" : "#fff", fontSize: 12, fontWeight: "bold" }}>
              {index + 1}
            </Text>
          </View>
          <View style={{ marginRight: 12 }}>
            <OptimizedAvatar
              source={p.profileImage && !p.isAnonymous ? { uri: p.profileImage } : undefined}
              size={36}
              fallbackColor="#EC4899"
              fallbackText={p.displayName.charAt(0)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                {p.isAnonymous ? "匿名" : p.displayName}
              </Text>
              {/* 性別アイコン */}
              {p.gender && p.gender !== "unspecified" && (
                <Text style={{ marginLeft: 4, fontSize: 12 }}>
                  {p.gender === "male" ? "👨" : "👩"}
                </Text>
              )}
              {p.userId && followerSet.has(p.userId) && (
                <View
                  style={{
                    marginLeft: 6,
                    backgroundColor: "#8B5CF6",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: colors.foreground, fontSize: 9, fontWeight: "bold" }}>フォロワー</Text>
                </View>
              )}
            </View>
            {/* 都道府県とユーザー名 */}
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
              {p.prefecture && (
                <Text style={{ color: "#6B7280", fontSize: 11 }}>📍{p.prefecture}</Text>
              )}
              {p.username && !p.isAnonymous && (
                <TouchableOpacity
                  onPress={() => {
                    if (p.userId) {
                      router.push({ pathname: "/profile/[userId]", params: { userId: p.userId.toString() } });
                    }
                  }}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Text style={{ color: "#DD6500", fontSize: 11 }}>@{p.username}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#EC4899", fontSize: 18, fontWeight: "bold" }}>+{p.contribution || 1}</Text>
            <Text style={{ color: "#6B7280", fontSize: 10 }}>
              {p.companionCount > 0 ? `(本人+${p.companionCount}人)` : ""}
            </Text>
            {p.followersCount && p.followersCount > 0 && (
              <Text style={{ color: "#9CA3AF", fontSize: 10, marginTop: 2 }}>
                {p.followersCount >= 10000
                  ? `${(p.followersCount / 10000).toFixed(1)}万`
                  : p.followersCount.toLocaleString()}
                フォロワー
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
