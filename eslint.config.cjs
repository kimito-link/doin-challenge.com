// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "scripts/*"],
  },
  {
    // 直書き色禁止ルール（theme/tokens を使用してください）
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/^#[0-9A-Fa-f]{6}$/]",
          message: "直書きの16進数カラーコードは禁止です。theme/tokens を使用してください。",
        },
        {
          selector: "Literal[value=/^#[0-9A-Fa-f]{3}$/]",
          message: "直書きの16進数カラーコード（短縮形）は禁止です。theme/tokens を使用してください。",
        },
        {
          selector: "Literal[value=/^rgba?\\(/]",
          message: "直書きのrgba()カラーは禁止です。theme/tokens を使用してください。",
        },
      ],
    },
  },
]);
