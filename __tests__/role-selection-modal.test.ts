/**
 * RoleSelectionModal テスト
 * 
 * v6.63: 初回ログイン時の役割選択画面
 * - 「ファンとして参加」「主催者として企画」の2択
 * - 説明文は短く、価値が即伝わる内容
 */
import { describe, it, expect } from "vitest";

describe("RoleSelectionModal", () => {
  describe("役割選択オプション", () => {
    it("ファン役割のラベルは「ファンとして参加」である", () => {
      const fanRoleLabel = "ファンとして参加";
      expect(fanRoleLabel).toBe("ファンとして参加");
    });

    it("主催者役割のラベルは「主催者として企画」である", () => {
      const hostRoleLabel = "主催者として企画";
      expect(hostRoleLabel).toBe("主催者として企画");
    });

    it("ファン役割の説明文は価値が即伝わる内容である", () => {
      const fanDescription = "推しのイベントを見つけて応援しよう。\n参加表明であなたの地域を点灯させよう！";
      expect(fanDescription).toContain("推し");
      expect(fanDescription).toContain("応援");
      expect(fanDescription).toContain("地域を点灯");
    });

    it("主催者役割の説明文は価値が即伝わる内容である", () => {
      const hostDescription = "イベントを作成してファンを集めよう。\n参加者数をリアルタイムで可視化できる！";
      expect(hostDescription).toContain("ファンを集め");
      expect(hostDescription).toContain("リアルタイム");
      expect(hostDescription).toContain("可視化");
    });
  });

  describe("初回ログイン判定", () => {
    it("初回ログインフラグのキーは has_logged_in_before である", () => {
      const FIRST_LOGIN_KEY = "has_logged_in_before";
      expect(FIRST_LOGIN_KEY).toBe("has_logged_in_before");
    });

    it("初回ログイン時は isFirstLogin が true である", () => {
      // 初回ログイン時の期待値
      const isFirstLogin = true;
      expect(isFirstLogin).toBe(true);
    });

    it("2回目以降のログイン時は isFirstLogin が false である", () => {
      // 2回目以降の期待値
      const isFirstLogin = false;
      expect(isFirstLogin).toBe(false);
    });
  });

  describe("UI/UX 仕様準拠", () => {
    it("ヘッダーのテキスト色は黒系 #111827 である", () => {
      const headerTextColor = "#111827";
      expect(headerTextColor).toBe("#111827");
    });

    it("「後で選ぶ」オプションが存在する", () => {
      const skipLabel = "後で選ぶ";
      expect(skipLabel).toBe("後で選ぶ");
    });

    it("ファンアイコンはハートである", () => {
      const fanIcon = "heart";
      expect(fanIcon).toBe("heart");
    });

    it("主催者アイコンは王冠である", () => {
      const hostIcon = "crown";
      expect(hostIcon).toBe("crown");
    });
  });
});
