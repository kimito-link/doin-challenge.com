/**
 * ErrorBoundary - 汎用エラーバウンダリコンポーネント
 * 
 * React 18のクラスコンポーネントを使用してエラーをキャッチし、
 * アプリ全体のクラッシュを防ぎます。
 * 
 * 使用例:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <RiskyComponent />
 * </ErrorBoundary>
 * ```
 */

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { color } from "@/theme/tokens";

// エラーバウンダリのProps型
export interface ErrorBoundaryProps {
  /** エラー時に表示するフォールバックUI */
  fallback?: ReactNode;
  /** エラー時に表示するフォールバックUIを返す関数 */
  fallbackRender?: (props: FallbackProps) => ReactNode;
  /** エラー発生時のコールバック */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** リトライ時のコールバック */
  onReset?: () => void;
  /** 子コンポーネント */
  children: ReactNode;
}

// フォールバックコンポーネントに渡されるProps
export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// エラーバウンダリの状態型
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - クラスコンポーネント
 * 
 * React 18ではエラーバウンダリはクラスコンポーネントでのみ実装可能
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーログを出力
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Error info:", errorInfo);
    
    // コールバックがあれば呼び出し
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, fallbackRender } = this.props;

    if (hasError && error) {
      // fallbackRenderが指定されていればそれを使用
      if (fallbackRender) {
        return fallbackRender({
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      // fallbackが指定されていればそれを使用
      if (fallback) {
        return fallback;
      }

      // デフォルトのフォールバックUI
      return (
        <DefaultErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

/**
 * DefaultErrorFallback - デフォルトのエラー表示UI
 */
function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="error-outline" size={48} color={color.danger} />
      <Text style={styles.title}>エラーが発生しました</Text>
      <Text style={styles.message} numberOfLines={3}>
        {error.message}
      </Text>
      <Pressable
        onPress={resetErrorBoundary}
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.retryButtonPressed,
        ]}
      >
        <MaterialIcons name="refresh" size={20} color={color.textWhite} />
        <Text style={styles.retryText}>再試行</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: color.surface,
    borderRadius: 16,
    gap: 12,
  },
  title: {
    color: color.textWhite,
    fontSize: 18,
    fontWeight: "bold",
  },
  message: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: color.accentPrimary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  retryText: {
    color: color.textWhite,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ErrorBoundary;
