import crypto from "crypto";

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
    scope: "tweet.read users.read offline.access",
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

// Store for temporary PKCE data (in production, use Redis or database)
const pkceStore = new Map<string, { codeVerifier: string; callbackUrl: string }>();

export function storePKCEData(state: string, codeVerifier: string, callbackUrl: string): void {
  pkceStore.set(state, { codeVerifier, callbackUrl });
  // Clean up after 10 minutes
  setTimeout(() => pkceStore.delete(state), 10 * 60 * 1000);
}

export function getPKCEData(state: string): { codeVerifier: string; callbackUrl: string } | undefined {
  return pkceStore.get(state);
}

export function deletePKCEData(state: string): void {
  pkceStore.delete(state);
}
