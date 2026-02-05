#!/usr/bin/env node
/**
 * Gate 2: API スモークテスト
 * 必須: /api/health が 200 かつ ok/commitSha が有効であること。
 * tRPC は参考で叩くのみ（失敗してもジョブは落とさない。本番プロキシ等で 400/500 が出ることがあるため）。
 * 使い方: BASE_URL=https://doin-challenge.com node scripts/gate2-api-smoke.mjs
 */
const BASE = process.env.BASE_URL || process.env.API_URL || "https://doin-challenge.com";

function log(msg) {
  console.log(`[gate2-smoke] ${msg}`);
}

async function smoke() {
  const requiredFailures = [];

  // 必須: Health（ここが落ちたら exit 1）
  try {
    const res = await fetch(`${BASE}/api/health`, { redirect: "follow" });
    if (!res.ok) {
      requiredFailures.push(`/api/health: ${res.status} ${res.statusText}`);
    } else {
      const data = await res.json();
      if (data.ok !== true || data.commitSha === "unknown") {
        requiredFailures.push("/api/health: ok または commitSha が不正");
      } else {
        log("✅ /api/health");
      }
    }
  } catch (e) {
    requiredFailures.push(`/api/health: ${e.message}`);
  }

  if (requiredFailures.length > 0) {
    console.error("❌ Gate 2 API smoke failed (required):");
    requiredFailures.forEach((f) => console.error("  -", f));
    process.exit(1);
  }

  // 参考: tRPC（失敗時は警告のみ。本番プロキシ・形式の差で 400/500 が出る場合あり）
  const trpcCalls = [
    ["events.list", {}],
    ["events.getById", { id: 90001 }],
    ["rankings.hosts", { limit: 1 }],
    ["rankings.contribution", { period: "all", limit: 1 }],
    ["participations.listByEvent", { eventId: 90001 }],
  ];
  for (const [path, input] of trpcCalls) {
    const inputParam = encodeURIComponent(JSON.stringify({ 0: input }));
    const url = `${BASE}/api/trpc/${path}?batch=1&input=${inputParam}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      const data = await res.json().catch(() => ({}));
      const result = Array.isArray(data) ? data[0] : data;
      if (res.ok && result?.result !== undefined) {
        log(`✅ /api/trpc/${path}`);
      } else {
        log(`⚠️ /api/trpc/${path} → ${res.status} (optional)`);
      }
    } catch (e) {
      log(`⚠️ /api/trpc/${path} → ${e.message} (optional)`);
    }
  }

  log("Required checks passed.");
}

smoke().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
