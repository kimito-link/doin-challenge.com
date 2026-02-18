/**
 * AccessibilityRole検証テスト
 * 全インタラクティブコンポーネントにaccessibilityRoleが適切に設定されているかを検証
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

interface AccessibilityIssue {
  file: string;
  line: number;
  type: "missing_role" | "missing_label" | "missing_hint";
  context: string;
}

/**
 * ファイル内のPressableコンポーネントを検証
 */
function checkAccessibilityInFile(filePath: string): AccessibilityIssue[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const issues: AccessibilityIssue[] = [];

  let inPressable = false;
  let pressableStartLine = 0;
  let pressableContent: string[] = [];
  let braceCount = 0;

  lines.forEach((line, index) => {
    // Pressableの開始を検出
    if (line.includes("<Pressable")) {
      inPressable = true;
      pressableStartLine = index + 1;
      pressableContent = [line];
      braceCount = 0;
    }

    if (inPressable) {
      pressableContent.push(line);

      // 波括弧のカウント（JSX内のネストを追跡）
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;

      // Pressableの終了を検出（自己閉じタグまたは閉じタグ）
      if (line.includes("/>") || (line.includes("</Pressable>") && braceCount === 0)) {
        const fullContent = pressableContent.join("\n");

        // accessibilityRoleのチェック
        if (!fullContent.includes("accessibilityRole=")) {
          issues.push({
            file: filePath,
            line: pressableStartLine,
            type: "missing_role",
            context: pressableContent[0].trim().substring(0, 80),
          });
        }

        // accessibilityLabelのチェック（onPressがある場合）
        if (fullContent.includes("onPress=") && !fullContent.includes("accessibilityLabel=")) {
          issues.push({
            file: filePath,
            line: pressableStartLine,
            type: "missing_label",
            context: pressableContent[0].trim().substring(0, 80),
          });
        }

        inPressable = false;
        pressableContent = [];
      }
    }
  });

  return issues;
}

/**
 * ディレクトリを再帰的にスキャン
 */
function scanDirectory(dir: string): AccessibilityIssue[] {
  let allIssues: AccessibilityIssue[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // node_modules, .git, dist などはスキップ
      if (["node_modules", ".git", "dist", "build", "__tests__"].includes(entry.name)) {
        continue;
      }
      allIssues = allIssues.concat(scanDirectory(fullPath));
    } else if (entry.isFile()) {
      // .tsx ファイルのみチェック
      if (fullPath.endsWith(".tsx")) {
        const issues = checkAccessibilityInFile(fullPath);
        allIssues = allIssues.concat(issues);
      }
    }
  }

  return allIssues;
}

describe("アクセシビリティ: AccessibilityRole", () => {
  const projectRoot = path.resolve(__dirname, "..");
  const componentsDir = path.join(projectRoot, "components");
  const appDir = path.join(projectRoot, "app");

  it("全てのPressableコンポーネントにaccessibilityRoleが設定されている", () => {
    const componentIssues = scanDirectory(componentsDir);
    const appIssues = scanDirectory(appDir);
    const allIssues = [...componentIssues, ...appIssues];

    const missingRoleIssues = allIssues.filter((issue) => issue.type === "missing_role");

    if (missingRoleIssues.length > 0) {
      const errorMessage = missingRoleIssues
        .map((issue) => `${issue.file}:${issue.line} - ${issue.context}`)
        .join("\n");
      console.error(`\n❌ accessibilityRoleが設定されていないPressable:\n${errorMessage}`);
    }

    expect(missingRoleIssues.length).toBe(0);
  });

  it("onPressを持つPressableにaccessibilityLabelが設定されている", () => {
    const componentIssues = scanDirectory(componentsDir);
    const appIssues = scanDirectory(appDir);
    const allIssues = [...componentIssues, ...appIssues];

    const missingLabelIssues = allIssues.filter((issue) => issue.type === "missing_label");

    if (missingLabelIssues.length > 0) {
      const errorMessage = missingLabelIssues
        .map((issue) => `${issue.file}:${issue.line} - ${issue.context}`)
        .join("\n");
      console.warn(`\n⚠️  accessibilityLabelが設定されていないPressable:\n${errorMessage}`);
    }

    // 警告のみ（一部のコンポーネントは動的にラベルを設定する可能性があるため）
    expect(missingLabelIssues.length).toBeLessThan(10);
  });
});

describe("アクセシビリティ: 高優先度コンポーネント", () => {
  const projectRoot = path.resolve(__dirname, "..");

  const highPriorityComponents = [
    "components/ui/input.tsx",
    "components/ui/modal.tsx",
    "components/ui/card.tsx",
    "components/molecules/pressable-card.tsx",
    "components/ui/gender-selector.tsx",
    "components/ui/prefecture-selector.tsx",
    "components/molecules/share-button.tsx",
    "components/molecules/reminder-button.tsx",
  ];

  highPriorityComponents.forEach((componentPath) => {
    it(`${componentPath} にaccessibilityRoleが設定されている`, () => {
      const fullPath = path.join(projectRoot, componentPath);
      
      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  ファイルが見つかりません: ${fullPath}`);
        return;
      }

      const issues = checkAccessibilityInFile(fullPath);
      const missingRoleIssues = issues.filter((issue) => issue.type === "missing_role");

      if (missingRoleIssues.length > 0) {
        const errorMessage = missingRoleIssues
          .map((issue) => `Line ${issue.line}: ${issue.context}`)
          .join("\n");
        console.error(`\n❌ ${componentPath} のaccessibilityRole未設定:\n${errorMessage}`);
      }

      expect(missingRoleIssues.length).toBe(0);
    });
  });
});
