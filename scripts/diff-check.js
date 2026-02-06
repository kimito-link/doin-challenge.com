#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const configPath = path.join(repoRoot, "scripts", "diff-check.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

function getDiffFiles() {
  const base = process.env.GITHUB_BASE_REF
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : "HEAD~1";
  const diff = execSync(`git diff --name-only ${base}`, {
    encoding: "utf-8",
    cwd: repoRoot,
  });
  return diff.split("\n").filter(Boolean);
}

function fail(msg) {
  console.error("❌ DIFF CHECK FAILED");
  console.error(msg);
  process.exit(1);
}

const files = getDiffFiles();

console.log("🔍 Changed files:");
files.forEach((f) => console.log(" -", f));

for (const file of files) {
  for (const danger of config.dangerFiles) {
    if (file.startsWith(danger)) {
      fail(`Dangerous file changed: ${file}`);
    }
  }
}

for (const file of files) {
  const fullPath = path.join(repoRoot, file);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, "utf-8");
  for (const word of config.forbiddenWords) {
    if (content.includes(word)) {
      fail(`Forbidden word "${word}" found in ${file}`);
    }
  }
}

console.log("✅ Diff check passed");
