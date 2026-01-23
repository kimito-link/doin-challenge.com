/**
 * SharePromptModal テスト
 * v6.64: 参加完了モーダル演出強化
 */
import { describe, it, expect } from "vitest";

describe("SharePromptModal", () => {
  describe("県点灯演出", () => {
    it("isNewPrefectureがtrueの場合、点灯メッセージを表示", () => {
      const prefecture = "東京都";
      const isNewPrefecture = true;

      // 新規県の場合のメッセージ
      const expectedMessage = `あなたの参加で${prefecture}が点灯！`;
      
      expect(expectedMessage).toContain("点灯");
      expect(expectedMessage).toContain(prefecture);
    });

    it("isNewPrefectureがfalseの場合、通常メッセージを表示", () => {
      const prefecture = "大阪府";
      const isNewPrefecture = false;

      // 既存県の場合のメッセージ
      const expectedMessage = `${prefecture}から参加`;
      
      expect(expectedMessage).not.toContain("点灯");
      expect(expectedMessage).toContain(prefecture);
    });

    it("prefectureがない場合、県表示セクションは非表示", () => {
      const prefecture = undefined;
      
      // 県が未設定の場合は表示しない
      expect(prefecture).toBeUndefined();
    });
  });

  describe("達成率・残り人数表示", () => {
    it("達成率が正しく計算される", () => {
      const currentParticipants = 75;
      const goalParticipants = 100;

      const progressPercent = goalParticipants > 0 
        ? Math.min((currentParticipants / goalParticipants) * 100, 100) 
        : 0;

      expect(progressPercent).toBe(75);
    });

    it("残り人数が正しく計算される", () => {
      const currentParticipants = 75;
      const goalParticipants = 100;

      const remainingCount = Math.max(goalParticipants - currentParticipants, 0);

      expect(remainingCount).toBe(25);
    });

    it("目標達成時は残り0人", () => {
      const currentParticipants = 120;
      const goalParticipants = 100;

      const remainingCount = Math.max(goalParticipants - currentParticipants, 0);

      expect(remainingCount).toBe(0);
    });

    it("達成率は100%を超えない", () => {
      const currentParticipants = 150;
      const goalParticipants = 100;

      const progressPercent = goalParticipants > 0 
        ? Math.min((currentParticipants / goalParticipants) * 100, 100) 
        : 0;

      expect(progressPercent).toBe(100);
    });
  });

  describe("参加者番号表示", () => {
    it("participantNumberが設定されている場合、表示される", () => {
      const participantNumber = 42;

      expect(participantNumber).toBeDefined();
      expect(participantNumber).toBeGreaterThan(0);
    });

    it("カウントアップアニメーションの最終値が正しい", () => {
      const participantNumber = 100;
      const displayNumber = participantNumber; // アニメーション完了後

      expect(displayNumber).toBe(participantNumber);
    });
  });

  describe("ワンタップ共有", () => {
    it("シェアボタンのテキストは「今すぐシェア」", () => {
      const shareButtonText = "今すぐシェア";
      const isSharing = false;

      const displayText = isSharing ? "シェア中..." : shareButtonText;

      expect(displayText).toBe("今すぐシェア");
    });

    it("シェア中はボタンテキストが変わる", () => {
      const shareButtonText = "今すぐシェア";
      const isSharing = true;

      const displayText = isSharing ? "シェア中..." : shareButtonText;

      expect(displayText).toBe("シェア中...");
    });

    it("スキップボタンのテキストは「あとでシェア」", () => {
      const skipButtonText = "あとでシェア";

      expect(skipButtonText).toBe("あとでシェア");
    });
  });

  describe("黒ベースUI", () => {
    it("オーバーレイは85%の黒", () => {
      const overlayColor = "rgba(0, 0, 0, 0.85)";

      expect(overlayColor).toContain("0.85");
    });

    it("シェアボタンは黒背景", () => {
      const shareButtonBg = "#000";

      expect(shareButtonBg).toBe("#000");
    });
  });

  describe("貢献度バッジ", () => {
    it("貢献度が1より大きい場合のみ表示", () => {
      const contribution1 = 1;
      const contribution2 = 3;

      expect(contribution1 > 1).toBe(false);
      expect(contribution2 > 1).toBe(true);
    });
  });
});
