/**
 * server/routers/auth0.ts
 * 
 * Auth0認証関連のルーター
 */
import { z } from "zod";
import { COOKIE_NAME } from "../../shared/const.js";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";
import { verifyAuth0Token, getTwitterIdFromAuth0User, getTwitterUsernameFromAuth0User } from "../lib/auth0-verify";
import { getUserByOpenId, upsertUser } from "../db/user-db";
import crypto from "crypto";

// セッショントークンを生成
function generateSessionToken(userId: number): string {
  return `${userId}:${crypto.randomBytes(32).toString("hex")}`;
}

export const auth0Router = router({
  /**
   * Auth0トークンを検証してセッションを確立
   */
  login: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Auth0トークンを検証
        const auth0User = await verifyAuth0Token(input.accessToken);
        
        // TwitterIDを取得
        const twitterId = getTwitterIdFromAuth0User(auth0User);
        if (!twitterId) {
          throw new Error('Twitter ID not found in Auth0 user');
        }

        const twitterUsername = getTwitterUsernameFromAuth0User(auth0User);
        const openId = `twitter-${twitterId}`;

        // ユーザーをupsert
        await upsertUser({
          openId,
          name: auth0User.name || twitterUsername || `User ${twitterId}`,
          email: auth0User.email || null,
          loginMethod: 'twitter',
          role: 'user',
          lastSignedIn: new Date(),
        });

        // ユーザー情報を取得
        const user = await getUserByOpenId(openId);
        if (!user) {
          throw new Error('Failed to create or retrieve user');
        }

        // セッショントークンを生成
        const sessionToken = generateSessionToken(user.id);

        // Cookieにセッショントークンを設定
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            openId: user.openId,
            loginMethod: user.loginMethod,
            role: user.role,
          },
          sessionToken,
        };
      } catch (error: any) {
        console.error('Auth0 login failed:', error);
        throw new Error(error.message || 'Authentication failed');
      }
    }),

  /**
   * 現在のユーザー情報を取得
   */
  me: publicProcedure.query((opts) => opts.ctx.user),

  /**
   * ログアウト
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
