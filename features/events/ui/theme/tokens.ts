/**
 * Events専用テーマトークン
 * 
 * events配下のコンポーネントでは直書き色（#XXXXXX）を使用せず、
 * このトークンを使用することで視認性を保証し、再発を防止する。
 * 
 * 使用例:
 * import { eventText, eventFont } from "@/features/events/ui/theme/tokens";
 * <Text style={{ color: eventText.username, fontSize: eventFont.username }}>@{username}</Text>
 */

/**
 * テキスト色トークン
 * ダーク背景（#1A1D21）に対して十分なコントラスト比を確保
 */
export const eventText = {
  // 一般テキスト
  primary: "#E5E7EB",   // ほぼ白（ダークで読みやすい）コントラスト比: 12.6:1
  muted: "#D1D5DB",     // サブテキスト（followersなど）コントラスト比: 11.48:1

  // 特定用途
  username: "#FBBF24",  // @username（視認性強）コントラスト比: 10.13:1
  follower: "#F472B6",  // フォロワー数（ピンクを明度寄せ）コントラスト比: 6.39:1
  
  // 補助
  secondary: "#9CA3AF", // 補助テキスト（大きいサイズ用）コントラスト比: 6.66:1
  hint: "#6B7280",      // ヒントテキスト（大きいサイズ用）コントラスト比: 4.48:1
} as const;

/**
 * フォントサイズトークン
 * ダークUIでは10px以下は字形が潰れやすいため、12pxを下限とする
 */
export const eventFont = {
  // 小さい文字の下限（視認性保証）
  meta: 12,       // フォロワー数、日付など
  username: 12,   // @username
  
  // 通常サイズ
  body: 14,       // 本文
  title: 16,      // タイトル
} as const;

/**
 * 型定義
 */
export type EventTextColor = keyof typeof eventText;
export type EventFontSize = keyof typeof eventFont;
