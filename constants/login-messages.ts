/**
 * ログインメッセージとキャラクターの対応設定
 * 
 * A/Bテスト用のメッセージバリエーションとキャラクター画像の対応を定義
 */

export interface LoginMessage {
  id: string;
  character: "rinku" | "konta" | "tanune";
  message: string;
  characterImagePath: string;
}

export const LOGIN_MESSAGES: LoginMessage[] = [
  {
    id: "rinku_1",
    character: "rinku",
    message: "ログインすると、参加履歴やお気に入りが使えるよ！",
    characterImagePath: "../assets/images/characters/link/link-yukkuri-smile-mouth-open.png",
  },
  {
    id: "rinku_2",
    character: "rinku",
    message: "ログインして、もっと楽しく推し活しよう！",
    characterImagePath: "../assets/images/characters/link/link-yukkuri-smile-mouth-open.png",
  },
  {
    id: "konta_1",
    character: "konta",
    message: "一緒に推しを応援しよう！ログインして参加しよう！",
    characterImagePath: "../assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png",
  },
  {
    id: "konta_2",
    character: "konta",
    message: "みんなと一緒に推しを盛り上げよう！",
    characterImagePath: "../assets/images/characters/konta/kitsune-yukkuri-smile-mouth-open.png",
  },
  {
    id: "tanune_1",
    character: "tanune",
    message: "ログインすると、あなたの応援が記録されるよ！",
    characterImagePath: "../assets/images/characters/tanunee/tanuki-yukkuri-smile-mouth-open.png",
  },
];

/**
 * ランダムにメッセージを選択
 */
export function getRandomLoginMessage(): LoginMessage {
  const randomIndex = Math.floor(Math.random() * LOGIN_MESSAGES.length);
  return LOGIN_MESSAGES[randomIndex];
}
