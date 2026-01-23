import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";
import { color } from "@/theme/tokens";

export interface TwitterUserData {
  /** Twitter ID (例: "1867512383713030149") */
  twitterId?: string;
  /** 表示名 (例: "君斗りんく＠アイドル応援") */
  name: string;
  /** ユーザー名 (例: "idolfunch") */
  username?: string;
  /** プロフィール画像URL */
  profileImage?: string;
  /** フォロワー数 */
  followersCount?: number;
  /** プロフィール文（description） */
  description?: string;
}

export interface TwitterUserCardProps {
  /** ユーザーデータ */
  user: TwitterUserData;
  /** カードのサイズ */
  size?: "small" | "medium" | "large";
  /** descriptionを表示するか */
  showDescription?: boolean;
  /** フォロワー数を表示するか */
  showFollowers?: boolean;
  /** タップ時のコールバック */
  onPress?: () => void;
  /** 追加のスタイル */
  className?: string;
  /** 
   * 明るい背景（オレンジ/イエローグラデーション等）の上で使用する場合はtrue
   * v6.63: 視認性改善 - 黒テキスト + 白バッジ
   */
  lightBackground?: boolean;
}

/**
 * 明るい背景用のカラー定義
 * WCAG AA準拠（コントラスト比 4.5:1 以上）
 */
const LIGHT_BG_COLORS = {
  textPrimary: "#111827",           // 黒系テキスト
  textSecondary: "rgba(17,24,39,0.78)",  // セカンダリテキスト
  textMuted: "rgba(17,24,39,0.62)",      // ミュートテキスト
  badgeBg: "rgba(255,255,255,0.92)",     // 白半透明バッジ背景
  badgeBorder: "rgba(255,255,255,0.6)",  // バッジボーダー
  teal: "#0F766E",                       // ティール（フォロワーアイコン）
} as const;

/**
 * Twitterユーザー情報を表示する再利用可能なカードコンポーネント
 * 
 * v6.57: 視認性改善
 * - @usernameとフォロワー数にバッジスタイル（背景色+ボーダー）を追加
 * - Twitterアイコンを追加
 * - テーマトークンから色を取得するように統一
 * 
 * v6.63: 明るい背景対応
 * - lightBackground propで黒テキスト + 白バッジに切り替え
 * - WCAG AA準拠のコントラスト比
 */
export function TwitterUserCard({
  user,
  size = "medium",
  showDescription = false,
  showFollowers = true,
  onPress,
  className,
  lightBackground = false,
}: TwitterUserCardProps) {
  // サイズに応じた設定
  const sizeConfig = {
    small: {
      avatarSize: 36,
      nameSize: 14,
      usernameSize: 11,
      followersSize: 10,
      descriptionSize: 12,
      gap: 8,
      badgePaddingH: 6,
      badgePaddingV: 2,
      iconSize: 12,
    },
    medium: {
      avatarSize: 48,
      nameSize: 16,
      usernameSize: 12,
      followersSize: 11,
      descriptionSize: 13,
      gap: 12,
      badgePaddingH: 8,
      badgePaddingV: 3,
      iconSize: 13,
    },
    large: {
      avatarSize: 64,
      nameSize: 18,
      usernameSize: 13,
      followersSize: 12,
      descriptionSize: 14,
      gap: 16,
      badgePaddingH: 10,
      badgePaddingV: 4,
      iconSize: 14,
    },
  };

  const config = sizeConfig[size];

  // 背景に応じた色を選択
  const textColor = lightBackground ? LIGHT_BG_COLORS.textPrimary : color.textPrimary;
  const mutedColor = lightBackground ? LIGHT_BG_COLORS.textMuted : color.textMuted;
  
  // バッジの色設定
  const usernameBadgeStyle = lightBackground
    ? {
        backgroundColor: LIGHT_BG_COLORS.badgeBg,
        borderColor: LIGHT_BG_COLORS.badgeBorder,
      }
    : {
        backgroundColor: `${color.twitter}20`,
        borderColor: `${color.twitter}60`,
      };
  
  const usernameTextColor = lightBackground ? LIGHT_BG_COLORS.textPrimary : color.twitter;
  const usernameIconColor = lightBackground ? LIGHT_BG_COLORS.textPrimary : color.twitter;
  
  const followersBadgeStyle = lightBackground
    ? {
        backgroundColor: LIGHT_BG_COLORS.badgeBg,
        borderColor: LIGHT_BG_COLORS.badgeBorder,
      }
    : {
        backgroundColor: `${color.accentAlt}20`,
        borderColor: `${color.accentAlt}60`,
      };
  
  const followersTextColor = lightBackground ? LIGHT_BG_COLORS.textPrimary : color.accentAlt;
  const followersIconColor = lightBackground ? LIGHT_BG_COLORS.teal : color.accentAlt;

  const content = (
    <View className={cn("flex-row items-center", className)} style={{ gap: config.gap }}>
      {/* プロフィール画像 */}
      <Image
        source={{ uri: user.profileImage || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" }}
        style={[
          styles.avatar,
          {
            width: config.avatarSize,
            height: config.avatarSize,
            borderRadius: config.avatarSize / 2,
          },
        ]}
        contentFit="cover"
        transition={200}
      />

      {/* ユーザー情報 */}
      <View className="flex-1" style={{ gap: 4 }}>
        {/* 名前 */}
        <Text
          className="font-bold"
          style={{ 
            fontSize: config.nameSize, 
            lineHeight: config.nameSize * 1.3,
            color: textColor,
          }}
          numberOfLines={1}
        >
          {user.name || "名前未設定"}
        </Text>

        {/* @username + フォロワー数（バッジスタイル） */}
        <View className="flex-row items-center flex-wrap" style={{ gap: 6 }}>
          {user.username && (
            <View style={[
              styles.badge,
              {
                ...usernameBadgeStyle,
                paddingHorizontal: config.badgePaddingH,
                paddingVertical: config.badgePaddingV,
              }
            ]}>
              <Ionicons 
                name="logo-twitter" 
                size={config.iconSize} 
                color={usernameIconColor} 
                style={{ marginRight: 4 }}
              />
              <Text
                style={{ 
                  fontSize: config.usernameSize, 
                  color: usernameTextColor, 
                  fontWeight: '600',
                }}
              >
                @{user.username}
              </Text>
            </View>
          )}
          {showFollowers && user.followersCount !== undefined && (
            <View style={[
              styles.badge,
              {
                ...followersBadgeStyle,
                paddingHorizontal: config.badgePaddingH,
                paddingVertical: config.badgePaddingV,
              }
            ]}>
              <Ionicons 
                name="people" 
                size={config.iconSize} 
                color={followersIconColor} 
                style={{ marginRight: 4 }}
              />
              <Text
                style={{ 
                  fontSize: config.followersSize, 
                  color: followersTextColor,
                  fontWeight: '600',
                }}
              >
                {user.followersCount.toLocaleString()} フォロワー
              </Text>
            </View>
          )}
        </View>

        {/* description */}
        {showDescription && user.description && (
          <Text
            style={{ 
              fontSize: config.descriptionSize, 
              lineHeight: config.descriptionSize * 1.5, 
              color: mutedColor, 
              marginTop: 4,
              flexWrap: 'wrap',
            }}
          >
            {user.description}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

/**
 * コンパクトなTwitterユーザー表示（アバター + 名前のみ）
 */
export function TwitterUserCompact({
  user,
  size = "small",
  onPress,
  lightBackground = false,
}: {
  user: TwitterUserData;
  size?: "small" | "medium";
  onPress?: () => void;
  lightBackground?: boolean;
}) {
  const avatarSize = size === "small" ? 24 : 32;
  const fontSize = size === "small" ? 12 : 14;
  const textColor = lightBackground ? LIGHT_BG_COLORS.textPrimary : color.textPrimary;

  const content = (
    <View className="flex-row items-center" style={{ gap: 6 }}>
      <Image
        source={{ uri: user.profileImage || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" }}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        }}
        contentFit="cover"
        transition={200}
      />
      <Text
        style={{ fontSize, color: textColor, fontWeight: '500' }}
        numberOfLines={1}
      >
        {user.name || user.username || "名前未設定"}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

/**
 * Twitterアバターのみ表示
 */
export function TwitterAvatar({
  user,
  size = 40,
  onPress,
}: {
  user: TwitterUserData;
  size?: number;
  onPress?: () => void;
}) {
  const image = (
    <Image
      source={{ uri: user.profileImage || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      contentFit="cover"
      transition={200}
    />
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
      >
        {image}
      </Pressable>
    );
  }

  return image;
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: color.surfaceDark,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
});
