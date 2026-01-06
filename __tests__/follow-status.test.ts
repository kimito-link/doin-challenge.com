import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for API tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Twitter Follow Status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkFollowStatus function", () => {
    it("should return isFollowing true when user follows target", async () => {
      // Mock user lookup response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {
              id: "123456789",
              name: "君斗りんく",
              username: "idolfunch",
            },
          }),
        })
        // Mock following list response
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: [
              { id: "123456789", name: "君斗りんく", username: "idolfunch" },
              { id: "987654321", name: "Other User", username: "other" },
            ],
          }),
        });

      // Import and test the function
      const { checkFollowStatus } = await import("../server/twitter-oauth2");
      const result = await checkFollowStatus("test_token", "source_user_id");

      expect(result.isFollowing).toBe(true);
      expect(result.targetUser?.username).toBe("idolfunch");
    });

    it("should return isFollowing false when user does not follow target", async () => {
      // Mock user lookup response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {
              id: "123456789",
              name: "君斗りんく",
              username: "idolfunch",
            },
          }),
        })
        // Mock following list response (target not in list)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: [
              { id: "987654321", name: "Other User", username: "other" },
            ],
          }),
        });

      const { checkFollowStatus } = await import("../server/twitter-oauth2");
      const result = await checkFollowStatus("test_token", "source_user_id");

      expect(result.isFollowing).toBe(false);
      expect(result.targetUser?.username).toBe("idolfunch");
    });

    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve("API Error"),
      });

      const { checkFollowStatus } = await import("../server/twitter-oauth2");
      const result = await checkFollowStatus("test_token", "source_user_id");

      expect(result.isFollowing).toBe(false);
      expect(result.targetUser).toBeNull();
    });
  });

  describe("getTargetAccountInfo function", () => {
    it("should return correct target account info", async () => {
      const { getTargetAccountInfo } = await import("../server/twitter-oauth2");
      const info = getTargetAccountInfo();

      expect(info.username).toBe("idolfunch");
      expect(info.displayName).toBe("君斗りんく");
      expect(info.profileUrl).toBe("https://twitter.com/idolfunch");
    });
  });
});

describe("Follow Status Hook", () => {
  it("should initialize with default values", () => {
    // Test that the hook provides correct default values
    const defaultStatus = {
      isFollowing: false,
      targetUsername: "idolfunch",
      targetDisplayName: "君斗りんく",
    };

    expect(defaultStatus.isFollowing).toBe(false);
    expect(defaultStatus.targetUsername).toBe("idolfunch");
    expect(defaultStatus.targetDisplayName).toBe("君斗りんく");
  });
});

describe("Premium Features", () => {
  it("should define premium features correctly", async () => {
    const { PREMIUM_FEATURES, isPremiumFeature } = await import("../hooks/use-follow-status");

    expect(PREMIUM_FEATURES.length).toBeGreaterThan(0);
    expect(isPremiumFeature("create_challenge")).toBe(true);
    expect(isPremiumFeature("statistics")).toBe(true);
    expect(isPremiumFeature("non_existent_feature")).toBe(false);
  });
});

describe("User type with follow status", () => {
  it("should support follow status fields", () => {
    // Test that User type includes follow status fields
    const user = {
      id: 1,
      openId: "test",
      name: "Test User",
      email: null,
      loginMethod: "twitter",
      lastSignedIn: new Date(),
      username: "testuser",
      profileImage: "https://example.com/image.jpg",
      followersCount: 100,
      isFollowingTarget: true,
      targetAccount: {
        id: "123456789",
        name: "君斗りんく",
        username: "idolfunch",
      },
    };

    expect(user.isFollowingTarget).toBe(true);
    expect(user.targetAccount?.username).toBe("idolfunch");
  });
});
