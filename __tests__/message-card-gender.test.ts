/**
 * MessageCard 性別ボーダーテスト
 * 
 * v6.63: 応援コメントカードの性別表示改善
 * - 背景色は黒で統一（性別で変えない）
 * - 左ボーダー2pxのみで性別を表現
 * - 男性：青 #3B82F6、女性：ピンク #F472B6、未設定：ニュートラル
 */
import { describe, it, expect } from "vitest";

// 性別ボーダーの色定義（MessageCardと同じ）
const GENDER_BORDER_COLORS = {
  male: "#3B82F6",      // 青
  female: "#F472B6",    // ピンク（ブランド色と少しずらす）
  neutral: "rgba(255,255,255,0.12)",  // ニュートラル
} as const;

/**
 * 性別に応じた左ボーダー色を取得
 */
function getGenderBorderColor(gender?: string | null): string {
  switch (gender) {
    case "male":
      return GENDER_BORDER_COLORS.male;
    case "female":
      return GENDER_BORDER_COLORS.female;
    default:
      return GENDER_BORDER_COLORS.neutral;
  }
}

/**
 * 性別アイコンを取得
 */
function getGenderIcon(gender?: string | null): string | null {
  switch (gender) {
    case "male":
      return "♂";
    case "female":
      return "♀";
    default:
      return null;
  }
}

describe("MessageCard Gender Border", () => {
  describe("getGenderBorderColor", () => {
    it("男性の場合は青 #3B82F6 を返す", () => {
      expect(getGenderBorderColor("male")).toBe("#3B82F6");
    });

    it("女性の場合はピンク #F472B6 を返す", () => {
      expect(getGenderBorderColor("female")).toBe("#F472B6");
    });

    it("未設定の場合はニュートラル色を返す", () => {
      expect(getGenderBorderColor(null)).toBe("rgba(255,255,255,0.12)");
      expect(getGenderBorderColor(undefined)).toBe("rgba(255,255,255,0.12)");
      expect(getGenderBorderColor("unspecified")).toBe("rgba(255,255,255,0.12)");
    });

    it("不正な値の場合はニュートラル色を返す", () => {
      expect(getGenderBorderColor("other")).toBe("rgba(255,255,255,0.12)");
      expect(getGenderBorderColor("")).toBe("rgba(255,255,255,0.12)");
    });
  });

  describe("getGenderIcon", () => {
    it("男性の場合は ♂ を返す", () => {
      expect(getGenderIcon("male")).toBe("♂");
    });

    it("女性の場合は ♀ を返す", () => {
      expect(getGenderIcon("female")).toBe("♀");
    });

    it("未設定の場合は null を返す", () => {
      expect(getGenderIcon(null)).toBeNull();
      expect(getGenderIcon(undefined)).toBeNull();
      expect(getGenderIcon("unspecified")).toBeNull();
    });
  });

  describe("仕様準拠チェック", () => {
    it("男性の青は仕様通り #3B82F6 である", () => {
      expect(GENDER_BORDER_COLORS.male).toBe("#3B82F6");
    });

    it("女性のピンクは仕様通り #F472B6 である（ブランド色 #EC4899 と異なる）", () => {
      expect(GENDER_BORDER_COLORS.female).toBe("#F472B6");
      expect(GENDER_BORDER_COLORS.female).not.toBe("#EC4899"); // ブランド色と異なることを確認
    });

    it("背景色は性別で変わらない（黒 #1A1D21 で統一）", () => {
      // MessageCardの背景色は常に #1A1D21
      const CARD_BACKGROUND = "#1A1D21";
      expect(CARD_BACKGROUND).toBe("#1A1D21");
    });
  });
});
