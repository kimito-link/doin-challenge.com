import { View, Text, Switch, StyleSheet, Platform, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import {
  getNotificationSettings,
  saveNotificationSettings,
  registerForPushNotifications,
  type NotificationSettings,
} from "@/lib/push-notifications";

interface NotificationSettingsProps {
  onClose?: () => void;
}

interface SettingItemProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingItem({
  icon,
  iconColor,
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingItemProps) {
  const handleChange = useCallback((newValue: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onValueChange(newValue);
  }, [onValueChange]);

  return (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <MaterialIcons name={icon as any} size={20} color="#fff" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, disabled && styles.textDisabled]}>{title}</Text>
        <Text style={[styles.settingDescription, disabled && styles.textDisabled]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
        trackColor={{ false: "#3A3F47", true: "#DD6500" }}
        thumbColor={value ? "#fff" : "#D1D5DB"}
        ios_backgroundColor="#3A3F47"
      />
    </View>
  );
}

/**
 * 通知設定コンポーネント
 * プッシュ通知の各種設定を管理
 */
export function NotificationSettingsPanel({ onClose }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    challengeUpdates: true,
    goalReached: true,
    milestones: true,
    newParticipants: true,
  });
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true);

  // 設定を読み込み
  useEffect(() => {
    async function loadSettings() {
      try {
        const stored = await getNotificationSettings();
        setSettings(stored);
      } catch (error) {
        console.error("[NotificationSettings] Failed to load:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // 設定を更新
  const updateSetting = useCallback(async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveNotificationSettings({ [key]: value });
  }, [settings]);

  // 通知を有効化
  const handleEnableNotifications = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Web版の制限",
        "プッシュ通知はモバイルアプリでのみ利用可能です。"
      );
      return;
    }

    const token = await registerForPushNotifications();
    if (token) {
      setPermissionGranted(true);
      await updateSetting("enabled", true);
      if ((Platform.OS as string) !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setPermissionGranted(false);
      Alert.alert(
        "通知の許可が必要です",
        "設定アプリから通知を許可してください。",
        [{ text: "OK" }]
      );
    }
  }, [updateSetting]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  const isWebPlatform = Platform.OS as string === "web";
  const notificationsDisabled = !settings.enabled || isWebPlatform;

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>通知設定</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>

      {/* Web版の注意 */}
      {isWebPlatform && (
        <View style={styles.webNotice}>
          <MaterialIcons name="info" size={20} color="#F59E0B" />
          <Text style={styles.webNoticeText}>
            プッシュ通知はモバイルアプリでのみ利用可能です
          </Text>
        </View>
      )}

      {/* メイン通知スイッチ */}
      <View style={styles.mainToggle}>
        <View style={styles.mainToggleInfo}>
          <MaterialIcons name="notifications" size={28} color="#DD6500" />
          <View style={styles.mainToggleText}>
            <Text style={styles.mainToggleTitle}>プッシュ通知</Text>
            <Text style={styles.mainToggleDescription}>
              {settings.enabled ? "通知を受け取ります" : "通知はオフです"}
            </Text>
          </View>
        </View>
        {!isWebPlatform && (
          <Switch
            value={settings.enabled}
            onValueChange={(value) => {
              if (value && !permissionGranted) {
                handleEnableNotifications();
              } else {
                updateSetting("enabled", value);
              }
            }}
            trackColor={{ false: "#3A3F47", true: "#DD6500" }}
            thumbColor={settings.enabled ? "#fff" : "#D1D5DB"}
            ios_backgroundColor="#3A3F47"
          />
        )}
      </View>

      {/* 個別設定 */}
      <View style={styles.settingsList}>
        <Text style={styles.sectionTitle}>通知の種類</Text>

        <SettingItem
          icon="emoji-events"
          iconColor="#F59E0B"
          title="目標達成"
          description="チャレンジが目標を達成したとき"
          value={settings.goalReached}
          onValueChange={(value) => updateSetting("goalReached", value)}
          disabled={notificationsDisabled}
        />

        <SettingItem
          icon="flag"
          iconColor="#10B981"
          title="マイルストーン"
          description="25%、50%、75%達成時"
          value={settings.milestones}
          onValueChange={(value) => updateSetting("milestones", value)}
          disabled={notificationsDisabled}
        />

        <SettingItem
          icon="person-add"
          iconColor="#3B82F6"
          title="新規参加者"
          description="誰かがチャレンジに参加したとき"
          value={settings.newParticipants}
          onValueChange={(value) => updateSetting("newParticipants", value)}
          disabled={notificationsDisabled}
        />

        <SettingItem
          icon="update"
          iconColor="#8B5CF6"
          title="チャレンジ更新"
          description="イベントリマインダーなど"
          value={settings.challengeUpdates}
          onValueChange={(value) => updateSetting("challengeUpdates", value)}
          disabled={notificationsDisabled}
        />
      </View>

      {/* 説明 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          通知設定はこのデバイスにのみ保存されます。
          別のデバイスでは再度設定が必要です。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151718",
  },
  loadingText: {
    color: "#D1D5DB",
    textAlign: "center",
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3139",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  webNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  webNoticeText: {
    color: "#F59E0B",
    fontSize: 14,
    flex: 1,
  },
  mainToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1D21",
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  mainToggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mainToggleText: {
    gap: 2,
  },
  mainToggleTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  mainToggleDescription: {
    color: "#D1D5DB",
    fontSize: 14,
  },
  settingsList: {
    padding: 16,
  },
  sectionTitle: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1D21",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    color: "#D1D5DB",
    fontSize: 13,
  },
  textDisabled: {
    color: "#9CA3AF",
  },
  footer: {
    padding: 16,
    marginTop: "auto",
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
