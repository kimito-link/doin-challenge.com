import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * パフォーマンスメトリクスストア
 * Web VitalsとstartupPerformanceのメトリクスを収集・保存・取得する
 */

export interface StartupMetric {
  jsLoaded: number;
  firstRender: number;
  interactive: number;
  timestamp: number;
}

export interface WebVitalsMetric {
  name: "LCP" | "FID" | "CLS";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

export interface PerformanceSnapshot {
  id: string;
  timestamp: number;
  startup: StartupMetric | null;
  webVitals: WebVitalsMetric[];
  userAgent: string;
  platform: string;
}

const STORAGE_KEY = "performance_metrics";
const MAX_SNAPSHOTS = 100; // 最大100個のスナップショットを保存

/**
 * パフォーマンススナップショットを保存
 */
export async function savePerformanceSnapshot(snapshot: PerformanceSnapshot): Promise<void> {
  try {
    const existing = await getPerformanceSnapshots();
    const updated = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("[Performance Store] Failed to save snapshot:", error);
  }
}

/**
 * 全てのパフォーマンススナップショットを取得
 */
export async function getPerformanceSnapshots(): Promise<PerformanceSnapshot[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[Performance Store] Failed to get snapshots:", error);
    return [];
  }
}

/**
 * パフォーマンススナップショットをクリア
 */
export async function clearPerformanceSnapshots(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[Performance Store] Failed to clear snapshots:", error);
  }
}

/**
 * パフォーマンス統計を計算
 */
export interface PerformanceStats {
  startup: {
    avgJsLoaded: number;
    avgFirstRender: number;
    avgInteractive: number;
    minInteractive: number;
    maxInteractive: number;
  };
  webVitals: {
    lcp: {
      avg: number;
      good: number;
      needsImprovement: number;
      poor: number;
    };
    fid: {
      avg: number;
      good: number;
      needsImprovement: number;
      poor: number;
    };
    cls: {
      avg: number;
      good: number;
      needsImprovement: number;
      poor: number;
    };
  };
  totalSnapshots: number;
}

export async function calculatePerformanceStats(): Promise<PerformanceStats> {
  const snapshots = await getPerformanceSnapshots();

  // Startup metrics
  const startupMetrics = snapshots.filter((s) => s.startup !== null).map((s) => s.startup!);
  const avgJsLoaded =
    startupMetrics.length > 0 ? startupMetrics.reduce((sum, m) => sum + m.jsLoaded, 0) / startupMetrics.length : 0;
  const avgFirstRender =
    startupMetrics.length > 0
      ? startupMetrics.reduce((sum, m) => sum + m.firstRender, 0) / startupMetrics.length
      : 0;
  const avgInteractive =
    startupMetrics.length > 0
      ? startupMetrics.reduce((sum, m) => sum + m.interactive, 0) / startupMetrics.length
      : 0;
  const minInteractive = startupMetrics.length > 0 ? Math.min(...startupMetrics.map((m) => m.interactive)) : 0;
  const maxInteractive = startupMetrics.length > 0 ? Math.max(...startupMetrics.map((m) => m.interactive)) : 0;

  // Web Vitals metrics
  const allWebVitals = snapshots.flatMap((s) => s.webVitals);
  const lcpMetrics = allWebVitals.filter((m) => m.name === "LCP");
  const fidMetrics = allWebVitals.filter((m) => m.name === "FID");
  const clsMetrics = allWebVitals.filter((m) => m.name === "CLS");

  const calculateMetricStats = (metrics: WebVitalsMetric[]) => {
    const avg = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length : 0;
    const good = metrics.filter((m) => m.rating === "good").length;
    const needsImprovement = metrics.filter((m) => m.rating === "needs-improvement").length;
    const poor = metrics.filter((m) => m.rating === "poor").length;
    return { avg, good, needsImprovement, poor };
  };

  return {
    startup: {
      avgJsLoaded,
      avgFirstRender,
      avgInteractive,
      minInteractive,
      maxInteractive,
    },
    webVitals: {
      lcp: calculateMetricStats(lcpMetrics),
      fid: calculateMetricStats(fidMetrics),
      cls: calculateMetricStats(clsMetrics),
    },
    totalSnapshots: snapshots.length,
  };
}
