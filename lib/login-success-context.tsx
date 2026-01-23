/**
 * ログイン成功コンテキスト
 * 
 * v6.63: 初回ログイン判定機能を追加
 * - 初回ログイン時は RoleSelectionModal を表示
 * - 2回目以降は WelcomeModal を表示
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

const LOGIN_SUCCESS_KEY = "login_success_pending";
const FIRST_LOGIN_KEY = "has_logged_in_before";

interface LoginSuccessContextType {
  showLoginSuccess: boolean;
  userName: string | null;
  userProfileImage: string | null;
  prefecture: string | null;
  isFirstLogin: boolean;
  triggerLoginSuccess: (name?: string, profileImage?: string, prefecture?: string) => void;
  dismissLoginSuccess: () => void;
}

const LoginSuccessContext = createContext<LoginSuccessContextType | null>(null);

export function LoginSuccessProvider({ children }: { children: ReactNode }) {
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [prefecture, setPrefecture] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // 起動時にペンディングのログイン成功があるか確認
  useEffect(() => {
    const checkPendingLoginSuccess = async () => {
      try {
        const pending = await AsyncStorage.getItem(LOGIN_SUCCESS_KEY);
        if (pending) {
          const data = JSON.parse(pending);
          setUserName(data.name || null);
          setUserProfileImage(data.profileImage || null);
          setPrefecture(data.prefecture || null);
          
          // 初回ログインかどうかを判定
          const hasLoggedInBefore = await AsyncStorage.getItem(FIRST_LOGIN_KEY);
          setIsFirstLogin(!hasLoggedInBefore);
          
          // 初回ログインフラグを保存
          if (!hasLoggedInBefore) {
            await AsyncStorage.setItem(FIRST_LOGIN_KEY, "true");
          }
          
          setShowLoginSuccess(true);
          await AsyncStorage.removeItem(LOGIN_SUCCESS_KEY);
        }
      } catch (err) {
        console.error("[LoginSuccess] Failed to check pending:", err);
      }
    };
    checkPendingLoginSuccess();
  }, []);

  const triggerLoginSuccess = useCallback(async (name?: string, profileImage?: string, pref?: string) => {
    setUserName(name || null);
    setUserProfileImage(profileImage || null);
    setPrefecture(pref || null);
    
    // 初回ログインかどうかを判定
    const hasLoggedInBefore = await AsyncStorage.getItem(FIRST_LOGIN_KEY);
    setIsFirstLogin(!hasLoggedInBefore);
    
    // 初回ログインフラグを保存
    if (!hasLoggedInBefore) {
      await AsyncStorage.setItem(FIRST_LOGIN_KEY, "true");
    }
    
    setShowLoginSuccess(true);
  }, []);

  const dismissLoginSuccess = useCallback(() => {
    setShowLoginSuccess(false);
    setUserName(null);
    setUserProfileImage(null);
    setPrefecture(null);
    setIsFirstLogin(false);
  }, []);

  return (
    <LoginSuccessContext.Provider
      value={{
        showLoginSuccess,
        userName,
        userProfileImage,
        prefecture,
        isFirstLogin,
        triggerLoginSuccess,
        dismissLoginSuccess,
      }}
    >
      {children}
    </LoginSuccessContext.Provider>
  );
}

export function useLoginSuccess() {
  const context = useContext(LoginSuccessContext);
  if (!context) {
    throw new Error("useLoginSuccess must be used within LoginSuccessProvider");
  }
  return context;
}

// OAuthコールバックからログイン成功を保存する関数
export async function saveLoginSuccessPending(name?: string, profileImage?: string, prefecture?: string) {
  try {
    await AsyncStorage.setItem(
      LOGIN_SUCCESS_KEY,
      JSON.stringify({ name, profileImage, prefecture })
    );
  } catch (err) {
    console.error("[LoginSuccess] Failed to save pending:", err);
  }
}
