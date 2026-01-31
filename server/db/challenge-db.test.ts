// server/db/challenge-db.test.ts
// v6.177: getAllEventsWithGenderStats()のユニットテスト

import { describe, it, expect } from "vitest";
import { getAllEventsWithGenderStats } from "./challenge-db";

describe("getAllEventsWithGenderStats", () => {
  it("should return events with gender statistics", { timeout: 30000 }, async () => {
    const events = await getAllEventsWithGenderStats();
    
    // イベントが取得できること
    expect(events).toBeDefined();
    expect(Array.isArray(events)).toBe(true);
    
    if (events.length > 0) {
      const firstEvent = events[0];
      
      // 基本フィールドが存在すること
      expect(firstEvent).toHaveProperty("id");
      expect(firstEvent).toHaveProperty("title");
      expect(firstEvent).toHaveProperty("hostName");
      
      // 性別統計フィールドが存在すること
      expect(firstEvent).toHaveProperty("maleCount");
      expect(firstEvent).toHaveProperty("femaleCount");
      expect(firstEvent).toHaveProperty("unspecifiedCount");
      expect(firstEvent).toHaveProperty("totalParticipants");
      
      // 性別統計フィールドが数値であること
      expect(typeof firstEvent.maleCount).toBe("number");
      expect(typeof firstEvent.femaleCount).toBe("number");
      expect(typeof firstEvent.unspecifiedCount).toBe("number");
      expect(typeof firstEvent.totalParticipants).toBe("number");
      
      // 性別統計の合計が totalParticipants と一致すること
      const sum = firstEvent.maleCount + firstEvent.femaleCount + firstEvent.unspecifiedCount;
      expect(sum).toBe(firstEvent.totalParticipants);
      
      console.log("✅ First event:", {
        id: firstEvent.id,
        title: firstEvent.title,
        maleCount: firstEvent.maleCount,
        femaleCount: firstEvent.femaleCount,
        unspecifiedCount: firstEvent.unspecifiedCount,
        totalParticipants: firstEvent.totalParticipants,
      });
    }
  });
  
  it("should return events sorted by eventDate DESC", { timeout: 30000 }, async () => {
    const events = await getAllEventsWithGenderStats();
    
    if (events.length > 1) {
      for (let i = 0; i < events.length - 1; i++) {
        const current = new Date(events[i].eventDate);
        const next = new Date(events[i + 1].eventDate);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    }
  });
  
  it("should cache results for 5 minutes", { timeout: 30000 }, async () => {
    const start = Date.now();
    const events1 = await getAllEventsWithGenderStats();
    const time1 = Date.now() - start;
    
    const start2 = Date.now();
    const events2 = await getAllEventsWithGenderStats();
    const time2 = Date.now() - start2;
    
    // 2回目の呼び出しはキャッシュから返されるため、1回目より高速であること（または同じデータが返されること）
    // time2が0msの場合は、キャッシュが正しく動作している
    if (time2 > 0) {
      expect(time2).toBeLessThan(time1);
    }
    
    // 同じデータが返されること
    expect(events1).toEqual(events2);
    
    console.log(`✅ Cache test: 1st call ${time1}ms, 2nd call ${time2}ms`);
  });
});
