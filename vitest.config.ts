import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", "dist", ".expo"],
    testTimeout: 10000,
    // フックテスト用にテスト環境をファイル単位で指定可能
    environmentMatchGlobs: [
      ["**/components/**/*.test.ts", "jsdom"],
      ["**/components/**/*.test.tsx", "jsdom"],
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
