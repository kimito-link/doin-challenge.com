/**
 * プロフィールカードコンポーネント
 * v6.23: 新UIコンポーネント（Button）を使用
 */
import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { useResponsive } from "@/hooks/use-responsive";
import { palette } from "@/theme/tokens/palette";
import { FollowStatusBadge } from "@/components/molecules/follow-gate";
import { TwitterUserCard } from "@/components/molecules/twitter-user-card";
import { mypageUI, mypageText, mypageAccent } from "../ui/theme/tokens";
import { Button } from "@/components/ui/button";

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
        backgroundColor: palette.gray800,
        marginHorizontal: isDesktop ? "auto" : 16,
        marginVertical: 16,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: palette.gray700,
        maxWidth: isDesktop ? 800 : undefined,
        width: isDesktop ? "100%" : undefined,
      }}
    >
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
              showDescription={true}
            />
          </View>
          <FollowStatusBadge isFollowing={isFollowing} />
        </View>

        {/* 統計情報 */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: mypageUI.cardBorder,
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
              {totalContribution}
            </Text>
            <Text style={{ color: mypageText.muted, fontSize: 12 }}>総貢献数</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
              {participationsCount}
            </Text>
            <Text style={{ color: mypageText.muted, fontSize: 12 }}>参加中</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
              {challengesCount}
            </Text>
            <Text style={{ color: mypageText.muted, fontSize: 12 }}>主催</Text>
          </View>
        </View>

        {/* 招待実績 */}
        {invitationStats && invitationStats.totalInvited > 0 && (
          <View
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: mypageUI.cardBorder,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MaterialIcons name="people" size={16} color={mypageAccent.linkPink} />
              <Text style={{ color: mypageAccent.linkPink, fontSize: 14, fontWeight: "bold", marginLeft: 4 }}>
                招待実績
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold" }}>
                  {invitationStats.totalInvited}
                </Text>
                <Text style={{ color: mypageText.muted, fontSize: 12 }}>招待送信</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "bold" }}>
                  {invitationStats.confirmedCount}
                </Text>
                <Text style={{ color: mypageText.muted, fontSize: 12 }}>参加表明済み</Text>
              </View>
            </View>
          </View>
        )}

        {/* アカウント切り替えボタン */}
        <Button
          variant="secondary"
          onPress={onAccountSwitch}
          fullWidth
          icon="swap-horiz"
          style={{
            backgroundColor: mypageUI.switchAccountBg,
            marginTop: 16,
          }}
        >
          <Text style={{ color: mypageText.switchAccount, fontSize: 14, marginLeft: 8 }}>
            別のアカウントでログイン
          </Text>
        </Button>

        <Button
          variant="ghost"
          onPress={onLogout}
          fullWidth
          icon="logout"
          style={{
            backgroundColor: colors.background,
            marginTop: 8,
          }}
        >
          <Text style={{ color: mypageText.logout, fontSize: 14, marginLeft: 8 }}>
            ログアウト
          </Text>
        </Button>
      </View>
    </View>
  );
}
