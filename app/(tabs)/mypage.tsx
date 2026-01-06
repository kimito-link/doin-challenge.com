import { FlatList, Text, View, TouchableOpacity, Alert, ScrollView, Linking } from "react-native";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ResponsiveContainer } from "@/components/responsive-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useFollowStatus } from "@/hooks/use-follow-status";
import { useResponsive } from "@/hooks/use-responsive";
import { FollowStatusBadge, FollowPromptBanner } from "@/components/follow-gate";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
  // メインキャラクター（全身）
  linkFull: require("@/assets/images/characters/KimitoLink.png"),
  linkIdol: require("@/assets/images/characters/idolKimitoLink.png"),
  // ゆっくりキャラクター
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png"),
  kontaYukkuri: require("@/assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png"),
  tanuneYukkuri: require("@/assets/images/characters/tanunee/tanuki-yukkuri-smile-mouth-open.png"),
};

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-maru-orange.jpg");

export default function MyPageScreen() {
  const router = useRouter();
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  const { isFollowing, targetUsername, targetDisplayName, updateFollowStatus } = useFollowStatus();
  const { isDesktop, isTablet } = useResponsive();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ログイン時にフォロー状態を更新
  useEffect(() => {
    if (user?.isFollowingTarget !== undefined) {
      updateFollowStatus(user.isFollowingTarget, user.targetAccount);
    }
  }, [user?.isFollowingTarget, user?.targetAccount, updateFollowStatus]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      // Webではリダイレクトするので、ここには戻ってこない
      // Nativeではブラウザが開くので、少し待ってからリセット
      setTimeout(() => setIsLoggingIn(false), 3000);
    }
  };
  
  const { data: myChallenges } = trpc.events.myEvents.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myParticipations } = trpc.participations.myParticipations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myBadges } = trpc.badges.myBadges.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    Alert.alert(
      "ログアウト",
      "ログアウトしますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "ログアウト", style: "destructive", onPress: logout },
      ]
    );
  };

  const handleChallengePress = (challengeId: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: challengeId.toString() },
    });
  };

  // 総貢献度を計算
  const totalContribution = myParticipations?.reduce((sum, p) => sum + (p.contribution || 1), 0) || 0;

  if (loading) {
    return (
      <ScreenContainer containerClassName="bg-[#0D1117]">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D1117" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-[#0D1117]">
      {/* ヘッダー */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: "#0D1117", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
          マイページ
        </Text>
        {isAuthenticated && (
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#1A1D21",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="notifications" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {!isAuthenticated ? (
        // 未ログイン状態
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#0D1117" }}>
          <Image
            source={logoImage}
            style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 24 }}
          />
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            ログインしてください
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
            Twitterでログインすると{"\n"}フォロワー数などの情報を自動取得できます
          </Text>
          
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoggingIn}
            style={{
              backgroundColor: isLoggingIn ? "#6B7280" : "#1DA1F2",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 32,
              flexDirection: "row",
              alignItems: "center",
              opacity: isLoggingIn ? 0.7 : 1,
            }}
          >
            <MaterialIcons name={isLoggingIn ? "hourglass-empty" : "login"} size={20} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 }}>
              {isLoggingIn ? "ログイン中..." : "Twitterでログイン"}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", marginTop: 32 }}>
            <Image source={characterImages.linkYukkuri} style={{ width: 64, height: 64 }} contentFit="contain" />
            <Image source={characterImages.kontaYukkuri} style={{ width: 64, height: 64, marginLeft: -8 }} contentFit="contain" />
            <Image source={characterImages.tanuneYukkuri} style={{ width: 64, height: 64, marginLeft: -8 }} contentFit="contain" />
          </View>
        </View>
      ) : (
        // ログイン済み状態
        <ScrollView style={{ flex: 1, backgroundColor: "#0D1117" }}>
          {/* プロフィールカード */}
          <View
            style={{
              backgroundColor: "#1A1D21",
              marginHorizontal: isDesktop ? "auto" : 16,
              marginVertical: 16,
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#2D3139",
              maxWidth: isDesktop ? 800 : undefined,
              width: isDesktop ? "100%" : undefined,
            }}
          >
            <LinearGradient
              colors={["#EC4899", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 4 }}
            />
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: "#EC4899" }}
                  />
                ) : (
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: "#EC4899",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
                      {user?.name?.charAt(0) || "?"}
                    </Text>
                  </View>
                )}
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                      {user?.name || "ゲスト"}
                    </Text>
                    <FollowStatusBadge isFollowing={isFollowing} />
                  </View>
                  {user?.username && (
                    <Text style={{ color: "#DD6500", fontSize: 14 }}>
                      @{user.username}
                    </Text>
                  )}
                  {user?.followersCount !== undefined && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <MaterialIcons name="people" size={16} color="#9CA3AF" />
                      <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 4 }}>
                        {user.followersCount.toLocaleString()} フォロワー
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* 統計 */}
              <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#0D1117",
                    borderRadius: 12,
                    padding: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#EC4899", fontSize: 24, fontWeight: "bold" }}>
                    {totalContribution}
                  </Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>総貢献度</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#0D1117",
                    borderRadius: 12,
                    padding: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#8B5CF6", fontSize: 24, fontWeight: "bold" }}>
                    {myParticipations?.length || 0}
                  </Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>参加チャレンジ</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#0D1117",
                    borderRadius: 12,
                    padding: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#DD6500", fontSize: 24, fontWeight: "bold" }}>
                    {myChallenges?.length || 0}
                  </Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>主催</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  backgroundColor: "#0D1117",
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="logout" size={20} color="#EF4444" />
                <Text style={{ color: "#EF4444", fontSize: 14, marginLeft: 8 }}>
                  ログアウト
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* フォロー促進バナー（未フォロー時のみ表示） */}
          {!isFollowing && (
            <FollowPromptBanner
              isFollowing={isFollowing}
              targetUsername={targetUsername}
              targetDisplayName={targetDisplayName}
            />
          )}

          {/* アチーブメントリンク */}
          <TouchableOpacity
            onPress={() => router.push("/achievements")}
            style={{
              backgroundColor: "#1A1D21",
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#2D3139",
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#FFD700",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 24 }}>🏆</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                アチーブメント
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                実績を解除してポイントを獲得しよう
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>

          {/* バッジセクション */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              獲得バッジ
            </Text>
            
            {myBadges && myBadges.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {myBadges.map((userBadge: any) => (
                  <View
                    key={userBadge.id}
                    style={{
                      backgroundColor: "#1A1D21",
                      borderRadius: 12,
                      padding: 12,
                      alignItems: "center",
                      width: 100,
                      borderWidth: 1,
                      borderColor: "#2D3139",
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: userBadge.badge?.type === "achievement" ? "#FFD700" : 
                                        userBadge.badge?.type === "milestone" ? "#8B5CF6" :
                                        userBadge.badge?.type === "special" ? "#EC4899" : "#4ADE80",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <MaterialIcons
                        name={
                          userBadge.badge?.type === "achievement" ? "emoji-events" :
                          userBadge.badge?.type === "milestone" ? "flag" :
                          userBadge.badge?.type === "special" ? "star" : "check-circle"
                        }
                        size={24}
                        color="#fff"
                      />
                    </View>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold", textAlign: "center" }} numberOfLines={2}>
                      {userBadge.badge?.name || "バッジ"}
                    </Text>
                    <Text style={{ color: "#6B7280", fontSize: 10, marginTop: 4 }}>
                      {new Date(userBadge.earnedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
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
                <MaterialIcons name="military-tech" size={48} color="#6B7280" />
                <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 12 }}>
                  まだバッジを獲得していません
                </Text>
                <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4, textAlign: "center" }}>
                  チャレンジに参加してバッジを集めよう！
                </Text>
              </View>
            )}
          </View>

          {/* 主催したチャレンジ */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              主催したチャレンジ
            </Text>

            {myChallenges && myChallenges.length > 0 ? (
              myChallenges.map((item) => {
                const eventDate = new Date(item.eventDate);
                const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
                const progress = Math.min(((item.currentValue || 0) / (item.goalValue || 100)) * 100, 100);
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleChallengePress(item.id)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: "#1A1D21",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: "#2D3139",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                          {item.title}
                        </Text>
                        <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}>
                          {formattedDate} {item.venue && `・ ${item.venue}`}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                    </View>
                    
                    {/* 進捗バー */}
                    <View
                      style={{
                        height: 6,
                        backgroundColor: "#2D3139",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <LinearGradient
                        colors={["#EC4899", "#8B5CF6"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          height: "100%",
                          width: `${progress}%`,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                    <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
                      {item.currentValue || 0} / {item.goalValue || 100}{item.goalUnit || "人"} ({Math.round(progress)}%)
                    </Text>
                  </TouchableOpacity>
                );
              })
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
                <MaterialIcons name="flag" size={48} color="#6B7280" />
                <Text style={{ color: "#9CA3AF", marginTop: 8, textAlign: "center" }}>
                  まだチャレンジを作成していません
                </Text>
              </View>
            )}
          </View>

          {/* 参加したチャレンジ */}
          <View style={{ paddingHorizontal: 16, marginBottom: 100 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              参加したチャレンジ
            </Text>

            {myParticipations && myParticipations.length > 0 ? (
              myParticipations.map((item) => (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: "#1A1D21",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#2D3139",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14 }}>
                        チャレンジID: {item.challengeId}
                      </Text>
                      {item.message && (
                        <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }} numberOfLines={2}>
                          {item.message}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ color: "#EC4899", fontSize: 18, fontWeight: "bold" }}>
                        +{item.contribution || 1}
                      </Text>
                      <Text style={{ color: "#6B7280", fontSize: 10 }}>貢献度</Text>
                    </View>
                  </View>
                </View>
              ))
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
                <MaterialIcons name="favorite-border" size={48} color="#6B7280" />
                <Text style={{ color: "#9CA3AF", marginTop: 8, textAlign: "center" }}>
                  まだチャレンジに参加していません
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
