import * as Linking from "expo-linking";
import * as ReactNative from "react-native";
import { getApiBaseUrl as getApiBaseUrlFromConfig } from "@/lib/api/config";

// Extract scheme from bundle ID (last segment timestamp, prefixed with "manus")
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const bundleId = "space.manus.birthday.celebration.t20251224092509";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  portal: process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL ?? "",
  server: process.env.EXPO_PUBLIC_OAUTH_SERVER_URL ?? "",
  appId: process.env.EXPO_PUBLIC_APP_ID ?? "",
  ownerId: process.env.EXPO_PUBLIC_OWNER_OPEN_ID ?? "",
  ownerName: process.env.EXPO_PUBLIC_OWNER_NAME ?? "",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  deepLinkScheme: schemeFromBundleId,
};

export const OAUTH_PORTAL_URL = env.portal;
export const OAUTH_SERVER_URL = env.server;
export const APP_ID = env.appId;
export const OWNER_OPEN_ID = env.ownerId;
export const OWNER_NAME = env.ownerName;
export const API_BASE_URL = env.apiBaseUrl;

/**
 * Get the API base URL for OAuth redirect URIs.
 * Uses the centralized API config to ensure consistency.
 * 
 * For OAuth redirect URIs, we need the actual backend URL (Railway) in production,
 * not the frontend URL (Vercel), because Manus OAuth portal needs to redirect to the backend.
 */
export function getApiBaseUrl(): string {
  // Use the centralized API config function
  return getApiBaseUrlFromConfig();
}

export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";
export const REFRESH_TOKEN_KEY = "twitter_refresh_token";
export const TOKEN_EXPIRES_AT_KEY = "twitter_token_expires_at";

const encodeState = (value: string) => {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }
  const BufferImpl = (globalThis as Record<string, any>).Buffer;
  if (BufferImpl) {
    return BufferImpl.from(value, "utf-8").toString("base64");
  }
  return value;
};

export const getLoginUrl = () => {
  let redirectUri: string;

  if (ReactNative.Platform.OS === "web") {
    // Web platform: redirect to API server callback (not Metro bundler)
    // The API server will then redirect back to the frontend with the session token
    const apiBaseUrl = getApiBaseUrl();
    
    // リダイレクトURIが空の場合はエラー
    if (!apiBaseUrl) {
      console.error("[OAuth] API base URL is empty, cannot generate redirect URI");
      throw new Error("API base URL is not configured");
    }
    
    redirectUri = `${apiBaseUrl}/api/oauth/callback`;
    
    // モバイルブラウザでのデバッグ用ログ
    if (typeof window !== "undefined") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile || __DEV__) {
        console.log("[OAuth] Platform: web, redirectUri:", redirectUri);
        console.log("[OAuth] API base URL:", apiBaseUrl);
        console.log("[OAuth] Current hostname:", window.location.hostname);
        console.log("[OAuth] Is mobile:", isMobile);
      }
    }
  } else {
    // Native platform: use deep link scheme for mobile OAuth callback
    // This allows the OS to redirect back to the app after authentication
    redirectUri = Linking.createURL("/oauth/callback", {
      scheme: env.deepLinkScheme,
    });
  }

  const state = encodeState(redirectUri);

  const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`);
  url.searchParams.set("appId", APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  const loginUrl = url.toString();
  
  // デバッグ用ログ
  if (__DEV__) {
    console.log("[OAuth] Generated login URL:", loginUrl);
    console.log("[OAuth] Redirect URI:", redirectUri);
    console.log("[OAuth] OAuth Portal URL:", OAUTH_PORTAL_URL);
  }

  return loginUrl;
};
