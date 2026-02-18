/**
 * 改善されたタッチ可能コンポーネント
 * アクセシビリティとユーザビリティを向上
 */

import React from "react";
import { Pressable, type PressableProps, type ViewStyle, Platform } from "react-native";
import * as Haptics from "expo-haptics";

export interface TouchableProps extends PressableProps {
  /**
   * タップ時のハプティックフィードバック
   * @default false
   */
  haptic?: boolean;
  
  /**
   * ハプティックフィードバックの種類
   * @default "light"
   */
  hapticType?: "light" | "medium" | "heavy" | "success" | "warning" | "error";
  
  /**
   * タップ領域の拡大（最低44x44pxを確保）
   * @default 8
   */
  hitSlop?: number;
  
  /**
   * プレス時のスケール
   * @default 0.97
   */
  pressScale?: number;
  
  /**
   * プレス時の不透明度
   * @default 0.8
   */
  pressOpacity?: number;
  
  /**
   * 連続タップを防ぐデバウンス時間（ms）
   * @default 0
   */
  debounce?: number;
  
  /**
   * 無効化時のスタイル
   */
  disabledStyle?: ViewStyle;
}

/**
 * 改善されたPressableコンポーネント
 * - 最低44x44pxのタップ領域を確保
 * - ハプティックフィードバック
 * - プレス時のビジュアルフィードバック
 * - 連続タップ防止
 */
export const Touchable = React.forwardRef<any, TouchableProps>(
  (
    {
      haptic = false,
      hapticType = "light",
      hitSlop = 8,
      pressScale = 0.97,
      pressOpacity = 0.8,
      debounce = 0,
      onPress,
      style,
      disabledStyle,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const lastPressTime = React.useRef(0);

    const handlePress = React.useCallback(
      (event: any) => {
        // デバウンス処理
        if (debounce > 0) {
          const now = Date.now();
          if (now - lastPressTime.current < debounce) {
            return;
          }
          lastPressTime.current = now;
        }

        // ハプティックフィードバック
        if (haptic && Platform.OS !== "web") {
          switch (hapticType) {
            case "light":
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              break;
            case "medium":
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              break;
            case "heavy":
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              break;
            case "success":
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              break;
            case "warning":
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              break;
            case "error":
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              break;
          }
        }

        onPress?.(event);
      },
      [haptic, hapticType, debounce, onPress]
    );

    return (
      <Pressable
        ref={ref}
        hitSlop={hitSlop}
        onPress={handlePress}
        disabled={disabled}
        style={(state) => [
          typeof style === "function" ? style(state) : style,
          state.pressed && {
            transform: [{ scale: pressScale }],
            opacity: pressOpacity,
          },
          disabled && disabledStyle,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);

Touchable.displayName = "Touchable";

/**
 * ボタン用のTouchable（デフォルトでハプティックフィードバック有効）
 */
export const TouchableButton = React.forwardRef<any, TouchableProps>((props, ref) => (
  <Touchable
    ref={ref}
    haptic={true}
    hapticType="light"
    debounce={300}
    {...props}
  />
));

TouchableButton.displayName = "TouchableButton";

/**
 * カード用のTouchable（軽いフィードバック）
 */
export const TouchableCard = React.forwardRef<any, TouchableProps>((props, ref) => (
  <Touchable
    ref={ref}
    pressScale={0.98}
    pressOpacity={0.9}
    {...props}
  />
));

TouchableCard.displayName = "TouchableCard";

/**
 * アイコン用のTouchable（小さいタップ領域）
 */
export const TouchableIcon = React.forwardRef<any, TouchableProps>((props, ref) => (
  <Touchable
    ref={ref}
    hitSlop={12}
    pressScale={0.95}
    pressOpacity={0.6}
    {...props}
  />
));

TouchableIcon.displayName = "TouchableIcon";
