/**
 * EventHeaderSection Component
 * イベント詳細のヘッダー部分（グラデーション背景、ホスト情報、タイトル）
 * 
 * v6.63: 視認性改善
 * - オレンジ〜イエローグラデーション背景上のテキストを黒系に変更
 * - TwitterUserCardにlightBackground propを追加
 * - WCAG AA準拠のコントラスト比
 */

import { View, Text, Pressable } from "react-native";
import { navigate } from "@/lib/navigation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "@/theme/tokens";
import { TwitterUserCard } from "@/components/molecules/twitter-user-card";
import type { EventDetailData } from "../types";

/**
 * 明るい背景用のカラー定義
 * WCAG AA準拠（コントラスト比 4.5:1 以上）
 */
const LIGHT_BG_COLORS = {
  textPrimary: "#111827",           // 黒系テキスト
  textSecondary: "rgba(17,24,39,0.78)",  // セカンダリテキスト
  iconBg: "rgba(0,0,0,0.15)",       // アイコン背景（暗め）
  iconColor: "#111827",             // アイコン色
  buttonBgActive: "rgba(0,0,0,0.15)",    // フォロー中ボタン背景
  buttonBgInactive: "rgba(255,255,255,0.92)", // フォローボタン背景
} as const;

interface EventHeaderSectionProps {
  challenge: EventDetailData;
  challengeId: number;
  isOwner: boolean;
  isChallengeFavorite: boolean;
  toggleFavorite: (id: number) => void;
  isFollowing: boolean | undefined;
  hostUserId: number | undefined;
  userId: number | undefined;
  onFollowToggle: () => void;
  onShowHostProfile: () => void;
}

export function EventHeaderSection({
  challenge,
  challengeId,
  isOwner,
  isChallengeFavorite,
  toggleFavorite,
  isFollowing,
  hostUserId,
  userId,
  onFollowToggle,
  onShowHostProfile,
}: EventHeaderSectionProps) {
  
  return (
    <LinearGradient
      colors={[color.accentPrimary, color.accentAlt]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ marginHorizontal: 16, borderRadius: 16, padding: 20, position: "relative" }}
    >
      {/* 主催者用の編集アイコン */}
      {isOwner && (
        <Pressable
          onPress={() => navigate.toEditChallenge(challengeId)}
          style={{
            position: "absolute",
            top: 12,
            right: 60,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: LIGHT_BG_COLORS.iconBg,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <MaterialIcons name="edit" size={20} color={LIGHT_BG_COLORS.iconColor} />
        </Pressable>
      )}
      
      {/* お気に入りボタン */}
      <Pressable
        onPress={() => toggleFavorite(challengeId)}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: LIGHT_BG_COLORS.iconBg,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <MaterialIcons
          name={isChallengeFavorite ? "star" : "star-outline"}
          size={24}
          color={isChallengeFavorite ? "#B8860B" : LIGHT_BG_COLORS.iconColor}
        />
      </Pressable>
      
      {/* ホスト情報 - lightBackground=true で黒テキスト + 白バッジ */}
      <TwitterUserCard
        user={{
          twitterId: challenge.hostTwitterId || undefined,
          name: challenge.hostName,
          username: challenge.hostUsername || undefined,
          profileImage: challenge.hostProfileImage || undefined,
          followersCount: challenge.hostFollowersCount || undefined,
          description: challenge.hostDescription || undefined,
        }}
        size="large"
        showFollowers
        showDescription
        onPress={onShowHostProfile}
        lightBackground={true}
        className="mb-4"
      />
      
      {/* フォローボタン */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 16, marginTop: -8 }}>
        {userId && hostUserId && hostUserId !== userId && (
          <Pressable
            onPress={onFollowToggle}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: isFollowing 
                ? LIGHT_BG_COLORS.buttonBgActive 
                : LIGHT_BG_COLORS.buttonBgInactive,
            }}
          >
            <Text style={{ 
              color: LIGHT_BG_COLORS.textPrimary, 
              fontSize: 13, 
              fontWeight: "bold" 
            }}>
              {isFollowing ? "フォロー中" : "フォロー"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* チャレンジタイトル - 黒テキスト */}
      <Text style={{ color: LIGHT_BG_COLORS.textPrimary, fontSize: 22, fontWeight: "bold" }}>
        {challenge.title}
      </Text>
    </LinearGradient>
  );
}
