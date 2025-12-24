import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: conversations, isLoading } = trpc.dm.conversations.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: unreadCount } = trpc.dm.unreadCount.useQuery(undefined, {
    enabled: !!user,
  });

  if (!user) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-6xl mb-4">💬</Text>
          <Text className="text-lg text-muted text-center">
            メッセージを見るにはログインが必要です
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/oauth" as never)}
            className="mt-4 bg-primary px-6 py-3 rounded-full"
          >
            <Text className="text-background font-bold">ログイン</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const renderConversation = ({ item }: { item: NonNullable<typeof conversations>[0] }) => {
    const partnerId = item.fromUserId === user.id ? item.toUserId : item.fromUserId;
    const partnerName = item.fromUserId === user.id ? "相手" : item.fromUserName;
    const isUnread = item.toUserId === user.id && !item.isRead;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/messages/${partnerId}?challengeId=${item.challengeId}` as never)}
        className={`flex-row items-center p-4 border-b border-border ${isUnread ? "bg-primary/10" : ""}`}
        activeOpacity={0.7}
      >
        {/* アバター */}
        <View className="w-12 h-12 rounded-full bg-surface items-center justify-center mr-3">
          {item.fromUserImage ? (
            <Image
              source={{ uri: item.fromUserImage }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <Text className="text-xl">👤</Text>
          )}
        </View>

        {/* メッセージ情報 */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`font-bold ${isUnread ? "text-foreground" : "text-muted"}`}>
              {partnerName}
            </Text>
            <Text className="text-xs text-muted">
              {new Date(item.createdAt).toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <Text
            className={`text-sm mt-1 ${isUnread ? "text-foreground" : "text-muted"}`}
            numberOfLines={1}
          >
            {item.message}
          </Text>
        </View>

        {/* 未読バッジ */}
        {isUnread && (
          <View className="w-3 h-3 rounded-full bg-primary ml-2" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">メッセージ</Text>
        <View className="w-10">
          {unreadCount && unreadCount > 0 && (
            <View className="bg-primary rounded-full px-2 py-1">
              <Text className="text-xs text-background font-bold text-center">
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 会話一覧 */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">読み込み中...</Text>
        </View>
      ) : conversations && conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => `${item.id}`}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-6xl mb-4">💬</Text>
          <Text className="text-lg font-bold text-foreground mb-2">
            まだメッセージがありません
          </Text>
          <Text className="text-sm text-muted text-center">
            チャレンジの参加者にメッセージを送ってみましょう
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
