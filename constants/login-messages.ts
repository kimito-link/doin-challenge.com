/**
 * ログインメッセージとキャラクターの対応設定
 * 
 * A/Bテスト用のメッセージバリエーションとキャラクター画像の対応を定義
 */

export interface LoginMessage {
  id: string;
  character: "rinku" | "konta" | "tanune";
  message: string;
  characterImage: any; // require()で読み込んだ画像
}

// キャラクター画像の読み込み（テスト環境ではスキップ）
function loadCharacterImage(path: string) {
  try {
    return require(path);
  } catch {
    // テスト環境ではダミー画像を返す
    return null;
  }
}

export const LOGIN_MESSAGES: LoginMessage[] = [
  {
    id: "rinku_1",
    character: "rinku",
    message: "ログインすると、参加履歴やお気に入りが使えるよ！",
    characterImage: loadCharacterImage("@/assets/images/characters/rinku.png"),
  },
  {
    id: "rinku_2",
    character: "rinku",
    message: "ログインして、もっと楽しく推し活しよう！",
    characterImage: loadCharacterImage("@/assets/images/characters/rinku.png"),
  },
  {
    id: "konta_1",
    character: "konta",
    message: "一緒に推しを応援しよう！ログインして参加しよう！",
    characterImage: loadCharacterImage("@/assets/images/characters/konta.png"),
  },
  {
    id: "konta_2",
    character: "konta",
    message: "みんなと一緒に推しを盛り上げよう！",
    characterImage: loadCharacterImage("@/assets/images/characters/konta.png"),
  },
  {
    id: "tanune_1",
    character: "tanune",
    message: "ログインすると、あなたの応援が記録されるよ！",
    characterImage: loadCharacterImage("@/assets/images/characters/tanune.png"),
  },
];

/**
 * ランダムにメッセージを選択
 */
export function getRandomLoginMessage(): LoginMessage {
  const randomIndex = Math.floor(Math.random() * LOGIN_MESSAGES.length);
  return LOGIN_MESSAGES[randomIndex];
}
