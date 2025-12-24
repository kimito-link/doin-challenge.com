import { FlatList, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// キャラクター画像
const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
};

// ロゴ画像
const logoImage = require("@/assets/images/logo/logo-color.jpg");

type Event = {
  id: number;
  hostName: string;
  hostUsername: string | null;
  hostProfileImage: string | null;
  hostFollowersCount: number | null;
  title: string;
  description: string | null;
  eventDate: Date;
  venue: string | null;
  participantCount?: number;
};

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const colors = useColors();
  const eventDate = new Date(event.eventDate);
  const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <LinearGradient
        colors={["#00427B", "#DD6500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 4 }}
      />
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          {event.hostProfileImage ? (
            <Image
              source={{ uri: event.hostProfileImage }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#00427B",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                {event.hostName.charAt(0)}
              </Text>
            </View>
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
              {event.hostName}
            </Text>
            {event.hostUsername && (
              <Text style={{ color: "#DD6500", fontSize: 14 }}>
                @{event.hostUsername}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#DD6500", fontSize: 24, fontWeight: "bold" }}>
              {formattedDate}
            </Text>
          </View>
        </View>

        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          {event.title}
        </Text>

        {event.description && (
          <Text
            style={{ color: colors.muted, fontSize: 14, marginBottom: 12 }}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        )}

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          {event.hostFollowersCount !== null && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="people" size={16} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 14, marginLeft: 4 }}>
                {event.hostFollowersCount.toLocaleString()} フォロワー
              </Text>
            </View>
          )}
          {event.venue && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="place" size={16} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 14, marginLeft: 4 }}>
                {event.venue}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: events, isLoading, refetch } = trpc.events.list.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: "/event/[id]",
      params: { id: eventId.toString() },
    });
  };

  return (
    <ScreenContainer>
      {/* ヘッダー */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Image
            source={logoImage}
            style={{ width: 140, height: 50 }}
            contentFit="contain"
          />
          <View style={{ flexDirection: "row" }}>
            <Image source={characterImages.rinku} style={{ width: 36, height: 36, marginLeft: -8 }} contentFit="contain" />
            <Image source={characterImages.konta} style={{ width: 36, height: 36, marginLeft: -8 }} contentFit="contain" />
            <Image source={characterImages.tanune} style={{ width: 36, height: 36, marginLeft: -8 }} contentFit="contain" />
          </View>
        </View>
        <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
          推しの生誕祭を盛り上げよう
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>読み込み中...</Text>
        </View>
      ) : events && events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => handleEventPress(item.id)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <Image source={characterImages.rinku} style={{ width: 80, height: 80 }} contentFit="contain" />
            <Image source={characterImages.konta} style={{ width: 80, height: 80, marginLeft: -16 }} contentFit="contain" />
            <Image source={characterImages.tanune} style={{ width: 80, height: 80, marginLeft: -16 }} contentFit="contain" />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
            まだイベントがありません
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>
            「イベント作成」タブから{"\n"}生誕祭イベントを作成しましょう
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
