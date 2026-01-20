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
  onAccountSwitch: () => void;
  onLogout: () => void;
}

export function ProfileCard({
  user,
  isFollowing,
  totalContribution,
  participationsCount,
  challengesCount,
  onAccountSwitch,
  onLogout,
}: ProfileCardProps) {
  const colors = useColors();
  const { isDesktop } = useResponsive();

  return (
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
            <Text style={{ color: "#EC4899", fontSize: 24, fontWeight: "bold" }}>
              {totalContribution}
            </Text>
            <Text style={{ color: "#D1D5DB", fontSize: 12 }}>総貢献度</Text>
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
            <Text style={{ color: "#8B5CF6", fontSize: 24, fontWeight: "bold" }}>
              {participationsCount}
            </Text>
            <Text style={{ color: "#D1D5DB", fontSize: 12 }}>参加チャレンジ</Text>
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
            <Text style={{ color: "#DD6500", fontSize: 24, fontWeight: "bold" }}>
              {challengesCount}
            </Text>
            <Text style={{ color: "#D1D5DB", fontSize: 12 }}>主催</Text>
          </View>
        </View>

        {/* アカウント切り替えボタン */}
        <TouchableOpacity
          onPress={onAccountSwitch}
          style={{
            backgroundColor: "#1E293B",
            borderRadius: 8,
            padding: 12,
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="swap-horiz" size={20} color="#93C5FD" />
          <Text style={{ color: "#93C5FD", fontSize: 14, marginLeft: 8 }}>
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
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={{ color: "#EF4444", fontSize: 14, marginLeft: 8 }}>
            ログアウト
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
