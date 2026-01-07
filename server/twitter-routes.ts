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
} from "./twitter-oauth2";

export function registerTwitterRoutes(app: Express) {
  // Step 1: Initiate Twitter OAuth 2.0
  app.get("/api/twitter/auth", async (req: Request, res: Response) => {
    try {
      // Build callback URL - force https for production environments
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || req.get("host")?.includes("manus.computer");
      const callbackUrl = `${forceHttps ? "https" : protocol}://${req.get("host")}/api/twitter/callback`;
      
      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = generatePKCE();
      const state = generateState();
      
      // Store PKCE data for callback
      storePKCEData(state, codeVerifier, callbackUrl);
      
      // Build authorization URL
      const authUrl = buildAuthorizationUrl(callbackUrl, state, codeChallenge);
      
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

      // Handle OAuth errors
      if (oauthError) {
        console.error("Twitter OAuth error:", oauthError, error_description);
        res.status(400).json({ 
          error: oauthError, 
          description: error_description 
        });
        return;
      }

      if (!code || !state) {
        res.status(400).json({ error: "Missing code or state parameter" });
        return;
      }

      // Retrieve stored PKCE data
      const pkceData = getPKCEData(state);
      if (!pkceData) {
        res.status(400).json({ error: "Invalid or expired state parameter" });
        return;
      }

      const { codeVerifier, callbackUrl } = pkceData;

      // Exchange authorization code for tokens
      const tokens = await exchangeCodeForTokens(code, callbackUrl, codeVerifier);
      
      console.log("[Twitter OAuth 2.0] Token exchange successful");

      // Clean up stored PKCE data
      deletePKCEData(state);

      // Get user profile using access token
      const userProfile = await getUserProfile(tokens.access_token);
      
      console.log("[Twitter OAuth 2.0] User profile retrieved:", userProfile.username);

      // Check if user follows the target account
      const followStatus = await checkFollowStatus(
        tokens.access_token,
        userProfile.id
      );
      
      console.log("[Twitter OAuth 2.0] Follow status:", followStatus.isFollowing);

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
        isFollowingTarget: followStatus.isFollowing,
        targetAccount: followStatus.targetUser,
      };

      // Encode user data for deep link
      const encodedData = encodeURIComponent(JSON.stringify(userData));
      
      // Get the app scheme from environment or use default
      const appScheme = process.env.APP_SCHEME || "manus20250106092504";
      
      // Redirect to app with user data
      const redirectUrl = `${appScheme}://twitter-callback?data=${encodedData}`;
      console.log("[Twitter OAuth 2.0] Redirecting to app:", redirectUrl.substring(0, 100) + "...");
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Twitter callback error:", error);
      res.status(500).json({ error: "Failed to complete Twitter authentication" });
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
}
