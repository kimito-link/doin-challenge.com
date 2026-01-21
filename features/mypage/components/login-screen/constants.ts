/**
 * ログイン画面の定数とパターンデータ
 */

import { mypageGradient, mypageAccent } from "../../ui/theme/tokens";

// キャラクター画像
export const characterImages = {
  rinku: require("@/assets/images/characters/rinku.png"),
  konta: require("@/assets/images/characters/konta.png"),
  tanune: require("@/assets/images/characters/tanune.png"),
  linkFull: require("@/assets/images/characters/KimitoLink.png"),
  linkIdol: require("@/assets/images/characters/idolKimitoLink.png"),
  linkYukkuri: require("@/assets/images/characters/link/link-yukkuri-smile-mouth-open.png"),
  kontaYukkuri: require("@/assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png"),
  tanuneYukkuri: require("@/assets/images/characters/tanunee/tanuki-yukkuri-smile-mouth-open.png"),
};

// ロゴ画像
export const logoImage = require("@/assets/images/logo/logo-maru-orange.jpg");

// ログインパターン型
export interface LoginPattern {
  id: number;
  character: keyof typeof characterImages;
  title: string;
  message: string;
  highlight: string;
  gradientColors: readonly [string, string];
  accentColor: string;
}

// ログイン画面のパターンデータ
export const loginPatterns: LoginPattern[] = [
  {
    id: 1,
    character: "linkIdol",
    title: "みんな、ちょっと聞いて！😊✨",
    message: "あなたの「推し」が、大きなステージに立つ瞬間を\n一緒に作りたいんだ。",
    highlight: "その景色を、一緒に作ろう！",
    gradientColors: mypageGradient.linkPink,
    accentColor: mypageAccent.linkPink,
  },
  {
    id: 2,
    character: "linkFull",
    title: "声を届けよう！🎙️✨",
    message: "あなたの応援の声が、\n誰かの心を動かす。",
    highlight: "一緒に推しの夢を叶えよう！",
    gradientColors: mypageGradient.linkPurple,
    accentColor: mypageAccent.linkPurple,
  },
  {
    id: 3,
    character: "linkYukkuri",
    title: "ようこそ！🎉",
    message: "動員ちゃれんじへようこそ！\nみんなの想いを集めて、推しの夢を叶えよう。",
    highlight: "さあ、始めよう！",
    gradientColors: mypageGradient.kontaOrange,
    accentColor: mypageAccent.kontaOrange,
  },
  {
    id: 4,
    character: "kontaYukkuri",
    title: "コンタだよ！🦊",
    message: "友達を誘って、みんなで盛り上げよう！\n一人の参加が、大きな波になるんだ。",
    highlight: "一緒に盛り上げよう！",
    gradientColors: mypageGradient.kontaGold,
    accentColor: mypageAccent.kontaGold,
  },
  {
    id: 5,
    character: "tanuneYukkuri",
    title: "たぬねだよ！🦝",
    message: "チャレンジを作って、\nみんなで目標達成を目指そう！",
    highlight: "目標達成でお祝い！🎉",
    gradientColors: mypageGradient.tanuneGreen,
    accentColor: mypageAccent.tanuneGreen,
  },
  {
    id: 6,
    character: "linkIdol",
    title: "ステージへの道！🎭✨",
    message: "客席を埋め尽くすファンの声援、\nリアルタイムで流れる応援コメント…",
    highlight: "その感動を、一緒に！",
    gradientColors: mypageGradient.tanunePink,
    accentColor: mypageAccent.tanunePink,
  },
];

// ランダムにパターンを選択する関数
export const getRandomPattern = (): LoginPattern => {
  return loginPatterns[Math.floor(Math.random() * loginPatterns.length)];
};
