/**
 * 日付ユーティリティ関数
 */

/**
 * 相対時間を計算して「○分前」「○時間前」「○日前」形式で返す
 * @param date 対象の日時
 * @returns 相対時間の文字列
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  
  // ミリ秒単位の差分
  const diffMs = now.getTime() - targetDate.getTime();
  
  // 秒単位の差分
  const diffSeconds = Math.floor(diffMs / 1000);
  
  // 1分未満
  if (diffSeconds < 60) {
    return "たった今";
  }
  
  // 1時間未満
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }
  
  // 1日未満
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }
  
  // 1週間未満
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}日前`;
  }
  
  // 1ヶ月未満
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks}週間前`;
  }
  
  // 1年未満
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}ヶ月前`;
  }
  
  // 1年以上
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}年前`;
}

/**
 * 日付を「YYYY/MM/DD HH:mm」形式でフォーマット
 * @param date 対象の日時
 * @returns フォーマットされた文字列
 */
export function formatDateTime(date: Date | string): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const hours = String(targetDate.getHours()).padStart(2, "0");
  const minutes = String(targetDate.getMinutes()).padStart(2, "0");
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}
