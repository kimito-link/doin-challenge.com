import { Text, View, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(false);
  
  // 通知履歴を取得
  const { data: notificationList, isLoading, refetch } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    if (Platform.OS === "web") return;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      setNotificationPermission(false);
      return;
    }
    
    setNotificationPermission(true);
    
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token.data);
    } catch (error) {
      console.error("Failed to get push token:", error);
    }
  };

  const unreadCount = notificationList?.filter(n => !n.isRead).length || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "goal_reached":
        return "emoji-events";
      case "milestone_25":
      case "milestone_50":
      case "milestone_75":
        return "flag";
      case "new_participant":
        return "person-add";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "goal_reached":
        return "#FFD700";
      case "milestone_25":
        return "#4ADE80";
      case "milestone_50":
        return "#60A5FA";
      case "milestone_75":
        return "#A78BFA";
      case "new_participant":
        return "#EC4899";
      default:
        return "#9CA3AF";
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#0D1117]">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <MaterialIcons name="notifications-off" size={64} color="#6B7280" />
          <Text style={{ color: "#9CA3AF", fontSize: 16, marginTop: 16, textAlign: "center" }}>
            通知を受け取るにはログインが必要です
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#0D1117]">
      <ScrollView style={{ flex: 1, backgroundColor: "#0D1117" }}>
        {/* ヘッダー */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#1A1D21",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginLeft: 12 }}>
              通知
            </Text>
            {unreadCount > 0 && (
              <View
                style={{
                  backgroundColor: "#EC4899",
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                  {unreadCount}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }} />
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={() => markAllAsReadMutation.mutate()}
                style={{
                  backgroundColor: "#1A1D21",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: "#EC4899", fontSize: 12 }}>すべて既読</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 通知許可状態 */}
        {Platform.OS !== "web" && !notificationPermission && (
          <View
            style={{
              backgroundColor: "#1A1D21",
              borderRadius: 12,
              padding: 16,
              marginHorizontal: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#F59E0B",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="warning" size={24} color="#F59E0B" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
                  プッシュ通知が無効です
                </Text>
                <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
                  設定からプッシュ通知を有効にしてください
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 通知リスト */}
        <View style={{ paddingHorizontal: 16 }}>
          {isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#EC4899" />
            </View>
          ) : notificationList && notificationList.length > 0 ? (
            notificationList.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => {
                  if (!notification.isRead) {
                    markAsReadMutation.mutate({ id: notification.id });
                  }
                  router.push(`/event/${notification.challengeId}`);
                }}
                style={{
                  backgroundColor: notification.isRead ? "#1A1D21" : "#1E2530",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: notification.isRead ? "#2D3139" : "#EC4899",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: getNotificationColor(notification.type) + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons
                      name={getNotificationIcon(notification.type) as any}
                      size={24}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
                      {notification.title}
                    </Text>
                    <Text style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4, lineHeight: 18 }}>
                      {notification.body}
                    </Text>
                    <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 8 }}>
                      {new Date(notification.sentAt).toLocaleString("ja-JP")}
                    </Text>
                  </View>
                  {!notification.isRead && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#EC4899",
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <MaterialIcons name="notifications-none" size={64} color="#6B7280" />
              <Text style={{ color: "#9CA3AF", fontSize: 16, marginTop: 16 }}>
                通知はありません
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
