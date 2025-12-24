import { Express, Request, Response } from "express";
import {
  getRequestToken,
  getAccessToken,
  getUserProfile,
  storeOAuthTokenSecret,
  getOAuthTokenSecret,
  deleteOAuthTokenSecret,
} from "./twitter-auth";

export function registerTwitterRoutes(app: Express) {
  // Step 1: Initiate Twitter OAuth
  app.get("/api/twitter/auth", async (req: Request, res: Response) => {
    try {
      const callbackUrl = `${req.protocol}://${req.get("host")}/api/twitter/callback`;
      
      const { oauth_token, oauth_token_secret } = await getRequestToken(callbackUrl);
      
      // Store the token secret for later use
      storeOAuthTokenSecret(oauth_token, oauth_token_secret);
      
      // Redirect to Twitter authorization page
      const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
      res.redirect(authUrl);
    } catch (error) {
      console.error("Twitter auth error:", error);
      res.status(500).json({ error: "Failed to initiate Twitter authentication" });
    }
  });

  // Step 2: Handle Twitter OAuth callback
  app.get("/api/twitter/callback", async (req: Request, res: Response) => {
    try {
      const { oauth_token, oauth_verifier } = req.query as {
        oauth_token: string;
        oauth_verifier: string;
      };

      if (!oauth_token || !oauth_verifier) {
        res.status(400).json({ error: "Missing oauth_token or oauth_verifier" });
        return;
      }

      // Retrieve the stored token secret
      const oauth_token_secret = getOAuthTokenSecret(oauth_token);
      if (!oauth_token_secret) {
        res.status(400).json({ error: "Invalid or expired oauth_token" });
        return;
      }

      // Exchange for access token
      const accessTokenData = await getAccessToken(
        oauth_token,
        oauth_token_secret,
        oauth_verifier
      );

      // Clean up stored token
      deleteOAuthTokenSecret(oauth_token);

      // Get user profile
      const userProfile = await getUserProfile(
        accessTokenData.oauth_token,
        accessTokenData.oauth_token_secret
      );

      // Return user data (in production, create a session and redirect)
      // For mobile app, redirect with deep link
      const userData = {
        twitterId: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        profileImage: userProfile.profile_image_url?.replace("_normal", "_400x400"),
        followersCount: userProfile.public_metrics?.followers_count || 0,
        followingCount: userProfile.public_metrics?.following_count || 0,
        description: userProfile.description || "",
      };

      // Encode user data for deep link
      const encodedData = encodeURIComponent(JSON.stringify(userData));
      
      // Get the app scheme from environment or use default
      const appScheme = process.env.APP_SCHEME || "kimitolink";
      
      // Redirect to app with user data
      res.redirect(`${appScheme}://twitter-callback?data=${encodedData}`);
    } catch (error) {
      console.error("Twitter callback error:", error);
      res.status(500).json({ error: "Failed to complete Twitter authentication" });
    }
  });

  // API endpoint to get user profile (for testing)
  app.get("/api/twitter/me", async (req: Request, res: Response) => {
    try {
      const accessToken = process.env.TWITTER_ACCESS_TOKEN;
      const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

      if (!accessToken || !accessTokenSecret) {
        res.status(401).json({ error: "Twitter credentials not configured" });
        return;
      }

      const userProfile = await getUserProfile(accessToken, accessTokenSecret);
      
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
}
