/**
 * オンボーディングチュートリアルの定数とスライドデータ
 */

export const ONBOARDING_STORAGE_KEY = "@onboarding_completed";

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  emoji: string;
  backgroundColor: string;
  features?: string[];
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "ようこそ！",
    description: "君斗りんくの動員ちゃれんじへ\nようこそ！",
    emoji: "🎉",
    backgroundColor: "#FF6B6B",
    features: [
      "推しの生誕祭を盛り上げよう",
      "全国のファンと一緒に参加",
      "目標達成を目指そう",
    ],
  },
  {
    id: "challenges",
    title: "チャレンジに参加",
    description: "好きなイベントを見つけて\n参加表明しよう",
    emoji: "🎯",
    backgroundColor: "#4ECDC4",
    features: [
      "ホーム画面でチャレンジを探す",
      "参加ボタンをタップ",
      "都道府県と応援メッセージを入力",
    ],
  },
  {
    id: "friends",
    title: "友達と一緒に",
    description: "友達を誘って\nもっと盛り上げよう",
    emoji: "👥",
    backgroundColor: "#45B7D1",
    features: [
      "友達を同行者として追加",
      "SNSでシェアして拡散",
      "みんなで目標達成を目指す",
    ],
  },
  {
    id: "map",
    title: "全国マップ",
    description: "日本全国から\n参加者が集まります",
    emoji: "🗾",
    backgroundColor: "#96CEB4",
    features: [
      "都道府県別の参加者を確認",
      "地域ごとの盛り上がりをチェック",
      "あなたの地域を代表しよう",
    ],
  },
  {
    id: "start",
    title: "さあ、始めよう！",
    description: "推しの生誕祭を\n一緒に盛り上げましょう",
    emoji: "🚀",
    backgroundColor: "#FF6B6B",
    features: [
      "Xアカウントでログイン",
      "お気に入りのチャレンジを見つける",
      "参加して応援しよう",
    ],
  },
];
