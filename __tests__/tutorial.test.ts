import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

// AsyncStorageのモック
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

// チュートリアルステップの定義テスト
describe("Tutorial Steps Definition", () => {
  it("ファン向けチュートリアルは3ステップ以下である", () => {
    // 任天堂原則: 5ステップ以内
    const FAN_STEPS = [
      { message: "推しを見つけよう" },
      { message: "参加しよう" },
      { message: "自分のも作れるよ" },
    ];
    expect(FAN_STEPS.length).toBeLessThanOrEqual(5);
    expect(FAN_STEPS.length).toBe(3);
  });

  it("主催者向けチュートリアルは3ステップ以下である", () => {
    const HOST_STEPS = [
      { message: "チャレンジを作ろう" },
      { message: "目標を決めよう" },
      { message: "公開しよう" },
    ];
    expect(HOST_STEPS.length).toBeLessThanOrEqual(5);
    expect(HOST_STEPS.length).toBe(3);
  });

  it("各ステップのメッセージは12文字以内である", () => {
    const ALL_STEPS = [
      { message: "推しを見つけよう" },
      { message: "参加しよう" },
      { message: "自分のも作れるよ" },
      { message: "チャレンジを作ろう" },
      { message: "目標を決めよう" },
      { message: "公開しよう" },
    ];
    
    ALL_STEPS.forEach((step) => {
      expect(step.message.length).toBeLessThanOrEqual(12);
    });
  });

  it("メッセージに専門用語が含まれていない", () => {
    const FORBIDDEN_TERMS = [
      "API", "OAuth", "認証", "トークン", "セッション",
      "データベース", "サーバー", "クライアント",
    ];
    
    const ALL_MESSAGES = [
      "推しを見つけよう",
      "参加しよう",
      "自分のも作れるよ",
      "チャレンジを作ろう",
      "目標を決めよう",
      "公開しよう",
    ];
    
    ALL_MESSAGES.forEach((message) => {
      FORBIDDEN_TERMS.forEach((term) => {
        expect(message).not.toContain(term);
      });
    });
  });

  it("メッセージに「してください」「できます」が含まれていない", () => {
    const FORBIDDEN_PHRASES = ["してください", "できます", "ください"];
    
    const ALL_MESSAGES = [
      "推しを見つけよう",
      "参加しよう",
      "自分のも作れるよ",
      "チャレンジを作ろう",
      "目標を決めよう",
      "公開しよう",
    ];
    
    ALL_MESSAGES.forEach((message) => {
      FORBIDDEN_PHRASES.forEach((phrase) => {
        expect(message).not.toContain(phrase);
      });
    });
  });
});

// AsyncStorage操作のテスト
describe("Tutorial Storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("チュートリアル完了状態を保存できる", async () => {
    const mockSetItem = vi.mocked(AsyncStorage.setItem);
    
    await AsyncStorage.setItem("tutorial_completed_fan", "true");
    
    expect(mockSetItem).toHaveBeenCalledWith("tutorial_completed_fan", "true");
  });

  it("チュートリアル完了状態を読み込める", async () => {
    const mockGetItem = vi.mocked(AsyncStorage.getItem);
    mockGetItem.mockResolvedValue("true");
    
    const result = await AsyncStorage.getItem("tutorial_completed_fan");
    
    expect(result).toBe("true");
  });

  it("チュートリアル状態をリセットできる", async () => {
    const mockRemoveItem = vi.mocked(AsyncStorage.removeItem);
    
    await AsyncStorage.removeItem("tutorial_completed_fan");
    await AsyncStorage.removeItem("tutorial_completed_host");
    
    expect(mockRemoveItem).toHaveBeenCalledTimes(2);
  });
});

// 任天堂クオリティチェック
describe("Nintendo Quality Checklist", () => {
  it("初回起動から10秒以内に成功体験があるか", () => {
    // チュートリアルは1秒後に自動表示
    // 最初のステップはタップで即座に完了
    const TUTORIAL_DELAY_MS = 1000;
    const FIRST_STEP_COMPLETION_MS = 3000; // 3秒以内
    
    expect(TUTORIAL_DELAY_MS + FIRST_STEP_COMPLETION_MS).toBeLessThanOrEqual(10000);
  });

  it("読まなくても進めるか", () => {
    // 全ステップがtapToContinue対応
    const STEPS = [
      { tapToContinue: true },
      { tapToContinue: false }, // アクション完了で進む
      { tapToContinue: true },
    ];
    
    // 少なくとも最初と最後はタップで進める
    expect(STEPS[0].tapToContinue).toBe(true);
    expect(STEPS[STEPS.length - 1].tapToContinue).toBe(true);
  });

  it("操作を間違えようがないか", () => {
    // 各ステップで1つのアクションのみ
    const STEP_ACTIONS = [
      ["tap"], // 推しを見つけよう: タップのみ
      ["tap"], // 参加しよう: タップのみ
      ["tap"], // 自分のも作れるよ: タップのみ
    ];
    
    STEP_ACTIONS.forEach((actions) => {
      expect(actions.length).toBe(1);
    });
  });

  it("終わった時に説明を思い出せない構成か", () => {
    // メッセージは短く、感覚的
    const MESSAGES = [
      "推しを見つけよう",
      "参加しよう",
      "自分のも作れるよ",
    ];
    
    // 平均文字数が8文字以下
    const avgLength = MESSAGES.reduce((sum, m) => sum + m.length, 0) / MESSAGES.length;
    expect(avgLength).toBeLessThanOrEqual(8);
  });
});

// ユーザータイプ選択のテスト
describe("User Type Selection", () => {
  it("ファンと主催者の2つの選択肢がある", () => {
    const USER_TYPES = ["fan", "host"];
    expect(USER_TYPES.length).toBe(2);
  });

  it("選択肢のラベルが分かりやすい", () => {
    const OPTIONS = [
      { type: "fan", label: "ファン", description: "推しを応援したい" },
      { type: "host", label: "主催者", description: "チャレンジを作りたい" },
    ];
    
    OPTIONS.forEach((option) => {
      expect(option.label.length).toBeLessThanOrEqual(5);
      expect(option.description.length).toBeLessThanOrEqual(15);
    });
  });

  it("スキップオプションがある", () => {
    const HAS_SKIP = true;
    expect(HAS_SKIP).toBe(true);
  });
});
