#!/usr/bin/env node
/**
 * Gate 1: diff-check の Node ラッパー
 * 実行: node scripts/diff-check.js [BASE_SHA] [HEAD_SHA]
 * 未指定時は環境変数 GITHUB_BASE_REF / HEAD や git から取得
 */
const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const scriptDir = path.dirname(__filename);
const shPath = path.join(scriptDir, "diff-check.sh");

if (!fs.existsSync(shPath)) {
  console.error("diff-check.sh not found at", shPath);
  process.exit(1);
}

const base = process.argv[2];
const head = process.argv[3];
const args = base && head ? [base, head] : [];

const result = spawnSync("bash", [shPath, ...args], {
  stdio: "inherit",
  cwd: path.join(scriptDir, ".."),
});

process.exit(result.status ?? 1);
