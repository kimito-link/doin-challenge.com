import { Text, View, ScrollView, Pressable, RefreshControl, Alert } from "react-native";
import { color } from "@/theme/tokens";
import { useLocalSearchParams } from "expo-router";
import { navigate, navigateBack } from "@/lib/navigation";
import { useState } from "react";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AppHeader } from "@/components/organisms/app-header";
import { RefreshingIndicator } from "@/components/molecules/refreshing-indicator";
import { UserProfileHeader } from "@/components/organisms/user-profile-header";


export default function ProfileScreen() {
  const colors = useColors();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"challenges" | "badges">("challenges");

  const parsedUserId = parseInt(userId || "0");

  // tRPC utils for prefetching
  const utils = trpc.useUtils();

  const { data: profile, isLoading, isFetching, refetch } = trpc.profiles.get.useQuery(
    { userId: parsedUserId },
    { enabled: !!userId }
  ) as any;

  const isOwnProfile = user?.id === parsedUserId;

  // ローディング状態を分離
  const hasData = !!profile;
  const isInitialLoading = isLoading && !hasData;
  const isRefreshing = isFetching && hasData;

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

  if (isInitialLoading) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: color.textMuted }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: color.textMuted }}>プロフィールが見つかりません</Text>
          <Pressable
            onPress={() => navigateBack()}
            style={{ marginTop: 16, padding: 12 }}
          >
            <Text style={{ color: color.hostAccentLegacy }}>戻る</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      {isRefreshing && <RefreshingIndicator isRefreshing={isRefreshing} />}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.hostAccentLegacy} />
        }
      >
        {/* ヘッダー */}
        <AppHeader 
          title="君斗りんくの動員ちゃれんじ" 
          showCharacters={false}
          rightElement={
            <Pressable
              onPress={() => navigateBack()}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
              <Text style={{ color: colors.foreground, marginLeft: 8 }}>戻る</Text>
            </Pressable>
          }
        />
        <UserProfileHeader
          user={{
            twitterId: profile.user?.twitterId || undefined,
            name: profile.user?.name || "名前未設定",
            username: profile.user?.username || undefined,
            profileImage: profile.user?.profileImage || undefined,
            followersCount: profile.user?.followersCount || 0,
            description: profile.user?.description || undefined,
            gender: profile.user?.gender as "male" | "female" | undefined,
          }}
          showFollowButton={!isOwnProfile && !!user}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          isFollowPending={followMutation.isPending || unfollowMutation.isPending}
        />

        {/* フォロー数・フォロワー数 */}
        <View style={{ 
          flexDirection: "row", 
          backgroundColor: color.surfaceDark, 
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: color.border,
          gap: 12,
        }}>
          <Pressable 
            onPress={() => navigate.toFollowing(userId)}
            style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              minHeight: 44,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>
              {followingCount || 0}
            </Text>
            <Text style={{ color: color.textMuted, fontSize: 14, marginLeft: 6 }}>
              フォロー中
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => navigate.toFollowers(userId)}
            style={{ 
              flexDirection: "row", 
              alignItems: "center",
              minHeight: 44,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>
              {followerCount || 0}
            </Text>
            <Text style={{ color: color.textMuted, fontSize: 14, marginLeft: 6 }}>
              フォロワー
            </Text>
          </Pressable>
        </View>

        {/* 統計 */}
        <View style={{ flexDirection: "row", backgroundColor: color.surfaceDark, padding: 16 }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: color.hostAccentLegacy, fontSize: 24, fontWeight: "bold" }}>
              {profile.stats?.totalContribution || 0}
            </Text>
            <Text style={{ color: color.textMuted, fontSize: 12 }}>総貢献度</Text>
          </View>
          <View style={{ width: 1, backgroundColor: color.border }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: color.accentPrimary, fontSize: 24, fontWeight: "bold" }}>
              {profile.stats?.participationCount || 0}
            </Text>
            <Text style={{ color: color.textMuted, fontSize: 12 }}>参加チャレンジ</Text>
          </View>
          <View style={{ width: 1, backgroundColor: color.border }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: color.accentAlt, fontSize: 24, fontWeight: "bold" }}>
              {profile.stats?.hostedCount || 0}
            </Text>
            <Text style={{ color: color.textMuted, fontSize: 12 }}>主催数</Text>
          </View>
        </View>

        {/* タブ */}
        <View style={{ flexDirection: "row", backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: color.border }}>
          <Pressable
            onPress={() => setActiveTab("challenges")}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: activeTab === "challenges" ? color.hostAccentLegacy : "transparent",
            }}
          >
            <Text style={{ color: activeTab === "challenges" ? color.hostAccentLegacy : color.textMuted, fontWeight: "600" }}>
              参加履歴
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("badges")}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: activeTab === "badges" ? color.hostAccentLegacy : "transparent",
            }}
          >
            <Text style={{ color: activeTab === "badges" ? color.hostAccentLegacy : color.textMuted, fontWeight: "600" }}>
              バッジ
            </Text>
          </Pressable>
        </View>

        {/* コンテンツ */}
        <View style={{ padding: 16 }}>
          {activeTab === "challenges" ? (
            profile.recentParticipations && profile.recentParticipations.length > 0 ? (
              profile.recentParticipations.map((participation: any, index: number) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    // プリフェッチ: イベント詳細画面のデータを事前に取得
                    utils.events.getById.prefetch({ id: participation.challengeId || 0 });
                    navigate.toEventDetail(participation.challengeId || 0);
                  }}
                  style={{
                    backgroundColor: color.surfaceDark,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: color.border,
                  }}
                >
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                    {participation.challengeTitle || "チャレンジ"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                    <MaterialIcons name="people" size={16} color={color.textMuted} />
                    <Text style={{ color: color.textMuted, fontSize: 12, marginLeft: 4 }}>
                      貢献度: {participation.contribution || 0}
                    </Text>
                    {participation.friendsCount > 0 && (
                      <>
                        <Text style={{ color: color.textSubtle, marginHorizontal: 8 }}>•</Text>
                        <Text style={{ color: color.textMuted, fontSize: 12 }}>
                          +{participation.friendsCount}人連れ
                        </Text>
                      </>
                    )}
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={{ alignItems: "center", padding: 32 }}>
                <MaterialIcons name="event-busy" size={48} color={color.textSubtle} />
                <Text style={{ color: color.textMuted, marginTop: 12 }}>参加履歴がありません</Text>
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
                        backgroundColor: badge.color || color.hostAccentLegacy,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{badge.icon || "🏆"}</Text>
                    </View>
                    <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600", textAlign: "center" }}>
                      {badge.name}
                    </Text>
                    <Text style={{ color: color.textMuted, fontSize: 12, textAlign: "center", marginTop: 2 }}>
                      {new Date(badge.earnedAt).toLocaleDateString("ja-JP")}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: "center", padding: 32 }}>
                <MaterialIcons name="emoji-events" size={48} color={color.textSubtle} />
                <Text style={{ color: color.textMuted, marginTop: 12 }}>バッジがありません</Text>
              </View>
            )
          )}
        </View>

        {/* 編集ボタン（自分のプロフィールの場合） */}
        {isOwnProfile && (
          <View style={{ padding: 16 }}>
            <Pressable
              onPress={() => navigateBack()}
              style={{
                backgroundColor: color.border,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>プロフィールを編集</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
