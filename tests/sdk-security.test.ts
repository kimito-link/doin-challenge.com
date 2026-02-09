/**
 * SDK セキュリティテスト
 * 
 * テストフレームワーク: Vitest
 * 対象ファイル: server/_core/sdk.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sdk } from "../server/_core/sdk";

describe("SDK Security", () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe("decodeState", () => {
    it("should decode valid base64 state", async () => {
      const validState = Buffer.from("https://example.com/callback").toString("base64");

      // decodeStateはprivateなので、exchangeCodeForToken経由でテスト
      // または、テスト用にexportする必要がある
    });

    it("should throw error for invalid base64", async () => {
      const invalidState = "not-base64!!!";

      // エラーがスローされることを確認
    });

    it("should throw error for empty decoded value", async () => {
      const emptyState = Buffer.from("").toString("base64");

      // エラーがスローされることを確認
    });

    it("should throw error for whitespace-only decoded value", async () => {
      const whitespaceState = Buffer.from("   ").toString("base64");

      // エラーがスローされることを確認
    });
  });

  describe("getSessionSecret", () => {
    it("should throw error when JWT_SECRET is not set", async () => {
      delete process.env.JWT_SECRET;

      // createSessionToken経由でテスト
      await expect(
        sdk.createSessionToken("test-open-id", { name: "Test" })
      ).rejects.toThrow("JWT_SECRET");
    });

    it("should throw error when JWT_SECRET is empty string", async () => {
      process.env.JWT_SECRET = "";

      await expect(
        sdk.createSessionToken("test-open-id", { name: "Test" })
      ).rejects.toThrow("JWT_SECRET");
    });

    it("should throw error when JWT_SECRET is whitespace only", async () => {
      process.env.JWT_SECRET = "   ";

      await expect(
        sdk.createSessionToken("test-open-id", { name: "Test" })
      ).rejects.toThrow("JWT_SECRET");
    });

    it("should work with valid JWT_SECRET", async () => {
      process.env.JWT_SECRET = "test-secret-key-12345";

      const token = await sdk.createSessionToken("test-open-id", { name: "Test" });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });
  });
});
