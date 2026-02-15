/**
 * セキュリティ強化ユーティリティ
 * XSS/CSRF対策、入力サニタイゼーション、レート制限など
 */

import type { Request, Response, NextFunction } from "express";

/**
 * XSS対策: HTMLエスケープ
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 入力サニタイゼーション
 */
export function sanitizeInput(input: string): string {
  // HTMLタグを削除
  let sanitized = input.replace(/<[^>]*>/g, "");
  
  // スクリプトタグを削除
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // イベントハンドラーを削除
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  
  // javascript:プロトコルを削除
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  return sanitized.trim();
}

/**
 * SQLインジェクション対策: 危険な文字をエスケープ
 */
export function escapeSql(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

/**
 * CSRF対策: トークン生成
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * CSRF対策: トークン検証ミドルウェア
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // GETリクエストはスキップ
  if (req.method === "GET") {
    return next();
  }

  const token = req.headers["x-csrf-token"] as string;
  const sessionToken = (req as any).session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  next();
}

/**
 * レート制限: IPアドレスごとのリクエスト数を制限
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(ip, record);
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ error: "Too many requests" });
    }

    record.count++;
    next();
  };
}

/**
 * セキュアヘッダーの設定
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // XSS対策
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // HTTPS強制
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  
  next();
}

/**
 * パスワード強度チェック
 */
export function checkPasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // 長さチェック
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("パスワードは8文字以上にしてください");
  }

  // 大文字チェック
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("大文字を含めてください");
  }

  // 小文字チェック
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("小文字を含めてください");
  }

  // 数字チェック
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("数字を含めてください");
  }

  // 特殊文字チェック
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push("特殊文字を含めてください");
  }

  return {
    isStrong: score >= 4,
    score,
    feedback,
  };
}

/**
 * 安全なランダム文字列生成
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * IPアドレス取得（プロキシ対応）
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * ユーザーエージェント検証
 */
export function validateUserAgent(req: Request): boolean {
  const userAgent = req.headers["user-agent"];
  if (!userAgent) {
    return false;
  }

  // 既知のボットをブロック
  const blockedBots = ["bot", "crawler", "spider", "scraper"];
  const lowerUA = userAgent.toLowerCase();
  
  return !blockedBots.some((bot) => lowerUA.includes(bot));
}
