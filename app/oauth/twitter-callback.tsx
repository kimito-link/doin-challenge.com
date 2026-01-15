import { ThemedView } from "@/components/themed-view";
import { FollowSuccessModal } from "@/components/follow-success-modal";
import * as Auth from "@/lib/_core/auth";
import { saveTokenData } from "@/lib/token-manager";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FOLLOW_SUCCESS_SHOWN_KEY = "follow_success_modal_shown";

export default function TwitterOAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    data?: string;
    error?: string;
  }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFollowSuccessModal, setShowFollowSuccessModal] = useState(false);
  const [targetAccountInfo, setTargetAccountInfo] = useState<{ username: string; name: string } | null>(null);
  const [savedReturnUrl, setSavedReturnUrl] = useState<string>("/(tabs)/mypage");
  const isFollowingRef = useRef(false);

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
          
          // エラーデータをパース（JSON形式の場合）
          try {
            const errorData = JSON.parse(decodeURIComponent(params.error));
            if (errorData.message) {
              // ユーザーフレンドリーなエラーメッセージに変換
              if (errorData.message.includes("fetch failed") || errorData.message.includes("network")) {
                setErrorMessage("ネットワークエラーが発生しました。もう一度お試しください。");
              } else if (errorData.message.includes("Invalid or expired state")) {
                setErrorMessage("認証の有効期限が切れました。もう一度ログインしてください。");
              } else if (errorData.message.includes("exchange code")) {
                setErrorMessage("Twitter認証に失敗しました。もう一度お試しください。");
              } else {
                setErrorMessage(errorData.message);
              }
            } else {
              setErrorMessage("認証に失敗しました");
            }
          } catch {
            // JSONパースに失敗した場合はそのまま表示
            setErrorMessage(params.error);
          }
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

          // Store token data for auto-refresh (if available)
          if (userData.accessToken) {
            await saveTokenData({
              accessToken: userData.accessToken,
              refreshToken: userData.refreshToken,
              expiresIn: 7200, // 2 hours
            });
            console.log("[Twitter OAuth] Token data stored for auto-refresh");
          }

          setStatus("success");
          console.log("[Twitter OAuth] Authentication successful");
          
          // ログイン前に保存したリダイレクト先を取得
          let returnUrl = "/(tabs)/mypage";
          if (typeof window !== "undefined") {
            const savedUrl = localStorage.getItem("auth_return_url");
            if (savedUrl) {
              returnUrl = savedUrl;
              localStorage.removeItem("auth_return_url");
              console.log("[Twitter OAuth] Using saved return URL:", returnUrl);
            }
          }
          setSavedReturnUrl(returnUrl);
          
          // フォローしている場合はお祝いモーダルを表示
          if (userData.isFollowingTarget) {
            isFollowingRef.current = true;
            setTargetAccountInfo(userData.targetAccount);
            
            // 以前にモーダルを表示したかチェック
            const hasShownBefore = await AsyncStorage.getItem(FOLLOW_SUCCESS_SHOWN_KEY);
            if (!hasShownBefore) {
              console.log("[Twitter OAuth] Showing follow success modal");
              setShowFollowSuccessModal(true);
              await AsyncStorage.setItem(FOLLOW_SUCCESS_SHOWN_KEY, "true");
              // モーダルを閉じたら保存したリダイレクト先に移動（後でモーダルのonCloseで処理）
            } else {
              // 既に表示済みの場合は直接リダイレクト
              setTimeout(() => {
                console.log("[Twitter OAuth] Executing redirect to:", returnUrl);
                router.replace(returnUrl as any);
              }, 1500);
            }
          } else {
            // フォローしていない場合は直接リダイレクト
            setTimeout(() => {
              console.log("[Twitter OAuth] Executing redirect to:", returnUrl);
              router.replace(returnUrl as any);
            }, 1500);
          }
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
              onPress={() => {
                // マイページに戻って再ログインを促す
                router.replace("/(tabs)/mypage");
              }}
            >
              マイページに戻って再ログイン
            </Text>
          </>
        )}
        
        {/* フォロー完了お祝いモーダル */}
        <FollowSuccessModal
          visible={showFollowSuccessModal}
          onClose={() => {
            setShowFollowSuccessModal(false);
            // モーダルを閉じたら保存したリダイレクト先に移動
            console.log("[Twitter OAuth] Modal closed, redirecting to:", savedReturnUrl);
            router.replace(savedReturnUrl as any);
          }}
          targetUsername={targetAccountInfo?.username || "idolfunch"}
          targetDisplayName={targetAccountInfo?.name || "君斗りんく"}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
