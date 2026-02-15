/**
 * Auth0統合の動作確認テスト
 */
import { describe, it, expect } from 'vitest';

describe('Auth0 Integration', () => {
  it('Auth0環境変数が設定されている', () => {
    expect(process.env.EXPO_PUBLIC_AUTH0_DOMAIN).toBeDefined();
    expect(process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID).toBeDefined();
    expect(process.env.AUTH0_CLIENT_SECRET).toBeDefined();
  });

  it('Auth0ドメインが正しい形式である', () => {
    const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
    expect(domain).toMatch(/^[a-z0-9-]+\.us\.auth0\.com$/);
  });

  it('Auth0クライアントIDが正しい形式である', () => {
    const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
    expect(clientId).toBeTruthy();
    expect(clientId?.length).toBeGreaterThan(20);
  });

  it('Auth0クライアントシークレットが正しい形式である', () => {
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    expect(clientSecret).toBeTruthy();
    expect(clientSecret?.length).toBeGreaterThan(40);
  });
});
