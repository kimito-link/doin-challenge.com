import { Platform } from "react-native";
import { savePerformanceSnapshot, type WebVitalsMetric as StoredWebVitalsMetric } from "./performance-metrics-store";

/**
 * Web Vitals - Core Web Vitalsの計測ユーティリティ
 *
 * Web版でのみ動作し、以下のメトリクスを計測します：
 * - LCP (Largest Contentful Paint): 最大コンテンツの描画時間
 * - FID (First Input Delay): 最初の入力遅延
 * - CLS (Cumulative Layout Shift): 累積レイアウトシフト
 */

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

type WebVitalsCallback = (metric: WebVitalsMetric) => void;

/**
 * Web Vitalsのメトリクスを評価
 */
function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  switch (name) {
    case "LCP":
      if (value <= 2500) return "good";
      if (value <= 4000) return "needs-improvement";
      return "poor";
    case "FID":
      if (value <= 100) return "good";
      if (value <= 300) return "needs-improvement";
      return "poor";
    case "CLS":
      if (value <= 0.1) return "good";
      if (value <= 0.25) return "needs-improvement";
      return "poor";
    default:
      return "good";
  }
}

/**
 * Web Vitalsを計測
 */
export function measureWebVitals(callback: WebVitalsCallback) {
  if (Platform.OS !== "web") {
    console.log("[Web Vitals] Only available on web platform");
    return;
  }

  // LCP (Largest Contentful Paint)
  if (typeof window !== "undefined" && "PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;

        if (lastEntry) {
          const value = lastEntry.renderTime || lastEntry.loadTime;
          callback({
            name: "LCP",
            value,
            rating: getRating("LCP", value),
            delta: value,
            id: `lcp-${Date.now()}`,
          });
        }
      });

      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (error) {
      console.warn("[Web Vitals] LCP measurement failed:", error);
    }

    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const value = entry.processingStart - entry.startTime;
          callback({
            name: "FID",
            value,
            rating: getRating("FID", value),
            delta: value,
            id: `fid-${Date.now()}`,
          });
        });
      });

      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (error) {
      console.warn("[Web Vitals] FID measurement failed:", error);
    }

    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            callback({
              name: "CLS",
              value: clsValue,
              rating: getRating("CLS", clsValue),
              delta: entry.value,
              id: `cls-${Date.now()}`,
            });
          }
        });
      });

      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (error) {
      console.warn("[Web Vitals] CLS measurement failed:", error);
    }
  }
}

/**
 * Web Vitalsのレポートを送信
 */
export async function reportWebVitals(metric: WebVitalsMetric) {
  if (__DEV__) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
    });
  }

  // Save metric to storage
  try {
    const storedMetric: StoredWebVitalsMetric = {
      name: metric.name as "LCP" | "FID" | "CLS",
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
    };

    await savePerformanceSnapshot({
      id: metric.id,
      timestamp: Date.now(),
      startup: null,
      webVitals: [storedMetric],
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      platform: Platform.OS,
    });

    if (__DEV__) {
      console.log("[Web Vitals] Metric saved successfully");
    }
  } catch (error) {
    console.error("[Web Vitals] Failed to save metric:", error);
  }

  // 本番環境では、アナリティクスサービスに送信
  // 例: Google Analytics, Sentry, etc.
}
