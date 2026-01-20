import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
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
}

/**
 * Twitterユーザー情報を表示する再利用可能なカードコンポーネント
 * 
 * 使用例:
 * ```tsx
 * <TwitterUserCard
 *   user={{
 *     name: "君斗りんく＠アイドル応援",
 *     username: "idolfunch",
 *     profileImage: "https://...",
 *     followersCount: 170,
 *     description: "アイドル応援アカウント"
 *   }}
 *   size="medium"
 *   showDescription
 *   showFollowers
 * />
 * ```
 */
export function TwitterUserCard({
  user,
  size = "medium",
  showDescription = false,
  showFollowers = true,
  onPress,
  className,
}: TwitterUserCardProps) {
  const colors = useColors();

  // サイズに応じた設定
  const sizeConfig = {
    small: {
      avatarSize: 36,
      nameSize: 14,
      usernameSize: 12,
      followersSize: 11,
      descriptionSize: 12,
      gap: 8,
    },
    medium: {
      avatarSize: 48,
      nameSize: 16,
      usernameSize: 13,
      followersSize: 12,
      descriptionSize: 13,
      gap: 12,
    },
    large: {
      avatarSize: 64,
      nameSize: 18,
      usernameSize: 14,
      followersSize: 13,
      descriptionSize: 14,
      gap: 16,
    },
  };

  const config = sizeConfig[size];

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
      <View className="flex-1" style={{ gap: 2 }}>
        {/* 名前 */}
        <Text
          className="font-bold text-foreground"
          style={{ fontSize: config.nameSize, lineHeight: config.nameSize * 1.3 }}
          numberOfLines={1}
        >
          {user.name || "名前未設定"}
        </Text>

        {/* @username + フォロワー数 */}
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {user.username && (
            <Text
              style={{ fontSize: config.usernameSize, color: color.accentPrimary }}
            >
              @{user.username}
            </Text>
          )}
          {showFollowers && user.followersCount !== undefined && (
            <Text
              className="text-muted"
              style={{ fontSize: config.followersSize }}
            >
              {user.followersCount.toLocaleString()} フォロワー
            </Text>
          )}
        </View>

        {/* description */}
        {showDescription && user.description && (
          <Text
            className="text-muted mt-1"
            style={{ fontSize: config.descriptionSize, lineHeight: config.descriptionSize * 1.5 }}
            numberOfLines={2}
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
          pressed && { opacity: 0.7 },
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
}: {
  user: TwitterUserData;
  size?: "small" | "medium";
  onPress?: () => void;
}) {
  const avatarSize = size === "small" ? 24 : 32;
  const fontSize = size === "small" ? 12 : 14;

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
        className="text-foreground font-medium"
        style={{ fontSize }}
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
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
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
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        {image}
      </Pressable>
    );
  }

  return image;
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#333",
  },
});
