# Feature Flags

## 概要

Feature Flagsを使用して、リアルタイム更新・プッシュ通知・重い演出を即OFFできるようにします。

## Feature Flags一覧

| Flag | 環境変数 | デフォルト | 説明 |
|------|----------|------------|------|
| リアルタイム更新（Polling） | `FEATURE_REALTIME_UPDATE` | `true` | 参加者数・応援メッセージの自動更新 |
| プッシュ通知 | `FEATURE_PUSH_NOTIFICATION` | `true` | 新しい応援メッセージの通知 |
| 参加完了アニメ | `FEATURE_PARTICIPATION_ANIMATION` | `true` | 参加表明完了時の演出 |

## 使い方

### 1. 環境変数を設定

`.env`ファイルに以下を追加：

```bash
FEATURE_REALTIME_UPDATE=true
FEATURE_PUSH_NOTIFICATION=true
FEATURE_PARTICIPATION_ANIMATION=true
```

### 2. コードで使用

```typescript
import { isFeatureEnabled } from "@/lib/feature-flags";

// リアルタイム更新が有効かどうかを確認
if (isFeatureEnabled("realtimeUpdate")) {
  // Polling処理
}

// プッシュ通知が有効かどうかを確認
if (isFeatureEnabled("pushNotification")) {
  // プッシュ通知処理
}

// 参加完了アニメが有効かどうかを確認
if (isFeatureEnabled("participationAnimation")) {
  // アニメーション処理
}
```

### 3. 管理画面で確認

`/admin/feature-flags`にアクセスして、現在のFeature Flagsの状態を確認できます。

## 即OFFにする方法

### 方法1: 環境変数を変更（推奨）

1. Vercelの Project Settings → Environment Variables に移動
2. 該当する環境変数を`false`に変更
3. 再デプロイ

### 方法2: ロールバック

1. Vercelの Deployments に移動
2. 前のデプロイメントを選択
3. 「Promote to Production」をクリック

## トラブルシューティング

### Feature Flagが反映されない場合

1. 環境変数が正しく設定されているか確認
2. 再デプロイしたか確認
3. キャッシュをクリアして再読み込み

### リアルタイム更新が停止しない場合

1. `FEATURE_REALTIME_UPDATE=false`を設定
2. 再デプロイ
3. `/admin/feature-flags`で確認

## 実装例

### リアルタイム更新（Polling）

```typescript
import { isFeatureEnabled } from "@/lib/feature-flags";
import { useEffect } from "react";

export function useRealtimeUpdate() {
  useEffect(() => {
    if (!isFeatureEnabled("realtimeUpdate")) {
      return;
    }

    const interval = setInterval(() => {
      // Polling処理
    }, 30000); // 30秒ごと

    return () => clearInterval(interval);
  }, []);
}
```

### プッシュ通知

```typescript
import { isFeatureEnabled } from "@/lib/feature-flags";
import * as Notifications from "expo-notifications";

export async function sendPushNotification() {
  if (!isFeatureEnabled("pushNotification")) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "新しい応援メッセージ",
      body: "○○さんから応援メッセージが届きました",
    },
    trigger: null,
  });
}
```

### 参加完了アニメ

```typescript
import { isFeatureEnabled } from "@/lib/feature-flags";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

export function ParticipationAnimation() {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (!isFeatureEnabled("participationAnimation")) {
      // アニメーションなしで完了
      return;
    }

    // アニメーション付きで完了
    scale.value = withSpring(1.2);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {/* コンテンツ */}
    </Animated.View>
  );
}
```

## 注意事項

- Feature Flagsは環境変数で管理されているため、変更するには再デプロイが必要です
- デフォルトは全て`true`（有効）に設定されています
- `false`を設定すると、該当する機能が無効化されます
- 管理画面（`/admin/feature-flags`）は読み取り専用です
