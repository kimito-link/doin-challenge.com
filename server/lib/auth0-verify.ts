import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS_URI = `https://${process.env.EXPO_PUBLIC_AUTH0_DOMAIN}/.well-known/jwks.json`;
const ISSUER = `https://${process.env.EXPO_PUBLIC_AUTH0_DOMAIN}/`;
const AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;

// JWKSエンドポイントからの公開鍵取得
const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

export interface Auth0User {
  sub: string; // Auth0のユーザーID
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  // Twitter固有の情報
  'https://twitter.com/id'?: string;
  'https://twitter.com/screen_name'?: string;
}

/**
 * Auth0のアクセストークンを検証してユーザー情報を取得
 */
export async function verifyAuth0Token(token: string): Promise<Auth0User> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload as Auth0User;
  } catch (error) {
    console.error('Auth0 token verification failed:', error);
    throw new Error('Invalid token');
  }
}

/**
 * Auth0ユーザー情報からTwitter IDを取得
 */
export function getTwitterIdFromAuth0User(user: Auth0User): string | null {
  // Auth0のTwitter接続では、subに "twitter|{twitter_id}" の形式でIDが含まれる
  if (user.sub.startsWith('twitter|')) {
    return user.sub.replace('twitter|', '');
  }
  
  // カスタムクレームからも取得を試みる
  return user['https://twitter.com/id'] || null;
}

/**
 * Auth0ユーザー情報からTwitterユーザー名を取得
 */
export function getTwitterUsernameFromAuth0User(user: Auth0User): string | null {
  return user['https://twitter.com/screen_name'] || user.nickname || null;
}
