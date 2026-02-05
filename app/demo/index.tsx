/**
 * デモチャレンジ体験画面
 * 
 * ログインなしでチャレンジ参加を体験できる
 */

import { useCallback, useEffect, useState } from "react";
import { color } from "@/theme/tokens";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { navigate } from "@/lib/navigation/app-routes";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import {
  getDemoChallenge,
  joinDemoChallenge,
  addDemoContribution,
  resetDemoState,
  type DemoChallenge,
  type DemoState,
} from "@/lib/demo-challenge";

export default function DemoScreen() {
  const colors = useColors();

  const [challenge, setChallenge] = useState<(DemoChallenge & { userState: DemoState }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // アニメーション値
  const progressWidth = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const celebrationOpacity = useSharedValue(0);
  const numberScale = useSharedValue(1);

  const loadChallenge = useCallback(async () => {
    try {
      const data = await getDemoChallenge();
      setChallenge(data);
      
      // 進捗バーのアニメーション
      const progress = (data.currentValue / data.goalValue) * 100;
      progressWidth.value = withTiming(progress, { duration: 1000, easing: Easing.out(Easing.cubic) });
    } catch (error) {
      console.error("Failed to load demo challenge:", error);
    } finally {
      setLoading(false);
    }
  }, [progressWidth]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  const handleJoin = async () => {
    if (!challenge || challenge.userState.hasJoined || joining) return;
    
    setJoining(true);
    
    // ハプティクス
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // ボタンアニメーション
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    
    try {
      const newState = await joinDemoChallenge();
      
      // 数字のアニメーション
      numberScale.value = withSequence(
        withTiming(1.3, { duration: 200 }),
        withSpring(1, { damping: 8 })
      );
      
      // 進捗バーのアニメーション
      const newProgress = (newState.currentValue / challenge.goalValue) * 100;
      progressWidth.value = withTiming(newProgress, { duration: 800, easing: Easing.out(Easing.cubic) });
      
      // お祝いアニメーション
      celebrationOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(2000, withTiming(0, { duration: 500 }))
      );
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // 成功ハプティクス
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // データ更新
      await loadChallenge();
    } catch (error) {
      console.error("Failed to join demo challenge:", error);
    } finally {
      setJoining(false);
    }
  };

  const handleAddContribution = async () => {
    if (!challenge || !challenge.userState.hasJoined) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const newState = await addDemoContribution(1);
      
      // 数字のアニメーション
      numberScale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withSpring(1, { damping: 10 })
      );
      
      // 進捗バーのアニメーション
      const newProgress = (newState.currentValue / challenge.goalValue) * 100;
      progressWidth.value = withTiming(newProgress, { duration: 500 });
      
      await loadChallenge();
    } catch (error) {
      console.error("Failed to add contribution:", error);
    }
  };

  const handleReset = async () => {
    await resetDemoState();
    progressWidth.value = 0;
    await loadChallenge();
  };

  const handleLogin = () => {
    navigate.toHome();
  };

  // アニメーションスタイル
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: celebrationOpacity.value,
  }));

  const numberAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysLeft = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading || !challenge) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted">デモを読み込み中...</Text>
      </ScreenContainer>
    );
  }

  const progress = (challenge.currentValue / challenge.goalValue) * 100;
  const daysLeft = getDaysLeft(challenge.eventDate);

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* デモバナー */}
        <View 
          className="mb-4 p-3 rounded-xl flex-row items-center"
          style={{ backgroundColor: colors.warning + "20" }}
        >
          <Ionicons name="flask" size={20} color={colors.warning} />
          <Text className="flex-1 ml-2 text-sm" style={{ color: colors.warning }}>
            これはデモ体験です。実際のチャレンジではありません。
          </Text>
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-xs" style={{ color: colors.warning }}>リセット</Text>
          </Pressable>
        </View>

        {/* チャレンジヘッダー */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Text className="text-2xl">🎤</Text>
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-lg font-bold text-foreground">{challenge.title}</Text>
              <Text className="text-sm text-muted">
                主催: {challenge.hostName} (@{challenge.hostUsername})
              </Text>
            </View>
          </View>

          {/* 進捗バー */}
          <View className="mb-4">
            <View className="flex-row items-end justify-between mb-2">
              <Animated.Text 
                className="text-3xl font-bold text-foreground"
                style={numberAnimatedStyle}
              >
                {challenge.currentValue}
              </Animated.Text>
              <Text className="text-lg text-muted">/ {challenge.goalValue}人</Text>
            </View>
            <View 
              className="h-4 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.border }}
            >
              <Animated.View
                className="h-full rounded-full"
                style={[
                  { backgroundColor: colors.primary },
                  progressAnimatedStyle,
                ]}
              />
            </View>
            <Text className="text-sm text-muted mt-1 text-right">
              達成率 {progress.toFixed(1)}%（参加予定）
            </Text>
          </View>

          {/* イベント情報 */}
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-1">{formatDate(challenge.eventDate)}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-1">{challenge.venue}</Text>
            </View>
            <View 
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                あと{daysLeft}日
              </Text>
            </View>
          </View>
        </View>

        {/* 説明 */}
        <View className="bg-surface rounded-xl p-4 border border-border mb-4">
          <Text className="text-foreground">{challenge.description}</Text>
        </View>

        {/* 参加ボタン */}
        {!challenge.userState.hasJoined ? (
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              onPress={handleJoin}
              disabled={joining}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center",
                opacity: pressed ? 0.9 : 1,
              })}
            >
              {joining ? (
                <ActivityIndicator color={color.textWhite} />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="hand-right" size={24} color={color.textWhite} />
                  <Text className="text-white text-lg font-bold ml-2">
                    参加する（お試し）
                  </Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        ) : (
          <View>
            {/* 参加済み表示 */}
            <View 
              className="p-4 rounded-xl mb-4 items-center"
              style={{ backgroundColor: colors.success + "20" }}
            >
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text className="text-lg font-bold ml-2" style={{ color: colors.success }}>
                  参加中！
                </Text>
              </View>
              <Text className="text-sm text-muted mt-1">
                あなたの貢献: {challenge.userState.contribution}人
              </Text>
            </View>

            {/* 友達を誘うボタン */}
            <Pressable
              onPress={handleAddContribution}
              style={({ pressed }) => ({
                backgroundColor: colors.surface,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
                marginBottom: 12,
              })}
            >
              <View className="flex-row items-center">
                <Ionicons name="people" size={20} color={colors.primary} />
                <Text className="font-semibold ml-2" style={{ color: colors.primary }}>
                  友達を誘う（+1人）
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* お祝いメッセージ */}
        <Animated.View 
          className="absolute top-1/3 left-0 right-0 items-center"
          style={celebrationAnimatedStyle}
          pointerEvents="none"
        >
          <View 
            className="px-6 py-4 rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-xl font-bold text-center">
              🎉 参加ありがとう！
            </Text>
            <Text className="text-white text-center mt-1">
              一緒に目標を達成しよう！
            </Text>
          </View>
        </Animated.View>

        {/* 参加者リスト */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            参加者 ({challenge.participants.length}人)
          </Text>
          <View className="gap-2">
            {challenge.participants.slice(0, 5).map((participant) => (
              <View 
                key={participant.id}
                className="flex-row items-center bg-surface p-3 rounded-xl border border-border"
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.muted + "30" }}
                >
                  <Ionicons name="person" size={20} color={colors.muted} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="font-medium text-foreground">
                    {participant.name}
                    {participant.id === "demo_user" && (
                      <Text style={{ color: colors.primary }}> (あなた)</Text>
                    )}
                  </Text>
                  <Text className="text-xs text-muted">
                    貢献: {participant.contribution}人
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ログイン誘導 */}
        <View className="mt-8 p-5 bg-surface rounded-2xl border border-border">
          <Text className="text-lg font-bold text-foreground text-center mb-2">
            気に入りましたか？
          </Text>
          <Text className="text-muted text-center mb-4">
            ログインすると、実際のチャレンジに参加したり、自分でチャレンジを作成できます！
          </Text>
          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-in" size={20} color={color.textWhite} />
              <Text className="text-white font-bold ml-2">
                ログインして始める
              </Text>
            </View>
          </Pressable>
        </View>

        {/* 下部の余白 */}
        <View className="h-20" />
      </ScrollView>
    </ScreenContainer>
  );
}
