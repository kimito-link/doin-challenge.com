/**
 * プロフィールカードコンポーネント
 * ログイン済みユーザーのプロフィール情報を表示
 */
import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";
import { useResponsive } from "@/hooks/use-responsive";
import { FollowStatusBadge } from "@/components/molecules/follow-gate";
import { TwitterUserCard } from "@/components/molecules/twitter-user-card";
import { mypageUI, mypageText, mypageGradient } from "../ui/theme/tokens";

interface ProfileCardProps {
  user: {
    twitterId?: string;
    name?: string | null;
    username?: string | null;
    profileImage?: string | null;
    followersCount?: number | null;
    description?: string | null;
  } | null;
  isFollowing: boolean;
  totalContribution: number;
  participationsCount: number;
  challengesCount: number;
  // v6.08: 招待実績
  invitationStats?: {
    totalInvited: number;
    confirmedCount: number;
  };
  onAccountSwitch: () => void;
  onLogout: () => void;
}

export function ProfileCard({
  user,
  isFollowing,
  totalContribution,
  participationsCount,
  challengesCount,
  invitationStats,
  onAccountSwitch,
  onLogout,
}: ProfileCardProps) {
  const colors = useColors();
  const { isDesktop } = useResponsive();

  return (
    <View
      style={{
        backgroundColor: mypageUI.cardBg,
        marginHorizontal: isDesktop ? "auto" : 16,
        marginVertical: 16,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: mypageUI.cardBorder,
        maxWidth: isDesktop ? 800 : undefined,
        width: isDesktop ? "100%" : undefined,
      }}
    >
      <LinearGradient
        colors={[...mypageGradient.profileHeader]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 4 }}
      />
      <View style={{ padding: 16 }}>
        {/* Twitterユーザーカード */}
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <TwitterUserCard
              user={{
                twitterId: user?.twitterId,
                name: user?.name || "ゲスト",
                username: user?.username ?? undefined,
                profileImage: user?.profileImage ?? undefined,
                followersCount: user?.followersCount ?? undefined,
                description: user?.description ?? undefined,
              }}
              size="large"
              showFollowers
              showDescription
            />
          </View>
          <FollowStatusBadge isFollowing={isFollowing} />
        </View>

        {/* 統計 */}
        <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: mypageText.statPink, fontSize: 24, fontWeight: "bold" }}>
              {totalContribution}
            </Text>
            <Text style={{ color: mypageText.muted, fontSize: 12 }}>総貢献度</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: mypageText.statPurple, fontSize: 24, fontWeight: "bold" }}>
              {participationsCount}
            </Text>
            <Text style={{ color: mypageText.muted, fontSize: 12 }}>参加チャレンジ</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: mypageText.statOrange, fontSize: 24, fontWeight: "bold" }}>
              {challengesCount}
            </Text>
            <Text style={{ color: mypageText.muted, fontSize: 12 }}>主催</Text>
          </View>
        </View>

        {/* v6.08: 招待実績 */}
        {invitationStats && (invitationStats.totalInvited > 0 || invitationStats.confirmedCount > 0) && (
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MaterialIcons name="people" size={18} color={mypageText.muted} />
              <Text style={{ color: mypageText.muted, fontSize: 14, marginLeft: 4, fontWeight: "600" }}>
                友達招待実績
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#10B981", fontSize: 24, fontWeight: "bold" }}>
                  {invitationStats.totalInvited}
                </Text>
                <Text style={{ color: mypageText.muted, fontSize: 12 }}>招待した人数</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#3B82F6", fontSize: 24, fontWeight: "bold" }}>
                  {invitationStats.confirmedCount}
                </Text>
                <Text style={{ color: mypageText.muted, fontSize: 12 }}>参加表明済み</Text>
              </View>
            </View>
          </View>
        )}

        {/* アカウント切り替えボタン */}
        <TouchableOpacity
          onPress={onAccountSwitch}
          style={{
            backgroundColor: mypageUI.switchAccountBg,
            borderRadius: 8,
            padding: 12,
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="swap-horiz" size={20} color={mypageText.switchAccount} />
          <Text style={{ color: mypageText.switchAccount, fontSize: 14, marginLeft: 8 }}>
            別のアカウントでログイン
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLogout}
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="logout" size={20} color={mypageText.logout} />
          <Text style={{ color: mypageText.logout, fontSize: 14, marginLeft: 8 }}>
            ログアウト
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
