import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TutorialStep } from "@/components/organisms/tutorial-overlay";

const STORAGE_KEY_PREFIX = "tutorial_completed_";
const STORAGE_KEY_SEEN = "tutorial_seen";

export type UserType = "fan" | "host";

/**
 * ファン向けチュートリアルステップ
 * 任天堂原則：
 * - 説明しない
 * - 失敗させない
 * - 1アクション＝1学習
 */
export const FAN_TUTORIAL_STEPS: TutorialStep[] = [
  {
    message: "推しを見つけよう",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "none",
  },
  {
    message: "参加しよう",
    messagePosition: "bottom",
    tapToContinue: true,
    successAnimation: "pulse",
  },
  {
    message: "自分のも作れるよ",
    messagePosition: "top",
    tapToContinue: true,
    successAnimation: "confetti",
  },
];

/**
 * 主催者向けチュートリアルステップ
 */
export const HOST_TUTORIAL_STEPS: TutorialStep[] = [
  {
    message: "チャレンジを作ろう",
    messagePosition: "center",
    tapToContinue: true,
    successAnimation: "none",
  },
  {
    message: "目標を決めよう",
    messagePosition: "bottom",
    tapToContinue: true,
    successAnimation: "pulse",
  },
  {
    message: "公開しよう",
    messagePosition: "bottom",
    tapToContinue: true,
    successAnimation: "confetti",
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
