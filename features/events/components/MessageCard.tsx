/**
 * 応援メッセージカードコンポーネント
 * 参加者の応援メッセージを表示
 */
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { OptimizedAvatar } from "@/components/molecules/optimized-image";
import type { Participation, Companion } from "@/types/participation";

/** 同伴者の表示用型 */
interface CompanionDisplay {
  id: number;
  displayName: string;
  twitterUsername: string | null;
  profileImage: string | null;
}

interface MessageCardProps {
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
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: "#1A1D21",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#2D3139",
      }}
    >
      {/* ヘッダー部分 */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <OptimizedAvatar
          source={
            participation.profileImage && !participation.isAnonymous
              ? { uri: participation.profileImage }
              : undefined
          }
          size={40}
          fallbackColor="#EC4899"
          fallbackText={participation.displayName.charAt(0)}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
              {participation.isAnonymous ? "匿名" : participation.displayName}
            </Text>
            {/* 性別アイコン */}
            {participation.gender && participation.gender !== "unspecified" && (
              <Text style={{ marginLeft: 4, fontSize: 14 }}>
                {participation.gender === "male" ? "👨" : "👩"}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
            {participation.username && !participation.isAnonymous && (
              <TouchableOpacity
                onPress={() => {
                  if (participation.userId) {
                    router.push({
                      pathname: "/profile/[userId]",
                      params: { userId: participation.userId.toString() },
                    });
                  }
                }}
                style={{ flexDirection: "row", alignItems: "center", marginRight: 8 }}
              >
                <MaterialIcons name="person" size={12} color="#DD6500" style={{ marginRight: 2 }} />
                <Text style={{ color: "#DD6500", fontSize: 14 }}>@{participation.username}</Text>
              </TouchableOpacity>
            )}
            {participation.prefecture && (
              <Text style={{ color: "#6B7280", fontSize: 12, marginRight: 8 }}>
                📍{participation.prefecture}
              </Text>
            )}
            {participation.followersCount && participation.followersCount > 0 && (
              <Text style={{ color: "#EC4899", fontSize: 11 }}>
                {participation.followersCount.toLocaleString()} フォロワー
              </Text>
            )}
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#EC4899", fontSize: 14, fontWeight: "bold" }}>
            +{participation.contribution || 1}人
          </Text>
        </View>
      </View>

      {/* メッセージ本文 */}
      {participation.message && (
        <Text style={{ color: "#E5E7EB", fontSize: 15, lineHeight: 22, marginBottom: 12 }}>
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
          <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>一緒に参加する友人:</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {companions.map((companion) => (
              <View
                key={companion.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1A1D21",
                  borderRadius: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: "#2D3139",
                }}
              >
                <View style={{ marginRight: 6 }}>
                  <OptimizedAvatar
                    source={companion.profileImage ? { uri: companion.profileImage } : undefined}
                    size={20}
                    fallbackColor="#8B5CF6"
                    fallbackText={companion.displayName.charAt(0)}
                  />
                </View>
                <Text style={{ color: colors.foreground, fontSize: 12 }}>{companion.displayName}</Text>
                {companion.twitterUsername && (
                  <Text style={{ color: "#9CA3AF", fontSize: 11, marginLeft: 4 }}>
                    @{companion.twitterUsername}
                  </Text>
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
          <TouchableOpacity
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
            <MaterialIcons name="mail" size={14} color="#9CA3AF" />
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 4 }}>DM</Text>
          </TouchableOpacity>
        )}

        {/* エールボタン */}
        {onCheer && (
          <TouchableOpacity
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
              <Text style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 4 }}>{cheerCount}</Text>
            )}
          </TouchableOpacity>
        )}

        {/* 編集・削除ボタン（自分の投稿のみ） */}
        {isOwnPost && (
          <>
            {onEdit && (
              <TouchableOpacity
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
                <MaterialIcons name="edit" size={14} color="#9CA3AF" />
                <Text style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 4 }}>編集</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
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
                <MaterialIcons name="delete" size={14} color="#EF4444" />
                <Text style={{ color: "#EF4444", fontSize: 12, marginLeft: 4 }}>取消</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}
