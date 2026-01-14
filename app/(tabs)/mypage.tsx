import { FlatList, Text, View, TouchableOpacity, ScrollView, Linking } from "react-native";
import { useState, useEffect } from "react";
import * as Auth from "@/lib/_core/auth";
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
import { ConfirmModal } from "@/components/confirm-modal";
import { MypageSkeleton } from "@/components/mypage-skeleton";

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
  const { isFollowing, targetUsername, targetDisplayName, updateFollowStatus, refreshFromServer, refreshing } = useFollowStatus();
  const { isDesktop, isTablet } = useResponsive();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginPattern, setLoginPattern] = useState(() => getRandomPattern());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDebugLogin, setShowDebugLogin] = useState(false);

  // デバッグ用テストユーザーでログイン（サンドボックス環境用）
  const handleDebugLogin = async () => {
    const testUser: Auth.User = {
      id: 999999,
      openId: "twitter:999999999",
      name: "テストユーザー",
      email: null,
      loginMethod: "twitter",
      lastSignedIn: new Date(),
      username: "test_user",
      profileImage: "https://pbs.twimg.com/profile_images/1869750131579416576/eXDlbCKD_400x400.jpg",
      followersCount: 1234,
      isFollowingTarget: true,
      targetAccount: { id: "123456", name: "君斗りんく", username: "idolfunch" },
    };
    await Auth.setUserInfo(testUser);
    // ページをリロードして状態を更新
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

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
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/logout");
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
        <AppHeader 
          title="動員ちゃれんじ" 
          showCharacters={false}
          isDesktop={isDesktop}
        />
        <MypageSkeleton />
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
        // 未ログイン状態 - KimitoLinkVoice風UI
        <View style={{ flex: 1, backgroundColor: "#0D1117" }}>
          {/* グラデーション背景 */}
          <LinearGradient
            colors={["#1a237e", "#0D1117"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1, 
              alignItems: "center", 
              padding: 24,
              paddingBottom: 48,
            }}
          >
            {/* ロゴとキャッチコピー */}
            <Image 
              source={logoImage} 
              style={{ 
                width: 80, 
                height: 80,
                borderRadius: 40,
                marginBottom: 16,
              }} 
              contentFit="contain" 
            />
            <Text style={{ 
              color: "#fff", 
              fontSize: 20, 
              fontWeight: "bold",
              marginBottom: 8,
              textAlign: "center",
            }}>
              動員ちゃれんじ
            </Text>
            <Text style={{ 
              color: "#9CA3AF", 
              fontSize: 14,
              marginBottom: 24,
              textAlign: "center",
            }}>
              推しと繋がる、みんなで応援する
            </Text>

            {/* 3つのキャラクターアイコン */}
            <View style={{ 
              flexDirection: "row", 
              justifyContent: "center", 
              gap: 12,
              marginBottom: 32,
            }}>
              <View style={{ alignItems: "center" }}>
                <View style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 28, 
                  borderWidth: 2, 
                  borderColor: "#EC4899",
                  overflow: "hidden",
                }}>
                  <Image 
                    source={characterImages.linkYukkuri} 
                    style={{ width: 52, height: 52 }} 
                    contentFit="cover" 
                  />
                </View>
              </View>
              <View style={{ alignItems: "center" }}>
                <View style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: 32, 
                  borderWidth: 3, 
                  borderColor: "#F59E0B",
                  overflow: "hidden",
                }}>
                  <Image 
                    source={characterImages.kontaYukkuri} 
                    style={{ width: 58, height: 58 }} 
                    contentFit="cover" 
                  />
                </View>
              </View>
              <View style={{ alignItems: "center" }}>
                <View style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 28, 
                  borderWidth: 2, 
                  borderColor: "#10B981",
                  overflow: "hidden",
                }}>
                  <Image 
                    source={characterImages.tanuneYukkuri} 
                    style={{ width: 52, height: 52 }} 
                    contentFit="cover" 
                  />
                </View>
              </View>
            </View>

            {/* 3ステップ説明 */}
            <View style={{ 
              width: "100%", 
              maxWidth: 400,
              marginBottom: 24,
            }}>
              {/* ステップ1 */}
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center",
                marginBottom: 16,
              }}>
                <View style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: 14, 
                  backgroundColor: "#1DA1F2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>1</Text>
                </View>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                  Xアカウントでログイン
                </Text>
              </View>

              {/* ステップ2 - フォロー必須アカウント */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ 
                  flexDirection: "row", 
                  alignItems: "center",
                  marginBottom: 12,
                }}>
                  <View style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: 14, 
                    backgroundColor: "#1DA1F2",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>2</Text>
                  </View>
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                    君斗りんくの2つのアカウントをフォロー
                  </Text>
                </View>
                
                {/* フォロー必須アカウントカード */}
                <View style={{ marginLeft: 40 }}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL("https://x.com/streamerfunch")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#1A1D21",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: "#2D3139",
                    }}
                  >
                    <Image 
                      source={{ uri: "https://pbs.twimg.com/profile_images/1869749892009009152/NLaHfIiB_400x400.jpg" }}
                      style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                        君斗りんく@クリエイター応援
                      </Text>
                      <Text style={{ color: "#1DA1F2", fontSize: 12 }}>@streamerfunch</Text>
                    </View>
                    <MaterialIcons name="open-in-new" size={18} color="#6B7280" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => Linking.openURL("https://x.com/idolfunch")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#1A1D21",
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#2D3139",
                    }}
                  >
                    <Image 
                      source={{ uri: "https://pbs.twimg.com/profile_images/1869750131579416576/eXDlbCKD_400x400.jpg" }}
                      style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                        君斗りんく@アイドル応援
                      </Text>
                      <Text style={{ color: "#1DA1F2", fontSize: 12 }}>@idolfunch</Text>
                    </View>
                    <MaterialIcons name="open-in-new" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ステップ3 */}
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center",
                marginBottom: 24,
              }}>
                <View style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: 14, 
                  backgroundColor: "#1DA1F2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>3</Text>
                </View>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                  プラットフォームへアクセス！
                </Text>
              </View>
            </View>

            {/* 重要説明ボックス */}
            <View style={{
              backgroundColor: "#1E3A5F",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              maxWidth: 400,
              width: "100%",
              borderWidth: 1,
              borderColor: "#2563EB",
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <MaterialIcons name="info" size={18} color="#60A5FA" />
                <Text style={{ color: "#60A5FA", fontSize: 14, fontWeight: "bold", marginLeft: 8 }}>
                  重要：認証されるアカウントについて
                </Text>
              </View>
              <Text style={{ color: "#E5E7EB", fontSize: 13, lineHeight: 20 }}>
                X.comで現在ログイン中のアカウント、または最後に認証したアカウントが連携されます。
              </Text>
            </View>

            {/* Xアカウントで認証ボタン */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoggingIn}
              style={{
                minHeight: 52,
                backgroundColor: isLoggingIn ? "#6B7280" : "#1DA1F2",
                borderRadius: 26,
                paddingVertical: 14,
                paddingHorizontal: 32,
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
                maxWidth: 400,
                width: "100%",
              }}
            >
              <MaterialIcons name="login" size={22} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 10 }}>
                {isLoggingIn ? "認証中..." : "Xアカウントで認証しています"}
              </Text>
            </TouchableOpacity>

            {/* デバッグ用テストユーザーログインボタン（サンドボックス環境用） */}
            <TouchableOpacity
              onPress={handleDebugLogin}
              style={{
                minHeight: 44,
                backgroundColor: "#374151",
                borderRadius: 22,
                paddingVertical: 12,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                maxWidth: 400,
                width: "100%",
                borderWidth: 1,
                borderColor: "#4B5563",
              }}
            >
              <MaterialIcons name="bug-report" size={20} color="#9CA3AF" />
              <Text style={{ color: "#9CA3AF", fontSize: 14, marginLeft: 8 }}>
                テストユーザーでログイン（デバッグ用）
              </Text>
            </TouchableOpacity>

            {/* キャラクター切り替えボタン（削除してシンプルに） */}
            {/* パターンインジケーター（削除してシンプルに） */}
            {/* 代わりにキャラクターの吹き出しメッセージ */}
            <View style={{ 
              flexDirection: "row", 
              alignItems: "flex-start", 
              marginTop: 24,
              maxWidth: 400,
              width: "100%",
            }}>
              <Image 
                source={characterImages[loginPattern.character as keyof typeof characterImages]} 
                style={{ 
                  width: 60, 
                  height: 60,
                  marginRight: 12,
                }} 
                contentFit="contain" 
              />
              <View style={{ 
                flex: 1, 
                backgroundColor: "rgba(236, 72, 153, 0.1)",
                borderRadius: 12,
                borderTopLeftRadius: 4,
                padding: 12,
                borderWidth: 1,
                borderColor: "rgba(236, 72, 153, 0.3)",
              }}>
                <Text style={{ 
                  color: "#E5E7EB", 
                  fontSize: 13, 
                  lineHeight: 20,
                }}>
                  {loginPattern.message}
                </Text>
              </View>
            </View>

            {/* パターン切り替えボタン */}
            <TouchableOpacity
              onPress={() => setLoginPattern(getRandomPattern())}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.05)",
                marginTop: 16,
              }}
            >
              <MaterialIcons name="refresh" size={18} color="#6B7280" />
              <Text style={{ color: "#6B7280", fontSize: 13, marginLeft: 6 }}>
                他のキャラクターのメッセージを見る
              </Text>
            </TouchableOpacity>

            {/* パターンインジケーター */}
            <View style={{ flexDirection: "row", marginTop: 12, gap: 8 }}>
              {loginPatterns.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setLoginPattern(p)}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: p.id === loginPattern.id ? "#EC4899" : "#3D4148",
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
              onRelogin={login}
              refreshing={refreshing}
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

      {/* ログアウト確認モーダル */}
      <ConfirmModal
        visible={showLogoutModal}
        title="ログアウト"
        message="ログアウトしますか？"
        confirmText="ログアウト"
        cancelText="キャンセル"
        confirmStyle="destructive"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        icon="logout"
        iconColor="#EF4444"
      />
    </ScreenContainer>
  );
}
