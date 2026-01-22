import { ScrollView, Text, View, Pressable, StyleSheet , Platform} from "react-native";
import * as Haptics from "expo-haptics";
import { color, palette } from "@/theme/tokens";
import { navigateBack } from "@/lib/navigation";
import { ScreenContainer } from "@/components/organisms/screen-container";
import { AppHeader } from "@/components/organisms/app-header";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { APP_VERSION } from "@/shared/version";

// リリースノートデータ
const releaseNotes = [
  {
    version: "v5.81",
    date: "2025-01-19",
    title: "用語改善・検索修正",
    changes: [
      { type: "improve", text: "「ホスト」を「主催者」に変更し、初見ユーザーにもわかりやすく" },
      { type: "improve", text: "ランキング画面に説明を追加（貢献度・主催者ランキングの違いを明記）" },
      { type: "fix", text: "検索窓の入力が正常に動作しない問題を修正" },
      { type: "new", text: "バージョン履歴（リリースノート）ページを追加" },
    ],
  },
  {
    version: "v5.80",
    date: "2025-01-19",
    title: "視認性改善・ダークモード専用化",
    changes: [
      { type: "improve", text: "アチーブメントバッジの色を視認性の高い色に変更" },
      { type: "improve", text: "全画面で薄いグレー文字を明るい色に変更" },
      { type: "change", text: "ダークモード専用化（ライトモードを削除）" },
    ],
  },
  {
    version: "v5.79",
    date: "2025-01-18",
    title: "パフォーマンス最適化",
    changes: [
      { type: "improve", text: "一覧ページの読み込み速度を改善" },
      { type: "fix", text: "スクロール時のカクつきを軽減" },
    ],
  },
  {
    version: "v5.78",
    date: "2025-01-17",
    title: "チュートリアル機能追加",
    changes: [
      { type: "new", text: "初回ユーザー向けチュートリアルを追加" },
      { type: "new", text: "ハイライト表示で操作をガイド" },
    ],
  },
  {
    version: "v5.77",
    date: "2025-01-16",
    title: "お気に入り機能強化",
    changes: [
      { type: "new", text: "お気に入りフィルターを追加" },
      { type: "improve", text: "お気に入り登録時のアニメーションを追加" },
    ],
  },
  {
    version: "v5.75",
    date: "2025-01-14",
    title: "カラフルカード表示",
    changes: [
      { type: "new", text: "チャレンジカードのカラフル表示モードを追加" },
      { type: "improve", text: "視認性を考慮した配色に変更" },
    ],
  },
  {
    version: "v5.70",
    date: "2025-01-10",
    title: "アチーブメント機能",
    changes: [
      { type: "new", text: "アチーブメント（実績）システムを追加" },
      { type: "new", text: "レアリティ別バッジ（コモン〜レジェンダリー）" },
      { type: "new", text: "ポイント獲得システム" },
    ],
  },
  {
    version: "v5.60",
    date: "2025-01-05",
    title: "励ましメッセージ機能",
    changes: [
      { type: "new", text: "参加時に励ましメッセージを表示" },
      { type: "new", text: "りんくちゃんからの応援メッセージ" },
    ],
  },
];

// 変更タイプのスタイル
const changeTypeStyles: Record<string, { icon: string; color: string; label: string }> = {
  new: { icon: "add-circle", color: color.successLight, label: "新機能" },
  improve: { icon: "trending-up", color: color.blue400, label: "改善" },
  fix: { icon: "build", color: palette.amber400, label: "修正" },
  change: { icon: "swap-horiz", color: color.purple400, label: "変更" },
};

export default function ReleaseNotesScreen() {


  return (
    <ScreenContainer containerClassName="bg-background">
      <AppHeader
        title="君斗りんくの動員ちゃれんじ"
        showCharacters={false}
        rightElement={
          <Pressable
            onPress={() => navigateBack()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <MaterialIcons name="arrow-back" size={24} color={color.textWhite} />
            <Text style={{ color: color.textWhite, marginLeft: 8 }}>戻る</Text>
          </Pressable>
        }
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>リリースノート</Text>
        <Text style={styles.headerSubtitle}>
          現在のバージョン: {APP_VERSION}
        </Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {releaseNotes.map((release, index) => (
          <View key={release.version} style={styles.releaseCard}>
            {/* バージョンヘッダー */}
            <View style={styles.releaseHeader}>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>{release.version}</Text>
              </View>
              <Text style={styles.releaseDate}>{release.date}</Text>
              {index === 0 && (
                <View style={styles.latestBadge}>
                  <Text style={styles.latestText}>最新</Text>
                </View>
              )}
            </View>

            {/* リリースタイトル */}
            <Text style={styles.releaseTitle}>{release.title}</Text>

            {/* 変更一覧 */}
            <View style={styles.changesList}>
              {release.changes.map((change, changeIndex) => {
                const typeStyle = changeTypeStyles[change.type] || changeTypeStyles.change;
                return (
                  <View key={changeIndex} style={styles.changeItem}>
                    <View style={[styles.changeIcon, { backgroundColor: `${typeStyle.color}20` }]}>
                      <MaterialIcons name={typeStyle.icon as any} size={16} color={typeStyle.color} />
                    </View>
                    <View style={styles.changeContent}>
                      <Text style={[styles.changeLabel, { color: typeStyle.color }]}>
                        {typeStyle.label}
                      </Text>
                      <Text style={styles.changeText}>{change.text}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* フッター */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ご要望・バグ報告はX（Twitter）でお知らせください
          </Text>
          <Text style={styles.footerHandle}>@kimito_link</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  headerTitle: {
    color: color.textWhite,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#A0AEC0",
    fontSize: 12,
    marginTop: 4,
  },
  releaseCard: {
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  releaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  versionBadge: {
    backgroundColor: color.hostAccentLegacy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  versionText: {
    color: color.textWhite,
    fontSize: 14,
    fontWeight: "bold",
  },
  releaseDate: {
    color: "#A0AEC0",
    fontSize: 12,
  },
  latestBadge: {
    backgroundColor: color.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: "auto",
  },
  latestText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
  releaseTitle: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  changesList: {
    gap: 10,
  },
  changeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  changeIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  changeContent: {
    flex: 1,
  },
  changeLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  changeText: {
    color: "#E2E8F0",
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    color: "#A0AEC0",
    fontSize: 12,
    textAlign: "center",
  },
  footerHandle: {
    color: color.hostAccentLegacy,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
});
