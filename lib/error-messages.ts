/**
 * ユーザーフレンドリーなエラーメッセージ
 * 
 * 技術的なエラーメッセージを、ユーザーが理解しやすいメッセージに変換
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
}

/**
 * エラーコードからユーザーフレンドリーなメッセージを生成
 */
export function getUserFriendlyError(error: unknown): UserFriendlyError {
  // エラーメッセージを取得
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // ネットワークエラー
  if (errorMessage.includes("Network") || errorMessage.includes("fetch failed")) {
    return {
      title: "接続エラー",
      message: "インターネット接続を確認してください。",
      action: "再試行",
    };
  }
  
  // タイムアウトエラー
  if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
    return {
      title: "タイムアウト",
      message: "サーバーの応答が遅れています。しばらく待ってから再試行してください。",
      action: "再試行",
    };
  }
  
  // 認証エラー
  if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
    return {
      title: "ログインが必要です",
      message: "この操作を行うにはログインが必要です。",
      action: "ログイン",
    };
  }
  
  // 権限エラー
  if (errorMessage.includes("Forbidden") || errorMessage.includes("403")) {
    return {
      title: "アクセス権限がありません",
      message: "この操作を行う権限がありません。",
    };
  }
  
  // 見つからないエラー
  if (errorMessage.includes("Not Found") || errorMessage.includes("404")) {
    return {
      title: "見つかりませんでした",
      message: "お探しのページまたはデータが見つかりませんでした。",
    };
  }
  
  // バリデーションエラー
  if (errorMessage.includes("validation") || errorMessage.includes("invalid")) {
    return {
      title: "入力エラー",
      message: "入力内容に誤りがあります。もう一度確認してください。",
    };
  }
  
  // サーバーエラー
  if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
    return {
      title: "サーバーエラー",
      message: "サーバーで問題が発生しました。しばらく待ってから再試行してください。",
      action: "再試行",
    };
  }
  
  // データベースエラー
  if (errorMessage.includes("database") || errorMessage.includes("DB")) {
    return {
      title: "データベースエラー",
      message: "データの保存中に問題が発生しました。しばらく待ってから再試行してください。",
      action: "再試行",
    };
  }
  
  // レート制限エラー
  if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
    return {
      title: "リクエスト制限",
      message: "リクエストが多すぎます。しばらく待ってから再試行してください。",
    };
  }
  
  // デフォルトエラー
  return {
    title: "エラーが発生しました",
    message: "予期しないエラーが発生しました。しばらく待ってから再試行してください。",
    action: "再試行",
  };
}

/**
 * エラーメッセージの日本語化マップ
 */
export const ERROR_MESSAGES_JA: Record<string, string> = {
  // 認証関連
  "Invalid credentials": "メールアドレスまたはパスワードが正しくありません",
  "Email already exists": "このメールアドレスは既に登録されています",
  "User not found": "ユーザーが見つかりませんでした",
  "Session expired": "セッションの有効期限が切れました。再度ログインしてください",
  
  // イベント関連
  "Event not found": "イベントが見つかりませんでした",
  "Event is full": "このイベントは定員に達しています",
  "Event has ended": "このイベントは終了しました",
  "Already registered": "既に参加登録済みです",
  
  // チャレンジ関連
  "Challenge not found": "チャレンジが見つかりませんでした",
  "Challenge is closed": "このチャレンジは終了しました",
  "Already completed": "既に完了済みです",
  
  // ファイルアップロード関連
  "File too large": "ファイルサイズが大きすぎます（最大10MB）",
  "Invalid file type": "サポートされていないファイル形式です",
  
  // 一般的なエラー
  "Required field": "必須項目です",
  "Invalid format": "形式が正しくありません",
  "Too long": "文字数が多すぎます",
  "Too short": "文字数が少なすぎます",
};

/**
 * エラーメッセージを日本語化
 */
export function translateErrorMessage(message: string): string {
  return ERROR_MESSAGES_JA[message] || message;
}
