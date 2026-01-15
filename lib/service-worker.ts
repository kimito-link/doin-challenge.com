import { Platform } from "react-native";

/**
 * Service Workerを登録する
 * Web環境でのみ動作し、オフラインキャッシュを有効にする
 */
export function registerServiceWorker(): void {
  if (Platform.OS !== "web") {
    return;
  }

  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SW] Service Worker registered with scope:", registration.scope);

        // 新しいService Workerが利用可能になった時の処理
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // 新しいバージョンが利用可能
                console.log("[SW] New version available");
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log("[SW] Service Worker registration skipped:", error.message);
      });
  });
}

/**
 * Service Workerのキャッシュをクリアする
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if (Platform.OS !== "web") {
    return;
  }

  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName.startsWith("douin-")) {
        return caches.delete(cacheName);
      }
      return Promise.resolve();
    })
  );
  console.log("[SW] Cache cleared");
}
