/**
 * CharacterIconRow Component (Login Screen Wrapper)
 * ログイン画面用のデフォルト3キャラクター設定を提供
 * 汎用コンポーネントのラッパー
 */

import { 
  CharacterIconRow as BaseCharacterIconRow,
  type CharacterIconConfig,
} from "@/components/ui/character-icon-row";
import { mypageAccent } from "../../ui/theme/tokens";
import { characterImages } from "./constants";

// デフォルトの3キャラクター設定
const defaultLoginIcons: CharacterIconConfig[] = [
  {
    image: characterImages.linkYukkuri,
    size: 56,
    borderWidth: 2,
    borderColor: mypageAccent.linkPink,
  },
  {
    image: characterImages.kontaYukkuri,
    size: 64,
    borderWidth: 3,
    borderColor: mypageAccent.kontaOrange,
  },
  {
    image: characterImages.tanuneYukkuri,
    size: 56,
    borderWidth: 2,
    borderColor: mypageAccent.tanuneGreen,
  },
];

interface LoginCharacterIconRowProps {
  /** 下部マージン */
  marginBottom?: number;
}

/**
 * ログイン画面用のキャラクターアイコン行
 * デフォルトで3キャラクター（りんく、コンタ、たぬね）を表示
 */
export function CharacterIconRow({ marginBottom = 32 }: LoginCharacterIconRowProps = {}) {
  return (
    <BaseCharacterIconRow
      icons={defaultLoginIcons}
      gap={12}
      marginBottom={marginBottom}
    />
  );
}
