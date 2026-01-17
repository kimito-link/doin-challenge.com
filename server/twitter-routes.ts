import { Express, Request, Response } from "express";
import {
  generatePKCE,
  generateState,
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  getUserProfile,
  storePKCEData,
  getPKCEData,
  deletePKCEData,
  checkFollowStatus,
  getTargetAccountInfo,
  getUserProfileByUsername,
  refreshAccessToken,
} from "./twitter-oauth2";

export function registerTwitterRoutes(app: Express) {
  // Step 1: Initiate Twitter OAuth 2.0
  app.get("/api/twitter/auth", async (req: Request, res: Response) => {
    try {
      // 別のアカウントでログインするかどうかのフラグ
      const forceLogin = req.query.force === "true" || req.query.switch === "true";
      
      // Build callback URL - force https for production environments
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || req.get("host")?.includes("manus.computer");
      const callbackUrl = `${forceHttps ? "https" : protocol}://${req.get("host")}/api/twitter/callback`;
      
      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = generatePKCE();
      const state = generateState();
      
      // Store PKCE data for callback
      await storePKCEData(state, codeVerifier, callbackUrl);
      
      // Build authorization URL (forceLoginで別アカウントでログイン可能)
      const authUrl = buildAuthorizationUrl(callbackUrl, state, codeChallenge, forceLogin);
      
      console.log("[Twitter OAuth 2.0] Redirecting to:", authUrl);
      
      // Redirect to Twitter authorization page
      res.redirect(authUrl);
    } catch (error) {
      console.error("Twitter auth error:", error);
      res.status(500).json({ error: "Failed to initiate Twitter authentication" });
    }
  });

  // Step 2: Handle Twitter OAuth 2.0 callback
  app.get("/api/twitter/callback", async (req: Request, res: Response) => {
    try {
      const { code, state, error: oauthError, error_description } = req.query as {
        code?: string;
        state?: string;
        error?: string;
        error_description?: string;
      };

      // Handle OAuth errors (e.g., user cancelled authorization)
      if (oauthError) {
        console.error("Twitter OAuth error:", oauthError, error_description);
        
        // Build redirect URL to frontend app with error info
        const host = req.get("host") || "";
        const protocol = req.get("x-forwarded-proto") || req.protocol;
        const forceHttps = protocol === "https" || host.includes("manus.computer") || host.includes("railway.app");
        
        // Production: redirect to doin-challenge.com
        // Development: redirect to Expo app (port 8081)
        let baseUrl: string;
        if (host.includes("railway.app")) {
          baseUrl = "https://doin-challenge.com";
        } else {
          const expoHost = host.replace("3000-", "8081-");
          baseUrl = `${forceHttps ? "https" : protocol}://${expoHost}`;
        }
        
        // Encode error data for redirect
        const errorData = encodeURIComponent(JSON.stringify({
          error: true,
          code: oauthError,
          message: oauthError === "access_denied" 
            ? "認証がキャンセルされました" 
            : error_description || "Twitter認証中にエラーが発生しました",
        }));
        
        // Redirect to Expo app with error
        res.redirect(`${baseUrl}/oauth/twitter-callback?error=${errorData}`);
        return;
      }

      if (!code || !state) {
        res.status(400).json({ error: "Missing code or state parameter" });
        return;
      }

      // Retrieve stored PKCE data
      const pkceData = await getPKCEData(state);
      if (!pkceData) {
        res.status(400).json({ error: "Invalid or expired state parameter" });
        return;
      }

      const { codeVerifier, callbackUrl } = pkceData;

      // Exchange authorization code for tokens
      const tokens = await exchangeCodeForTokens(code, callbackUrl, codeVerifier);
      
      console.log("[Twitter OAuth 2.0] Token exchange successful");

      // Clean up stored PKCE data (background, don't wait)
      setImmediate(() => deletePKCEData(state).catch(() => {}));

      // Get user profile using access token
      const userProfile = await getUserProfile(tokens.access_token);
      
      console.log("[Twitter OAuth 2.0] User profile retrieved:", userProfile.username);
      console.log("[Twitter OAuth 2.0] User profile description:", userProfile.description);
      console.log("[Twitter OAuth 2.0] Full user profile:", JSON.stringify(userProfile));

      // フォローチェックはログイン後に非同期で行うため、ここではスキップ
      // フロントエンドから /api/twitter/follow-status を呼び出して確認する
      const isFollowingTarget = false; // 後で確認
      const targetAccount = null; // 後で確認
      console.log("[Twitter OAuth 2.0] Skipping follow check for faster login");
      
      // Build user data object
      const userData = {
        twitterId: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        profileImage: userProfile.profile_image_url?.replace("_normal", "_400x400"),
        followersCount: userProfile.public_metrics?.followers_count || 0,
        followingCount: userProfile.public_metrics?.following_count || 0,
        description: userProfile.description || "",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isFollowingTarget,
        targetAccount,
      };

      console.log("[Twitter OAuth 2.0] userData.description:", userData.description);
      
      // Encode user data for redirect
      const encodedData = encodeURIComponent(JSON.stringify(userData));
      
      // Build redirect URL - redirect to frontend app
      const host = req.get("host") || "";
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || host.includes("manus.computer") || host.includes("railway.app");
      
      // Production: redirect to doin-challenge.com
      // Development: redirect to Expo app (port 8081)
      let baseUrl: string;
      if (host.includes("railway.app")) {
        baseUrl = "https://doin-challenge.com";
      } else {
        const expoHost = host.replace("3000-", "8081-");
        baseUrl = `${forceHttps ? "https" : protocol}://${expoHost}`;
      }
      
      // Redirect to Expo app callback page with user data
      const redirectUrl = `${baseUrl}/oauth/twitter-callback?data=${encodedData}`;
      console.log("[Twitter OAuth 2.0] Redirecting to:", redirectUrl.substring(0, 100) + "...");
      
      res.redirect(redirectUrl);
    } catch (error: unknown) {
      console.error("Twitter callback error:", error);
      
      // エラーメッセージを抽出
      let errorMessage = "Failed to complete Twitter authentication";
      let errorDetails = "";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || "";
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      // エラーページにリダイレクト（ユーザーフレンドリーなエラー表示）
      const host = req.get("host") || "";
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || host.includes("manus.computer") || host.includes("railway.app");
      
      // Production: redirect to doin-challenge.com
      // Development: redirect to Expo app (port 8081)
      let baseUrl: string;
      if (host.includes("railway.app")) {
        baseUrl = "https://doin-challenge.com";
      } else {
        const expoHost = host.replace("3000-", "8081-");
        baseUrl = `${forceHttps ? "https" : protocol}://${expoHost}`;
      }
      
      // エラー情報をエンコードしてリダイレクト
      const errorData = encodeURIComponent(JSON.stringify({
        error: true,
        message: errorMessage,
        details: errorDetails.substring(0, 200), // 長すぎる場合は切り詰め
      }));
      
      res.redirect(`${baseUrl}/oauth/twitter-callback?error=${errorData}`);
    }
  });

  // API endpoint to get user profile (for testing)
  app.get("/api/twitter/me", async (req: Request, res: Response) => {
    try {
      // Get access token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
      }

      const accessToken = authHeader.substring(7);
      const userProfile = await getUserProfile(accessToken);
      
      res.json({
        twitterId: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        profileImage: userProfile.profile_image_url?.replace("_normal", "_400x400"),
        followersCount: userProfile.public_metrics?.followers_count || 0,
        followingCount: userProfile.public_metrics?.following_count || 0,
        description: userProfile.description || "",
      });
    } catch (error) {
      console.error("Twitter profile error:", error);
      res.status(500).json({ error: "Failed to get Twitter profile" });
    }
  });

  // API endpoint to check follow status
  app.get("/api/twitter/follow-status", async (req: Request, res: Response) => {
    try {
      // Get access token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
      }

      const accessToken = authHeader.substring(7);
      const userId = req.query.userId as string;
      
      if (!userId) {
        res.status(400).json({ error: "Missing userId parameter" });
        return;
      }

      const followStatus = await checkFollowStatus(accessToken, userId);
      const targetInfo = getTargetAccountInfo();
      
      res.json({
        isFollowing: followStatus.isFollowing,
        targetAccount: {
          ...targetInfo,
          ...followStatus.targetUser,
        },
      });
    } catch (error) {
      console.error("Follow status error:", error);
      res.status(500).json({ error: "Failed to check follow status" });
    }
  });

  // API endpoint to get target account info
  app.get("/api/twitter/target-account", async (req: Request, res: Response) => {
    try {
      const targetInfo = getTargetAccountInfo();
      res.json(targetInfo);
    } catch (error) {
      console.error("Target account error:", error);
      res.status(500).json({ error: "Failed to get target account info" });
    }
  });

  // API endpoint to lookup user profile by username
  // Supports: @username, username, https://x.com/username, https://twitter.com/username
  app.get("/api/twitter/user/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      
      if (!username) {
        res.status(400).json({ error: "Username is required" });
        return;
      }
      
      const profile = await getUserProfileByUsername(username);
      
      if (!profile) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      res.json({
        id: profile.id,
        name: profile.name,
        username: profile.username,
        profileImage: profile.profile_image_url,
        description: profile.description || "",
        followersCount: profile.public_metrics?.followers_count || 0,
        followingCount: profile.public_metrics?.following_count || 0,
      });
    } catch (error) {
      console.error("Twitter user lookup error:", error);
      res.status(500).json({ error: "Failed to lookup Twitter user" });
    }
  });

  // API endpoint to refresh follow status (re-login required to get new token)
  // This endpoint triggers a re-authentication flow to check follow status
  app.get("/api/twitter/refresh-follow-status", async (req: Request, res: Response) => {
    try {
      // Build callback URL - force https for production environments
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || req.get("host")?.includes("manus.computer");
      const callbackUrl = `${forceHttps ? "https" : protocol}://${req.get("host")}/api/twitter/callback`;
      
      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = generatePKCE();
      const state = generateState();
      
      // Store PKCE data for callback
      await storePKCEData(state, codeVerifier, callbackUrl);
      
      // Build authorization URL
      const authUrl = buildAuthorizationUrl(callbackUrl, state, codeChallenge);
      
      console.log("[Twitter OAuth 2.0] Refresh follow status - Redirecting to:", authUrl);
      
      // Redirect to Twitter authorization page
      res.redirect(authUrl);
    } catch (error) {
      console.error("Twitter refresh follow status error:", error);
      res.status(500).json({ error: "Failed to initiate follow status refresh" });
    }
  });

  // Token refresh endpoint
  app.post("/api/twitter/refresh", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      
      if (!refreshToken) {
        res.status(400).json({ error: "Refresh token is required" });
        return;
      }
      
      console.log("[Twitter OAuth 2.0] Refreshing access token...");
      
      const tokens = await refreshAccessToken(refreshToken);
      
      console.log("[Twitter OAuth 2.0] Token refresh successful");
      
      res.json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
      });
    } catch (error) {
      console.error("Twitter token refresh error:", error);
      res.status(401).json({ error: "Failed to refresh token" });
    }
  });

  // API endpoint to lookup user profile by URL or username (POST for URL encoding)
  app.post("/api/twitter/lookup", async (req: Request, res: Response) => {
    try {
      const { input } = req.body as { input?: string };
      
      if (!input) {
        res.status(400).json({ error: "Input is required" });
        return;
      }
      
      const profile = await getUserProfileByUsername(input);
      
      if (!profile) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      res.json({
        id: profile.id,
        name: profile.name,
        username: profile.username,
        profileImage: profile.profile_image_url,
        description: profile.description || "",
        followersCount: profile.public_metrics?.followers_count || 0,
        followingCount: profile.public_metrics?.following_count || 0,
      });
    } catch (error) {
      console.error("Twitter user lookup error:", error);
      res.status(500).json({ error: "Failed to lookup Twitter user" });
    }
  });
}
