import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl, SESSION_TOKEN_KEY } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";
import { Platform } from "react-native";

/**
 * tRPC React client for type-safe API calls.
 *
 * IMPORTANT (tRPC v11): The `transformer` must be inside `httpBatchLink`,
 * NOT at the root createClient level. This ensures client and server
 * use the same serialization format (superjson).
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get access token from localStorage (Web) or SecureStore (Native)
 * This is used for cross-origin requests where cookies don't work
 */
async function getAccessToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      // Web: get from localStorage
      const token = window.localStorage.getItem(SESSION_TOKEN_KEY);
      if (token) {
        console.log("[tRPC] Using access token from localStorage");
        return token;
      }
    }
    // Native: use Auth module
    return await Auth.getSessionToken();
  } catch (error) {
    console.error("[tRPC] Failed to get access token:", error);
    return null;
  }
}

/**
 * Creates the tRPC client with proper configuration.
 * Call this once in your app's root layout.
 */
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        // tRPC v11: transformer MUST be inside httpBatchLink, not at root
        transformer: superjson,
        async headers() {
          // Always try to get access token and send in Authorization header
          // This is required for cross-origin requests (Vercel -> Railway)
          const token = await getAccessToken();
          if (token) {
            return { Authorization: `Bearer ${token}` };
          }
          return {};
        },
        // Custom fetch to include credentials for cookie-based auth (fallback)
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
}
