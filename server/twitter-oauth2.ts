import crypto from "crypto";
import { getDb } from "./db";
import { oauthPkceData } from "../drizzle/schema";
import { eq, lt } from "drizzle-orm";
import { twitterApiFetch, waitIfRateLimited } from "./rate-limit-handler";

// Twitter OAuth 2.0 with PKCE implementation
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || "";
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || "";

// Generate PKCE code verifier and challenge
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  // Generate a random code verifier (43-128 characters)
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  
  // Generate code challenge using SHA256
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  
  return { codeVerifier, codeChallenge };
}

// Generate state for CSRF protection
export function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

// Build authorization URL
export function buildAuthorizationUrl(
  callbackUrl: string,
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: callbackUrl,
    scope: "users.read tweet.read follows.read offline.access",
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  
  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  callbackUrl: string,
  codeVerifier: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}> {
  const url = "https://api.twitter.com/2/oauth2/token";
  
  const params = new URLSearchParams({
    code: code,
    grant_type: "authorization_code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: callbackUrl,
    code_verifier: codeVerifier,
  });
  
  // Create Basic auth header
  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const text = await response.text();
    console.error("Token exchange error:", text);
    throw new Error(`Failed to exchange code for tokens: ${text}`);
  }
  
  return response.json();
}

// Get user profile using OAuth 2.0 access token
export async function getUserProfile(accessToken: string): Promise<{
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
  description: string;
}> {
  const url = "https://api.twitter.com/2/users/me";
  const params = "user.fields=profile_image_url,public_metrics,description";
  const fullUrl = `${url}?${params}`;
  
  const response = await fetch(fullUrl, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const text = await response.text();
    console.error("User profile error:", text);
    throw new Error(`Failed to get user profile: ${text}`);
  }
  
  const json = await response.json();
  return json.data;
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}> {
  const url = "https://api.twitter.com/2/oauth2/token";
  
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: TWITTER_CLIENT_ID,
  });
  
  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to refresh token: ${text}`);
  }
  
  return response.json();
}

// Store PKCE data in database
export async function storePKCEData(state: string, codeVerifier: string, callbackUrl: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[PKCE] Database not available, using memory fallback");
    pkceMemoryStore.set(state, { codeVerifier, callbackUrl });
    setTimeout(() => pkceMemoryStore.delete(state), 10 * 60 * 1000);
    return;
  }
  
  // Set expiration to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  try {
    // Clean up expired entries first
    await db.delete(oauthPkceData).where(lt(oauthPkceData.expiresAt, new Date()));
    
    // Insert new PKCE data
    await db.insert(oauthPkceData).values({
      state,
      codeVerifier,
      callbackUrl,
      expiresAt,
    });
    
    console.log("[PKCE] Stored PKCE data for state:", state.substring(0, 8) + "...");
  } catch (error) {
    console.error("[PKCE] Failed to store in database, using memory fallback:", error);
    pkceMemoryStore.set(state, { codeVerifier, callbackUrl });
    setTimeout(() => pkceMemoryStore.delete(state), 10 * 60 * 1000);
  }
}

// Get PKCE data from database
export async function getPKCEData(state: string): Promise<{ codeVerifier: string; callbackUrl: string } | undefined> {
  // Check memory store first (fallback)
  const memoryData = pkceMemoryStore.get(state);
  if (memoryData) {
    console.log("[PKCE] Retrieved PKCE data from memory for state:", state.substring(0, 8) + "...");
    return memoryData;
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[PKCE] Database not available");
    return undefined;
  }
  
  try {
    const result = await db.select().from(oauthPkceData).where(eq(oauthPkceData.state, state)).limit(1);
    
    if (result.length === 0) {
      console.log("[PKCE] No PKCE data found for state:", state.substring(0, 8) + "...");
      return undefined;
    }
    
    const data = result[0];
    
    // Check if expired
    if (new Date(data.expiresAt) < new Date()) {
      console.log("[PKCE] PKCE data expired for state:", state.substring(0, 8) + "...");
      await deletePKCEData(state);
      return undefined;
    }
    
    console.log("[PKCE] Retrieved PKCE data for state:", state.substring(0, 8) + "...");
    return {
      codeVerifier: data.codeVerifier,
      callbackUrl: data.callbackUrl,
    };
  } catch (error) {
    console.error("[PKCE] Failed to get from database:", error);
    return undefined;
  }
}

// Delete PKCE data from database
export async function deletePKCEData(state: string): Promise<void> {
  // Delete from memory store
  pkceMemoryStore.delete(state);
  
  const db = await getDb();
  if (!db) {
    console.warn("[PKCE] Database not available for delete");
    return;
  }
  
  try {
    await db.delete(oauthPkceData).where(eq(oauthPkceData.state, state));
    console.log("[PKCE] Deleted PKCE data for state:", state.substring(0, 8) + "...");
  } catch (error) {
    console.error("[PKCE] Failed to delete from database:", error);
  }
}

// Memory fallback store for PKCE data
const pkceMemoryStore = new Map<string, { codeVerifier: string; callbackUrl: string }>();

// Target account to check follow status (idolfunch)
const TARGET_TWITTER_USERNAME = "idolfunch";

// Check if user follows a specific account
// 指数バックオフとレート制限対応を適用
// レート制限時はスキップして認証を継続
export async function checkFollowStatus(
  accessToken: string,
  sourceUserId: string,
  targetUsername: string = TARGET_TWITTER_USERNAME
): Promise<{
  isFollowing: boolean;
  targetUser: {
    id: string;
    name: string;
    username: string;
  } | null;
  skipped?: boolean;
}> {
  try {
    // First, get the target user's ID by username
    const userLookupUrl = `https://api.twitter.com/2/users/by/username/${targetUsername}`;
    
    // レート制限時はタイムアウトを短くしてスキップ
    const { data: userData, rateLimitInfo: userRateLimitInfo } = await twitterApiFetch<{ data?: { id: string; name: string; username: string } }>(
      userLookupUrl,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      },
      { maxRetries: 2, initialDelayMs: 500, maxDelayMs: 5000 } // リトライを減らして高速化
    );
    
    // レート制限に近づいている場合はスキップ（待機しない）
    if (userRateLimitInfo && userRateLimitInfo.remaining <= 0) {
      console.log("[Twitter API] Rate limit reached, skipping follow check");
      return { isFollowing: false, targetUser: null, skipped: true };
    }
    
    const targetUser = userData.data;
    
    if (!targetUser) {
      console.error("Target user not found:", targetUsername);
      return { isFollowing: false, targetUser: null };
    }
    
    // Check if source user follows target user
    // Using the followers lookup endpoint
    const followCheckUrl = `https://api.twitter.com/2/users/${sourceUserId}/following`;
    const params = new URLSearchParams({
      "user.fields": "id,name,username",
      "max_results": "1000",
    });
    
    const { data: followData, rateLimitInfo: followRateLimitInfo } = await twitterApiFetch<{ data?: Array<{ id: string; name: string; username: string }> }>(
      `${followCheckUrl}?${params}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      },
      { maxRetries: 2, initialDelayMs: 500, maxDelayMs: 5000 } // リトライを減らして高速化
    );
    
    // レート制限情報をログ
    if (followRateLimitInfo) {
      console.log(
        `[Twitter API] Follow check rate limit: ${followRateLimitInfo.remaining}/${followRateLimitInfo.limit} remaining`
      );
    }
    
    const following = followData.data || [];
    
    // Check if target user is in the following list
    const isFollowing = following.some((user: { id: string }) => user.id === targetUser.id);
    
    return {
      isFollowing,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
      },
    };
  } catch (error) {
    // レート制限エラーの場合はスキップして認証を継続
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      console.log("[Twitter API] Rate limit error, skipping follow check");
      return { isFollowing: false, targetUser: null, skipped: true };
    }
    console.error("Follow status check error:", error);
    return { isFollowing: false, targetUser: null };
  }
}

// Get target account info
export function getTargetAccountInfo() {
  return {
    username: TARGET_TWITTER_USERNAME,
    displayName: "君斗りんく",
    profileUrl: `https://twitter.com/${TARGET_TWITTER_USERNAME}`,
  };
}


// ユーザー名からプロフィール情報を取得（Bearer Token認証）
export async function getUserProfileByUsername(username: string): Promise<{
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  description?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
} | null> {
  // ユーザー名をクリーンアップ（@を削除、URLからユーザー名を抽出）
  let cleanUsername = username.trim();
  
  // URL形式の場合（https://x.com/username または https://twitter.com/username）
  const urlMatch = cleanUsername.match(/(?:https?:\/\/)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/i);
  if (urlMatch) {
    cleanUsername = urlMatch[1];
  }
  
  // @を削除
  cleanUsername = cleanUsername.replace(/^@/, "");
  
  if (!cleanUsername) {
    return null;
  }
  
  try {
    // Bearer Token認証を使用（アプリ専用認証）
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      console.error("TWITTER_BEARER_TOKEN is not set");
      return null;
    }
    
    const url = `https://api.twitter.com/2/users/by/username/${cleanUsername}`;
    const params = "user.fields=profile_image_url,public_metrics,description";
    const fullUrl = `${url}?${params}`;
    
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
      },
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error("Twitter user lookup error:", response.status, text);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.data) {
      console.error("Twitter user not found:", cleanUsername);
      return null;
    }
    
    // プロフィール画像を高解像度に変換
    const profileImageUrl = data.data.profile_image_url?.replace("_normal", "_400x400") || "";
    
    return {
      id: data.data.id,
      name: data.data.name,
      username: data.data.username,
      profile_image_url: profileImageUrl,
      description: data.data.description,
      public_metrics: data.data.public_metrics,
    };
  } catch (error) {
    console.error("Error fetching Twitter user profile:", error);
    return null;
  }
}
