/**
 * API Utilities
 * 
 * このディレクトリはAPI関連のユーティリティを一元管理します。
 * 
 * @see docs/API-ARCHITECTURE.md
 */

// API設定
export {
  getApiBaseUrl,
  isProductionDomain,
  logApiConfig,
  PRODUCTION_API_URL,
  PRODUCTION_DOMAINS,
} from "./config";

// Twitter認証
export {
  getTwitterAuthUrl,
  getTwitterSwitchAccountUrl,
  getTwitterLogoutCallbackUrl,
  redirectToTwitterAuth,
  redirectToTwitterSwitchAccount,
  logTwitterAuthUrls,
  TWITTER_AUTH_ENDPOINTS,
} from "./twitter-auth";
