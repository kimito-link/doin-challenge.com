/**
 * レスポンシブユーティリティ
 * 
 * 画面サイズに応じたレイアウト調整
 */

import { Dimensions, Platform } from "react-native";

/**
 * 画面サイズを取得
 */
export function getScreenDimensions() {
  return Dimensions.get("window");
}

/**
 * 画面幅を取得
 */
export function getScreenWidth(): number {
  return Dimensions.get("window").width;
}

/**
 * 画面高さを取得
 */
export function getScreenHeight(): number {
  return Dimensions.get("window").height;
}

/**
 * デバイスタイプを判定
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = getScreenWidth();
  
  if (Platform.OS === "web") {
    if (width >= 1024) return "desktop";
    if (width >= 768) return "tablet";
    return "mobile";
  }
  
  // React Nativeの場合
  if (width >= 768) return "tablet";
  return "mobile";
}

/**
 * モバイルかどうかを判定
 */
export function isMobile(): boolean {
  return getDeviceType() === "mobile";
}

/**
 * タブレットかどうかを判定
 */
export function isTablet(): boolean {
  return getDeviceType() === "tablet";
}

/**
 * デスクトップかどうかを判定
 */
export function isDesktop(): boolean {
  return getDeviceType() === "desktop";
}

/**
 * レスポンシブフォントサイズを取得
 */
export function getResponsiveFontSize(baseSize: number): number {
  const width = getScreenWidth();
  const scale = width / 375; // iPhone SE基準
  
  return Math.round(baseSize * scale);
}

/**
 * レスポンシブスペーシングを取得
 */
export function getResponsiveSpacing(baseSpacing: number): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case "desktop":
      return baseSpacing * 1.5;
    case "tablet":
      return baseSpacing * 1.25;
    default:
      return baseSpacing;
  }
}

/**
 * レスポンシブ列数を取得
 */
export function getResponsiveColumns(): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case "desktop":
      return 3;
    case "tablet":
      return 2;
    default:
      return 1;
  }
}

/**
 * レスポンシブパディングを取得
 */
export function getResponsivePadding(): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case "desktop":
      return 32;
    case "tablet":
      return 24;
    default:
      return 16;
  }
}

/**
 * レスポンシブ最大幅を取得
 */
export function getResponsiveMaxWidth(): number | undefined {
  const deviceType = getDeviceType();
  
  if (deviceType === "desktop") {
    return 1200;
  }
  
  return undefined;
}
