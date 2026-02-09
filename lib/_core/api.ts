import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "./auth";
import { apiPost, apiGet } from "@/lib/api";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // 全プラットフォームでBearerトークンを送信
  // Web: localStorageから取得（クロスオリジンではCookieが届かないため必須）
  // Native: SecureStoreから取得
  const sessionToken = await Auth.getSessionToken();
  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }

  const baseUrl = getApiBaseUrl();
  // Ensure no double slashes between baseUrl and endpoint
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = baseUrl ? `${cleanBaseUrl}${cleanEndpoint}` : endpoint;
  console.log("[API] Full URL:", url);

  try {
    console.log("[API] Making request...");
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    console.log("[API] Response status:", response.status, response.statusText);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log("[API] Response headers:", responseHeaders);

    // Check if Set-Cookie header is present (cookies are automatically handled in React Native)
    const setCookie = response.headers.get("Set-Cookie");
    if (setCookie) {
      console.log("[API] Set-Cookie header received:", setCookie);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Error response:", errorText);
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {
        // Not JSON, use text as is
      }
      throw new Error(errorMessage || `API call failed: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("[API] JSON response received");
      return data as T;
    }

    const text = await response.text();
    console.log("[API] Text response received");
    return (text ? JSON.parse(text) : {}) as T;
  } catch (error) {
    console.error("[API] Request failed:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

// Logout
export async function logout(): Promise<void> {
  await apiCall<void>("/api/auth/logout", {
    method: "POST",
  });
}

// Get current authenticated user (web uses cookie-based auth)
export async function getMe(): Promise<{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
  prefecture?: string | null;
  gender?: "male" | "female" | "unspecified" | null;
  role?: "user" | "admin" | null;
} | null> {
  try {
    const result = await apiCall<{ user: any }>("/api/auth/me");
    return result.user || null;
  } catch (error) {
    console.error("[API] getMe failed:", error);
    return null;
  }
}

// Establish session cookie on the backend (3000-xxx domain)
// Called after receiving token via postMessage to get a proper Set-Cookie from the backend
export async function establishSession(token: string): Promise<boolean> {
  try {
    console.log("[API] establishSession: setting cookie on backend...");
    
    const result = await apiPost("/api/auth/session", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!result.ok) {
      console.error("[API] establishSession failed:", result.status, result.error);
      return false;
    }

    console.log("[API] establishSession: cookie set successfully");
    return true;
  } catch (error) {
    console.error("[API] establishSession error:", error);
    return false;
  }
}


// Check Twitter follow status (called after login)
export async function checkFollowStatus(
  accessToken: string,
  userId: string
): Promise<{
  isFollowing: boolean;
  targetAccount: {
    id: string;
    name: string;
    username: string;
  } | null;
}> {
  try {
    console.log("[API] checkFollowStatus: checking follow status...");
    
    const result = await apiGet<{
      isFollowing: boolean;
      targetAccount: {
        id: string;
        name: string;
        username: string;
      } | null;
    }>(`/api/twitter/follow-status?userId=${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!result.ok || !result.data) {
      console.error("[API] checkFollowStatus failed:", result.status, result.error);
      return { isFollowing: false, targetAccount: null };
    }

    console.log("[API] checkFollowStatus result:", result.data);
    return {
      isFollowing: result.data.isFollowing || false,
      targetAccount: result.data.targetAccount || null,
    };
  } catch (error) {
    console.error("[API] checkFollowStatus error:", error);
    return { isFollowing: false, targetAccount: null };
  }
}
