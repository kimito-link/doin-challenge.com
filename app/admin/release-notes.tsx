/**
 * リリースノート管理画面
 * 管理者がリリースノートを追加・管理できる画面
 */

import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { AppHeader } from "@/components/organisms/app-header";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { color } from "@/theme/tokens";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { navigateBack } from "@/lib/navigation/app-routes";

export default function ReleaseNotesAdminScreen() {
  const colors = useColors();
  const [version, setVersion] = useState("6.182");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState("ファクタリング完了 & X APIコスト管理機能の改善");
  const [changesText, setChangesText] = useState(`改善: コンポーネント統一: SearchBarをSearchInputベースに移行（コード量70%削減）
改善: コンポーネント統一: challenge-created-modalで統一Checkboxコンポーネントを使用
改善: 型定義統一: Gender型を統一（FormGender型を導入）
新機能: X APIコスト管理: エンドポイント別コスト表示機能を追加
新機能: X APIコスト管理: 日次レポート機能を追加（毎日の使用量とコストをメール通知）
改善: X APIコスト管理: フォロー状態のキャッシュ期間を24時間から48時間に延長
改善: コンポーネント統一: RetryButtonコンポーネントを統一
改善: コンポーネント統一: Skeletonコンポーネントを統一`);

  const addReleaseNoteMutation = trpc.releaseNotes.add.useMutation({
    onSuccess: () => {
      Alert.alert("成功", "リリースノートを追加しました");
      navigateBack();
    },
    onError: (error) => {
      Alert.alert("エラー", error.message || "リリースノートの追加に失敗しました");
    },
  });

  const handleAdd = () => {
    // 変更内容をパース
    const changes = changesText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const match = line.match(/^(新機能|改善|修正|変更):\s*(.+)$/);
        if (match) {
          const typeMap: Record<string, "new" | "improve" | "fix" | "change"> = {
            新機能: "new",
            改善: "improve",
            修正: "fix",
            変更: "change",
          };
          return {
            type: typeMap[match[1]] || "improve",
            text: match[2],
          };
        }
        return {
          type: "improve" as const,
          text: line.trim(),
        };
      });

    if (changes.length === 0) {
      Alert.alert("エラー", "変更内容を入力してください");
      return;
    }

    addReleaseNoteMutation.mutate({
      version,
      date,
      title,
      changes,
    });
  };

  return (
    <ScreenContainer>
      <AppHeader title="リリースノート追加" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.foreground, fontSize: 14, marginBottom: 8, fontWeight: "600" }}>
            バージョン
          </Text>
          <TextInput
            value={version}
            onChangeText={setVersion}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: color.border,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
            }}
            placeholder="例: 6.182"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.foreground, fontSize: 14, marginBottom: 8, fontWeight: "600" }}>
            日付 (YYYY-MM-DD)
          </Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: color.border,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
            }}
            placeholder="例: 2025-01-31"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.foreground, fontSize: 14, marginBottom: 8, fontWeight: "600" }}>
            タイトル
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: color.border,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
            }}
            placeholder="例: ファクタリング完了 & X APIコスト管理機能の改善"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.foreground, fontSize: 14, marginBottom: 8, fontWeight: "600" }}>
            変更内容（1行1項目、形式: 新機能/改善/修正/変更: 説明）
          </Text>
          <TextInput
            value={changesText}
            onChangeText={setChangesText}
            multiline
            numberOfLines={10}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: color.border,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
              minHeight: 200,
              textAlignVertical: "top",
            }}
            placeholder="改善: コンポーネント統一: SearchBarをSearchInputベースに移行&#10;新機能: X APIコスト管理: エンドポイント別コスト表示機能を追加"
          />
        </View>

        <Pressable
          onPress={handleAdd}
          disabled={addReleaseNoteMutation.isPending}
          style={{
            backgroundColor: color.accentPrimary,
            borderRadius: 8,
            padding: 16,
            alignItems: "center",
            opacity: addReleaseNoteMutation.isPending ? 0.5 : 1,
          }}
        >
          {addReleaseNoteMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              リリースノートを追加
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
