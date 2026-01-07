import { ThemedView } from "@/components/themed-view";
import * as Auth from "@/lib/_core/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TwitterOAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    data?: string;
    error?: string;
  }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log("[Twitter OAuth] Callback handler triggered");
      console.log("[Twitter OAuth] Params received:", {
        data: params.data ? "present" : "missing",
        error: params.error,
      });

      try {
        // Check for error
        if (params.error) {
          console.error("[Twitter OAuth] Error parameter found:", params.error);
          setStatus("error");
          setErrorMessage(params.error);
          return;
        }

        // Check for data
        if (!params.data) {
          console.error("[Twitter OAuth] Missing data parameter");
          setStatus("error");
          setErrorMessage("認証データが見つかりません");
          return;
        }

        // Parse user data
        try {
          const userData = JSON.parse(decodeURIComponent(params.data));
          console.log("[Twitter OAuth] User data parsed:", {
            twitterId: userData.twitterId,
            username: userData.username,
            name: userData.name,
          });

          // Convert Twitter user data to Auth.User format
          const userInfo: Auth.User = {
            id: parseInt(userData.twitterId) || 0,
            openId: `twitter:${userData.twitterId}`,
            name: userData.name,
            email: null,
            loginMethod: "twitter",
            lastSignedIn: new Date(),
            // Twitter specific fields
            username: userData.username,
            profileImage: userData.profileImage,
            followersCount: userData.followersCount,
            isFollowingTarget: userData.isFollowingTarget,
            targetAccount: userData.targetAccount,
          };

          // Store user info using the Auth module
          await Auth.setUserInfo(userInfo);
          console.log("[Twitter OAuth] User info stored successfully via Auth module");

          setStatus("success");
          console.log("[Twitter OAuth] Authentication successful, redirecting to mypage...");

          // Redirect to mypage tab after a short delay
          setTimeout(() => {
            console.log("[Twitter OAuth] Executing redirect...");
            router.replace("/(tabs)/mypage");
          }, 1500);
        } catch (parseError) {
          console.error("[Twitter OAuth] Failed to parse user data:", parseError);
          setStatus("error");
          setErrorMessage("認証データの解析に失敗しました");
        }
      } catch (error) {
        console.error("[Twitter OAuth] Callback error:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "認証の完了に失敗しました"
        );
      }
    };

    handleCallback();
  }, [params.data, params.error, router]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
      <ThemedView className="flex-1 items-center justify-center gap-4 p-5">
        {status === "processing" && (
          <>
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="mt-4 text-base leading-6 text-center text-foreground">
              認証を完了しています...
            </Text>
          </>
        )}
        {status === "success" && (
          <>
            <Text className="text-4xl mb-2">✓</Text>
            <Text className="text-xl font-bold text-center text-foreground">
              認証成功！
            </Text>
            <Text className="text-base leading-6 text-center text-muted">
              リダイレクトしています...
            </Text>
          </>
        )}
        {status === "error" && (
          <>
            <Text className="text-4xl mb-2">✕</Text>
            <Text className="mb-2 text-xl font-bold leading-7 text-error">
              認証に失敗しました
            </Text>
            <Text className="text-base leading-6 text-center text-foreground">
              {errorMessage}
            </Text>
            <Text
              className="mt-4 text-primary underline"
              onPress={() => router.replace("/(tabs)/mypage")}
            >
              マイページに戻る
            </Text>
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
