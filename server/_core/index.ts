import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { readBuildInfo } from "./health";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { registerOAuthRoutes } from "./oauth";
import { registerTwitterRoutes } from "../twitter-routes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { getDashboardSummary, getApiUsageStats } from "../api-usage-tracker";
import { getErrorLogs, getErrorStats, resolveError, resolveAllErrors, clearErrorLogs, errorTrackingMiddleware } from "../error-tracker";
import { checkSchemaIntegrity, notifySchemaIssue, type SchemaCheckResult } from "../schema-check";
import { getOpenApiSpec } from "../openapi";
import swaggerUi from "swagger-ui-express";
import { initWebSocketServer } from "../websocket";
import { initSentry, Sentry } from "./sentry";
import { rateLimiterMiddleware } from "./rate-limiter";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Initialize Sentry for error tracking
  initSentry();
  
  const app = express();
  const server = createServer(app);
  
  // Sentry request handler must be the first middleware (no-op for now)
  // Error handler will be added at the end

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Rate Limiter Middleware（不正アクセスを自動ブロック）
  app.use(rateLimiterMiddleware);

  registerOAuthRoutes(app);
  registerTwitterRoutes(app);

  app.get("/api/health", async (_req, res) => {
    // Gate 1: build-info を必ず読む。unknown なら ok=false / 500（UptimeRobot 検知用）
    const buildInfo = readBuildInfo();
    const nodeEnv = process.env.NODE_ENV || "development";
    if (!buildInfo.ok && Sentry) {
      Sentry.captureException(new Error("unknown version in /api/health"), {
        extra: { commitSha: buildInfo.commitSha, env: nodeEnv },
      });
      console.error("[CRITICAL] unknown version detected:", buildInfo);
    }
    const baseInfo = {
      ...buildInfo,
      nodeEnv,
      timestamp: Date.now(),
    };

    // DB接続確認
    let dbStatus: { connected: boolean; latency: number; error: string; challengesCount?: number } = { connected: false, latency: 0, error: "" };
    try {
      const { getDb, sql } = await import("../db");
      const startTime = Date.now();
      const db = await getDb();
      if (db) {
        await db.execute(sql`SELECT 1`);
        let challengesCount = 0;
        try {
          const r = await db.execute(sql`SELECT COUNT(*) AS c FROM challenges WHERE "isPublic" = true`);
          const rows = (r as unknown as { rows?: Array<{ c: string }> })?.rows ?? (Array.isArray(r) ? r : []);
          challengesCount = rows.length ? Number((rows[0] as { c: string })?.c ?? 0) : 0;
        } catch (_) {
          // テーブルが無い等は 0 のまま
        }
        dbStatus = {
          connected: true,
          latency: Date.now() - startTime,
          error: "",
          challengesCount,
        };
      } else {
        dbStatus.error = "DATABASE_URLが設定されていません";
      }
    } catch (err) {
      dbStatus.error = err instanceof Error ? err.message : "接続エラー";
    }

    // クリティカルAPI確認（オプション）
    const checkCritical = _req.query.critical === "true";
    let criticalApis: Record<string, { ok: boolean; error?: string }> & { error?: string } = {};

    if (checkCritical && dbStatus.connected) {
      try {
        const caller = appRouter.createCaller(await createContext({ req: _req as any, res: res as any, info: {} as any }));

        // homeEvents: イベント一覧取得
        try {
          await caller.events.list();
          criticalApis.homeEvents = { ok: true };
        } catch (err) {
          criticalApis.homeEvents = { ok: false, error: err instanceof Error ? err.message : String(err) };
        }

        // rankings: ランキング取得
        try {
          await caller.rankings.hosts({ limit: 1 });
          criticalApis.rankings = { ok: true };
        } catch (err) {
          criticalApis.rankings = { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
      } catch (err) {
        criticalApis.error = err instanceof Error ? err.message : String(err);
      }
    }

    // スキーマチェックはオプション（?schema=true で有効化）
    const checkSchema = _req.query.schema === "true";
    let schemaCheck: SchemaCheckResult | undefined;

    if (checkSchema) {
      try {
        schemaCheck = await checkSchemaIntegrity();
        
        // スキーマ不整合時は通知
        if (schemaCheck.status === "mismatch") {
          await notifySchemaIssue(schemaCheck);
        }
      } catch (error) {
        console.error("[health] Schema check failed:", error);
        schemaCheck = {
          status: "error",
          expectedVersion: "unknown",
          missingColumns: [],
          errors: [error instanceof Error ? error.message : String(error)],
          checkedAt: new Date().toISOString(),
        };
      }
    }

    // 全体のok（unknown なら false = UptimeRobot 等で検知可能）
    const overallOk =
      buildInfo.ok &&
      dbStatus.connected &&
      (!checkCritical || Object.values(criticalApis).every(api => typeof api === "object" && "ok" in api && api.ok));

    res.status(overallOk ? 200 : 500).json({
      ...baseInfo,
      ok: overallOk,
      db: dbStatus,
      ...(checkCritical && { critical: criticalApis }),
      ...(schemaCheck && { schema: schemaCheck }),
    });
  });

  // デバッグエンドポイント: 環境変数の確認
  app.get("/api/debug/env", (_req, res) => {
    res.json({
      RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA,
      APP_VERSION: process.env.APP_VERSION,
      GIT_SHA: process.env.GIT_SHA,
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
    });
  });

  // API使用量ダッシュボード用エンドポイント
  // OpenAPI仕様書エンドポイント
  app.get("/api/openapi.json", (_req, res) => {
    res.json(getOpenApiSpec());
  });

  // Swagger UI
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(getOpenApiSpec(), {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "動員ちゃれんじ API ドキュメント",
  }));

  // システム状態確認API
  app.get("/api/admin/system-status", async (_req, res) => {
    try {
      const { getDb } = await import("../db");
      
      // データベース接続確認
      let dbStatus = { connected: false, latency: 0, error: "" };
      try {
        const startTime = Date.now();
        const db = await getDb();
        if (db) {
          // 簡単なクエリで接続確認
          await db.execute("SELECT 1");
          dbStatus = {
            connected: true,
            latency: Date.now() - startTime,
            error: "",
          };
        } else {
          dbStatus.error = "DATABASE_URLが設定されていません";
        }
      } catch (err) {
        dbStatus.error = err instanceof Error ? err.message : "接続エラー";
      }

      // Twitter API設定確認
      const twitterStatus = {
        configured: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
        rateLimitRemaining: undefined as number | undefined,
        error: "",
      };
      if (!twitterStatus.configured) {
        twitterStatus.error = "Twitter API認証情報が設定されていません";
      }

      // サーバー情報
      const memUsage = process.memoryUsage();
      const serverInfo = {
        uptime: process.uptime(),
        memory: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal,
        },
        nodeVersion: process.version,
      };

      // 環境変数確認（値はマスク）
      const envVars = [
        { name: "DATABASE_URL", value: process.env.DATABASE_URL },
        { name: "TWITTER_CLIENT_ID", value: process.env.TWITTER_CLIENT_ID },
        { name: "TWITTER_CLIENT_SECRET", value: process.env.TWITTER_CLIENT_SECRET },
        { name: "TWITTER_BEARER_TOKEN", value: process.env.TWITTER_BEARER_TOKEN },
        { name: "SESSION_SECRET", value: process.env.SESSION_SECRET },
        { name: "EXPO_PUBLIC_API_BASE_URL", value: process.env.EXPO_PUBLIC_API_BASE_URL },
      ];

      const environment = envVars.map((env) => ({
        name: env.name,
        masked: env.value ? env.value.substring(0, 4) + "****" : "未設定",
        configured: !!env.value,
      }));

      res.json({
        database: dbStatus,
        twitter: twitterStatus,
        server: serverInfo,
        environment,
      });
    } catch (err) {
      console.error("[Admin] System status error:", err);
      res.status(500).json({ error: "システム状態の取得に失敗しました" });
    }
  });

  app.get("/api/admin/api-usage", async (_req, res) => {
    // TODO: 管理者認証を追加
    try {
      const summary = await getDashboardSummary();
      res.json(summary);
    } catch (error) {
      console.error("[Admin] API usage error:", error);
      res.status(500).json({ error: "API使用量の取得に失敗しました" });
    }
  });

  app.get("/api/admin/api-usage/stats", (_req, res) => {
    // TODO: 管理者認証を追加
    const stats = getApiUsageStats();
    res.json(stats);
  });

  // エラーログAPI
  app.get("/api/admin/errors", (req, res) => {
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const resolved = req.query.resolved === "true" ? true : req.query.resolved === "false" ? false : undefined;
    
    const logs = getErrorLogs({
      category: category as any,
      limit,
      resolved,
    });
    const stats = getErrorStats();
    
    res.json({ logs, stats });
  });

  // エラーを解決済みにマーク
  app.post("/api/admin/errors/:id/resolve", (req, res) => {
    const success = resolveError(req.params.id);
    res.json({ success });
  });

  // すべてのエラーを解決済みにマーク
  app.post("/api/admin/errors/resolve-all", (_req, res) => {
    const count = resolveAllErrors();
    res.json({ success: true, count });
  });

  // エラーログをクリア
  app.delete("/api/admin/errors", (_req, res) => {
    const count = clearErrorLogs();
    res.json({ success: true, count });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Sentry error handler must be after all controllers and before other error middleware
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.expressErrorHandler());
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // WebSocketサーバーを初期化
  initWebSocketServer(server);

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
