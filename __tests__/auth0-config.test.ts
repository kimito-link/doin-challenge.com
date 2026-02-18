import { describe, it, expect } from 'vitest';

describe('Auth0 Configuration', () => {
  it('should have AUTH0_DOMAIN environment variable', () => {
    expect(process.env.EXPO_PUBLIC_AUTH0_DOMAIN).toBeDefined();
    expect(process.env.EXPO_PUBLIC_AUTH0_DOMAIN).toBe('dev-5fz2k7cymjmhkcu4.us.auth0.com');
  });

  it('should have AUTH0_CLIENT_ID environment variable', () => {
    expect(process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID).toBe('50UCyVdM4Q7ZWqq70rR3iv66trxccOxi');
  });

  it('should have AUTH0_CLIENT_SECRET environment variable', () => {
    expect(process.env.AUTH0_CLIENT_SECRET).toBeDefined();
    expect(process.env.AUTH0_CLIENT_SECRET).toHaveLength(64); // Auth0 Client Secretは64文字
  });

  it('should have valid Auth0 domain format', () => {
    const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
    expect(domain).toMatch(/^[a-z0-9-]+\.(us|eu|au)\.auth0\.com$/);
  });

  it('should have valid Auth0 client ID format', () => {
    const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
    expect(clientId).toMatch(/^[A-Za-z0-9]{32}$/);
  });
});
