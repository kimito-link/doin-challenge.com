import { describe, it, expect } from "vitest";

describe("Auth0 Configuration", () => {
  it("should have AUTH0_DOMAIN environment variable", () => {
    expect(process.env.AUTH0_DOMAIN).toBeDefined();
    expect(process.env.AUTH0_DOMAIN).toContain("auth0.com");
  });

  it("should have AUTH0_CLIENT_ID environment variable", () => {
    expect(process.env.AUTH0_CLIENT_ID).toBeDefined();
    expect(process.env.AUTH0_CLIENT_ID).toHaveLength(32);
  });

  it("should have AUTH0_CLIENT_SECRET environment variable", () => {
    expect(process.env.AUTH0_CLIENT_SECRET).toBeDefined();
    expect(process.env.AUTH0_CLIENT_SECRET?.length).toBeGreaterThan(0);
  });
});
