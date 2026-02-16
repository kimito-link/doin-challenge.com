import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/organisms/screen-container';
import { useAuth0 } from '@/lib/auth0-provider';
import { navigateReplace } from '@/lib/navigation/app-routes';
import * as Haptics from 'expo-haptics';
import { getApiBaseUrl } from '@/lib/api/config';

export default function OAuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login, isLoading, isAuthenticated } = useAuth0();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auth0コールバック処理（Web環境のみ）
  useEffect(() => {
    if (Platform.OS === 'web' && params.code) {
      handleAuth0Callback(params.code as string);
    }
  }, [params.code]);

  // 既にログイン済みの場合はホーム画面にリダイレクト
  useEffect(() => {
    if (isAuthenticated && !isProcessing) {
      navigateReplace.toHome();
    }
  }, [isAuthenticated, isProcessing]);

  const handleAuth0Callback = async (code: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Auth0の認可コードをアクセストークンに交換
      const apiUrl = getApiBaseUrl();
      const redirectUri = `${window.location.origin}/oauth`;
      
      const response = await fetch(`${apiUrl}/api/trpc/auth0.exchangeCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            code,
            redirectUri,
          },
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed:', errorText);
        throw new Error('ログインに失敗しました。もう一度お試しください。');
      }

      const result = await response.json();
      const userData = result.result?.data?.user;

      if (!userData) {
        throw new Error('ユーザー情報の取得に失敗しました。');
      }

      // ログイン成功 - ホーム画面にリダイレクト
      navigateReplace.toHome();
    } catch (err: any) {
      console.error('Auth0 callback failed:', err);
      setError(err.message || 'ログインに失敗しました。もう一度お試しください。');
      setIsProcessing(false);
    }
  };

  const handleLogin = async () => {
    try {
      setError(null);
      
      // ハプティックフィードバック
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      await login();
      
      // Web環境ではAuth0にリダイレクトされるため、ここには戻ってこない
      // ネイティブアプリではログイン成功後にuseEffectでリダイレクトされる
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'ログインに失敗しました。もう一度お試しください。');
      
      // エラー時のハプティックフィードバック
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // コールバック処理中の表示
  if (isProcessing) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center p-6">
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text className="text-base text-muted text-center mt-4">
          ログイン処理中...
        </Text>
      </ScreenContainer>
    );
  }

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
          ログインして、動員チャレンジに参加しよう！
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
              ログイン
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
