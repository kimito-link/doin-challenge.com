import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { readBuildInfo } from "./health";
import { APP_VERSION } from "../../shared/version";

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
import { verifyAdminPassword } from "../admin-password-auth";
import { getSessionCookieOptions } from "./cookies";
import type { Request, Response } from "express";
import { ONE_YEAR_MS } from "../../shared/const";

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

/**
 * 信頼できるオリジンかどうかをチェック
 * 
 * @internal テスト用にexport（本来はprivate関数）
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  
  // 信頼できるオリジンのリスト（環境変数から取得可能）
  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  
  // 開発環境では localhost を許可
  if (process.env.NODE_ENV !== "production") {
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return true;
    }
  }
  
  // 本番環境ではホワイトリストをチェック
  if (ALLOWED_ORIGINS.length > 0) {
    return ALLOWED_ORIGINS.some(allowed => {
      // 完全一致（originは完全なURL、allowedも完全なURLまたはドメイン）
      if (origin === allowed) return true;
      
      // .example.com のような形式の場合、originのhostnameがexample.comで終わるかチェック
      if (allowed.startsWith(".")) {
        try {
          const url = new URL(origin);
          return url.hostname === allowed.slice(1) || url.hostname.endsWith(allowed);
        } catch {
          return origin.endsWith(allowed) || origin === allowed.slice(1);
        }
      }
      
      // allowedがURL形式の場合、完全一致をチェック
      // allowedがドメインのみの場合、originのhostnameと比較
      try {
        const originUrl = new URL(origin);
        const allowedUrl = allowed.startsWith("http") ? new URL(allowed) : null;
        if (allowedUrl) {
          return originUrl.origin === allowedUrl.origin;
        } else {
          // allowedがドメインのみの場合
          return originUrl.hostname === allowed || originUrl.hostname.endsWith(`.${allowed}`);
        }
      } catch {
        // URL解析に失敗した場合は文字列比較
        return origin === allowed || origin.endsWith(allowed);
      }
    });
  }
  
  // ホワイトリストが設定されていない場合は、doin-challenge.com のみ許可
  // より厳密にチェック: doin-challenge.com で終わる、または完全一致
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    // doin-challenge.com で終わる、かつ evil.com のようなサブドメイン攻撃を防ぐ
    return hostname === "doin-challenge.com" || 
           hostname.endsWith(".doin-challenge.com");
  } catch {
    // URL解析に失敗した場合は、includes でフォールバック
    return origin.includes("doin-challenge.com") && 
           !origin.includes("doin-challenge.com.evil") &&
           !origin.includes("evil-doin-challenge.com");
  }
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
    
    if (origin && isAllowedOrigin(origin)) {
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

  // ... (existing imports)

  // ...

  app.get("/api/health", async (_req, res) => {
    try {
      const buildInfo = readBuildInfo();
      const nodeEnv = process.env.NODE_ENV || "development";

      // Use imported APP_VERSION as the authoritative version
      // Fallback to buildInfo.version or "unknown" only if needed, 
      // but ideally we want the semantic version from shared/version.ts
      const displayVersion = APP_VERSION || buildInfo.version || "unknown";

      if (!buildInfo.ok && Sentry) {
        Sentry.captureException(new Error("unknown version in /api/health"), {
          extra: { commitSha: buildInfo.commitSha, env: nodeEnv },
        });
        console.error("[CRITICAL] unknown version detected:", buildInfo);
      }
      const baseInfo = {
        ...buildInfo,
        version: displayVersion, // Override/Ensure version is set
        nodeEnv,
        timestamp: Date.now(),
      };

      let dbStatus: { connected: boolean; latency: number; error: string; challengesCount?: number } = { connected: false, latency: 0, error: "" };
      try {
        const { getDb, sql } = await import("../db");
        const startTime = Date.now();
        const db = await getDb();
        if (db) {
          try {
            // シンプルな接続テストクエリ
            await db.execute(sql`SELECT 1`);
            
            let challengesCount = 0;
            try {
              const r = await db.execute(sql`SELECT COUNT(*) AS c FROM challenges WHERE "isPublic" = true`);
              const rows = (r as unknown as { rows?: Array<{ c: string }> })?.rows ?? (Array.isArray(r) ? r : []);
              challengesCount = rows.length ? Number((rows[0] as { c: string })?.c ?? 0) : 0;
            } catch (countErr) {
              // テーブルが無い等は 0 のまま
              console.warn("[health] Failed to count challenges:", countErr);
            }
            
            dbStatus = {
              connected: true,
              latency: Date.now() - startTime,
              error: "",
              challengesCount,
            };
          } catch (queryErr) {
            // クエリ実行エラー
            const errorMessage = queryErr instanceof Error ? queryErr.message : String(queryErr);
            // エラーメッセージから不要な部分を削除（\nparamなど）
            const cleanMessage = errorMessage
              .replace(/\nparam.*$/g, "")
              .replace(/params:.*$/g, "")
              .trim();
            
            console.error("[health] Database query failed:", {
              error: cleanMessage,
              originalError: errorMessage,
              stack: queryErr instanceof Error ? queryErr.stack : undefined,
            });
            
            dbStatus = {
              connected: false,
              latency: Date.now() - startTime,
              error: cleanMessage || "データベースクエリの実行に失敗しました",
            };
          }
        } else {
          // DATABASE_URLが設定されていない、または接続に失敗
          const hasDatabaseUrl = !!process.env.DATABASE_URL;
          dbStatus.error = hasDatabaseUrl
            ? "データベース接続の確立に失敗しました"
            : "DATABASE_URLが設定されていません";
        }
      } catch (err) {
        // 予期しないエラー（インポートエラーなど）
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[health] Unexpected database error:", {
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
        });
        dbStatus.error = errorMessage || "接続エラー";
      }

      const checkCritical = _req.query.critical === "true";
      let criticalApis: Record<string, { ok: boolean; error?: string }> & { error?: string } = {};

      if (checkCritical && dbStatus.connected) {
        try {
          const caller = appRouter.createCaller(await createContext({ req: _req as any, res: res as any, info: {} as any }));

          try {
            await caller.events.list();
            criticalApis.homeEvents = { ok: true };
          } catch (err) {
            criticalApis.homeEvents = { ok: false, error: err instanceof Error ? err.message : String(err) };
          }

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

      const checkSchema = _req.query.schema === "true";
      let schemaCheck: SchemaCheckResult | undefined;

      if (checkSchema) {
        try {
          schemaCheck = await checkSchemaIntegrity();
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

      // DB 未接続のときだけ 500（UptimeRobot アラート）。build-info のみ不備のときは 200 + ok:false でアラート抑止
      const overallOk =
        dbStatus.connected &&
        buildInfo.ok &&
        (!checkCritical || Object.values(criticalApis).every(api => typeof api === "object" && "ok" in api && api.ok));

      const statusCode = dbStatus.connected ? 200 : 500;
      res.status(statusCode).json({
        ...baseInfo,
        // 後方互換性のため、commitsha（小文字）も含める
        commitsha: baseInfo.commitSha,
        ok: overallOk,
        db: dbStatus,
        ...(checkCritical && { critical: criticalApis }),
        ...(schemaCheck && { schema: schemaCheck }),
      });
    } catch (err) {
      console.error("[health] Unhandled error:", err);
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        ok: false,
        commitSha: "unknown",
        commitsha: "unknown", // 後方互換性のため
        version: "unknown",
        builtAt: "unknown",
        timestamp: Date.now(),
        error: message,
        db: { connected: false, latency: 0, error: message },
      });
    }
  });

  // デバッグエンドポイント: 環境変数の確認
  app.get("/api/debug/env", (_req, res) => {
    // 機密情報をマスク
    const maskSecret = (value: string | undefined) => {
      if (!value) return undefined;
      if (value.length <= 8) return "***";
      return value.substring(0, 4) + "***" + value.substring(value.length - 4);
    };
    
    res.json({
      RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA,
      APP_VERSION: process.env.APP_VERSION,
      GIT_SHA: process.env.GIT_SHA,
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
      // 機密情報はマスク
      DATABASE_URL: maskSecret(process.env.DATABASE_URL),
      JWT_SECRET: maskSecret(process.env.JWT_SECRET),
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

  // 管理者パスワード認証
  app.post("/api/admin/verify-password", async (req: Request, res: Response) => {
    try {
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ error: "パスワードが必要です" });
        return;
      }

      if (verifyAdminPassword(password)) {
        // パスワードが正しい場合、管理者セッションCookieを設定（1年間有効）
        const ADMIN_SESSION_COOKIE = "admin_session";
        const cookieOptions = getSessionCookieOptions(req);

        res.cookie(ADMIN_SESSION_COOKIE, "authenticated", {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        res.json({ success: true });
      } else {
        res.status(401).json({ error: "パスワードが正しくありません" });
      }
    } catch (error) {
      console.error("[Admin] Password verification error:", error);
      res.status(500).json({ error: "認証に失敗しました" });
    }
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
