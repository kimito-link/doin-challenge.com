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
import { AppHeader } from "@/components/app-header";

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

// ログイン画面のパターンデータ
const loginPatterns = [
  {
    id: 1,
    character: "linkIdol",
    title: "みんな、ちょっと聞いて！😊✨",
    message: "あなたの「推し」が、大きなステージに立つ瞬間を\n一緒に作りたいんだ。",
    highlight: "その景色を、一緒に作ろう！",
    gradientColors: ["#EC4899", "#8B5CF6"] as const,
    accentColor: "#EC4899",
  },
  {
    id: 2,
    character: "linkFull",
    title: "声を届けよう！🎙️✨",
    message: "あなたの応援の声が、\n誰かの心を動かす。",
    highlight: "一緒に推しの夢を叶えよう！",
    gradientColors: ["#8B5CF6", "#3B82F6"] as const,
    accentColor: "#8B5CF6",
  },
  {
    id: 3,
    character: "linkYukkuri",
    title: "ようこそ！🎉",
    message: "動員ちゃれんじへようこそ！\nみんなの想いを集めて、推しの夢を叶えよう。",
    highlight: "さあ、始めよう！",
    gradientColors: ["#F59E0B", "#EF4444"] as const,
    accentColor: "#F59E0B",
  },
  {
    id: 4,
    character: "kontaYukkuri",
    title: "コンタだよ！🦊",
    message: "友達を誘って、みんなで盛り上げよう！\n一人の参加が、大きな波になるんだ。",
    highlight: "一緒に盛り上げよう！",
    gradientColors: ["#DD6500", "#F59E0B"] as const,
    accentColor: "#DD6500",
  },
  {
    id: 5,
    character: "tanuneYukkuri",
    title: "たぬねだよ！🦝",
    message: "チャレンジを作って、\nみんなで目標達成を目指そう！",
    highlight: "目標達成でお祝い！🎉",
    gradientColors: ["#10B981", "#3B82F6"] as const,
    accentColor: "#10B981",
  },
  {
    id: 6,
    character: "linkIdol",
    title: "ステージへの道！🎭✨",
    message: "客席を埋め尽くすファンの声援、\nリアルタイムで流れる応援コメント…",
    highlight: "その感動を、一緒に！",
    gradientColors: ["#EC4899", "#F43F5E"] as const,
    accentColor: "#F43F5E",
  },
];

// ランダムにパターンを選択する関数
const getRandomPattern = () => {
  return loginPatterns[Math.floor(Math.random() * loginPatterns.length)];
};

export default function MyPageScreen() {
  const router = useRouter();
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  const { isFollowing, targetUsername, targetDisplayName, updateFollowStatus } = useFollowStatus();
  const { isDesktop, isTablet } = useResponsive();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginPattern, setLoginPattern] = useState(() => getRandomPattern());

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
      <AppHeader 
        title="動員ちゃれんじ" 
        showCharacters={false}
        isDesktop={isDesktop}
        rightElement={
          isAuthenticated ? (
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
          ) : undefined
        }
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, backgroundColor: "#0D1117" }}>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
          マイページ
        </Text>
      </View>

      {!isAuthenticated ? (
        // 未ログイン状態 - パターン切り替え対応
        <View style={{ flex: 1, backgroundColor: "#0D1117" }}>
          {/* グラデーション背景 */}
          <LinearGradient
            colors={[...loginPattern.gradientColors, "#0D1117"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 300,
              opacity: 0.3,
            }}
          />
          
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1, 
              alignItems: "center", 
              justifyContent: "center", 
              padding: 24,
              paddingBottom: 48,
            }}
          >
            {/* キャラクターと吹き出し */}
            <View style={{ 
              flexDirection: "row", 
              alignItems: "flex-start", 
              marginBottom: 32,
              maxWidth: 400,
              width: "100%",
            }}>
              <Image 
                source={characterImages[loginPattern.character as keyof typeof characterImages]} 
                style={{ 
                  width: loginPattern.character.includes("Yukkuri") ? 80 : 100, 
                  height: loginPattern.character.includes("Yukkuri") ? 80 : 140,
                  marginRight: 16,
                }} 
                contentFit="contain" 
              />
              <View style={{ 
                flex: 1, 
                backgroundColor: `${loginPattern.accentColor}15`,
                borderRadius: 16,
                borderTopLeftRadius: 4,
                padding: 16,
                borderWidth: 1,
                borderColor: `${loginPattern.accentColor}40`,
              }}>
                <Text style={{ 
                  color: "#fff", 
                  fontSize: 18, 
                  fontWeight: "bold",
                  marginBottom: 8,
                }}>
                  {loginPattern.title}
                </Text>
                <Text style={{ 
                  color: "#E5E7EB", 
                  fontSize: 14, 
                  lineHeight: 22,
                }}>
                  {loginPattern.message}
                </Text>
              </View>
            </View>

            {/* ハイライトメッセージ */}
            <View style={{
              backgroundColor: `${loginPattern.accentColor}20`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
              borderLeftWidth: 3,
              borderLeftColor: loginPattern.accentColor,
              maxWidth: 400,
              width: "100%",
            }}>
              <Text style={{ 
                color: loginPattern.accentColor, 
                fontSize: 16, 
                fontWeight: "bold",
                textAlign: "center",
              }}>
                {loginPattern.highlight}
              </Text>
            </View>

            {/* ログインボタン */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoggingIn}
              style={{
                minHeight: 52,
                backgroundColor: isLoggingIn ? "#6B7280" : "#1DA1F2",
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 40,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: isLoggingIn ? 0.7 : 1,
                shadowColor: "#1DA1F2",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
                marginBottom: 16,
              }}
            >
              <MaterialIcons name={isLoggingIn ? "hourglass-empty" : "login"} size={22} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold", marginLeft: 10 }}>
                {isLoggingIn ? "ログイン中..." : "Twitterでログイン"}
              </Text>
            </TouchableOpacity>

            {/* サブテキスト */}
            <Text style={{ color: "#6B7280", fontSize: 12, textAlign: "center", marginBottom: 24 }}>
              ログインするとフォロワー数などの情報を自動取得できます
            </Text>

            {/* パターン切り替えボタン */}
            <TouchableOpacity
              onPress={() => setLoginPattern(getRandomPattern())}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <MaterialIcons name="refresh" size={18} color="#6B7280" />
              <Text style={{ color: "#6B7280", fontSize: 13, marginLeft: 6 }}>
                他のキャラクターを見る
              </Text>
            </TouchableOpacity>

            {/* パターンインジケーター */}
            <View style={{ flexDirection: "row", marginTop: 16, gap: 8 }}>
              {loginPatterns.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setLoginPattern(p)}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: p.id === loginPattern.id ? loginPattern.accentColor : "#3D4148",
                  }}
                />
              ))}
            </View>
          </ScrollView>
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
