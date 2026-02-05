#!/usr/bin/env node
/**
 * Gate 2: API スモークテスト
 * デプロイ後に主要APIが 200 + 期待JSON を返すことを確認する。
 * tRPC は batch=1 + input={"0": <input>} の GET で呼ぶ（v11 形式）。
 * 使い方: BASE_URL=https://doin-challenge.com node scripts/gate2-api-smoke.mjs
 */
const BASE = process.env.BASE_URL || process.env.API_URL || "https://doin-challenge.com";

function log(msg) {
  console.log(`[gate2-smoke] ${msg}`);
}

async function fetchOk(url, options = {}) {
  const res = await fetch(url, { ...options, redirect: "follow" });
  if (!res.ok) {
    throw new Error(`${url} → ${res.status} ${res.statusText}`);
  }
  return res;
}

/** tRPC GET: 単一手続きを batch=1 で呼ぶ。input は Record<number, unknown> で {"0": procedureInput} */
function trpcGet(path, procedureInput = {}) {
  const batchInput = { 0: procedureInput };
  const inputParam = encodeURIComponent(JSON.stringify(batchInput));
  return `${BASE}/api/trpc/${path}?batch=1&input=${inputParam}`;
}

async function smoke() {
  const failures = [];

  // 1. Health（Gate 1 と重複するがここでも確認）
  try {
    const res = await fetchOk(`${BASE}/api/health`);
    const data = await res.json();
    if (data.ok !== true && data.commitSha === "unknown") {
      failures.push("/api/health: ok または commitSha が不正");
    } else {
      log("✅ /api/health");
    }
  } catch (e) {
    failures.push(`/api/health: ${e.message}`);
  }

  // 2. イベント一覧（公開）
  try {
    const url = trpcGet("events.list", {});
    const res = await fetchOk(url);
    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.result === undefined) {
      failures.push("/api/trpc/events.list: result なし");
    } else {
      log("✅ /api/trpc/events.list");
    }
  } catch (e) {
    failures.push(`/api/trpc/events.list: ${e.message}`);
  }

  // 3. イベント詳細（存在するIDで試す）
  try {
    const url = trpcGet("events.getById", { id: 90001 });
    const res = await fetchOk(url);
    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.result === undefined) {
      failures.push("/api/trpc/events.getById: result なし");
    } else {
      log("✅ /api/trpc/events.getById");
    }
  } catch (e) {
    failures.push(`/api/trpc/events.getById: ${e.message}`);
  }

  // 4. ランキング（ホスト）
  try {
    const url = trpcGet("rankings.hosts", { limit: 1 });
    const res = await fetchOk(url);
    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.result === undefined) {
      failures.push("/api/trpc/rankings.hosts: result なし");
    } else {
      log("✅ /api/trpc/rankings.hosts");
    }
  } catch (e) {
    failures.push(`/api/trpc/rankings.hosts: ${e.message}`);
  }

  // 5. ランキング（貢献度）
  try {
    const url = trpcGet("rankings.contribution", { period: "all", limit: 1 });
    const res = await fetchOk(url);
    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.result === undefined) {
      failures.push("/api/trpc/rankings.contribution: result なし");
    } else {
      log("✅ /api/trpc/rankings.contribution");
    }
  } catch (e) {
    failures.push(`/api/trpc/rankings.contribution: ${e.message}`);
  }

  // 6. 参加者一覧（公開・1イベント）
  try {
    const url = trpcGet("participations.listByEvent", { eventId: 90001 });
    const res = await fetchOk(url);
    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.result === undefined) {
      failures.push("/api/trpc/participations.listByEvent: result なし");
    } else {
      log("✅ /api/trpc/participations.listByEvent");
    }
  } catch (e) {
    failures.push(`/api/trpc/participations.listByEvent: ${e.message}`);
  }

  if (failures.length > 0) {
    console.error("❌ Gate 2 API smoke failed:");
    failures.forEach((f) => console.error("  -", f));
    process.exit(1);
  }
  log("All API smoke checks passed.");
}

smoke().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
