import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";
import { LinkSpeech } from "@/components/organisms/link-speech";
import * as Haptics from "expo-haptics";

export interface LinkAuthResultProps {
  type: "success" | "cancel" | "error";
  errorType?: "network" | "oauth" | "other";
  requestId?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

/**
 * ログイン結果画面（共通コンポーネント）
 * 
 * 成功/キャンセル/エラーを1つのコンポーネントで出し分け
 * 
 * @param type - 表示タイプ（success/cancel/error）
 * @param errorType - エラー種別（network/oauth/other）
 * @param requestId - リクエストID（開発環境のみ表示）
 * @param onRetry - 「もう一度試す」ボタンのコールバック
 * @param onBack - 「マイページに戻る」ボタンのコールバック
 */
export function LinkAuthResult({
  type,
  errorType = "other",
  requestId,
  onRetry,
  onBack,
}: LinkAuthResultProps) {
  const colors = useColors();

  // タイトルとメッセージを取得
  const { title, message } = getContent(type, errorType);

  // ボタン押下時のハプティクス
  const handlePress = (callback?: () => void) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    callback?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ロゴ */}
      <Image
        source={require("@/assets/images/icon.png")}
        style={styles.logo}
        contentFit="contain"
      />

      {/* りんくキャラクター */}
      <Image
        source={getCharacterImage(type)}
        style={styles.character}
        contentFit="contain"
      />

      {/* タイトル */}
      <Text
        style={[
          styles.title,
          {
            color:
              type === "success"
                ? colors.success
                : type === "cancel"
                ? colors.foreground
                : colors.error,
          },
        ]}
      >
        {title}
      </Text>

      {/* りんく吹き出し */}
      <LinkSpeech message={message} />

      {/* requestID（開発環境のみ） */}
      {type === "error" &&
        requestId &&
        process.env.NODE_ENV === "development" && (
          <Text style={[styles.requestId, { color: colors.muted }]}>
            エラーID: {requestId}
          </Text>
        )}

      {/* ボタン */}
      <View style={styles.buttonContainer}>
        {type === "error" && onRetry && (
          <Pressable
            onPress={() => handlePress(onRetry)}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              もう一度試す
            </Text>
          </Pressable>
        )}

        {onBack && (
          <Pressable
            onPress={() => handlePress(onBack)}
            style={({ pressed }) => [
              styles.button,
              type === "error"
                ? styles.secondaryButton
                : styles.primaryButton,
              type === "error"
                ? { borderColor: colors.border, borderWidth: 1 }
                : { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                type === "error"
                  ? { color: colors.foreground }
                  : { color: colors.background },
              ]}
            >
              マイページに戻る
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * タイトルとメッセージを取得
 */
function getContent(
  type: "success" | "cancel" | "error",
  errorType: "network" | "oauth" | "other"
): { title: string; message: string } {
  if (type === "success") {
    return {
      title: "ログイン完了！",
      message: "ようこそ！\nこれで参加履歴やお気に入りが使えるよ！",
    };
  }

  if (type === "cancel") {
    return {
      title: "ログインをキャンセルしました",
      message: "またいつでもログインできるから、安心してね！",
    };
  }

  // type === "error"
  if (errorType === "network") {
    return {
      title: "ログインできませんでした",
      message: "ネットワークに問題があるみたい...\nもう一度試してみてね！",
    };
  }

  if (errorType === "oauth") {
    return {
      title: "ログインできませんでした",
      message:
        "Xとの連携がうまくいかなかったみたい...\n時間をおいてもう一度試してみてね！",
    };
  }

  // errorType === "other"
  return {
    title: "ログインできませんでした",
    message: "うまくいかなかったみたい...\nもう一度試してみてね！",
  };
}

/**
 * キャラクター画像を取得
 */
function getCharacterImage(type: "success" | "cancel" | "error") {
  if (type === "success") {
    // 成功：笑顔（口開け）
    return require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png");
  }

  if (type === "cancel") {
    // キャンセル：困った表情（口閉じ）
    return require("@/assets/images/characters/link/link-yukkuri-half-eyes-mouth-closed.png");
  }

  // type === "error"
  // エラー：困った表情（半目）
  return require("@/assets/images/characters/link/link-yukkuri-half-eyes-mouth-open.png");
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
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  requestId: {
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 32,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // タップエリア確保
  },
  primaryButton: {
    // backgroundColor は動的に設定
  },
  secondaryButton: {
    backgroundColor: "transparent",
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
