import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  savePerformanceSnapshot,
  getPerformanceSnapshots,
  clearPerformanceSnapshots,
  calculatePerformanceStats,
  type PerformanceSnapshot,
} from "@/lib/performance-metrics-store";

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    getItem: vi.fn((key: string) => {
      return Promise.resolve(mockStorage[key] || null);
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
  },
}));

describe("Performance Metrics Store", () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  describe("savePerformanceSnapshot", () => {
    it("should save a performance snapshot", async () => {
      const snapshot: PerformanceSnapshot = {
        id: "test-1",
        timestamp: Date.now(),
        startup: {
          jsLoaded: 500,
          firstRender: 800,
          interactive: 1200,
          timestamp: Date.now(),
        },
        webVitals: [],
        userAgent: "test-agent",
        platform: "web",
      };

      await savePerformanceSnapshot(snapshot);
      const snapshots = await getPerformanceSnapshots();

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].id).toBe("test-1");
      expect(snapshots[0].startup?.jsLoaded).toBe(500);
    });

    it("should save multiple snapshots", async () => {
      const snapshot1: PerformanceSnapshot = {
        id: "test-1",
        timestamp: Date.now(),
        startup: {
          jsLoaded: 500,
          firstRender: 800,
          interactive: 1200,
          timestamp: Date.now(),
        },
        webVitals: [],
        userAgent: "test-agent",
        platform: "web",
      };

      const snapshot2: PerformanceSnapshot = {
        id: "test-2",
        timestamp: Date.now() + 1000,
        startup: {
          jsLoaded: 600,
          firstRender: 900,
          interactive: 1300,
          timestamp: Date.now() + 1000,
        },
        webVitals: [],
        userAgent: "test-agent",
        platform: "web",
      };

      await savePerformanceSnapshot(snapshot1);
      await savePerformanceSnapshot(snapshot2);
      const snapshots = await getPerformanceSnapshots();

      expect(snapshots).toHaveLength(2);
      expect(snapshots[0].id).toBe("test-2"); // Most recent first
      expect(snapshots[1].id).toBe("test-1");
    });

    it("should limit snapshots to MAX_SNAPSHOTS", async () => {
      // Save 101 snapshots
      for (let i = 0; i < 101; i++) {
        const snapshot: PerformanceSnapshot = {
          id: `test-${i}`,
          timestamp: Date.now() + i,
          startup: {
            jsLoaded: 500 + i,
            firstRender: 800 + i,
            interactive: 1200 + i,
            timestamp: Date.now() + i,
          },
          webVitals: [],
          userAgent: "test-agent",
          platform: "web",
        };
        await savePerformanceSnapshot(snapshot);
      }

      const snapshots = await getPerformanceSnapshots();
      expect(snapshots).toHaveLength(100); // Should be limited to 100
      expect(snapshots[0].id).toBe("test-100"); // Most recent
      expect(snapshots[99].id).toBe("test-1"); // Oldest kept
    });
  });

  describe("getPerformanceSnapshots", () => {
    it("should return empty array when no snapshots exist", async () => {
      const snapshots = await getPerformanceSnapshots();
      expect(snapshots).toEqual([]);
    });

    it("should return all saved snapshots", async () => {
      const snapshot1: PerformanceSnapshot = {
        id: "test-1",
        timestamp: Date.now(),
        startup: null,
        webVitals: [
          {
            name: "LCP",
            value: 2000,
            rating: "good",
            timestamp: Date.now(),
          },
        ],
        userAgent: "test-agent",
        platform: "web",
      };

      await savePerformanceSnapshot(snapshot1);
      const snapshots = await getPerformanceSnapshots();

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].webVitals).toHaveLength(1);
      expect(snapshots[0].webVitals[0].name).toBe("LCP");
    });
  });

  describe("clearPerformanceSnapshots", () => {
    it("should clear all snapshots", async () => {
      const snapshot: PerformanceSnapshot = {
        id: "test-1",
        timestamp: Date.now(),
        startup: {
          jsLoaded: 500,
          firstRender: 800,
          interactive: 1200,
          timestamp: Date.now(),
        },
        webVitals: [],
        userAgent: "test-agent",
        platform: "web",
      };

      await savePerformanceSnapshot(snapshot);
      let snapshots = await getPerformanceSnapshots();
      expect(snapshots).toHaveLength(1);

      await clearPerformanceSnapshots();
      snapshots = await getPerformanceSnapshots();
      expect(snapshots).toEqual([]);
    });
  });

  describe("calculatePerformanceStats", () => {
    it("should calculate correct stats for startup metrics", async () => {
      const snapshot1: PerformanceSnapshot = {
        id: "test-1",
        timestamp: Date.now(),
        startup: {
          jsLoaded: 500,
          firstRender: 800,
          interactive: 1200,
          timestamp: Date.now(),
        },
        webVitals: [],
        userAgent: "test-agent",
        platform: "web",
      };

      const snapshot2: PerformanceSnapshot = {
        id: "test-2",
        timestamp: Date.now() + 1000,
        startup: {
          jsLoaded: 600,
          firstRender: 900,
          interactive: 1400,
          timestamp: Date.now() + 1000,
        },
        webVitals: [],
        userAgent: "test-agent",
        platform: "web",
      };

      await savePerformanceSnapshot(snapshot1);
      await savePerformanceSnapshot(snapshot2);

      const stats = await calculatePerformanceStats();

      expect(stats.startup.avgJsLoaded).toBe(550);
      expect(stats.startup.avgFirstRender).toBe(850);
      expect(stats.startup.avgInteractive).toBe(1300);
      expect(stats.startup.minInteractive).toBe(1200);
      expect(stats.startup.maxInteractive).toBe(1400);
      expect(stats.totalSnapshots).toBe(2);
    });

    it("should calculate correct stats for Web Vitals", async () => {
      const snapshot1: PerformanceSnapshot = {
        id: "test-1",
        timestamp: Date.now(),
        startup: null,
        webVitals: [
          {
            name: "LCP",
            value: 2000,
            rating: "good",
            timestamp: Date.now(),
          },
          {
            name: "FID",
            value: 50,
            rating: "good",
            timestamp: Date.now(),
          },
        ],
        userAgent: "test-agent",
        platform: "web",
      };

      const snapshot2: PerformanceSnapshot = {
        id: "test-2",
        timestamp: Date.now() + 1000,
        startup: null,
        webVitals: [
          {
            name: "LCP",
            value: 3000,
            rating: "needs-improvement",
            timestamp: Date.now() + 1000,
          },
          {
            name: "FID",
            value: 150,
            rating: "needs-improvement",
            timestamp: Date.now() + 1000,
          },
        ],
        userAgent: "test-agent",
        platform: "web",
      };

      await savePerformanceSnapshot(snapshot1);
      await savePerformanceSnapshot(snapshot2);

      const stats = await calculatePerformanceStats();

      expect(stats.webVitals.lcp.avg).toBe(2500);
      expect(stats.webVitals.lcp.good).toBe(1);
      expect(stats.webVitals.lcp.needsImprovement).toBe(1);
      expect(stats.webVitals.lcp.poor).toBe(0);

      expect(stats.webVitals.fid.avg).toBe(100);
      expect(stats.webVitals.fid.good).toBe(1);
      expect(stats.webVitals.fid.needsImprovement).toBe(1);
      expect(stats.webVitals.fid.poor).toBe(0);
    });

    it("should return zero stats when no snapshots exist", async () => {
      const stats = await calculatePerformanceStats();

      expect(stats.startup.avgJsLoaded).toBe(0);
      expect(stats.startup.avgFirstRender).toBe(0);
      expect(stats.startup.avgInteractive).toBe(0);
      expect(stats.startup.minInteractive).toBe(0);
      expect(stats.startup.maxInteractive).toBe(0);
      expect(stats.totalSnapshots).toBe(0);
    });
  });
});
