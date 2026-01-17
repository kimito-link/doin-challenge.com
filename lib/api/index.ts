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

// APIクライアント
export {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  setApiLogging,
  isApiLoggingEnabled,
  getErrorMessage,
  isApiSuccess,
  ApiError,
  type ApiResponse,
  type ApiRequestOptions,
} from "./client";

// APIエンドポイント
export {
  clearSession,
  validateSession,
  refreshToken,
  lookupTwitterUser,
  getFollowStatus,
  getApiUsage,
  type TwitterLookupResult,
  type ApiUsageData,
  type TokenRefreshResult,
  type FollowStatusResult,
} from "./endpoints";

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
