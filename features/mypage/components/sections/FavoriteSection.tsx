/**
 * お気に入りチャレンジセクションコンポーネント
 * マイページでお気に入り登録したチャレンジ一覧を表示する
 */

import { View, Text, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { mypageUI, mypageText } from "../../ui/theme/tokens";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFavorites } from "@/hooks/use-favorites";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

interface FavoriteSectionProps {
  onChallengePress: (challengeId: number) => void;
}

export function FavoriteSection({ onChallengePress }: FavoriteSectionProps) {
  const colors = useColors();
  const { favorites } = useFavorites();
  
  // 全チャレンジを取得してお気に入りのみフィルタリング
  const { data: allChallenges } = trpc.events.list.useQuery();
  
  const favoriteChallenges = useMemo(() => {
    if (!allChallenges || favorites.length === 0) return [];
    return allChallenges.filter((challenge: any) => favorites.includes(challenge.id));
  }, [allChallenges, favorites]);

  // お気に入りが0件の場合は表示しない
  if (favorites.length === 0) {
    return null;
  }

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <MaterialIcons name="star" size={20} color={colors.warning} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold" }}>
          気になるイベントリスト
        </Text>
      </View>
      
      {favoriteChallenges.length > 0 ? (
        <View style={{ gap: 12 }}>
          {favoriteChallenges.map((challenge: any) => (
            <Pressable
              key={challenge.id}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onChallengePress(challenge.id);
              }}
              style={({ pressed }) => ({
                backgroundColor: mypageUI.cardBg,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: mypageUI.cardBorder,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "bold" }}>
                    {challenge.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <MaterialIcons name="event" size={12} color={mypageText.muted} style={{ marginRight: 4 }} />
                    <Text style={{ color: mypageText.muted, fontSize: 12 }}>
                      {new Date(challenge.eventDate).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}
                    </Text>
                    {challenge.venue && (
                      <>
                        <Text style={{ color: mypageText.muted, fontSize: 12, marginHorizontal: 6 }}>•</Text>
                        <MaterialIcons name="place" size={12} color={mypageText.muted} style={{ marginRight: 4 }} />
                        <Text style={{ color: mypageText.muted, fontSize: 12 }} numberOfLines={1}>
                          {challenge.venue}
                        </Text>
                      </>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Text style={{ color: mypageText.muted, fontSize: 12 }}>
                      進捗: {challenge.currentValue || 0} / {challenge.goalValue || 0}{challenge.goalUnit || "人"}
                    </Text>
                    <Text style={{ color: colors.primary, fontSize: 12, marginLeft: 8, fontWeight: "600" }}>
                      {Math.min(((challenge.currentValue || 0) / (challenge.goalValue || 1)) * 100, 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={mypageText.muted} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ 
          backgroundColor: mypageUI.cardBg, 
          borderRadius: 12, 
          padding: 24, 
          alignItems: "center",
          borderWidth: 1,
          borderColor: mypageUI.cardBorder,
        }}>
          <MaterialIcons name="star-outline" size={48} color={mypageText.muted} />
          <Text style={{ color: mypageText.muted, fontSize: 14, marginTop: 12, textAlign: "center" }}>
            お気に入りのチャレンジが読み込めませんでした
          </Text>
        </View>
      )}
    </View>
  );
}
