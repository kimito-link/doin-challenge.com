import { useEffect, useRef } from "react";

/**
 * useInterval フック
 * 指定された間隔でコールバック関数を実行する
 * 
 * @param callback 実行する関数
 * @param delay 間隔（ミリ秒）。nullの場合は停止
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | null>(null);

  // コールバックを保存
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // インターバルを設定
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
