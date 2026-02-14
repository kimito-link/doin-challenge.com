/**
 * KeyboardAvoidingContainer
 * キーボード表示時にコンテンツを適切に調整するコンテナ
 */

import { KeyboardAvoidingView, Platform, type ViewProps } from "react-native";
import { ReactNode } from "react";

interface KeyboardAvoidingContainerProps extends ViewProps {
  children: ReactNode;
  /**
   * キーボードとコンテンツの間のオフセット（デフォルト: 0）
   */
  keyboardVerticalOffset?: number;
  /**
   * キーボード表示時の動作（デフォルト: iOS="padding", Android="height"）
   */
  behavior?: "height" | "position" | "padding";
}

/**
 * プラットフォームに応じた最適なKeyboardAvoidingViewを提供
 * 
 * iOS: behavior="padding"（推奨）
 * Android: behavior="height"（推奨）
 * 
 * @example
 * ```tsx
 * <KeyboardAvoidingContainer>
 *   <TextInput placeholder="名前" />
 *   <TextInput placeholder="メールアドレス" />
 *   <Button title="送信" />
 * </KeyboardAvoidingContainer>
 * ```
 */
export function KeyboardAvoidingContainer({
  children,
  keyboardVerticalOffset = 0,
  behavior,
  style,
  ...props
}: KeyboardAvoidingContainerProps) {
  // プラットフォームに応じたデフォルトのbehavior
  const defaultBehavior = Platform.select({
    ios: "padding" as const,
    android: "height" as const,
    default: "padding" as const,
  });

  return (
    <KeyboardAvoidingView
      behavior={behavior || defaultBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[{ flex: 1 }, style]}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
