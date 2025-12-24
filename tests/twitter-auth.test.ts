import { describe, it, expect } from "vitest";

describe("Twitter API Credentials", () => {
  it("should have Twitter API credentials configured", () => {
    // Check that environment variables are set
    expect(process.env.TWITTER_API_KEY).toBeDefined();
    expect(process.env.TWITTER_API_KEY).not.toBe("");
    
    expect(process.env.TWITTER_API_SECRET).toBeDefined();
    expect(process.env.TWITTER_API_SECRET).not.toBe("");
    
    expect(process.env.TWITTER_ACCESS_TOKEN).toBeDefined();
    expect(process.env.TWITTER_ACCESS_TOKEN).not.toBe("");
    
    expect(process.env.TWITTER_ACCESS_TOKEN_SECRET).toBeDefined();
    expect(process.env.TWITTER_ACCESS_TOKEN_SECRET).not.toBe("");
  });

  it("should validate Twitter API key format", () => {
    const apiKey = process.env.TWITTER_API_KEY;
    // Twitter API keys are typically 25 characters
    expect(apiKey?.length).toBeGreaterThanOrEqual(20);
  });

  it("should validate Twitter API secret format", () => {
    const apiSecret = process.env.TWITTER_API_SECRET;
    // Twitter API secrets are typically 50 characters
    expect(apiSecret?.length).toBeGreaterThanOrEqual(40);
  });

  it("should validate Twitter access token format", () => {
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    // Twitter access tokens contain a hyphen
    expect(accessToken).toContain("-");
  });
});
