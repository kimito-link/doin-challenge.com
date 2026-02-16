/**
 * API圧縮ミドルウェア
 * 
 * gzip圧縮を有効化してレスポンスサイズを削減
 * 通常30-70%のサイズ削減が可能
 */

import { Request, Response, NextFunction } from "express";
import { createGzip } from "zlib";

/**
 * 圧縮が必要かどうかを判定
 */
function shouldCompress(req: Request, res: Response): boolean {
  // クライアントがgzipをサポートしているか
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (!acceptEncoding.includes("gzip")) {
    return false;
  }
  
  // Content-Typeが圧縮可能な形式か
  const contentType = res.getHeader("content-type") as string || "";
  const compressibleTypes = [
    "application/json",
    "application/javascript",
    "text/html",
    "text/css",
    "text/plain",
    "text/xml",
  ];
  
  return compressibleTypes.some((type) => contentType.includes(type));
}

/**
 * gzip圧縮ミドルウェア
 */
export function compressionMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 元のsend関数を保存
  const originalSend = res.send;
  
  // send関数をオーバーライド
  res.send = function (body: unknown): Response {
    if (!shouldCompress(req, res)) {
      return originalSend.call(this, body);
    }
    
    // gzip圧縮を適用
    const gzip = createGzip();
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Vary", "Accept-Encoding");
    
    // 圧縮されたデータを送信
    if (typeof body === "string") {
      gzip.write(body);
      gzip.end();
      
      const chunks: Buffer[] = [];
      gzip.on("data", (chunk) => chunks.push(chunk));
      gzip.on("end", () => {
        const compressed = Buffer.concat(chunks);
        originalSend.call(res, compressed);
      });
      
      return this;
    }
    
    return originalSend.call(this, body);
  };
  
  next();
}

/**
 * レスポンスペイロードのサイズを削減するヘルパー関数
 */
export function minimizePayload<T extends Record<string, unknown>>(
  data: T,
  excludeFields: string[] = []
): Partial<T> {
  const minimized: Partial<T> = {};
  
  for (const key in data) {
    if (excludeFields.includes(key)) continue;
    
    const value = data[key];
    
    // null/undefinedは除外
    if (value === null || value === undefined) continue;
    
    // 空文字列は除外
    if (value === "") continue;
    
    // 空配列は除外
    if (Array.isArray(value) && value.length === 0) continue;
    
    // 空オブジェクトは除外
    if (typeof value === "object" && Object.keys(value as object).length === 0) continue;
    
    minimized[key] = value;
  }
  
  return minimized;
}
