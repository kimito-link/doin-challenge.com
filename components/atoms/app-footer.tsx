/**
 * components/atoms/app-footer.tsx
 * アプリのバージョン情報とコピーライトを表示する共通コンポーネント
 */
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { color } from "@/theme/tokens";
import Constants from "expo-constants";

interface AppFooterProps {
  /** ロゴを表示するかどうか */
  showLogo?: boolean;
  /** アプリ名を表示するかどうか */
  showAppName?: boolean;
  /** バージョン番号を表示するかどうか */
  showVersion?: boolean;
  /** サブテキストを表示するかどうか */
  showSubtext?: boolean;
  /** サブテキストのカスタム内容 */
  subtextContent?: string;
  /** コピーライトを表示するかどうか */
  showCopyright?: boolean;
}

/**
 * アプリのバージョン情報とコピーライトを表示する共通コンポーネント
 * 
 * 使用例:
 * ```tsx
 * // 全て表示
 * <AppFooter showLogo showAppName showVersion showSubtext showCopyright />
 * 
 * // コピーライトのみ
 * <AppFooter showCopyright />
 * ```
 */
export function AppFooter({
  showLogo = false,
  showAppName = false,
  showVersion = false,
  showSubtext = false,
  subtextContent = "設定はこのデバイスに保存されます",
  showCopyright = true,
}: AppFooterProps) {
  // バージョン番号を取得（app.config.tsから）
  const version = Constants.expoConfig?.version || "1.0.0";

  return (
    <View style={styles.container}>
      {(showLogo || showAppName) && (
        <View style={styles.header}>
          {showLogo && (
            <Image
              source={require("@/assets/images/logos/kimitolink-logo.jpg")}
              style={styles.logo}
              contentFit="contain"
            />
          )}
          {showAppName && (
            <Text style={styles.appName}>動員ちゃれんじ</Text>
          )}
        </View>
      )}
      
      {showVersion && (
        <Text style={styles.version}>v{version}</Text>
      )}
      
      {showSubtext && (
        <Text style={styles.subtext}>{subtextContent}</Text>
      )}
      
      {showCopyright && (
        <Text style={styles.copyright}>
          © 動員ちゃれんじ
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: color.textWhite,
  },
  version: {
    fontSize: 12,
    color: color.textMuted,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 11,
    color: color.textMuted,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 11,
    color: color.textMuted,
    textAlign: "center",
  },
});
