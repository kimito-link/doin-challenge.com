/**
 * 既存チャレンジのhostGenderを同期するスクリプト
 * 
 * 使用方法:
 * pnpm tsx scripts/sync-host-gender.ts
 */

import { syncChallengeHostGender } from "../server/db/challenge-db";

async function main() {
  console.log("[sync-host-gender] Starting...");
  
  try {
    const result = await syncChallengeHostGender();
    console.log(`[sync-host-gender] Completed successfully!`);
    console.log(`[sync-host-gender] Total challenges: ${result.total}`);
    console.log(`[sync-host-gender] Updated challenges: ${result.updated}`);
  } catch (error) {
    console.error("[sync-host-gender] Error:", error);
    process.exit(1);
  }
}

main();
