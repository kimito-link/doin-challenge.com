import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TutorialStep } from "@/components/organisms/tutorial-overlay";

const STORAGE_KEY_PREFIX = "tutorial_completed_";
const STORAGE_KEY_FIRST_LAUNCH = "tutorial_first_launch";

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
    tapToContinue: false,
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
    tapToContinue: false,
    successAnimation: "pulse",
  },
  {
    message: "公開しよう",
    messagePosition: "bottom",
    tapToContinue: false,
    successAnimation: "confetti",
  },
];

type TutorialContextType = {
  /** 初回起動かどうか */
  isFirstLaunch: boolean;
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
};

const TutorialContext = createContext<TutorialContextType | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [showUserTypeSelector, setShowUserTypeSelector] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentHighlight, setCurrentHighlight] = useState<TutorialStep["highlight"]>();

  // 初期化：完了状態と初回起動を確認
  useEffect(() => {
    const initialize = async () => {
      try {
        const [fanCompleted, hostCompleted, firstLaunch] = await Promise.all([
          AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}fan`),
          AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}host`),
          AsyncStorage.getItem(STORAGE_KEY_FIRST_LAUNCH),
        ]);
        
        const completed = fanCompleted === "true" || hostCompleted === "true";
        setIsCompleted(completed);
        
        // 初回起動判定
        if (firstLaunch === null && !completed) {
          setIsFirstLaunch(true);
          // 初回起動フラグを保存
          await AsyncStorage.setItem(STORAGE_KEY_FIRST_LAUNCH, "false");
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize tutorial:", error);
        setIsInitialized(true);
      }
    };
    initialize();
  }, []);

  // 初回起動時に自動でユーザータイプ選択を表示
  useEffect(() => {
    if (isInitialized && isFirstLaunch && !isCompleted) {
      // 少し遅延させてアプリの読み込みを待つ
      const timer = setTimeout(() => {
        setShowUserTypeSelector(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isFirstLaunch, isCompleted]);

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
    setIsFirstLaunch(false);
    if (userType) {
      try {
        await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${userType}`, "true");
      } catch (error) {
        console.error("Failed to save tutorial status:", error);
      }
    }
  }, [userType]);

  const skipTutorial = useCallback(async () => {
    setShowUserTypeSelector(false);
    setIsActive(false);
    setIsCompleted(true);
    setIsFirstLaunch(false);
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}fan`, "true");
      await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}host`, "true");
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
      await AsyncStorage.removeItem(STORAGE_KEY_FIRST_LAUNCH);
      setIsCompleted(false);
      setIsFirstLaunch(true);
      setCurrentStepIndex(0);
      setUserType(null);
      setSteps([]);
    } catch (error) {
      console.error("Failed to reset tutorial:", error);
    }
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
        isFirstLaunch,
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
