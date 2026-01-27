import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { APP_VERSION } from "../../shared/version";

// 環境変数からcommitShaを取得（デプロイ時にGitHub Actionsから設定）
const COMMIT_SHA = process.env.COMMIT_SHA || "unknown";

export const systemRouter = router({
  // バージョン取得エンドポイント
  version: publicProcedure.query(() => ({
    version: APP_VERSION,
  })),

  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      }),
    )
    .query(() => ({
      ok: true,
      commitSha: COMMIT_SHA,
      version: APP_VERSION,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
