import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { color, palette } from "@/theme/tokens";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { AppHeader } from "@/components/organisms/app-header";

const goalTypeLabels: Record<string, string> = {
  attendance: "動員",
  followers: "フォロワー",
  viewers: "同時視聴",
  points: "ポイント",
  custom: "カスタム",
};

export default function TemplatesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: myTemplates, refetch: refetchMy } = trpc.templates.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: publicTemplates } = trpc.templates.public.useQuery();

  const deleteTemplate = trpc.templates.delete.useMutation({
    onSuccess: () => {
      refetchMy();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  });

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "テンプレートを削除",
      `「${name}」を削除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: () => deleteTemplate.mutate({ id }),
        },
      ]
    );
  };

  const handleUseTemplate = (template: NonNullable<typeof myTemplates>[0]) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // テンプレートの設定を使ってチャレンジ作成画面に遷移
    router.push({
      pathname: "/(tabs)/create",
      params: {
        templateId: template.id,
        goalType: template.goalType,
        goalValue: template.goalValue,
        goalUnit: template.goalUnit,
        eventType: template.eventType,
        ticketPresale: template.ticketPresale || "",
        ticketDoor: template.ticketDoor || "",
      },
    } as never);
  };

  const renderTemplate = ({ item }: { item: NonNullable<typeof myTemplates>[0] }) => (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ color: color.textWhite, fontSize: 16, fontWeight: "bold", flex: 1 }}>
          {item.name}
        </Text>
        {item.isPublic && (
          <View style={{ backgroundColor: color.success, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: color.textWhite, fontSize: 10 }}>公開中</Text>
          </View>
        )}
      </View>

      {item.description && (
        <Text style={{ color: color.textMuted, fontSize: 13, marginBottom: 8 }}>
          {item.description}
        </Text>
      )}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <View style={{ backgroundColor: color.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: color.accentPrimary, fontSize: 12 }}>
            {goalTypeLabels[item.goalType] || item.goalType} {item.goalValue}{item.goalUnit}
          </Text>
        </View>
        <View style={{ backgroundColor: color.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: color.textMuted, fontSize: 12 }}>
            {item.eventType === "solo" ? "ソロ" : "グループ"}
          </Text>
        </View>
        {item.useCount > 0 && (
          <View style={{ backgroundColor: color.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: color.textMuted, fontSize: 12 }}>
              {item.useCount}回使用
            </Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          onPress={() => handleUseTemplate(item)}
          style={{
            flex: 1,
            backgroundColor: color.accentPrimary,
            borderRadius: 8,
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="add" size={18} color={color.textWhite} />
          <Text style={{ color: color.textWhite, fontSize: 13, fontWeight: "bold", marginLeft: 4 }}>
            使用する
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.name)}
          style={{
            backgroundColor: color.border,
            borderRadius: 8,
            padding: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="delete" size={18} color={color.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPublicTemplate = ({ item }: { item: NonNullable<typeof publicTemplates>[0] }) => (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <Text style={{ color: color.textWhite, fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>
        {item.name}
      </Text>
      {item.description && (
        <Text style={{ color: color.textMuted, fontSize: 13, marginBottom: 8 }}>
          {item.description}
        </Text>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <View style={{ backgroundColor: color.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: color.accentPrimary, fontSize: 12 }}>
            {goalTypeLabels[item.goalType] || item.goalType} {item.goalValue}{item.goalUnit}
          </Text>
        </View>
        <View style={{ backgroundColor: color.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: color.textMuted, fontSize: 12 }}>
            {item.useCount}回使用
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleUseTemplate(item as NonNullable<typeof myTemplates>[0])}
        style={{
          backgroundColor: color.accentAlt,
          borderRadius: 8,
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialIcons name="content-copy" size={18} color={color.textWhite} />
        <Text style={{ color: color.textWhite, fontSize: 13, fontWeight: "bold", marginLeft: 4 }}>
          このテンプレートを使う
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer>
      {/* ヘッダー */}
      <AppHeader 
        title="君斗りんくの動員ちゃれんじ" 
        showCharacters={false}
        rightElement={
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: color.textWhite }}>← 戻る</Text>
          </TouchableOpacity>
        }
      />
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: color.border }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: color.textWhite }}>
          テンプレート
        </Text>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            {/* マイテンプレート */}
            {user && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: color.textWhite, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                  マイテンプレート
                </Text>
                {myTemplates && myTemplates.length > 0 ? (
                  myTemplates.map((template) => (
                    <View key={template.id}>
                      {renderTemplate({ item: template })}
                    </View>
                  ))
                ) : (
                  <View style={{ backgroundColor: color.surface, borderRadius: 12, padding: 24, alignItems: "center" }}>
                    <MaterialIcons name="folder-open" size={48} color={color.textSubtle} />
                    <Text style={{ color: color.textMuted, fontSize: 14, marginTop: 8, textAlign: "center" }}>
                      まだテンプレートがありません{"\n"}
                      チャレンジ作成時に保存できます
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 公開テンプレート */}
            <View>
              <Text style={{ color: color.textWhite, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                公開テンプレート
              </Text>
              {publicTemplates && publicTemplates.length > 0 ? (
                publicTemplates.map((template) => (
                  <View key={template.id}>
                    {renderPublicTemplate({ item: template })}
                  </View>
                ))
              ) : (
                <View style={{ backgroundColor: color.surface, borderRadius: 12, padding: 24, alignItems: "center" }}>
                  <MaterialIcons name="public" size={48} color={color.textSubtle} />
                  <Text style={{ color: color.textMuted, fontSize: 14, marginTop: 8, textAlign: "center" }}>
                    公開テンプレートはまだありません
                  </Text>
                </View>
              )}
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
