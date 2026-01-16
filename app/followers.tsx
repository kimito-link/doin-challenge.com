import { FlatList, Text, View, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/hooks/use-auth";

export default function FollowersScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // userIdが指定されていない場合は自分のフォロワーを表示
  const targetUserId = userId ? parseInt(userId) : user?.id;
  
  const { data: followers, isLoading, refetch } = trpc.follows.followers.useQuery(
    { userId: targetUserId || 0 },
    { enabled: !!targetUserId }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScreenContainer containerClassName="bg-[#0D1117]">
      {/* ヘッダー */}
      <AppHeader 
        title="動員ちゃれんじ" 
        showCharacters={false}
        rightElement={
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>戻る</Text>
          </TouchableOpacity>
        }
      />
      <View style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2D3139",
      }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
          フォロワー
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      ) : followers && followers.length > 0 ? (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => {
                if (item.followerId) {
                  router.push({ pathname: "/profile/[userId]", params: { userId: item.followerId.toString() } });
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                minHeight: 72,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#2D3139",
              }}
            >
              {item.followerImage ? (
                <Image
                  source={{ uri: item.followerImage }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#EC4899",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                    {(item.followerName || "?")[0]}
                  </Text>
                </View>
              )}
              
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  {item.followerName || "不明なユーザー"}
                </Text>
                <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>
                  {new Date(item.createdAt).toLocaleDateString("ja-JP")} からフォロー
                </Text>
              </View>
              
              <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DD6500" />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          // パフォーマンス最適化
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={Platform.OS !== "web"}
          updateCellsBatchingPeriod={50}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <MaterialIcons name="people-outline" size={64} color="#4B5563" />
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>
            まだフォロワーがいません
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center" }}>
            チャレンジを作成して{"\n"}フォロワーを増やしましょう
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
