export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
/** セッションCookieの有効期限: 30日（セキュリティベストプラクティスに基づき短縮） */
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30日
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
