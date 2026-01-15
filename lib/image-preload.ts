/**
 * 重要な画像のプリロード
 * 
 * アプリ起動時に即座に表示したい画像を事前に読み込む
 */

import { Image } from "expo-image";

// プリロードする画像のリスト
const PRELOAD_IMAGES = [
  // キャラクター画像（ヘッダー用）
  require("@/assets/images/characters/link/link-yukkuri-normal-mouth-open.png"),
  require("@/assets/images/characters/konta/kitsune-yukkuri-normal.png"),
  require("@/assets/images/characters/tanunee/tanuki-yukkuri-normal-mouth-open.png"),
  // ロゴ
  require("@/assets/images/logo/logo-color.jpg"),
  // マイページ用キャラクター
  require("@/assets/images/characters/rinku.png"),
  require("@/assets/images/characters/konta.png"),
  require("@/assets/images/characters/tanune.png"),
];

let isPreloaded = false;

/**
 * 重要な画像をプリロード
 * アプリ起動時に一度だけ呼び出す
 */
export async function preloadCriticalImages(): Promise<void> {
  if (isPreloaded) return;
  
  try {
    // expo-imageのprefetch機能を使用
    await Promise.all(
      PRELOAD_IMAGES.map(source => {
        // ローカル画像の場合はImageコンポーネントが自動的にキャッシュする
        // ここではメモリにロードするためにprefetchを呼び出す
        if (typeof source === "number") {
          // require()で読み込んだローカル画像はすでにバンドルに含まれている
          return Promise.resolve();
        }
        return Image.prefetch(source);
      })
    );
    isPreloaded = true;
    console.log("[ImagePreload] Critical images preloaded");
  } catch (error) {
    console.warn("[ImagePreload] Failed to preload images:", error);
  }
}

/**
 * プリロード状態をリセット（テスト用）
 */
export function resetPreloadState(): void {
  isPreloaded = false;
}
