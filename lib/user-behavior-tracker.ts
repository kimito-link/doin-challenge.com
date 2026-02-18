import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * ユーザー行動パターン学習システム
 * ナビゲーション履歴を記録し、次に訪れる可能性が高い画面を予測する
 */

const STORAGE_KEY = "user_behavior_history";
const MAX_HISTORY_SIZE = 100; // 最大100件の履歴を保持

export interface NavigationEvent {
  from: string;
  to: string;
  timestamp: number;
  userType?: "host" | "fan";
}

export interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  probability: number;
}

export interface BehaviorAnalytics {
  totalNavigations: number;
  patterns: NavigationPattern[];
  frequentScreens: Array<{ screen: string; count: number }>;
  timeBasedPatterns: {
    morning: NavigationPattern[]; // 6:00-12:00
    afternoon: NavigationPattern[]; // 12:00-18:00
    evening: NavigationPattern[]; // 18:00-24:00
    night: NavigationPattern[]; // 0:00-6:00
  };
}

class UserBehaviorTracker {
  private history: NavigationEvent[] = [];
  private initialized = false;

  /**
   * 初期化（AsyncStorageから履歴を読み込む）
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
        console.log("[BehaviorTracker] Loaded", this.history.length, "navigation events");
      }
      this.initialized = true;
    } catch (error) {
      console.error("[BehaviorTracker] Failed to load history:", error);
      this.history = [];
      this.initialized = true;
    }
  }

  /**
   * ナビゲーションイベントを記録
   */
  async recordNavigation(from: string, to: string, userType?: "host" | "fan"): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const event: NavigationEvent = {
      from,
      to,
      timestamp: Date.now(),
      userType,
    };

    this.history.push(event);

    // 履歴サイズを制限
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history = this.history.slice(-MAX_HISTORY_SIZE);
    }

    // AsyncStorageに保存
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error("[BehaviorTracker] Failed to save history:", error);
    }
  }

  /**
   * 次に訪れる可能性が高い画面を予測
   */
  async predictNextScreens(currentScreen: string, topN: number = 3): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    // 現在の画面から遷移したパターンを抽出
    const transitions = this.history.filter((event) => event.from === currentScreen);

    if (transitions.length === 0) {
      return [];
    }

    // 遷移先をカウント
    const counts = new Map<string, number>();
    transitions.forEach((event) => {
      counts.set(event.to, (counts.get(event.to) || 0) + 1);
    });

    // 確率順にソート
    const sorted = Array.from(counts.entries())
      .map(([screen, count]) => ({
        screen,
        count,
        probability: count / transitions.length,
      }))
      .sort((a, b) => b.count - a.count);

    return sorted.slice(0, topN).map((item) => item.screen);
  }

  /**
   * 行動分析結果を取得
   */
  async getAnalytics(): Promise<BehaviorAnalytics> {
    if (!this.initialized) {
      await this.initialize();
    }

    const totalNavigations = this.history.length;

    // パターン分析
    const transitionCounts = new Map<string, number>();
    this.history.forEach((event) => {
      const key = `${event.from}→${event.to}`;
      transitionCounts.set(key, (transitionCounts.get(key) || 0) + 1);
    });

    const patterns: NavigationPattern[] = Array.from(transitionCounts.entries())
      .map(([key, count]) => {
        const [from, to] = key.split("→");
        return {
          from,
          to,
          count,
          probability: count / totalNavigations,
        };
      })
      .sort((a, b) => b.count - a.count);

    // 頻繁にアクセスする画面
    const screenCounts = new Map<string, number>();
    this.history.forEach((event) => {
      screenCounts.set(event.to, (screenCounts.get(event.to) || 0) + 1);
    });

    const frequentScreens = Array.from(screenCounts.entries())
      .map(([screen, count]) => ({ screen, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 時間帯別パターン
    const timeBasedPatterns = this.analyzeTimeBasedPatterns();

    return {
      totalNavigations,
      patterns,
      frequentScreens,
      timeBasedPatterns,
    };
  }

  /**
   * 時間帯別のパターン分析
   */
  private analyzeTimeBasedPatterns() {
    const morning: NavigationEvent[] = [];
    const afternoon: NavigationEvent[] = [];
    const evening: NavigationEvent[] = [];
    const night: NavigationEvent[] = [];

    this.history.forEach((event) => {
      const hour = new Date(event.timestamp).getHours();
      if (hour >= 6 && hour < 12) {
        morning.push(event);
      } else if (hour >= 12 && hour < 18) {
        afternoon.push(event);
      } else if (hour >= 18 && hour < 24) {
        evening.push(event);
      } else {
        night.push(event);
      }
    });

    return {
      morning: this.extractPatterns(morning),
      afternoon: this.extractPatterns(afternoon),
      evening: this.extractPatterns(evening),
      night: this.extractPatterns(night),
    };
  }

  /**
   * イベントリストからパターンを抽出
   */
  private extractPatterns(events: NavigationEvent[]): NavigationPattern[] {
    if (events.length === 0) return [];

    const transitionCounts = new Map<string, number>();
    events.forEach((event) => {
      const key = `${event.from}→${event.to}`;
      transitionCounts.set(key, (transitionCounts.get(key) || 0) + 1);
    });

    return Array.from(transitionCounts.entries())
      .map(([key, count]) => {
        const [from, to] = key.split("→");
        return {
          from,
          to,
          count,
          probability: count / events.length,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * 履歴をクリア
   */
  async clearHistory(): Promise<void> {
    this.history = [];
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("[BehaviorTracker] History cleared");
    } catch (error) {
      console.error("[BehaviorTracker] Failed to clear history:", error);
    }
  }
}

// シングルトンインスタンス
export const userBehaviorTracker = new UserBehaviorTracker();
