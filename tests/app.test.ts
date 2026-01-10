import { describe, it, expect } from "vitest";

describe("動員ちゃれんじ App Configuration", () => {
  it("should have correct app name", async () => {
    const config = await import("../app.config");
    expect(config.default.name).toBe("君斗りんくの動員ちゃれんじ");
  });

  it("should have correct app slug", async () => {
    const config = await import("../app.config");
    expect(config.default.slug).toBe("birthday-celebration");
  });

  it("should have icon configured", async () => {
    const config = await import("../app.config");
    expect(config.default.icon).toBe("./assets/images/icon.png");
  });
});

describe("Theme Configuration", () => {
  it("should have KimitoLink brand colors", () => {
    const { themeColors } = require("../theme.config");
    
    // Primary color should be KimitoLink blue
    expect(themeColors.primary.light).toBe("#00427B");
    expect(themeColors.primary.dark).toBe("#4A90D9"); // Lighter blue for dark mode
    
    // Accent color should be KimitoLink orange
    expect(themeColors.accent.light).toBe("#DD6500");
    expect(themeColors.accent.dark).toBe("#FF8C33"); // Lighter orange for dark mode
  });
});

describe("Database Schema", () => {
  it("should have events table defined", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.events).toBeDefined();
  });

  it("should have participations table defined", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.participations).toBeDefined();
  });
});
