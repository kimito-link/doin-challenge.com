/**
 * ダークモード対応チェックスクリプト
 * 全コンポーネントでテーマカラーの使用状況を検証
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HARDCODED_COLORS = [
  "#0D1117",
  "#151718",
  "#1E2022",
  "#E6EDF3",
  "#9CA3AF",
  "#2D3139",
  "#DD6500",
  "#fff",
  "#ffffff",
  "#FFFFFF",
  "#000",
  "#000000",
  "#F5F5F5",
  "#E5E7EB",
  "#11181C",
  "#687076",
];

interface ColorIssue {
  file: string;
  line: number;
  color: string;
  context: string;
}

function checkFile(filePath: string): ColorIssue[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const issues: ColorIssue[] = [];

  lines.forEach((line, index) => {
    HARDCODED_COLORS.forEach((color) => {
      if (line.includes(color)) {
        // コメント行はスキップ
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
          return;
        }
        
        // import文はスキップ
        if (line.includes("import")) {
          return;
        }

        issues.push({
          file: filePath,
          line: index + 1,
          color,
          context: line.trim(),
        });
      }
    });
  });

  return issues;
}

function scanDirectory(dir: string): ColorIssue[] {
  let allIssues: ColorIssue[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // node_modules, .git, dist などはスキップ
      if (["node_modules", ".git", "dist", "build"].includes(entry.name)) {
        continue;
      }
      allIssues = allIssues.concat(scanDirectory(fullPath));
    } else if (entry.isFile()) {
      // .tsx, .ts ファイルのみチェック
      if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
        const issues = checkFile(fullPath);
        allIssues = allIssues.concat(issues);
      }
    }
  }

  return allIssues;
}

// メイン処理
const projectRoot = path.resolve(__dirname, "..");
const componentsDir = path.join(projectRoot, "components");
const appDir = path.join(projectRoot, "app");

console.log("🔍 ダークモード対応チェックを開始します...\n");

const componentIssues = scanDirectory(componentsDir);
const appIssues = scanDirectory(appDir);
const allIssues = [...componentIssues, ...appIssues];

if (allIssues.length === 0) {
  console.log("✅ ハードコードされた色は見つかりませんでした！");
} else {
  console.log(`⚠️  ${allIssues.length}箇所のハードコードされた色が見つかりました:\n`);

  // ファイルごとにグループ化
  const issuesByFile = allIssues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = [];
    }
    acc[issue.file].push(issue);
    return acc;
  }, {} as Record<string, ColorIssue[]>);

  Object.entries(issuesByFile).forEach(([file, issues]) => {
    console.log(`📄 ${file.replace(projectRoot, ".")}`);
    issues.forEach((issue) => {
      console.log(`   Line ${issue.line}: ${issue.color}`);
      console.log(`   ${issue.context.substring(0, 80)}...`);
    });
    console.log("");
  });
}

console.log("\n✨ チェック完了");
