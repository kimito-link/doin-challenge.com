const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const dir = path.join(__dirname, '..', 'server', '_core');
fs.mkdirSync(dir, { recursive: true });

let commitSha;
try {
  commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
} catch {
  commitSha = `railway-${Date.now()}`;
}

const buildInfo = {
  commitSha,
  gitSha: commitSha,
  version: commitSha,
  builtAt: new Date().toISOString(),
  buildTime: new Date().toISOString()
};

fs.writeFileSync(
  path.join(dir, 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

console.log('Generated build-info.json:', buildInfo);
