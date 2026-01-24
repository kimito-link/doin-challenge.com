import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import { BlinkingLink } from "@/components/atoms/blinking-character";

export interface LinkAuthLoadingProps {
  /** 現在のステップ（1: ログイン中, 2: ユーザー情報取得中, 3: 完了） */
  currentStep?: 1 | 2 | 3;
}

/**
 * ログインローディング画面（共通コンポーネント）
 * 
 * ログイン処理中の画面を表示
 * 
 * @param currentStep - 現在のステップ（1: ログイン中, 2: ユーザー情報取得中, 3: 完了）
 */
export function LinkAuthLoading({ currentStep = 1 }: LinkAuthLoadingProps) {
  const colors = useColors();

  // ステップに応じたメッセージを取得
  const message = getMessage(currentStep);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ロゴ */}
      <Image
        source={require("@/assets/images/icon.png")}
        style={styles.logo}
        contentFit="contain"
      />

      {/* りんくキャラクター（まばたきアニメーション付き） */}
      <BlinkingLink
        variant="normalClosed"
        size={150}
        blinkInterval={2500}
        style={styles.character}
      />

      {/* ローディングインジケーター */}
      <ActivityIndicator size="large" color={colors.primary} />

      {/* メッセージ */}
      <Text style={[styles.message, { color: colors.foreground }]}>
        {message}
      </Text>

      {/* ステップインジケーター */}
      <View style={styles.stepContainer}>
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            style={[
              styles.stepDot,
              {
                backgroundColor:
                  step <= currentStep ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * ステップに応じたメッセージを取得
 */
function getMessage(step: 1 | 2 | 3): string {
  switch (step) {
    case 1:
      return "ログイン中...";
    case 2:
      return "ユーザー情報を取得中...";
    case 3:
      return "完了しました！";
    default:
      return "ログイン中...";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  character: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  stepContainer: {
    flexDirection: "row",
    marginTop: 32,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
