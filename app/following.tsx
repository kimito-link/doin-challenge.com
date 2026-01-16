import { FlatList, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AppHeader } from "@/components/app-header";

export default function FollowingScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: following, isLoading, refetch } = trpc.follows.following.useQuery();
  const unfollowMutation = trpc.follows.unfollow.useMutation({
    onSuccess: () => refetch(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleUnfollow = (followeeId: number) => {
    unfollowMutation.mutate({ followeeId });
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
          フォロー中
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#9CA3AF" }}>読み込み中...</Text>
        </View>
      ) : following && following.length > 0 ? (
        <FlatList
          data={following}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#2D3139",
            }}>
              {item.followeeImage ? (
                <Image
                  source={{ uri: item.followeeImage }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#DD6500",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                    {(item.followeeName || "?")[0]}
                  </Text>
                </View>
              )}
              
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  {item.followeeName || "不明なユーザー"}
                </Text>
                <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>
                  {new Date(item.createdAt).toLocaleDateString("ja-JP")} からフォロー中
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => handleUnfollow(item.followeeId)}
                style={{
                  minHeight: 44,
                  minWidth: 100,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 22,
                  backgroundColor: "#2D3139",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>フォロー解除</Text>
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DD6500" />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <MaterialIcons name="person-add" size={64} color="#4B5563" />
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>
            まだ誰もフォローしていません
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center" }}>
            チャレンジ詳細画面からホストをフォローすると{"\n"}新着チャレンジの通知を受け取れます
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
