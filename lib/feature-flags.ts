/**
 * lib/feature-flags.ts
 * 
 * Feature Flagの管理
 * 
 * リアルタイム更新・プッシュ通知・重い演出を即OFFできる仕組み
 */

/**
 * Feature Flagの型定義
 */
export interface FeatureFlags {
  /** リアルタイム更新（Polling） */
  realtimeUpdate: boolean;
  /** プッシュ通知 */
  pushNotification: boolean;
  /** 参加完了アニメ */
  participationAnimation: boolean;
}

/**
 * 環境変数からFeature Flagsを取得
 * 
 * デフォルトは全てtrue（有効）
 */
function getFeatureFlagsFromEnv(): FeatureFlags {
  return {
    realtimeUpdate: process.env.FEATURE_REALTIME_UPDATE !== "false",
    pushNotification: process.env.FEATURE_PUSH_NOTIFICATION !== "false",
    participationAnimation: process.env.FEATURE_PARTICIPATION_ANIMATION !== "false",
  };
}

/**
 * Feature Flagsのシングルトンインスタンス
 */
let featureFlags: FeatureFlags | null = null;

/**
 * Feature Flagsを取得
 */
export function getFeatureFlags(): FeatureFlags {
  if (!featureFlags) {
    featureFlags = getFeatureFlagsFromEnv();
  }
  return featureFlags;
}

/**
 * Feature Flagsをリセット（テスト用）
 */
export function resetFeatureFlags() {
  featureFlags = null;
}

/**
 * 特定のFeature Flagが有効かどうかを確認
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}
