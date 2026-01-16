import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TutorialStep } from "@/components/organisms/tutorial-overlay";

const STORAGE_KEY_PREFIX = "tutorial_completed_";
const STORAGE_KEY_SEEN = "tutorial_seen";

export type UserType = "fan" | "host";

/**
 * ファン向けチュートリアルステップ（ベネフィット起点版）
 * 
 * 設計思想：
 * 「この機能があります」ではなく「こうなれます」を先に伝える
 * ベネフィット → だからこの機能がある → 使い方
 */
export const FAN_TUTORIAL_STEPS: TutorialStep[] = [
  // ========================================
  // ベネフィット1：推しに認知されたい
  // ========================================
  {
    message: "推しに認知されたい？",
    subMessage: "イベントに行っても、モブの一人で終わってない？",
    character: "rinku_normal",
    speech: "せっかく遠征したのに、覚えてもらえない...悲しいよね",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "none",
    previewType: "none",
  },
  {
    message: "認知される方法がある！",
    subMessage: "参加表明すると、あなたの名前が運営に届く",
    character: "konta_normal",
    speech: "このアプリで参加表明すると、運営さんがあなたを認識できるんだ！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "sparkle",
    previewType: "participants",
  },
  // ========================================
  // ベネフィット2：ファンサをもらいたい
  // ========================================
  {
    message: "ファンサをもらいたい？",
    subMessage: "握手会で名前を呼ばれたり、特別対応されたくない？",
    character: "rinku_smile",
    speech: "「〇〇さん、いつもありがとう！」って言われたら嬉しいよね！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "none",
    previewType: "none",
  },
  {
    message: "常連になれば叶うかも！",
    subMessage: "何度も参加すると「常連バッジ」がついて、運営に覚えてもらえる",
    character: "tanune_smile",
    speech: "リピーターさんは運営も大切にしたいの。特別扱いされる確率UP！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "sparkle",
    previewType: "crown",
  },
  // ========================================
  // ベネフィット3：他のファンより優位に立ちたい
  // ========================================
  {
    message: "古参アピールしたい？",
    subMessage: "「私、初期から応援してます」って証明したくない？",
    character: "konta_smile",
    speech: "参加履歴が残るから、古参の証明になるよ！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "pulse",
    previewType: "notification",
  },
  // ========================================
  // CTA
  // ========================================
  {
    message: "推しを探そう！",
    subMessage: "さっそくチャレンジを見て、参加表明してみよう",
    character: "kimitolink",
    speech: "一緒に推し活しよう！認知されるチャンス！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "confetti",
    previewType: "none",
  },
];

/**
 * 主催者向けチュートリアルステップ（ベネフィット起点版）
 * 
 * 設計思想：
 * 主催者の「悩み」から入り、「解決策」として機能を紹介
 * ベネフィット → だからこの機能がある → 具体的なシナリオ
 */
export const HOST_TUTORIAL_STEPS: TutorialStep[] = [
  // ========================================
  // ベネフィット1：赤字を出したくない
  // ========================================
  {
    message: "赤字を出したくない？",
    subMessage: "100人の会場を借りたのに30人しか来なかった...そんな経験ない？",
    character: "tanune_normal",
    speech: "会場費だけで赤字...イベント運営あるあるよね...",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "none",
    previewType: "none",
  },
  {
    message: "事前に人数がわかる！",
    subMessage: "参加表明した人数をリアルタイムで確認できる",
    character: "konta_normal",
    speech: "「今50人参加表明してる」ってわかるから、適切な会場を選べるよ！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "sparkle",
    previewType: "participants",
  },
  // ========================================
  // ベネフィット2：遠征ライブを成功させたい
  // ========================================
  {
    message: "遠征ライブを成功させたい？",
    subMessage: "地方でライブしたいけど、人が来るかわからない...",
    character: "rinku_normal",
    speech: "北海道でライブしたいけど、需要あるのかな...",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "none",
    previewType: "none",
  },
  {
    message: "どこから来るかわかる！",
    subMessage: "参加者の地域をマップで確認できる",
    character: "konta_smile",
    speech: "北海道から東京に来てる人が多い！→北海道でライブできるかも！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "sparkle",
    previewType: "map",
  },
  {
    message: "遠征ライブの判断材料に！",
    subMessage: "京都から来る人が多ければ、京都でライブ開催の目安になる",
    character: "tanune_smile",
    speech: "データを見て「ここなら人が集まる」って判断できるわ",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "pulse",
    previewType: "map",
  },
  // ========================================
  // ベネフィット3：急なトラブルに対応したい
  // ========================================
  {
    message: "急なキャンセル、困る？",
    subMessage: "当日「仕事で行けなくなりました」...穴埋めどうする？",
    character: "tanune_normal",
    speech: "せっかくの枠が空いちゃう...もったいないわよね",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "none",
    previewType: "none",
  },
  {
    message: "すぐ連絡できる！",
    subMessage: "参加者のTwitterアカウントがわかるから、代わりを募集できる",
    character: "konta_normal",
    speech: "「1枠空きました！」ってすぐツイートで呼びかけられるね",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "sparkle",
    previewType: "notification",
  },
  // ========================================
  // ベネフィット4：ファンを大切にしたい
  // ========================================
  {
    message: "ファンを大切にしたい？",
    subMessage: "いつも来てくれる人に、感謝を伝えたくない？",
    character: "rinku_smile",
    speech: "リピーターさんには特別なファンサしたいよね！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "none",
    previewType: "none",
  },
  {
    message: "常連がひと目でわかる！",
    subMessage: "参加回数が多いファンには「常連バッジ」がつく",
    character: "tanune_smile",
    speech: "「〇〇さん、10回目の参加ありがとう！」って言えるわ",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "sparkle",
    previewType: "crown",
  },
  // ========================================
  // おまけ：データで準備
  // ========================================
  {
    message: "データで準備万端！",
    subMessage: "男女比やフォロワー数も確認できる",
    character: "konta_smile",
    speech: "グッズの数や演出の参考になるね！インフルエンサーも見つかるかも",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "pulse",
    previewType: "chart",
  },
  // ========================================
  // CTA
  // ========================================
  {
    message: "作ってみよう！",
    subMessage: "さっそくチャレンジを作成して、ファンを集めよう",
    character: "kimitolink",
    speech: "素敵なイベントにしよう！",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "confetti",
    previewType: "none",
  },
];

type TutorialContextType = {
  /** チュートリアル未視聴かどうか */
  hasNotSeenTutorial: boolean;
  /** ユーザータイプ選択画面を表示中か */
  showUserTypeSelector: boolean;
  /** チュートリアル表示中かどうか */
  isActive: boolean;
  /** 現在のステップ（0から開始） */
  currentStepIndex: number;
  /** 現在のステップデータ */
  currentStep: TutorialStep | null;
  /** 総ステップ数 */
  totalSteps: number;
  /** ユーザータイプ選択を開始 */
  showTypeSelector: () => void;
  /** ユーザータイプを選択してチュートリアル開始 */
  selectUserType: (userType: UserType) => void;
  /** 次のステップに進む */
  nextStep: () => void;
  /** 特定のステップを完了としてマーク（アクション完了時） */
  completeCurrentStep: () => void;
  /** チュートリアルを終了 */
  completeTutorial: () => void;
  /** チュートリアルをスキップ */
  skipTutorial: () => void;
  /** チュートリアル完了済みかどうか */
  isCompleted: boolean;
  /** 現在のユーザータイプ */
  userType: UserType | null;
  /** ハイライト位置を更新 */
  setHighlight: (highlight: TutorialStep["highlight"]) => void;
  /** チュートリアル完了状態をリセット（設定画面用） */
  resetTutorial: () => Promise<void>;
  /** 初期化完了 */
  isInitialized: boolean;
  /** ログイン誘導モーダルを表示中か */
  showLoginPrompt: boolean;
  /** ログイン誘導モーダルを閉じる */
  dismissLoginPrompt: () => void;
};

const TutorialContext = createContext<TutorialContextType | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasNotSeenTutorial, setHasNotSeenTutorial] = useState(false);
  const [showUserTypeSelector, setShowUserTypeSelector] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentHighlight, setCurrentHighlight] = useState<TutorialStep["highlight"]>();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 初期化：チュートリアル視聴状態を確認（ログイン状態に依存しない）
  useEffect(() => {
    const initialize = async () => {
      try {
        const seen = await AsyncStorage.getItem(STORAGE_KEY_SEEN);
        
        // 一度も見ていない場合
        if (seen === null) {
          setHasNotSeenTutorial(true);
          setIsCompleted(false);
        } else {
          setHasNotSeenTutorial(false);
          setIsCompleted(true);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize tutorial:", error);
        setIsInitialized(true);
      }
    };
    initialize();
  }, []);

  // 初回起動時に自動でユーザータイプ選択を表示（ログイン不要）
  useEffect(() => {
    if (isInitialized && hasNotSeenTutorial && !isCompleted) {
      // 即座に表示（アプリ起動直後）
      const timer = setTimeout(() => {
        setShowUserTypeSelector(true);
      }, 500); // 0.5秒後に表示
      return () => clearTimeout(timer);
    }
  }, [isInitialized, hasNotSeenTutorial, isCompleted]);

  const showTypeSelector = useCallback(() => {
    setShowUserTypeSelector(true);
  }, []);

  const selectUserType = useCallback((type: UserType) => {
    setUserType(type);
    setSteps(type === "fan" ? FAN_TUTORIAL_STEPS : HOST_TUTORIAL_STEPS);
    setCurrentStepIndex(0);
    setShowUserTypeSelector(false);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentHighlight(undefined);
    } else {
      completeTutorial();
    }
  }, [currentStepIndex, steps.length]);

  const completeCurrentStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const completeTutorial = useCallback(async () => {
    setIsActive(false);
    setIsCompleted(true);
    setHasNotSeenTutorial(false);
    
    // チュートリアル完了後、ログイン誘導モーダルを表示
    setTimeout(() => {
      setShowLoginPrompt(true);
    }, 500);
    
    try {
      // チュートリアル視聴済みフラグを保存
      await AsyncStorage.setItem(STORAGE_KEY_SEEN, "true");
      if (userType) {
        await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${userType}`, "true");
      }
    } catch (error) {
      console.error("Failed to save tutorial status:", error);
    }
  }, [userType]);

  const skipTutorial = useCallback(async () => {
    setShowUserTypeSelector(false);
    setIsActive(false);
    setIsCompleted(true);
    setHasNotSeenTutorial(false);
    try {
      // スキップした場合も視聴済みとして保存
      await AsyncStorage.setItem(STORAGE_KEY_SEEN, "true");
    } catch (error) {
      console.error("Failed to save tutorial status:", error);
    }
  }, []);

  const setHighlight = useCallback((highlight: TutorialStep["highlight"]) => {
    setCurrentHighlight(highlight);
  }, []);

  const resetTutorial = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEY_PREFIX}fan`);
      await AsyncStorage.removeItem(`${STORAGE_KEY_PREFIX}host`);
      await AsyncStorage.removeItem(STORAGE_KEY_SEEN);
      setIsCompleted(false);
      setHasNotSeenTutorial(true);
      setCurrentStepIndex(0);
      setUserType(null);
      setSteps([]);
      setShowLoginPrompt(false);
      // リセット後、即座にユーザータイプ選択を表示
      setTimeout(() => {
        setShowUserTypeSelector(true);
      }, 100);
    } catch (error) {
      console.error("Failed to reset tutorial:", error);
    }
  }, []);

  const dismissLoginPrompt = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  // 現在のステップにハイライト情報をマージ
  const currentStep = steps[currentStepIndex]
    ? {
        ...steps[currentStepIndex],
        highlight: currentHighlight || steps[currentStepIndex].highlight,
      }
    : null;

  return (
    <TutorialContext.Provider
      value={{
        hasNotSeenTutorial,
        showUserTypeSelector,
        isActive,
        currentStepIndex,
        currentStep,
        totalSteps: steps.length,
        showTypeSelector,
        selectUserType,
        nextStep,
        completeCurrentStep,
        completeTutorial,
        skipTutorial,
        isCompleted,
        userType,
        setHighlight,
        resetTutorial,
        isInitialized,
        showLoginPrompt,
        dismissLoginPrompt,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
