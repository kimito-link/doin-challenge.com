import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function readBuildInfo(): {
  ok: boolean;
  commitSha: string;
  version: string;
  builtAt: string;
} {
  const candidates = [
    path.join(process.cwd(), "dist", "build-info.json"),
    path.join(__dirname, "build-info.json"),
  ];
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const raw = JSON.parse(fs.readFileSync(p, "utf-8")) as Record<string, unknown>;
      const commitSha = (raw.commitSha ?? raw.version ?? "unknown") as string;
      const version = (raw.version ?? raw.commitSha ?? "unknown") as string;
      const builtAt = (raw.builtAt ?? raw.buildTime ?? new Date().toISOString()) as string;
      if (!commitSha || commitSha === "unknown") {
        throw new Error("invalid build-info");
      }
      // Railway: ビルド時は SHA が入らないことがあるので、ランタイムの RAILWAY_GIT_COMMIT_SHA で上書き
      const resolvedSha =
        process.env.RAILWAY_GIT_COMMIT_SHA && /^(local-|railway-)/.test(commitSha)
          ? process.env.RAILWAY_GIT_COMMIT_SHA
          : commitSha;
      return {
        ok: true,
        commitSha: resolvedSha,
        version: resolvedSha,
        builtAt,
      };
    } catch {
      continue;
    }
  }
  return {
    ok: false,
    commitSha: "unknown",
    version: "unknown",
    builtAt: "unknown",
  };
}
