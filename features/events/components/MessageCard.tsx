/**
 * 応援メッセージカードコンポーネント
 * 参加者の応援メッセージを表示
 * 
 * v6.63: 性別表示の改善
 * - 背景色は黒で統一（性別で変えない）
 * - 左ボーダー2pxのみで性別を表現
 * - 男性：青 #3B82F6、女性：ピンク #F472B6、未設定：ニュートラル
 */
import { View, Text, Pressable } from "react-native";
import { navigate } from "@/lib/navigation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { eventText, eventFont, eventUI } from "@/features/events/ui/theme/tokens";
import { OptimizedAvatar } from "@/components/molecules/optimized-image";
import { Button } from "@/components/ui/button";
import type { Participation, Companion } from "@/types/participation";

/** 性別ボーダーの色定義 */
const GENDER_BORDER_COLORS = {
  male: "#3B82F6",      // 青
  female: "#F472B6",    // ピンク（ブランド色と少しずらす）
  neutral: "rgba(255,255,255,0.12)",  // ニュートラル
} as const;

/** 同伴者の表示用型 */
interface CompanionDisplay {
  id: number;
  displayName: string;
  twitterUsername: string | null;
  profileImage: string | null;
  // v6.08: 本人参加確認フラグ
  isConfirmed?: boolean;
}

/** メッセージのViewModel */
export interface MessageVM {
  id: string;
  twitterId?: string | null;
  displayName: string;
  username?: string;
  profileImage?: string;
  message: string;
  createdAtText?: string;
}

export interface MessageCardProps {
  /** 参加情報 */
  participation: Participation;
  /** エールボタンのコールバック */
  onCheer?: () => void;
  /** エール数 */
  cheerCount?: number;
  /** DMボタンのコールバック */
  onDM?: (userId: number) => void;
  /** チャレンジID */
  challengeId?: number;
  /** 同伴者リスト */
  companions?: CompanionDisplay[];
  /** 自分の投稿かどうか */
  isOwnPost?: boolean;
  /** 編集ボタンのコールバック */
  onEdit?: () => void;
  /** 削除ボタンのコールバック */
  onDelete?: () => void;
}

/**
 * 性別に応じた左ボーダー色を取得
 * 背景色は変えず、左ボーダーのみで性別を表現
 */
function getGenderBorderColor(gender?: string | null): string {
  switch (gender) {
    case "male":
      return GENDER_BORDER_COLORS.male;
    case "female":
      return GENDER_BORDER_COLORS.female;
    default:
      return GENDER_BORDER_COLORS.neutral;
  }
}

/**
 * 性別アイコンを取得（極小の♂/♀）
 */
function getGenderIcon(gender?: string | null): string | null {
  switch (gender) {
    case "male":
      return "♂";
    case "female":
      return "♀";
    default:
      return null;
  }
}

export function MessageCard({
  participation,
  onCheer,
  cheerCount,
  onDM,
  challengeId,
  companions,
  isOwnPost,
  onEdit,
  onDelete,
}: MessageCardProps) {
  const colors = useColors();
  
  const genderBorderColor = getGenderBorderColor(participation.gender);
  const genderIcon = getGenderIcon(participation.gender);

  return (
    <View
      style={{
        // 背景色は黒で統一（性別で変えない）
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        // 通常のボーダー
        borderWidth: 1,
        borderColor: "#2D3139",
        // 左ボーダー2pxで性別を表現
        borderLeftWidth: 2,
        borderLeftColor: genderBorderColor,
      }}
    >
      {/* ヘッダー部分 */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Pressable
          onPress={() => {
            if (participation.userId && !participation.isAnonymous) {
              navigate.toProfile(participation.userId);
            }
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <OptimizedAvatar
            source={
              participation.profileImage && !participation.isAnonymous
                ? { uri: participation.profileImage }
                : undefined
            }
            size={40}
            fallbackColor={eventUI.fallback}
            fallbackText={participation.displayName.charAt(0)}
          />
        </Pressable>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
              {participation.isAnonymous ? "匿名" : participation.displayName}
            </Text>
            {/* 性別アイコン（極小の♂/♀） */}
            {genderIcon && (
              <Text 
                style={{ 
                  marginLeft: 4, 
                  fontSize: 12,
                  color: genderBorderColor,
                  fontWeight: "500",
                }}
              >
                {genderIcon}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
            {participation.username && !participation.isAnonymous && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => { if (participation.userId) navigate.toProfile(participation.userId); }}
                style={{ flexDirection: "row", alignItems: "center", marginRight: 8, padding: 0 }}
              >
                <MaterialIcons name="person" size={12} color={eventText.username} style={{ marginRight: 2 }} />
                <Text style={{ color: eventText.username, fontSize: eventFont.body }}>@{participation.username}</Text>
              </Button>
            )}
            {participation.prefecture && (
              <Text style={{ color: eventText.hint, fontSize: eventFont.meta, marginRight: 8 }}>
                📍{participation.prefecture}
              </Text>
            )}
            {participation.followersCount && participation.followersCount > 0 && (
              <Text style={{ color: eventText.follower, fontSize: eventFont.meta }}>
                {participation.followersCount.toLocaleString()} フォロワー
              </Text>
            )}
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: eventText.accent, fontSize: eventFont.body, fontWeight: "bold" }}>
            +{participation.contribution || 1}人
          </Text>
        </View>
      </View>

      {/* メッセージ本文 */}
      {participation.message && (
        <Text style={{ color: eventText.primary, fontSize: 15, lineHeight: 22, marginBottom: 12 }}>
          {participation.message}
        </Text>
      )}

      {/* 一緒に参加する友人表示 */}
      {companions && companions.length > 0 && (
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: eventText.secondary, fontSize: eventFont.meta, marginBottom: 8 }}>一緒に参加する友人:</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {companions.map((companion) => (
              <View
                key={companion.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: companion.isConfirmed ? "rgba(16, 185, 129, 0.15)" : "#1A1D21",
                  borderRadius: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: companion.isConfirmed ? "#10B981" : "#2D3139",
                }}
              >
                <View style={{ marginRight: 6 }}>
                  <OptimizedAvatar
                    source={companion.profileImage ? { uri: companion.profileImage } : undefined}
                    size={20}
                    fallbackColor={companion.isConfirmed ? "#10B981" : eventUI.fallbackAlt}
                    fallbackText={companion.displayName.charAt(0)}
                  />
                </View>
                <Text style={{ color: colors.foreground, fontSize: 12 }}>{companion.displayName}</Text>
                {companion.twitterUsername && (
                  <Text style={{ color: eventText.secondary, fontSize: eventFont.small, marginLeft: 4 }}>
                    @{companion.twitterUsername}
                  </Text>
                )}
                {/* v6.08: 本人参加確認バッジ */}
                {companion.isConfirmed && (
                  <View style={{ marginLeft: 4, flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name="verified" size={12} color="#10B981" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* アクションボタン */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 8, gap: 8 }}>
        {/* DMボタン */}
        {onDM && participation.userId && !participation.isAnonymous && (
          <Button
            variant="secondary"
            size="sm"
            onPress={() => onDM(participation.userId!)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#2D3139",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <MaterialIcons name="mail" size={14} color={eventUI.iconMuted} />
            <Text style={{ color: eventText.secondary, fontSize: eventFont.meta, marginLeft: 4 }}>DM</Text>
          </Button>
        )}

        {/* エールボタン */}
        {onCheer && (
          <Button
            variant="secondary"
            size="sm"
            onPress={onCheer}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#2D3139",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ fontSize: 14 }}>👏</Text>
            {cheerCount !== undefined && cheerCount > 0 && (
              <Text style={{ color: eventText.secondary, fontSize: eventFont.meta, marginLeft: 4 }}>{cheerCount}</Text>
            )}
          </Button>
        )}

        {/* 編集・削除ボタン（自分の投稿のみ） */}
        {isOwnPost && (
          <>
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onPress={onEdit}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#2D3139",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <MaterialIcons name="edit" size={14} color={eventUI.iconMuted} />
                <Text style={{ color: eventText.secondary, fontSize: eventFont.meta, marginLeft: 4 }}>編集</Text>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="secondary"
                size="sm"
                onPress={onDelete}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#2D3139",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <MaterialIcons name="delete" size={14} color={eventUI.iconDanger} />
                <Text style={{ color: eventText.danger, fontSize: eventFont.meta, marginLeft: 4 }}>取消</Text>
              </Button>
            )}
          </>
        )}
      </View>
    </View>
  );
}
