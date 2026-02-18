/**
 * 分析機能とユーザー行動追跡システム
 * ユーザーの行動を追跡し、アプリの改善に役立てる
 */

import { logger } from "./logger";

export interface AnalyticsEvent {
  userId?: number;
  sessionId?: string;
  eventName: string;
  eventCategory: string;
  eventProperties?: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  referrer?: string;
  url?: string;
}

export interface UserSession {
  sessionId: string;
  userId?: number;
  startTime: Date;
  lastActivity: Date;
  events: AnalyticsEvent[];
  deviceInfo?: {
    platform: string;
    browser: string;
    os: string;
  };
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();

  /**
   * イベントを追跡
   */
  track(event: Omit<AnalyticsEvent, "timestamp">) {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    // セッションに追加
    if (event.sessionId) {
      const session = this.sessions.get(event.sessionId);
      if (session) {
        session.events.push(fullEvent);
        session.lastActivity = new Date();
      }
    }

    logger.logUserAction(
      event.userId || 0,
      event.eventName,
      {
        category: event.eventCategory,
        properties: event.eventProperties,
      }
    );
  }

  /**
   * ページビューを追跡
   */
  trackPageView(userId: number | undefined, url: string, sessionId?: string) {
    this.track({
      userId,
      sessionId,
      eventName: "page_view",
      eventCategory: "navigation",
      eventProperties: { url },
      url,
    });
  }

  /**
   * ボタンクリックを追跡
   */
  trackClick(userId: number | undefined, buttonName: string, sessionId?: string) {
    this.track({
      userId,
      sessionId,
      eventName: "button_click",
      eventCategory: "interaction",
      eventProperties: { buttonName },
    });
  }

  /**
   * フォーム送信を追跡
   */
  trackFormSubmit(userId: number | undefined, formName: string, success: boolean, sessionId?: string) {
    this.track({
      userId,
      sessionId,
      eventName: "form_submit",
      eventCategory: "conversion",
      eventProperties: { formName, success },
    });
  }

  /**
   * エラーを追跡
   */
  trackError(userId: number | undefined, errorName: string, errorMessage: string, sessionId?: string) {
    this.track({
      userId,
      sessionId,
      eventName: "error",
      eventCategory: "error",
      eventProperties: { errorName, errorMessage },
    });
  }

  /**
   * セッションを開始
   */
  startSession(sessionId: string, userId?: number, deviceInfo?: UserSession["deviceInfo"]): UserSession {
    const session: UserSession = {
      sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      events: [],
      deviceInfo,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * セッションを取得
   */
  getSession(sessionId: string): UserSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * セッションを終了
   */
  endSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      const duration = new Date().getTime() - session.startTime.getTime();
      logger.info("Session ended", {
        sessionId,
        userId: session.userId,
        duration: `${duration}ms`,
        eventCount: session.events.length,
      });
      this.sessions.delete(sessionId);
    }
  }

  /**
   * 統計を取得
   */
  getStats(timeRange?: { start: Date; end: Date }) {
    let filteredEvents = this.events;

    if (timeRange) {
      filteredEvents = this.events.filter(
        (event) => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      );
    }

    // イベント数カウント
    const eventCounts = new Map<string, number>();
    filteredEvents.forEach((event) => {
      const count = eventCounts.get(event.eventName) || 0;
      eventCounts.set(event.eventName, count + 1);
    });

    // ユニークユーザー数
    const uniqueUsers = new Set(filteredEvents.filter((e) => e.userId).map((e) => e.userId));

    // カテゴリ別イベント数
    const categoryCounts = new Map<string, number>();
    filteredEvents.forEach((event) => {
      const count = categoryCounts.get(event.eventCategory) || 0;
      categoryCounts.set(event.eventCategory, count + 1);
    });

    return {
      totalEvents: filteredEvents.length,
      uniqueUsers: uniqueUsers.size,
      eventCounts: Object.fromEntries(eventCounts),
      categoryCounts: Object.fromEntries(categoryCounts),
      activeSessions: this.sessions.size,
    };
  }

  /**
   * ユーザーの行動パターンを分析
   */
  analyzeUserBehavior(userId: number) {
    const userEvents = this.events.filter((event) => event.userId === userId);

    if (userEvents.length === 0) {
      return null;
    }

    // 最も頻繁なアクション
    const actionCounts = new Map<string, number>();
    userEvents.forEach((event) => {
      const count = actionCounts.get(event.eventName) || 0;
      actionCounts.set(event.eventName, count + 1);
    });

    const mostFrequentAction = Array.from(actionCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    // 平均セッション時間
    const userSessions = Array.from(this.sessions.values()).filter((s) => s.userId === userId);
    const avgSessionDuration =
      userSessions.length > 0
        ? userSessions.reduce((sum, s) => sum + (s.lastActivity.getTime() - s.startTime.getTime()), 0) /
          userSessions.length
        : 0;

    return {
      totalEvents: userEvents.length,
      mostFrequentAction: mostFrequentAction ? mostFrequentAction[0] : null,
      mostFrequentActionCount: mostFrequentAction ? mostFrequentAction[1] : 0,
      avgSessionDuration: `${Math.round(avgSessionDuration / 1000)}s`,
      activeSessions: userSessions.length,
    };
  }

  /**
   * コンバージョン率を計算
   */
  calculateConversionRate(startEvent: string, endEvent: string): number {
    const startCount = this.events.filter((e) => e.eventName === startEvent).length;
    const endCount = this.events.filter((e) => e.eventName === endEvent).length;

    if (startCount === 0) {
      return 0;
    }

    return (endCount / startCount) * 100;
  }

  /**
   * ファネル分析
   */
  analyzeFunnel(steps: string[]): { step: string; count: number; dropoffRate: number }[] {
    const result: { step: string; count: number; dropoffRate: number }[] = [];

    let previousCount = 0;

    steps.forEach((step, index) => {
      const count = this.events.filter((e) => e.eventName === step).length;
      const dropoffRate = index > 0 && previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0;

      result.push({ step, count, dropoffRate });
      previousCount = count;
    });

    return result;
  }

  /**
   * イベントデータをクリア（テスト用）
   */
  clear() {
    this.events = [];
    this.sessions.clear();
  }
}

// シングルトンインスタンス
export const analytics = new Analytics();

/**
 * A/Bテスト管理
 */
export class ABTestManager {
  private tests: Map<
    string,
    {
      variants: string[];
      assignments: Map<number, string>;
      results: Map<string, { impressions: number; conversions: number }>;
    }
  > = new Map();

  /**
   * A/Bテストを作成
   */
  createTest(testName: string, variants: string[]) {
    this.tests.set(testName, {
      variants,
      assignments: new Map(),
      results: new Map(variants.map((v) => [v, { impressions: 0, conversions: 0 }])),
    });
  }

  /**
   * ユーザーにバリアントを割り当て
   */
  assignVariant(testName: string, userId: number): string | null {
    const test = this.tests.get(testName);
    if (!test) {
      return null;
    }

    // 既に割り当てられている場合はそれを返す
    const existing = test.assignments.get(userId);
    if (existing) {
      return existing;
    }

    // ランダムにバリアントを選択
    const variant = test.variants[Math.floor(Math.random() * test.variants.length)];
    test.assignments.set(userId, variant);

    // インプレッションをカウント
    const result = test.results.get(variant);
    if (result) {
      result.impressions++;
    }

    return variant;
  }

  /**
   * コンバージョンを記録
   */
  recordConversion(testName: string, userId: number) {
    const test = this.tests.get(testName);
    if (!test) {
      return;
    }

    const variant = test.assignments.get(userId);
    if (!variant) {
      return;
    }

    const result = test.results.get(variant);
    if (result) {
      result.conversions++;
    }
  }

  /**
   * テスト結果を取得
   */
  getTestResults(testName: string) {
    const test = this.tests.get(testName);
    if (!test) {
      return null;
    }

    const results = Array.from(test.results.entries()).map(([variant, data]) => ({
      variant,
      impressions: data.impressions,
      conversions: data.conversions,
      conversionRate: data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0,
    }));

    return results;
  }
}

export const abTestManager = new ABTestManager();
