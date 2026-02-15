import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

interface LoginErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * ログインエラーメッセージコンポーネント
 * 
 * 機能:
 * - ユーザーフレンドリーなエラーメッセージ表示
 * - リトライボタン
 * - 閉じるボタン
 * - ハプティックフィードバック
 */
export function LoginErrorMessage({
  error,
  onRetry,
  onDismiss,
}: LoginErrorMessageProps) {
  const colors = useColors();
  
  useEffect(() => {
    // エラー表示時にハプティックフィードバック
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);
  
  // エラーメッセージを解析してユーザーフレンドリーなメッセージに変換
  const getErrorMessage = (err: Error | string): { title: string; message: string; canRetry: boolean } => {
    const errorString = typeof err === "string" ? err : err.message;
    
    // ネットワークエラー
    if (
      errorString.includes("fetch") ||
      errorString.includes("network") ||
      errorString.includes("Failed to fetch") ||
      errorString.includes("Network request failed")
    ) {
      return {
        title: "ネットワークエラー",
        message: "インターネット接続を確認して、もう一度お試しください。",
        canRetry: true,
      };
    }
    
    // OAuth state不一致エラー
    if (
      errorString.includes("Invalid or expired state parameter") ||
      errorString.includes("state")
    ) {
      return {
        title: "認証エラー",
        message: "ログインセッションの有効期限が切れました。もう一度ログインしてください。",
        canRetry: true,
      };
    }
    
    // タイムアウトエラー
    if (errorString.includes("timeout") || errorString.includes("Timeout")) {
      return {
        title: "タイムアウトエラー",
        message: "サーバーからの応答がありませんでした。しばらく待ってから、もう一度お試しください。",
        canRetry: true,
      };
    }
    
    // 認証失敗エラー
    if (
      errorString.includes("Unauthorized") ||
      errorString.includes("401") ||
      errorString.includes("authentication failed")
    ) {
      return {
        title: "認証失敗",
        message: "ログインに失敗しました。もう一度お試しください。",
        canRetry: true,
      };
    }
    
    // サーバーエラー
    if (
      errorString.includes("500") ||
      errorString.includes("502") ||
      errorString.includes("503") ||
      errorString.includes("Internal Server Error")
    ) {
      return {
        title: "サーバーエラー",
        message: "サーバーで問題が発生しました。しばらく待ってから、もう一度お試しください。",
        canRetry: true,
      };
    }
    
    // その他のエラー
    return {
      title: "ログインエラー",
      message: "ログイン中に問題が発生しました。もう一度お試しください。",
      canRetry: true,
    };
  };
  
  const { title, message, canRetry } = getErrorMessage(error);
  
  const handleRetry = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onRetry?.();
  };
  
  const handleDismiss = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss?.();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.error }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.error + "20" }]}>
          <Ionicons name="alert-circle" size={24} color={colors.error} />
        </View>
        {onDismiss && (
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={[styles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      
      <Text style={[styles.message, { color: colors.muted }]}>
        {message}
      </Text>
      
      {canRetry && onRetry && (
        <TouchableOpacity
          onPress={handleRetry}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="refresh" size={18} color="#fff" style={styles.retryIcon} />
          <Text style={styles.retryButtonText}>もう一度試す</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
