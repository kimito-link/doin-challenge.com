/**
 * プッシュ通知強化ユーティリティ
 * 
 * ユーザーエンゲージメントを向上させるための
 * 高度なプッシュ通知機能を提供します。
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 通知カテゴリー
 */
export enum NotificationCategory {
  EVENT_REMINDER = 'event_reminder',
  CHALLENGE_ACHIEVEMENT = 'challenge_achievement',
  NEW_MESSAGE = 'new_message',
  PARTICIPATION_CONFIRMED = 'participation_confirmed',
  EVENT_STARTING_SOON = 'event_starting_soon',
  DAILY_REMINDER = 'daily_reminder',
}

/**
 * 通知優先度
 */
export enum NotificationPriority {
  LOW = 'low',
  DEFAULT = 'default',
  HIGH = 'high',
  MAX = 'max',
}

/**
 * 通知設定
 */
export interface NotificationSettings {
  enabled: boolean;
  categories: {
    [key in NotificationCategory]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

/**
 * デフォルトの通知設定
 */
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  categories: {
    [NotificationCategory.EVENT_REMINDER]: true,
    [NotificationCategory.CHALLENGE_ACHIEVEMENT]: true,
    [NotificationCategory.NEW_MESSAGE]: true,
    [NotificationCategory.PARTICIPATION_CONFIRMED]: true,
    [NotificationCategory.EVENT_STARTING_SOON]: true,
    [NotificationCategory.DAILY_REMINDER]: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

/**
 * 通知設定のストレージキー
 */
const SETTINGS_KEY = '@notification_settings';

/**
 * プッシュ通知の初期化
 */
export async function initializePushNotifications(): Promise<string | null> {
  try {
    // 物理デバイスでのみ動作
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

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

    // 権限の確認と要求
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return null;
    }

    // プッシュトークンの取得
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    // Android用のチャンネル設定
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    return token.data;
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
    return null;
  }
}

/**
 * Android用の通知チャンネルを設定
 */
async function setupAndroidChannels(): Promise<void> {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'デフォルト',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });

  await Notifications.setNotificationChannelAsync('high', {
    name: '重要な通知',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('low', {
    name: '低優先度',
    importance: Notifications.AndroidImportance.LOW,
  });
}

/**
 * ローカル通知をスケジュール
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
  options?: {
    category?: NotificationCategory;
    priority?: NotificationPriority;
    data?: Record<string, any>;
  }
): Promise<string | null> {
  try {
    // 通知設定を確認
    const settings = await getNotificationSettings();
    if (!settings.enabled) {
      return null;
    }

    if (options?.category && !settings.categories[options.category]) {
      return null;
    }

    // 静音時間のチェック
    if (settings.quietHours.enabled && isInQuietHours(settings.quietHours)) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: options?.data,
        priority: options?.priority || NotificationPriority.DEFAULT,
        categoryIdentifier: options?.category,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

/**
 * イベントリマインダーをスケジュール
 */
export async function scheduleEventReminder(
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  reminderMinutes: number = 30
): Promise<string | null> {
  const reminderDate = new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);
  
  return await scheduleLocalNotification(
    'イベント開始のお知らせ',
    `「${eventTitle}」が${reminderMinutes}分後に開始します`,
    { type: 'date', date: reminderDate } as Notifications.DateTriggerInput,
    {
      category: NotificationCategory.EVENT_REMINDER,
      priority: NotificationPriority.HIGH,
      data: { eventId, type: 'event_reminder' },
    }
  );
}

/**
 * チャレンジ達成通知を送信
 */
export async function sendAchievementNotification(
  achievementTitle: string,
  achievementDescription: string
): Promise<string | null> {
  return await scheduleLocalNotification(
    '🎉 チャレンジ達成！',
    `${achievementTitle}: ${achievementDescription}`,
    null as any, // 即座に表示
    {
      category: NotificationCategory.CHALLENGE_ACHIEVEMENT,
      priority: NotificationPriority.HIGH,
      data: { type: 'achievement' },
    }
  );
}

/**
 * 参加確認通知を送信
 */
export async function sendParticipationConfirmation(
  eventTitle: string
): Promise<string | null> {
  return await scheduleLocalNotification(
    '参加表明完了',
    `「${eventTitle}」への参加を表明しました`,
    null as any,
    {
      category: NotificationCategory.PARTICIPATION_CONFIRMED,
      priority: NotificationPriority.DEFAULT,
      data: { type: 'participation' },
    }
  );
}

/**
 * デイリーリマインダーをスケジュール
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<string | null> {
  return await scheduleLocalNotification(
    '今日もチャレンジしよう！',
    'イベントをチェックして、参加表明をお忘れなく',
    {
      type: 'calendar',
      hour,
      minute,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
    {
      category: NotificationCategory.DAILY_REMINDER,
      priority: NotificationPriority.LOW,
      data: { type: 'daily_reminder' },
    }
  );
}

/**
 * 通知設定を取得
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to get notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 通知設定を保存
 */
export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  }
}

/**
 * 静音時間内かどうかを判定
 */
function isInQuietHours(quietHours: NotificationSettings['quietHours']): boolean {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const { start, end } = quietHours;
  
  if (start < end) {
    return currentTime >= start && currentTime < end;
  } else {
    // 日をまたぐ場合（例: 22:00-08:00）
    return currentTime >= start || currentTime < end;
  }
}

/**
 * すべてのスケジュール済み通知を取得
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * 特定の通知をキャンセル
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * すべての通知をキャンセル
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * バッジカウントを設定
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * バッジカウントをクリア
 */
export async function clearBadgeCount(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
