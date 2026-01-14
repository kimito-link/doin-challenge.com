import { Share, Platform, Linking } from "react-native";
import * as Haptics from "expo-haptics";

const APP_HASHTAG = "#動員ちゃれんじ";
const APP_URL = "https://douin-challenge.manus.space"; // TODO: 実際のURLに変更

export interface ShareContent {
  title: string;
  message: string;
  url?: string;
  hashtags?: string[];
}

/**
 * 汎用シェア機能
 */
export async function shareContent(content: ShareContent): Promise<boolean> {
  try {
    // ハプティックフィードバック
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const shareMessage = content.url
      ? `${content.message}\n\n${content.url}`
      : content.message;

    const result = await Share.share({
      title: content.title,
      message: shareMessage,
    });

    if (result.action === Share.sharedAction) {
      console.log("[Share] Content shared successfully");
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Share] Error sharing content:", error);
    return false;
  }
}

/**
 * Twitterでシェア
 */
export async function shareToTwitter(
  text: string,
  url?: string,
  hashtags?: string[]
): Promise<boolean> {
  try {
    // ハプティックフィードバック
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const hashtagString = hashtags?.join(",") || "";
    const params = new URLSearchParams();
    params.set("text", text);
    if (url) params.set("url", url);
    if (hashtagString) params.set("hashtags", hashtagString);

    const twitterUrl = `https://twitter.com/intent/tweet?${params.toString()}`;

    // Web環境ではwindow.openを使用
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.open(twitterUrl, "_blank", "noopener,noreferrer");
        return true;
      }
      return false;
    }

    // ネイティブ環境ではLinking.openURLを使用
    const canOpen = await Linking.canOpenURL(twitterUrl);
    if (canOpen) {
      await Linking.openURL(twitterUrl);
      return true;
    } else {
      // canOpenURLがfalseでも試みる
      await Linking.openURL(twitterUrl);
      return true;
    }
  } catch (error) {
    console.error("[Share] Error sharing to Twitter:", error);
    return false;
  }
}

/**
 * チャレンジ参加表明をシェア
 */
export async function shareParticipation(
  challengeTitle: string,
  hostName: string,
  challengeId: number
): Promise<boolean> {
  const text = `🎉 「${challengeTitle}」に参加表明しました！\n\n主催: ${hostName}\n\nみんなも一緒に応援しよう！\n${APP_HASHTAG}`;
  const url = `${APP_URL}/event/${challengeId}`;

  return shareToTwitter(text, url, ["動員ちゃれんじ", hostName.replace(/\s/g, "")]);
}

/**
 * チャレンジ達成をシェア
 */
export async function shareChallengeGoalReached(
  challengeTitle: string,
  hostName: string,
  goalValue: number,
  unit: string,
  challengeId: number
): Promise<boolean> {
  const text = `🎊 目標達成！\n\n「${challengeTitle}」が目標の${goalValue}${unit}を達成しました！\n\n主催: ${hostName}\nみんなの応援のおかげです！\n${APP_HASHTAG}`;
  const url = `${APP_URL}/event/${challengeId}`;

  return shareToTwitter(text, url, ["動員ちゃれんじ", "目標達成"]);
}

/**
 * マイルストーン達成をシェア
 */
export async function shareMilestoneReached(
  challengeTitle: string,
  milestone: number,
  currentValue: number,
  unit: string,
  challengeId: number
): Promise<boolean> {
  const text = `🏆 ${milestone}%達成！\n\n「${challengeTitle}」が${currentValue}${unit}に到達しました！\n\n目標達成まであと少し！\n${APP_HASHTAG}`;
  const url = `${APP_URL}/event/${challengeId}`;

  return shareToTwitter(text, url, ["動員ちゃれんじ"]);
}

/**
 * チャレンジ作成をシェア
 */
export async function shareChallengeCreated(
  challengeTitle: string,
  goalValue: number,
  unit: string,
  challengeId: number
): Promise<boolean> {
  const text = `📢 新しいチャレンジを作成しました！\n\n「${challengeTitle}」\n目標: ${goalValue}${unit}\n\nみんなで一緒に目標達成を目指そう！\n${APP_HASHTAG}`;
  const url = `${APP_URL}/event/${challengeId}`;

  return shareToTwitter(text, url, ["動員ちゃれんじ", "新規チャレンジ"]);
}

/**
 * アプリをシェア
 */
export async function shareApp(): Promise<boolean> {
  const text = `🎵 推しの応援をもっと楽しく！\n\n「動員ちゃれんじ」でライブやイベントの動員目標をみんなで達成しよう！\n\n${APP_HASHTAG}`;

  return shareToTwitter(text, APP_URL, ["動員ちゃれんじ"]);
}

/**
 * カスタムメッセージでシェア
 */
export async function shareCustomMessage(
  message: string,
  challengeId?: number
): Promise<boolean> {
  const url = challengeId ? `${APP_URL}/event/${challengeId}` : APP_URL;
  const text = `${message}\n\n${APP_HASHTAG}`;

  return shareToTwitter(text, url, ["動員ちゃれんじ"]);
}
