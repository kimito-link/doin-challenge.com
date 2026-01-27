/**
 * app/admin/feature-flags.tsx
 * 
 * Feature Flags管理画面
 * 
 * リアルタイム更新・プッシュ通知・重い演出を即OFFできる管理画面
 */

import { View, Text, ScrollView, Switch, StyleSheet } from "react-native";
import { ScreenContainer } from "../../components/organisms/screen-container";
import { useColors } from "../../hooks/use-colors";
import { getFeatureFlags } from "../../lib/feature-flags";
import { useState } from "react";

export default function FeatureFlagsScreen() {
  const colors = useColors();
  const [flags, setFlags] = useState(getFeatureFlags());

  return (
    <ScreenContainer className="p-6">
      <ScrollView>
        <View className="gap-6">
          {/* ヘッダー */}
          <View>
            <Text className="text-3xl font-bold text-foreground">
              Feature Flags
            </Text>
            <Text className="mt-2 text-muted">
              リアルタイム更新・プッシュ通知・重い演出を即OFFできます
            </Text>
          </View>

          {/* 注意事項 */}
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-sm text-muted">
              ⚠️ 環境変数で設定されているため、変更するには再デプロイが必要です。
            </Text>
          </View>

          {/* Feature Flags一覧 */}
          <View className="gap-4">
            {/* リアルタイム更新 */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    リアルタイム更新（Polling）
                  </Text>
                  <Text className="mt-1 text-sm text-muted">
                    参加者数・応援メッセージの自動更新
                  </Text>
                </View>
                <Switch
                  value={flags.realtimeUpdate}
                  disabled
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>

            {/* プッシュ通知 */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    プッシュ通知
                  </Text>
                  <Text className="mt-1 text-sm text-muted">
                    新しい応援メッセージの通知
                  </Text>
                </View>
                <Switch
                  value={flags.pushNotification}
                  disabled
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>

            {/* 参加完了アニメ */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    参加完了アニメ
                  </Text>
                  <Text className="mt-1 text-sm text-muted">
                    参加表明完了時の演出
                  </Text>
                </View>
                <Switch
                  value={flags.participationAnimation}
                  disabled
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>
          </View>

          {/* 変更方法 */}
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-2">
              変更方法
            </Text>
            <Text className="text-sm text-muted leading-relaxed">
              1. 環境変数を変更（例: FEATURE_REALTIME_UPDATE=false）{"\n"}
              2. 再デプロイ{"\n"}
              3. この画面で確認
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
