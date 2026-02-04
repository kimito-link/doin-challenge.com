import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ColorfulChallengeCard } from "@/components/molecules/colorful-challenge-card";
import { useFavorites } from "@/hooks/use-favorites";
import { trpc } from "@/lib/trpc";
import { color } from "@/theme/tokens";
import { mypageFont } from "../../ui/theme/tokens";

/**
 * マイページ - 気になるイベントリスト
 * 
 * お気に入り登録したチャレンジを表示
 */
export function FavoriteSection() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  
  // 全チャレンジを取得してお気に入りのみフィルタリング
  const { data: allChallenges } = trpc.events.list.useQuery();
  
  // お気に入りIDに該当するチャレンジのみ抽出
  const favoriteChallenges = (allChallenges || []).filter((event: any) =>
    favorites.includes(event.id)
  );
  
  // お気に入りが0件の場合は非表示
  if (favoriteChallenges.length === 0) {
    return null;
  }
  
  return (
    <View style={{ marginBottom: 32 }}>
      {/* セクションヘッダー */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            fontSize: mypageFont.lg,
            fontWeight: "bold",
            color: color.textPrimary,
          }}
        >
          気になるイベントリスト
        </Text>
        <Text
          style={{
            fontSize: mypageFont.body,
            color: color.textMuted,
          }}
        >
          {favoriteChallenges.length}件
        </Text>
      </View>
      
      {/* チャレンジカード一覧 */}
      <FlatList
        data={favoriteChallenges}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 12,
        }}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: { item: any }) => (
          <View style={{ width: 280 }}>
            <ColorfulChallengeCard
              challenge={item}
              onPress={() => {
                router.push(`/event/${item.id}`);
              }}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={toggleFavorite}
            />
          </View>
        )}
      />
    </View>
  );
}
