import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from "react-native";
import { color, palette } from "@/theme/tokens";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleEventReminder, cancelNotification } from "@/lib/push-notifications";

const REMINDER_STORAGE_KEY = "event_reminders";

interface ReminderOption {
  id: string;
  label: string;
  minutesBefore: number;
}

const REMINDER_OPTIONS: ReminderOption[] = [
  { id: "1day", label: "1日前", minutesBefore: 24 * 60 },
  { id: "3hours", label: "3時間前", minutesBefore: 3 * 60 },
  { id: "1hour", label: "1時間前", minutesBefore: 60 },
  { id: "30min", label: "30分前", minutesBefore: 30 },
];

interface ReminderButtonProps {
  challengeId: number;
  challengeTitle: string;
  eventDate: Date;
}

interface StoredReminder {
  notificationId: string;
  option: string;
  scheduledFor: string;
}

/**
 * リマインダー設定ボタン
 */
export function ReminderButton({
  challengeId,
  challengeTitle,
  eventDate,
}: ReminderButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeReminder, setActiveReminder] = useState<StoredReminder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // 保存されたリマインダーを読み込み
  useEffect(() => {
    loadReminder();
  }, [challengeId]);

  const loadReminder = async () => {
    try {
      const stored = await AsyncStorage.getItem(`${REMINDER_STORAGE_KEY}_${challengeId}`);
      if (stored) {
        const reminder = JSON.parse(stored) as StoredReminder;
        // 過去のリマインダーは無効
        if (new Date(reminder.scheduledFor) > new Date()) {
          setActiveReminder(reminder);
        } else {
          await AsyncStorage.removeItem(`${REMINDER_STORAGE_KEY}_${challengeId}`);
        }
      }
    } catch (error) {
      console.error("[Reminder] Failed to load:", error);
    }
  };

  useEffect(() => {
    if (showModal) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [showModal, scaleAnim, opacityAnim]);

  const handleSetReminder = async (option: ReminderOption) => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      setShowModal(false);
      return;
    }

    setIsLoading(true);
    try {
      // 既存のリマインダーをキャンセル
      if (activeReminder) {
        await cancelNotification(activeReminder.notificationId);
      }

      // 新しいリマインダーをスケジュール
      const notificationId = await scheduleEventReminder(
        challengeId,
        challengeTitle,
        eventDate,
        option.minutesBefore
      );

      if (notificationId) {
        const reminder: StoredReminder = {
          notificationId,
          option: option.id,
          scheduledFor: new Date(eventDate.getTime() - option.minutesBefore * 60 * 1000).toISOString(),
        };
        await AsyncStorage.setItem(
          `${REMINDER_STORAGE_KEY}_${challengeId}`,
          JSON.stringify(reminder)
        );
        setActiveReminder(reminder);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("[Reminder] Failed to set:", error);
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleCancelReminder = async () => {
    if (!activeReminder) return;

    setIsLoading(true);
    try {
      await cancelNotification(activeReminder.notificationId);
      await AsyncStorage.removeItem(`${REMINDER_STORAGE_KEY}_${challengeId}`);
      setActiveReminder(null);

      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("[Reminder] Failed to cancel:", error);
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const getActiveOptionLabel = () => {
    if (!activeReminder) return null;
    const option = REMINDER_OPTIONS.find(o => o.id === activeReminder.option);
    return option?.label || null;
  };

  const isEventPast = eventDate < new Date();

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          setShowModal(true);
        }}
        disabled={isEventPast}
        style={[styles.button, isEventPast && styles.buttonDisabled]}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={activeReminder ? "notifications-active" : "notifications-none"}
          size={18}
          color={activeReminder ? color.accentPrimary : color.textMuted}
        />
        <Text style={[styles.buttonText, activeReminder && styles.buttonTextActive]}>
          {activeReminder ? getActiveOptionLabel() : "リマインド"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHeader}>
                <MaterialIcons name="notifications" size={24} color={color.accentPrimary} />
                <Text style={styles.modalTitle}>リマインダー設定</Text>
              </View>

              <Text style={styles.modalSubtitle}>
                イベント開始前に通知でお知らせします
              </Text>

              <View style={styles.optionsContainer}>
                {REMINDER_OPTIONS.map((option) => {
                  const isActive = activeReminder?.option === option.id;
                  const reminderTime = new Date(eventDate.getTime() - option.minutesBefore * 60 * 1000);
                  const isPast = reminderTime < new Date();

                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => !isPast && handleSetReminder(option)}
                      disabled={isPast || isLoading}
                      style={[
                        styles.optionButton,
                        isActive && styles.optionButtonActive,
                        isPast && styles.optionButtonDisabled,
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionContent}>
                        <MaterialIcons
                          name={isActive ? "check-circle" : "radio-button-unchecked"}
                          size={20}
                          color={isActive ? color.accentPrimary : isPast ? color.textSubtle : color.textMuted}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            isActive && styles.optionTextActive,
                            isPast && styles.optionTextDisabled,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      {isPast && (
                        <Text style={styles.optionSubtext}>過去の時間</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {activeReminder && (
                <TouchableOpacity
                  onPress={handleCancelReminder}
                  disabled={isLoading}
                  style={styles.cancelButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>リマインダーを解除</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: color.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: color.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  buttonTextActive: {
    color: color.accentPrimary,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: color.surface,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    color: color.textWhite,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSubtitle: {
    color: color.textMuted,
    fontSize: 13,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: color.bg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: color.border,
  },
  optionButtonActive: {
    borderColor: color.accentPrimary,
    backgroundColor: "rgba(236, 72, 153, 0.1)",
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionText: {
    color: color.textWhite,
    fontSize: 15,
    fontWeight: "500",
  },
  optionTextActive: {
    color: color.accentPrimary,
  },
  optionTextDisabled: {
    color: color.textSubtle,
  },
  optionSubtext: {
    color: color.textSubtle,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 30,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  cancelButtonText: {
    color: color.danger,
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: color.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeButtonText: {
    color: color.textWhite,
    fontSize: 15,
    fontWeight: "600",
  },
});
