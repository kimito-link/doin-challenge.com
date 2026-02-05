/**
 * 共通の文言定数（ボタン、エラー、確認など）
 * 全画面で使われる文言を一元管理
 */
export const commonCopy = {
  buttons: {
    cancel: "キャンセル",
    confirm: "確認",
    submit: "送信",
    save: "保存",
    delete: "削除",
    edit: "編集",
    close: "閉じる",
    back: "戻る",
    next: "次へ",
    skip: "スキップ",
    retry: "再試行",
  },
  errors: {
    generic: "エラーが発生しました",
    network: "ネットワークエラーが発生しました",
    notFound: "見つかりません",
    unauthorized: "ログインが必要です",
    forbidden: "アクセス権限がありません",
    serverError: "サーバーエラーが発生しました",
    unknown: "不明なエラーが発生しました",
  },
  confirmations: {
    delete: "削除しますか？",
    cancel: "キャンセルしますか？",
    unsavedChanges: "保存されていない変更があります。続行しますか？",
  },
  loading: {
    loading: "読み込み中...",
    submitting: "送信中...",
    saving: "保存中...",
    user: "ユーザーを読み込み中...",
    challenge: "チャレンジを読み込み中...",
    data: "データを読み込み中...",
    stats: "統計データを読み込み中...",
    messages: "メッセージを読み込み中...",
    notifications: "通知を読み込み中...",
    participants: "参加者を読み込み中...",
    categories: "カテゴリを読み込み中...",
    errors: "エラーログを読み込み中...",
  },
  empty: {
    noData: "データがありません",
    noResults: "検索結果がありません",
  },
} as const;
