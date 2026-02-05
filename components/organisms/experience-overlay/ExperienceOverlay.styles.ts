/**
 * ExperienceOverlay.styles.ts
 * 
 * ExperienceOverlayコンポーネント専用のスタイル定義
 * v6.35: スタイルコロケーション対応
 */
import { StyleSheet, Dimensions } from "react-native";
import { color, palette } from "@/theme/tokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // オーバーレイ
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  
  // ヘッダー
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: color.textWhite,
  },
  stepTitle: {
    fontSize: 12,
    color: color.hotPink,
    marginTop: 4,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.white + "33", // rgba(255, 255, 255, 0.2) = 20% opacity = 33 in hex
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: color.textWhite,
    fontSize: 16,
  },
  
  // プログレスバー
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  progressBarWrapper: {
    flex: 1,
    height: 4,
    backgroundColor: palette.white + "33", // rgba(255, 255, 255, 0.2) = 20% opacity = 33 in hex
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFillHeader: {
    height: "100%",
    backgroundColor: color.hotPink,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: palette.white + "99", // rgba(255, 255, 255, 0.6) = 60% opacity = 99 in hex
    minWidth: 50,
    textAlign: "right",
  },
  
  // スクロールコンテンツ
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    alignItems: "center",
  },
  
  // キャラクターセクション
  characterSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    width: "100%",
  },
  characterContainer: {
    marginRight: 12,
  },
  characterImage: {
    width: 80,
    height: 80,
  },
  
  // 思考バブル
  thoughtBubble: {
    flex: 1,
    backgroundColor: palette.white + "26", // rgba(255, 255, 255, 0.15) = 15% opacity = 26 in hex
    borderRadius: 16,
    padding: 12,
    position: "relative",
  },
  thoughtTail: {
    position: "absolute",
    left: -8,
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: "transparent",
    borderBottomWidth: 8,
    borderBottomColor: "transparent",
    borderRightWidth: 8,
    borderRightColor: palette.white + "26",
  },
  thoughtText: {
    fontSize: 14,
    color: color.textWhite,
    lineHeight: 22,
    fontStyle: "italic",
  },
  
  // スピーチバブル
  speechBubble: {
    backgroundColor: color.textWhite,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxWidth: SCREEN_WIDTH - 60,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: color.overlayDark,
    textAlign: "center",
  },
  subMessageText: {
    fontSize: 14,
    color: palette.white + "CC", // rgba(255, 255, 255, 0.8) = 80% opacity = CC in hex
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  
  // ナビゲーション
  navigation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: 24,
    gap: 40,
  },
  
  // キャラクターナビゲーションボタン
  characterNavButton: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  characterNavButtonDisabled: {
    opacity: 0.4,
  },
  navCharacterImage: {
    width: 56,
    height: 56,
  },
  navBubble: {
    backgroundColor: palette.white + "26", // rgba(255, 255, 255, 0.15) = 15% opacity = 26 in hex
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "relative",
    marginBottom: 8,
  },
  navBubbleLeft: {
    marginLeft: -8,
  },
  navBubbleRight: {
    marginRight: -8,
  },
  navBubbleDisabled: {
    backgroundColor: palette.white + "14", // rgba(255, 255, 255, 0.08) = 8% opacity = 14 in hex
  },
  navBubblePrimary: {
    backgroundColor: color.hotPink,
  },
  navBubbleTailLeft: {
    position: "absolute",
    left: -6,
    bottom: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderBottomWidth: 6,
    borderBottomColor: "transparent",
    borderRightWidth: 6,
    borderRightColor: "rgba(255, 255, 255, 0.15)",
  },
  navBubbleTailRight: {
    position: "absolute",
    right: -6,
    bottom: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderBottomWidth: 6,
    borderBottomColor: "transparent",
    borderLeftWidth: 6,
    borderLeftColor: color.hotPink,
  },
  navBubbleText: {
    color: color.textWhite,
    fontSize: 14,
    fontWeight: "600",
  },
  navBubbleTextDisabled: {
    color: palette.white + "66", // rgba(255, 255, 255, 0.4) = 40% opacity = 66 in hex
  },
  navBubbleTextPrimary: {
    color: color.textWhite,
    fontSize: 14,
    fontWeight: "bold",
  },
});
