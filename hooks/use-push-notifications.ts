/**
 * Push Notifications Hook
 * プッシュ通知の登録・管理
 */

import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useAuth } from "./use-auth";
import { trpc } from "@/lib/trpc";

// 通知ハンドラーの設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // TODO: サーバー側のtRPCエンドポイント実装後に有効化
  // const registerPushTokenMutation = trpc.notifications.registerPushToken.useMutation();

  useEffect(() => {
    if (isAuthenticated && user) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          setExpoPushToken(token);
          // TODO: サーバーにトークンを登録
          // registerPushTokenMutation.mutate({ token });
          console.log("プッシュ通知トークン登録済み:", token);
        }
      });

      // 通知受信リスナー
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

      // 通知タップリスナー
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("通知がタップされました:", response);
        // TODO: 通知の内容に応じて適切な画面に遷移
      });

      return () => {
        notificationListener.current && notificationListener.current.remove();
        responseListener.current && responseListener.current.remove();
      };
    }
  }, [isAuthenticated, user]);

  return {
    expoPushToken,
    notification,
  };
}

async function registerForPushNotificationsAsync() {
  let token: string | null = null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#EC4899",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("プッシュ通知のパーミッションが拒否されました");
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        console.log("EAS Project IDが見つかりません");
        return null;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("プッシュ通知トークン:", token);
    } catch (error) {
      console.error("プッシュ通知トークンの取得に失敗:", error);
    }
  } else {
    console.log("物理デバイスでのみプッシュ通知を使用できます");
  }

  return token;
}
