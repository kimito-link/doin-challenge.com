/**
 * セッション管理 SDK
 * 
 * JWT ベースのセッショントークン生成・検証と、リクエスト認証を行う。
 * 
 * 注意: Manus OAuth Server との通信（OAuthService, exchangeCodeForToken,
 * getUserInfo, getUserInfoWithJwt）は現在使用されていないため削除済み。
 * ログインは Twitter OAuth 2.0 のみ使用し、ユーザー情報は直接 DB に保存される。
 */
import { COOKIE_NAME, SESSION_MAX_AGE_MS } from "../../shared/const.js";
import { ForbiddenError } from "../../shared/_core/errors.js";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

class SDKServer {
  constructor() {
    // Manus OAuth Server への通信は不要になったため、HTTP クライアントは作成しない
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    // テストで環境変数を変更できるように、ENV.cookieSecretではなくprocess.env.JWT_SECRETを直接参照
    const secret = process.env.JWT_SECRET ?? ENV.cookieSecret;
    
    if (!secret || secret.trim() === "") {
      throw new Error(
        "JWT_SECRET environment variable is not set or empty. " +
        "This is required for session token generation."
      );
    }
    
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a user openId
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {},
  ): Promise<string> {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || "",
      },
      options,
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {},
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? SESSION_MAX_AGE_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null,
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        openId,
        appId,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  /**
   * リクエストからユーザーを認証する。
   * Bearer トークン or セッション Cookie の JWT を検証し、DB からユーザーを取得する。
   */
  async authenticateRequest(req: Request): Promise<User> {
    // Bearer token from Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token: string | undefined;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice("Bearer ".length).trim();
    }

    // Cookie fallback
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = token || cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;

    // アイドルタイムアウトチェック（ガイド推奨）
    if (!checkAndUpdateActivity(sessionUserId)) {
      throw ForbiddenError("Session expired due to inactivity");
    }

    const signedInAt = new Date();
    const user = await db.getUserByOpenId(sessionUserId);

    if (!user) {
      console.error("[Auth] User not found in DB:", sessionUserId);
      throw ForbiddenError("User not found");
    }

    // lastSignedIn を更新（BUG-007修正: 5分間隔でスロットリング、DB書き込み負荷軽減）
    const lastUpdate = lastSignedInCache.get(user.openId);
    const THROTTLE_MS = 5 * 60 * 1000; // 5分
    if (!lastUpdate || (Date.now() - lastUpdate) > THROTTLE_MS) {
      lastSignedInCache.set(user.openId, Date.now());
      db.upsertUser({
        openId: user.openId,
        lastSignedIn: signedInAt,
      }).catch((err) => console.warn("[Auth] lastSignedIn update failed:", err));
    }

    return user;
  }
}

// =============================================================================
// セッションアイドルタイムアウト（ガイド推奨: 非アクティブユーザーの自動ログアウト）
// JWTの絶対タイムアウト(72h)に加え、操作がない場合にセッションを無効化
// =============================================================================

const SESSION_IDLE_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4時間（操作なし）
const lastActivityMap = new Map<string, number>();
// BUG-007: lastSignedIn更新のスロットリング用キャッシュ
const lastSignedInCache = new Map<string, number>();

// メモリリーク防止: 古いエントリを定期的にクリーンアップ
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of lastActivityMap.entries()) {
    if (now - ts > SESSION_IDLE_TIMEOUT_MS * 2) {
      lastActivityMap.delete(key);
    }
  }
}, 60 * 60 * 1000); // 1時間ごとにクリーンアップ

/**
 * アイドルタイムアウトのチェックと更新
 * @returns false = タイムアウトしている (セッション無効)
 */
export function checkAndUpdateActivity(openId: string): boolean {
  const now = Date.now();
  const lastActivity = lastActivityMap.get(openId);
  
  // 初回アクセスは常にOK
  if (lastActivity === undefined) {
    lastActivityMap.set(openId, now);
    return true;
  }
  
  // アイドルタイムアウトチェック
  if (now - lastActivity > SESSION_IDLE_TIMEOUT_MS) {
    lastActivityMap.delete(openId);
    return false; // タイムアウト
  }
  
  // 最終アクティビティを更新
  lastActivityMap.set(openId, now);
  return true;
}

/** ログアウト時にアクティビティ記録を削除 */
export function clearActivity(openId: string): void {
  lastActivityMap.delete(openId);
}

export const sdk = new SDKServer();
