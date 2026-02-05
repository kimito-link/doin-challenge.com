const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Gate 1: デプロイ先に応じた commit SHA（優先順）
// - GITHUB_SHA: GitHub Actions でビルド時
// - RAILWAY_GIT_COMMIT_SHA: Railway が自動設定（/api/health は Railway で応答）
// - VERCEL_GIT_COMMIT_SHA: Vercel ビルド時
let commitSha =
  process.env.GITHUB_SHA ||
  process.env.RAILWAY_GIT_COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA;
if (!commitSha) {
  try {
    commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    commitSha = `local-${Date.now()}`;
  }
}

const buildInfo = {
  commitSha,
  version: commitSha,
  builtAt: new Date().toISOString(),
};

// Server (Node): server/_core/build-info.json → later copied to dist/
const serverDir = path.join(__dirname, '..', 'server', '_core');
fs.mkdirSync(serverDir, { recursive: true });
fs.writeFileSync(
  path.join(serverDir, 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

// Frontend (Vercel): public/version.json for /version.json and Gate 1 verify
const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(
  path.join(publicDir, 'version.json'),
  JSON.stringify(buildInfo, null, 2)
);

console.log('Generated build-info.json & public/version.json:', buildInfo);
