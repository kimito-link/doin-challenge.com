/**
 * アプリ起動時間とパフォーマンスを計測するユーティリティ
 */

import { Platform } from "react-native";
import { savePerformanceSnapshot, type StartupMetric } from "./performance-metrics-store";

interface PerformanceMetrics {
  appStartTime: number;
  firstRenderTime?: number;
  interactiveTime?: number;
  jsLoadTime?: number;
  nativeBridgeTime?: number;
}

class StartupPerformanceMonitor {
  private metrics: PerformanceMetrics = {
    appStartTime: Date.now(),
  };

  private marks: Map<string, number> = new Map();

  /**
   * パフォーマンスマークを記録
   */
  mark(name: string): void {
    this.marks.set(name, Date.now());

    if (__DEV__) {
      console.log(`[Performance] ${name}: ${Date.now() - this.metrics.appStartTime}ms`);
    }
  }

  /**
   * 2つのマーク間の時間を計測
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (!start || !end) {
      console.warn(`[Performance] Cannot measure ${name}: missing marks`);
      return null;
    }

    const duration = end - start;

    if (__DEV__) {
      console.log(`[Performance] ${name}: ${duration}ms`);
    }

    return duration;
  }

  /**
   * 最初のレンダリング完了を記録
   */
  markFirstRender(): void {
    if (!this.metrics.firstRenderTime) {
      this.metrics.firstRenderTime = Date.now();
      this.mark("first-render");

      if (__DEV__) {
        const duration = this.metrics.firstRenderTime - this.metrics.appStartTime;
        console.log(`[Performance] Time to first render: ${duration}ms`);
      }
    }
  }

  /**
   * インタラクティブになった時点を記録
   */
  markInteractive(): void {
    if (!this.metrics.interactiveTime) {
      this.metrics.interactiveTime = Date.now();
      this.mark("interactive");

      if (__DEV__) {
        const duration = this.metrics.interactiveTime - this.metrics.appStartTime;
        console.log(`[Performance] Time to interactive: ${duration}ms`);
      }

      // Save metrics when interactive
      this.saveMetrics();
    }
  }

  /**
   * JavaScript読み込み完了を記録
   */
  markJSLoaded(): void {
    if (!this.metrics.jsLoadTime) {
      this.metrics.jsLoadTime = Date.now();
      this.mark("js-loaded");

      if (__DEV__) {
        const duration = this.metrics.jsLoadTime - this.metrics.appStartTime;
        console.log(`[Performance] JavaScript loaded: ${duration}ms`);
      }
    }
  }

  /**
   * 現在のメトリクスを取得
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * メトリクスをコンソールに出力
   */
  logMetrics(): void {
    if (!__DEV__) return;

    console.log("=== Startup Performance Metrics ===");
    console.log(`Platform: ${Platform.OS}`);
    console.log(`App Start Time: ${this.metrics.appStartTime}`);

    if (this.metrics.jsLoadTime) {
      console.log(`JS Load Time: ${this.metrics.jsLoadTime - this.metrics.appStartTime}ms`);
    }

    if (this.metrics.firstRenderTime) {
      console.log(`First Render Time: ${this.metrics.firstRenderTime - this.metrics.appStartTime}ms`);
    }

    if (this.metrics.interactiveTime) {
      console.log(`Interactive Time: ${this.metrics.interactiveTime - this.metrics.appStartTime}ms`);
    }

    console.log("===================================");
  }

  /**
   * メトリクスを保存
   */
  async saveMetrics(): Promise<void> {
    const { jsLoadTime, firstRenderTime, interactiveTime, appStartTime } = this.metrics;

    if (!jsLoadTime || !firstRenderTime || !interactiveTime) {
      console.warn("[Startup Performance] Cannot save incomplete metrics");
      return;
    }

    const metric: StartupMetric = {
      jsLoaded: jsLoadTime - appStartTime,
      firstRender: firstRenderTime - appStartTime,
      interactive: interactiveTime - appStartTime,
      timestamp: Date.now(),
    };

    try {
      await savePerformanceSnapshot({
        id: `startup-${Date.now()}`,
        timestamp: Date.now(),
        startup: metric,
        webVitals: [],
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        platform: Platform.OS,
      });

      if (__DEV__) {
        console.log("[Startup Performance] Metrics saved successfully");
      }
    } catch (error) {
      console.error("[Startup Performance] Failed to save metrics:", error);
    }
  }

  /**
   * メトリクスをリセット
   */
  reset(): void {
    this.metrics = {
      appStartTime: Date.now(),
    };
    this.marks.clear();
  }
}

// シングルトンインスタンス
export const startupPerformance = new StartupPerformanceMonitor();

/**
 * React Hookでパフォーマンス計測を簡単に使用
 */
export function useStartupPerformance() {
  return {
    markFirstRender: () => startupPerformance.markFirstRender(),
    markInteractive: () => startupPerformance.markInteractive(),
    mark: (name: string) => startupPerformance.mark(name),
    measure: (name: string, startMark: string, endMark: string) => startupPerformance.measure(name, startMark, endMark),
    getMetrics: () => startupPerformance.getMetrics(),
    logMetrics: () => startupPerformance.logMetrics(),
  };
}
