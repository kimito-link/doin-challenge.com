import { Text, View, ScrollView, TouchableOpacity, FlatList, RefreshControl, Alert } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/app-header";

// バッジアイコンマッピング
const badgeIcons: Record<string, string> = {
  "🌟": "star",
  "🏆": "emoji-events",
  "🎯": "gps-fixed",
  "👑": "workspace-premium",
  "🔥": "local-fire-department",
  "💎": "diamond",
  "🎵": "music-note",
  "🎤": "mic",
  "🎉": "celebration",
};

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"challenges" | "badges">("challenges");

  const parsedUserId = parseInt(userId || "0");

  const { data: profile, isLoading, refetch } = trpc.profiles.get.useQuery(
    { userId: parsedUserId },
    { enabled: !!userId }
  ) as any;

  const isOwnProfile = user?.id === parsedUserId;

  // フォロー状態を取得
  const { data: isFollowing, refetch: refetchFollowStatus } = trpc.follows.isFollowing.useQuery(
    { followeeId: parsedUserId },
    { enabled: !!user && !isOwnProfile && parsedUserId > 0 }
  );

  // フォロワー数を取得
  const { data: followerCount } = trpc.follows.followerCount.useQuery(
    { userId: parsedUserId },
    { enabled: parsedUserId > 0 }
  );

  // フォロー中数を取得
  const { data: followingCount } = trpc.follows.followingCount.useQuery(
    { userId: parsedUserId },
    { enabled: parsedUserId > 0 }
  );

  // フォロー/フォロー解除のミューテーション
  const followMutation = trpc.follows.follow.useMutation({
    onSuccess: () => {
      refetchFollowStatus();
      Alert.alert("フォローしました", "新着チャレンジの通知を受け取れます");
    },
    onError: (error) => {
      Alert.alert("エラー", error.message);
    },
  });

  const unfollowMutation = trpc.follows.unfollow.useMutation({
    onSuccess: () => {
      refetchFollowStatus();
    },
    onError: (error) => {
      Alert.alert("エラー", error.message);
    },
  });

  // バッジはプロフィールから取得
  const badges = profile?.badges || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await refetchFollowStatus();
    setRefreshing(false);
  };

  const handleFollowToggle = () => {
    if (!user) {
      Alert.alert("ログインが必要です", "フォローするにはログインしてください");
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate({ followeeId: parsedUserId });
    } else {
      followMutation.mutate({
        followeeId: parsedUserId,
        followeeName: profile?.user?.name,
        followeeImage: (profile?.user as any)?.profileImage || undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer containerClassName="bg-[#0D1117]">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer containerClassName="bg-[#0D1117]">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#9CA3AF" }}>プロフィールが見つかりません</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16, padding: 12 }}
          >
            <Text style={{ color: "#DD6500" }}>戻る</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-[#0D1117]">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DD6500" />
        }
      >
        {/* ヘッダー */}
        <AppHeader 
          title="動員ちゃれんじ" 
          showCharacters={false}
          rightElement={
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8 }}>戻る</Text>
            </TouchableOpacity>
          }
        />
        <LinearGradient
          colors={["#DD6500", "#EC4899", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 20, paddingTop: 16 }}
        >

          <View style={{ alignItems: "center" }}>
            {(profile.user as any)?.profileImage ? (
              <Image
                source={{ uri: (profile.user as any).profileImage }}
                style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#1E293B",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "#fff",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 40, fontWeight: "bold" }}>
                  {profile.user?.name?.charAt(0) || "?"}
                </Text>
              </View>
            )}

            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 12 }}>
              {profile.user?.name || "名前未設定"}
            </Text>
            {(profile.user as any)?.username && (
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 }}>
                @{(profile.user as any).username}
              </Text>
            )}

            {/* フォローボタン（自分以外のプロフィールの場合） */}
            {!isOwnProfile && user && (
              <TouchableOpacity
                onPress={handleFollowToggle}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: isFollowing ? "rgba(255,255,255,0.2)" : "#fff",
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: followMutation.isPending || unfollowMutation.isPending ? 0.6 : 1,
                }}
              >
                <MaterialIcons 
                  name={isFollowing ? "check" : "person-add"} 
                  size={18} 
                  color={isFollowing ? "#fff" : "#DD6500"} 
                />
                <Text style={{ 
                  color: isFollowing ? "#fff" : "#DD6500", 
                  fontSize: 14, 
                  fontWeight: "bold",
                  marginLeft: 6,
                }}>
                  {isFollowing ? "フォロー中" : "フォローする"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* フォロー数・フォロワー数 */}
        <View style={{ 
          flexDirection: "row", 
          backgroundColor: "#161B22", 
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#2D3139",
        }}>
          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/following", params: { userId: userId } })}
            style={{ flexDirection: "row", alignItems: "center", marginRight: 24 }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {followingCount || 0}
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 4 }}>
              フォロー中
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/followers", params: { userId: userId } })}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {followerCount || 0}
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 4 }}>
              フォロワー
            </Text>
          </TouchableOpacity>
        </View>

        {/* 統計 */}
        <View style={{ flexDirection: "row", backgroundColor: "#161B22", padding: 16 }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#DD6500", fontSize: 24, fontWeight: "bold" }}>
              {profile.stats?.totalContribution || 0}
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>総貢献度</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#2D3139" }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#EC4899", fontSize: 24, fontWeight: "bold" }}>
              {profile.stats?.participationCount || 0}
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>参加チャレンジ</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#2D3139" }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#8B5CF6", fontSize: 24, fontWeight: "bold" }}>
              {profile.stats?.hostedCount || 0}
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>主催数</Text>
          </View>
        </View>

        {/* タブ */}
        <View style={{ flexDirection: "row", backgroundColor: "#0D1117", borderBottomWidth: 1, borderBottomColor: "#2D3139" }}>
          <TouchableOpacity
            onPress={() => setActiveTab("challenges")}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: activeTab === "challenges" ? "#DD6500" : "transparent",
            }}
          >
            <Text style={{ color: activeTab === "challenges" ? "#DD6500" : "#9CA3AF", fontWeight: "600" }}>
              参加履歴
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("badges")}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: activeTab === "badges" ? "#DD6500" : "transparent",
            }}
          >
            <Text style={{ color: activeTab === "badges" ? "#DD6500" : "#9CA3AF", fontWeight: "600" }}>
              バッジ
            </Text>
          </TouchableOpacity>
        </View>

        {/* コンテンツ */}
        <View style={{ padding: 16 }}>
          {activeTab === "challenges" ? (
            profile.recentParticipations && profile.recentParticipations.length > 0 ? (
              profile.recentParticipations.map((participation: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push({
                    pathname: "/event/[id]",
                    params: { id: participation.challengeId?.toString() || "0" },
                  })}
                  style={{
                    backgroundColor: "#161B22",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#2D3139",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                    {participation.challengeTitle || "チャレンジ"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                    <MaterialIcons name="people" size={16} color="#9CA3AF" />
                    <Text style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 4 }}>
                      貢献度: {participation.contribution || 0}
                    </Text>
                    {participation.friendsCount > 0 && (
                      <>
                        <Text style={{ color: "#6B7280", marginHorizontal: 8 }}>•</Text>
                        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                          +{participation.friendsCount}人連れ
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ alignItems: "center", padding: 32 }}>
                <MaterialIcons name="event-busy" size={48} color="#4B5563" />
                <Text style={{ color: "#9CA3AF", marginTop: 12 }}>参加履歴がありません</Text>
              </View>
            )
          ) : (
            badges && badges.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {badges.map((badge: any, index: number) => (
                  <View
                    key={index}
                    style={{
                      width: "33.33%",
                      padding: 8,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: badge.color || "#DD6500",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{badge.icon || "🏆"}</Text>
                    </View>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", textAlign: "center" }}>
                      {badge.name}
                    </Text>
                    <Text style={{ color: "#9CA3AF", fontSize: 10, textAlign: "center", marginTop: 2 }}>
                      {new Date(badge.earnedAt).toLocaleDateString("ja-JP")}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: "center", padding: 32 }}>
                <MaterialIcons name="emoji-events" size={48} color="#4B5563" />
                <Text style={{ color: "#9CA3AF", marginTop: 12 }}>バッジがありません</Text>
              </View>
            )
          )}
        </View>

        {/* 編集ボタン（自分のプロフィールの場合） */}
        {isOwnProfile && (
          <View style={{ padding: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: "#2D3139",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>プロフィールを編集</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
