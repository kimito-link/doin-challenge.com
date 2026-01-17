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
  codeChallenge: string,
  forceLogin: boolean = false
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
  
  // force_loginパラメータを追加して別のアカウントでログインできるようにする
  // Twitter OAuth 2.0では prompt=login で強制的にログイン画面を表示
  // これによりブラウザにキャッシュされたセッションを無視して別のアカウントを選択可能
  if (forceLogin) {
    // prompt=login: 強制的にログイン画面を表示（セッションがあっても再認証を要求）
    params.set("prompt", "login");
    // タイムスタンプも追加してキャッシュを確実に無効化
    params.set("t", Date.now().toString());
  }
  
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

// Memory fallback store for PKCE data (used when database is unavailable)
const pkceMemoryStore = new Map<string, { codeVerifier: string; callbackUrl: string }>();

// Store PKCE data - データベース優先で保存（複数インスタンス対応）
// Railwayなどの複数インスタンス環境では、メモリストアは別インスタンスで参照できないため
// データベースへの保存を同期的に行い、確実にデータを永続化する
export async function storePKCEData(state: string, codeVerifier: string, callbackUrl: string): Promise<void> {
  // メモリにも保存（同一インスタンスでの高速アクセス用）
  pkceMemoryStore.set(state, { codeVerifier, callbackUrl });
  setTimeout(() => pkceMemoryStore.delete(state), 10 * 60 * 1000);
  
  // データベースに同期的に保存（複数インスタンス対応のため必須）
  try {
    const db = await getDb();
    if (!db) {
      console.log("[PKCE] Database not available, using memory-only mode");
      return;
    }
    
    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Clean up expired entries first (non-blocking error handling)
    await db.delete(oauthPkceData).where(lt(oauthPkceData.expiresAt, new Date())).catch(() => {});
    
    // Insert new PKCE data
    await db.insert(oauthPkceData).values({
      state,
      codeVerifier,
      callbackUrl,
      expiresAt,
    });
    
    console.log("[PKCE] Stored PKCE data in database for state:", state.substring(0, 8) + "...");
  } catch (error) {
    console.error("[PKCE] Database storage failed:", error instanceof Error ? error.message : error);
    // メモリには保存済みなので、単一インスタンスの場合は動作する
    console.log("[PKCE] Falling back to memory-only mode for state:", state.substring(0, 8) + "...");
  }
}

// Get PKCE data - データベース優先で取得（複数インスタンス対応）
export async function getPKCEData(state: string): Promise<{ codeVerifier: string; callbackUrl: string } | undefined> {
  // まずデータベースから取得を試みる（複数インスタンス対応）
  try {
    const db = await getDb();
    if (db) {
      const result = await db.select().from(oauthPkceData).where(eq(oauthPkceData.state, state)).limit(1);
      
      if (result.length > 0) {
        const data = result[0];
        
        // Check if expired
        if (new Date(data.expiresAt) < new Date()) {
          console.log("[PKCE] PKCE data expired for state:", state.substring(0, 8) + "...");
          await deletePKCEData(state);
          return undefined;
        }
        
        console.log("[PKCE] Retrieved PKCE data from database for state:", state.substring(0, 8) + "...");
        return {
          codeVerifier: data.codeVerifier,
          callbackUrl: data.callbackUrl,
        };
      }
    }
  } catch (error) {
    console.error("[PKCE] Failed to get from database:", error);
  }
  
  // データベースにない場合はメモリストアをチェック（フォールバック）
  const memoryData = pkceMemoryStore.get(state);
  if (memoryData) {
    console.log("[PKCE] Retrieved PKCE data from memory for state:", state.substring(0, 8) + "...");
    return memoryData;
  }
  
  console.log("[PKCE] No PKCE data found for state:", state.substring(0, 8) + "...");
  return undefined;
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
      { maxRetries: 2, initialDelayMs: 500, maxDelayMs: 5000 }
    );
    
    // レート制限に近づいている場合はスキップ
    if (followRateLimitInfo && followRateLimitInfo.remaining <= 0) {
      console.log("[Twitter API] Rate limit reached during follow check, skipping");
      return { isFollowing: false, targetUser, skipped: true };
    }
    
    const following = followData.data || [];
    const isFollowing = following.some(user => user.id === targetUser.id);
    
    return {
      isFollowing,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
      },
    };
  } catch (error) {
    console.error("Follow status check error:", error);
    // エラー時はスキップとして扱い、認証は継続
    return { isFollowing: false, targetUser: null, skipped: true };
  }
}

// Get target account info
export function getTargetAccountInfo(): { username: string; displayName: string; profileUrl: string } {
  return {
    username: TARGET_TWITTER_USERNAME,
    displayName: "アイドルファンチ",
    profileUrl: `https://twitter.com/${TARGET_TWITTER_USERNAME}`,
  };
}

// Get user profile by username (supports @username, username, or full URL)
export async function getUserProfileByUsername(input: string): Promise<{
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
} | null> {
  // Parse username from various formats
  let username = input.trim();
  
  // Remove @ prefix
  if (username.startsWith("@")) {
    username = username.substring(1);
  }
  
  // Extract from Twitter/X URL
  const urlPatterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/,
  ];
  
  for (const pattern of urlPatterns) {
    const match = username.match(pattern);
    if (match) {
      username = match[1];
      break;
    }
  }
  
  // Validate username format
  if (!/^[a-zA-Z0-9_]{1,15}$/.test(username)) {
    console.error("Invalid Twitter username format:", username);
    return null;
  }
  
  try {
    const url = `https://api.twitter.com/2/users/by/username/${username}`;
    const params = "user.fields=profile_image_url,public_metrics,description";
    const fullUrl = `${url}?${params}`;
    
    // Use app-only auth (Bearer token)
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      console.error("TWITTER_BEARER_TOKEN not configured");
      return null;
    }
    
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
      },
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error("User lookup error:", text);
      return null;
    }
    
    const json = await response.json();
    return json.data || null;
  } catch (error) {
    console.error("User lookup error:", error);
    return null;
  }
}
