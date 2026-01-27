/**
 * アプリ全体で使用する文言定数
 * 
 * このファイルで文言を一元管理することで、以下のメリットがあります：
 * - 文言変更時の修正箇所が1箇所で済む
 * - 表記の一貫性が保たれる
 * - 将来的なi18n対応が容易になる
 */

/**
 * 参加者関連の文言
 */
export const PARTICIPANT_LABELS = {
  /** 参加予定数（参加表明した人数） */
  COUNT: "参加予定数",
  /** 参加予定の推移（グラフなどで使用） */
  TREND: "参加予定の推移",
  /** 実際の参加予定数（イベント後の実績） */
  ACTUAL_COUNT: "実際の参加予定数",
  /** 参加者（単数形） */
  SINGULAR: "参加者",
  /** 参加者（複数形） */
  PLURAL: "参加者",
} as const;

/**
 * チャレンジ関連の文言
 */
export const CHALLENGE_LABELS = {
  /** チャレンジ */
  CHALLENGE: "チャレンジ",
  /** 動員ちゃれんじ */
  DOIN_CHALLENGE: "動員ちゃれんじ",
  /** 目標人数 */
  TARGET_COUNT: "目標人数",
  /** 進捗 */
  PROGRESS: "進捗",
  /** 達成率 */
  ACHIEVEMENT_RATE: "達成率",
} as const;

/**
 * イベント関連の文言
 */
export const EVENT_LABELS = {
  /** イベント */
  EVENT: "イベント",
  /** 開催日時 */
  DATE_TIME: "開催日時",
  /** 会場 */
  VENUE: "会場",
  /** ジャンル */
  GENRE: "ジャンル",
} as const;

/**
 * アクション関連の文言
 */
export const ACTION_LABELS = {
  /** 参加予定を表明 */
  PARTICIPATE: "参加予定を表明",
  /** 参加表明 */
  PARTICIPATION: "参加表明",
  /** シェア */
  SHARE: "シェア",
  /** 編集 */
  EDIT: "編集",
  /** 削除 */
  DELETE: "削除",
  /** 保存 */
  SAVE: "保存",
  /** キャンセル */
  CANCEL: "キャンセル",
} as const;

/**
 * メッセージ関連の文言
 */
export const MESSAGE_LABELS = {
  /** 応援メッセージ */
  SUPPORT_MESSAGE: "応援メッセージ",
  /** いいね */
  LIKE: "いいね",
  /** コメント */
  COMMENT: "コメント",
} as const;

/**
 * 通知関連の文言
 */
export const NOTIFICATION_LABELS = {
  /** 通知 */
  NOTIFICATION: "通知",
  /** 新しい参加者 */
  NEW_PARTICIPANT: "新しい参加者",
  /** 目標達成 */
  GOAL_ACHIEVED: "目標達成",
  /** マイルストーン */
  MILESTONE: "マイルストーン",
} as const;

/**
 * 統計・分析関連の文言
 */
export const STATS_LABELS = {
  /** 時間帯別の参加予定 */
  HOURLY_PARTICIPATION: "時間帯別の参加予定",
  /** 日別の参加予定 */
  DAILY_PARTICIPATION: "日別の参加予定",
  /** 地域別の参加予定 */
  REGIONAL_PARTICIPATION: "地域別の参加予定",
  /** 都道府県別の参加予定 */
  PREFECTURAL_PARTICIPATION: "都道府県別の参加予定",
} as const;

/**
 * エラーメッセージ
 */
export const ERROR_LABELS = {
  /** エラーが発生しました */
  GENERIC_ERROR: "エラーが発生しました",
  /** ネットワークエラー */
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  /** 認証エラー */
  AUTH_ERROR: "認証エラーが発生しました",
} as const;

/**
 * 成功メッセージ
 */
export const SUCCESS_LABELS = {
  /** 保存しました */
  SAVED: "保存しました",
  /** 削除しました */
  DELETED: "削除しました",
  /** 参加表明しました */
  PARTICIPATED: "参加表明しました",
} as const;

/**
 * すべてのラベルを統合したオブジェクト
 */
export const LABELS = {
  PARTICIPANT: PARTICIPANT_LABELS,
  CHALLENGE: CHALLENGE_LABELS,
  EVENT: EVENT_LABELS,
  ACTION: ACTION_LABELS,
  MESSAGE: MESSAGE_LABELS,
  NOTIFICATION: NOTIFICATION_LABELS,
  STATS: STATS_LABELS,
  ERROR: ERROR_LABELS,
  SUCCESS: SUCCESS_LABELS,
} as const;
