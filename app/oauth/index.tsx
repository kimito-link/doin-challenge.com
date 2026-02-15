import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/organisms/screen-container';
import { useAuth0 } from '@/lib/auth0-provider';
import * as Haptics from 'expo-haptics';

export default function OAuthScreen() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth0();
  const [error, setError] = useState<string | null>(null);

  // 既にログイン済みの場合はホーム画面にリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      setError(null);
      
      // ハプティックフィードバック
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      await login();
      
      // ログイン成功後はAuth0Providerが自動的にisAuthenticatedをtrueにする
      // useEffectでホーム画面にリダイレクトされる
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'ログインに失敗しました。もう一度お試しください。');
      
      // エラー時のハプティックフィードバック
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  return (
    <ScreenContainer className="flex-1 items-center justify-center p-6">
      <View className="w-full max-w-md items-center">
        {/* アプリロゴ */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground text-center">
            君斗りんくの
          </Text>
          <Text className="text-4xl font-bold text-foreground text-center">
            動員ちゃれんじ
          </Text>
        </View>

        {/* 説明文 */}
        <Text className="text-base text-muted text-center mb-8">
          Twitterアカウントでログインして、
        </Text>
        <Text className="text-base text-muted text-center mb-8">
          生誕祭の動員チャレンジに参加しよう！
        </Text>

        {/* エラーメッセージ */}
        {error && (
          <View className="w-full bg-error/10 border border-error rounded-lg p-4 mb-6">
            <Text className="text-error text-sm text-center">{error}</Text>
          </View>
        )}

        {/* ログインボタン */}
        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          className="w-full bg-primary px-6 py-4 rounded-full items-center"
          style={({ pressed }) => [
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-background text-lg font-bold">
              Twitterでログイン
            </Text>
          )}
        </Pressable>

        {/* 注意事項 */}
        <Text className="text-xs text-muted text-center mt-6">
          ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
        </Text>
      </View>
    </ScreenContainer>
  );
}
