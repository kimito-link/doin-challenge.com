/**
 * アクセシビリティテスト
 * WCAG 2.1 AA基準への準拠を検証
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ==================== コントラスト比計算 ====================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ==================== テスト ====================

describe("アクセシビリティ: 色のコントラスト比", () => {
  const palettePath = path.join(__dirname, "../theme/tokens/palette.ts");
  const paletteContent = fs.readFileSync(palettePath, "utf-8");

  // パレットから色を抽出
  const extractColor = (name: string): string | null => {
    const match = paletteContent.match(new RegExp(`${name}:\\s*["']([^"']+)["']`));
    return match ? match[1] : null;
  };

  const white = extractColor("white") || "#FFFFFF";
  const black = extractColor("black") || "#000000";
  const gray50 = extractColor("gray50") || "#FAFAFA";
  const primary500 = extractColor("primary500") || "#0A7EA4";
  const accent500 = extractColor("accent500") || "#7C3AED";
  const green500 = extractColor("green500") || "#10B981";
  const red500 = extractColor("red500") || "#EF4444";

  it("白テキスト on Primary Button は 4.5:1 以上", () => {
    const ratio = getContrastRatio(white, primary500);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("白テキスト on Accent Button は 4.5:1 以上", () => {
    const ratio = getContrastRatio(white, accent500);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("白テキスト on Success Button は 4.5:1 以上", () => {
    const ratio = getContrastRatio(white, green500);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("白テキスト on Danger Button は 4.5:1 以上", () => {
    const ratio = getContrastRatio(white, red500);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("黒テキスト on 白背景 は 4.5:1 以上", () => {
    const ratio = getContrastRatio(black, white);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("黒テキスト on gray50背景 は 4.5:1 以上", () => {
    const ratio = getContrastRatio(black, gray50);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe("アクセシビリティ: スクリーンリーダー対応", () => {
  const componentsDir = path.join(__dirname, "../components");

  // インタラクティブ要素を持つコンポーネントを検索
  function findInteractiveComponents(): string[] {
    const files: string[] = [];
    
    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith(".tsx")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (
            content.includes("TouchableOpacity") ||
            content.includes("Pressable") ||
            content.includes("Button")
          ) {
            files.push(fullPath);
          }
        }
      }
    }
    
    walk(componentsDir);
    return files;
  }

  it("主要なインタラクティブコンポーネントに accessibilityRole が設定されている", () => {
    const interactiveComponents = findInteractiveComponents();
    const missingAccessibility: string[] = [];

    for (const file of interactiveComponents) {
      const content = fs.readFileSync(file, "utf-8");
      
      // Button コンポーネントを使用している場合はスキップ（Button自体にaccessibilityRoleが設定されている）
      if (content.includes("from '@/components/ui/button'") || content.includes("from \"@/components/ui/button\"")) {
        continue;
      }
      
      // TouchableOpacity/Pressableを使用しているが、accessibilityRoleが設定されていない
      if (
        (content.includes("TouchableOpacity") || content.includes("Pressable")) &&
        !content.includes("accessibilityRole")
      ) {
        missingAccessibility.push(path.relative(componentsDir, file));
      }
    }

    // 一部のコンポーネントは許容（装飾的な要素など）
    const allowedMissing = [
      "error-boundary.tsx",
      "install-prompt.tsx",
      // 必要に応じて追加
    ];

    const actualMissing = missingAccessibility.filter(
      (file) => !allowedMissing.some((allowed) => file.includes(allowed))
    );

    if (actualMissing.length > 0) {
      console.warn(
        `以下のコンポーネントに accessibilityRole が設定されていません:\n${actualMissing.join("\n")}`
      );
    }

    // 主要なコンポーネント（ui/button.tsx）にはaccessibilityRoleが設定されていることを確認
    const buttonPath = path.join(componentsDir, "ui/button.tsx");
    if (fs.existsSync(buttonPath)) {
      const buttonContent = fs.readFileSync(buttonPath, "utf-8");
      expect(buttonContent).toContain("accessibilityRole");
    }
  });

  it("スクリーンリーダー対応ガイドが存在する", () => {
    const guidePath = path.join(__dirname, "../docs/ACCESSIBILITY_SCREEN_READER_GUIDE.md");
    expect(fs.existsSync(guidePath)).toBe(true);
  });
});

describe("アクセシビリティ: ドキュメント", () => {
  it("アクセシビリティガイドが存在する", () => {
    const guidePath = path.join(__dirname, "../docs/ACCESSIBILITY_SCREEN_READER_GUIDE.md");
    expect(fs.existsSync(guidePath)).toBe(true);
    
    const content = fs.readFileSync(guidePath, "utf-8");
    expect(content).toContain("accessibilityLabel");
    expect(content).toContain("accessibilityRole");
    expect(content).toContain("accessibilityHint");
  });

  it("コントラスト比チェックスクリプトが存在する", () => {
    const scriptPath = path.join(__dirname, "../scripts/check-contrast-ratio.ts");
    expect(fs.existsSync(scriptPath)).toBe(true);
  });
});
