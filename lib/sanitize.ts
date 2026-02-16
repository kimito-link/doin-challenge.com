/**
 * 入力サニタイズユーティリティ
 * 
 * XSS攻撃を防ぐため、ユーザー入力をサニタイズ
 */

/**
 * HTMLエスケープ
 * 
 * XSS攻撃を防ぐため、HTML特殊文字をエスケープ
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * HTMLタグを削除
 * 
 * すべてのHTMLタグを削除し、プレーンテキストのみを残す
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * URLをサニタイズ
 * 
 * javascript:やdata:などの危険なプロトコルを除去
 */
export function sanitizeUrl(url: string): string {
  const dangerousProtocols = ["javascript:", "data:", "vbscript:"];
  
  for (const protocol of dangerousProtocols) {
    if (url.toLowerCase().startsWith(protocol)) {
      return "";
    }
  }
  
  return url;
}

/**
 * SQLインジェクション対策
 * 
 * SQLクエリで使用される特殊文字をエスケープ
 * 注意: 実際のアプリケーションでは、プリペアドステートメントを使用すること
 */
export function escapeSql(text: string): string {
  return text.replace(/'/g, "''");
}

/**
 * ファイル名をサニタイズ
 * 
 * ファイル名に使用できない文字を削除
 */
export function sanitizeFilename(filename: string): string {
  // パストラバーサル攻撃を防ぐため、../ や ..\\ を削除
  let sanitized = filename.replace(/\.\.[/\\]/g, "");
  
  // ファイル名に使用できない文字を削除
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1F]/g, "");
  
  // 先頭と末尾の空白を削除
  sanitized = sanitized.trim();
  
  // 空文字列の場合はデフォルト名を返す
  if (sanitized === "") {
    return "untitled";
  }
  
  return sanitized;
}

/**
 * メールアドレスをサニタイズ
 * 
 * 基本的なメールアドレス形式のバリデーション
 */
export function sanitizeEmail(email: string): string {
  // 空白を削除
  let sanitized = email.trim().toLowerCase();
  
  // 基本的なメールアドレス形式のチェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return "";
  }
  
  return sanitized;
}

/**
 * 電話番号をサニタイズ
 * 
 * 数字とハイフンのみを許可
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9-]/g, "");
}

/**
 * テキスト入力をサニタイズ
 * 
 * 一般的なテキスト入力のサニタイズ
 */
export function sanitizeText(text: string, maxLength = 1000): string {
  // HTMLタグを削除
  let sanitized = stripHtml(text);
  
  // 制御文字を削除
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
  
  // 最大長を制限
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // 先頭と末尾の空白を削除
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * JSONをサニタイズ
 * 
 * JSON文字列の妥当性をチェック
 */
export function sanitizeJson(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch {
    return "";
  }
}
