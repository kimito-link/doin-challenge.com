/**
 * ログ機能とエラー追跡システム
 * アプリケーションの動作を記録し、問題の早期発見と解決を支援
 */

import fs from "fs";
import path from "path";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  userId?: number;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
}

class Logger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), "logs");
    this.logFile = path.join(this.logDir, `app-${this.getDateString()}.log`);
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry) + "\n";
  }

  private writeLog(entry: LogEntry) {
    const formatted = this.formatLogEntry(entry);
    
    // コンソールに出力
    console.log(formatted);

    // ファイルに書き込み
    try {
      fs.appendFileSync(this.logFile, formatted);
    } catch (error) {
      console.error("Failed to write log:", error);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
    });
  }

  info(message: string, context?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    });
  }

  warn(message: string, context?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    });
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      context,
    });
  }

  fatal(message: string, error?: Error, context?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.FATAL,
      message,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      context,
    });
  }

  /**
   * HTTPリクエストログ
   */
  logRequest(req: any, userId?: number) {
    this.info("HTTP Request", {
      method: req.method,
      url: req.url,
      ip: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
      userId,
    });
  }

  /**
   * HTTPレスポンスログ
   */
  logResponse(req: any, res: any, duration: number) {
    this.info("HTTP Response", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  }

  /**
   * データベースクエリログ
   */
  logQuery(query: string, duration: number, params?: any[]) {
    this.debug("Database Query", {
      query,
      params,
      duration: `${duration}ms`,
    });
  }

  /**
   * ユーザーアクションログ
   */
  logUserAction(userId: number, action: string, details?: Record<string, any>) {
    this.info("User Action", {
      userId,
      action,
      ...details,
    });
  }

  /**
   * セキュリティイベントログ
   */
  logSecurityEvent(event: string, severity: "low" | "medium" | "high", details?: Record<string, any>) {
    this.warn("Security Event", {
      event,
      severity,
      ...details,
    });
  }

  /**
   * パフォーマンスログ
   */
  logPerformance(operation: string, duration: number, details?: Record<string, any>) {
    if (duration > 1000) {
      this.warn("Slow Operation", {
        operation,
        duration: `${duration}ms`,
        ...details,
      });
    } else {
      this.debug("Performance", {
        operation,
        duration: `${duration}ms`,
        ...details,
      });
    }
  }
}

// シングルトンインスタンス
export const logger = new Logger();

/**
 * エラー追跡システム
 */
export class ErrorTracker {
  private errors: Map<string, { count: number; lastOccurred: Date; samples: Error[] }> = new Map();

  track(error: Error, context?: Record<string, any>) {
    const key = `${error.name}:${error.message}`;
    const existing = this.errors.get(key);

    if (existing) {
      existing.count++;
      existing.lastOccurred = new Date();
      if (existing.samples.length < 5) {
        existing.samples.push(error);
      }
    } else {
      this.errors.set(key, {
        count: 1,
        lastOccurred: new Date(),
        samples: [error],
      });
    }

    logger.error("Error tracked", error, context);
  }

  getStats() {
    const stats = Array.from(this.errors.entries()).map(([key, data]) => ({
      error: key,
      count: data.count,
      lastOccurred: data.lastOccurred,
      sampleStack: data.samples[0]?.stack,
    }));

    return stats.sort((a, b) => b.count - a.count);
  }

  clear() {
    this.errors.clear();
  }
}

export const errorTracker = new ErrorTracker();

/**
 * パフォーマンス計測ヘルパー
 */
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = Date.now();

  const result = fn();

  if (result instanceof Promise) {
    return result.then((value) => {
      const duration = Date.now() - start;
      logger.logPerformance(operation, duration);
      return value;
    });
  } else {
    const duration = Date.now() - start;
    logger.logPerformance(operation, duration);
    return result;
  }
}
