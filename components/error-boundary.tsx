/**
 * エラーバウンダリコンポーネント
 * アプリ全体のエラーをキャッチして、ユーザーフレンドリーなエラー画面を表示
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("ErrorBoundary caught an error", {
      data: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😢</Text>
            <Text style={styles.title}>エラーが発生しました</Text>
            <Text style={styles.message}>
              申し訳ございません。予期しないエラーが発生しました。
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>エラー詳細（開発環境のみ）:</Text>
                <Text style={styles.errorMessage}>{this.state.error.message}</Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack}>{this.state.error.stack}</Text>
                )}
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={this.resetError}
            >
              <Text style={styles.buttonText}>もう一度試す</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    maxWidth: 400,
    alignItems: "center",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f5f5",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#a3a3a3",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    width: "100%",
    backgroundColor: "#171717",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: "#f5f5f5",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  errorStack: {
    fontSize: 10,
    color: "#a3a3a3",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#DD6500",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
