/**
 * Phase 2: ログインUX改善
 * PR-3: waitingReturn状態とタイムアウト処理追加
 * 
 * このファイルはPhase 2実装ガイドに基づいて作成されています。
 * docs/phase2-implementation-guide.md を参照してください。
 */

import { useReducer, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * 認証UXの状態定義
 */
export type AuthUxState =
  | { name: "idle" }
  | { name: "confirm"; reason: "need_login" | "switch_account" }
  | { name: "redirecting" }
  | { name: "waitingReturn"; startedAt: number; timeoutMs: number }
  | { name: "success" }
  | { name: "cancel"; kind: "timeout" | "user" }
  | { name: "error"; message?: string };

/**
 * 認証UXのアクション定義
 */
export type AuthUxAction =
  | { type: "TAP_LOGIN"; reason?: "need_login" | "switch_account" }
  | { type: "CONFIRM_YES" }
  | { type: "CONFIRM_NO" }
  | { type: "REDIRECTING_START" }
  | { type: "WAITING_RETURN_START"; startedAt: number; timeoutMs: number }
  | { type: "SUCCESS" }
  | { type: "CANCEL"; kind: "timeout" | "user" }
  | { type: "ERROR"; message?: string }
  | { type: "RETRY" }
  | { type: "BACK_WITHOUT_LOGIN" }
  | { type: "RESET" };

/**
 * FSM reducer（状態遷移ロジック）
 * 
 * PR-1では idle ↔ confirm のみ実装
 * 他の状態は後続PRで追加
 */
function authUxReducer(state: AuthUxState, action: AuthUxAction): AuthUxState {
  switch (action.type) {
    case "TAP_LOGIN":
      // idle → confirm（確認を挟む方針）
      if (state.name === "idle") {
        return {
          name: "confirm",
          reason: action.reason || "need_login",
        };
      }
      return state;

    case "CONFIRM_YES":
      // confirm → redirecting
      if (state.name === "confirm") {
        return { name: "redirecting" };
      }
      return state;

    case "CONFIRM_NO":
      // confirm → idle
      if (state.name === "confirm") {
        return { name: "idle" };
      }
      return state;

    case "RESET":
      // どの状態からでも idle に戻る
      return { name: "idle" };

    case "REDIRECTING_START":
      // idle/confirm → redirecting
      if (state.name === "idle" || state.name === "confirm") {
        return { name: "redirecting" };
      }
      return state;

    case "CANCEL":
      // キャンセルされたら idle に戻る
      return { name: "idle" };

    case "WAITING_RETURN_START":
      // redirecting → waitingReturn
      if (state.name === "redirecting") {
        return {
          name: "waitingReturn",
          startedAt: action.startedAt,
          timeoutMs: action.timeoutMs,
        };
      }
      return state;

    // 以下は後続PRで実装予定
    case "SUCCESS":
    case "ERROR":
    case "RETRY":
    case "BACK_WITHOUT_LOGIN":
      // PR-3では未実装
      return state;

    default:
      return state;
  }
}

/**
 * 認証UX状態管理フック
 * 
 * PR-3: idle → confirm → redirecting → waitingReturn まで実装
 * 
 * @returns 状態と状態遷移関数
 */
export function useAuthUxMachine() {
  const [state, dispatch] = useReducer(authUxReducer, { name: "idle" });
  const { login } = useAuth();

  // タイムアウト処理（waitingReturn状態で30秒経過したらcancel）
  useEffect(() => {
    if (state.name !== "waitingReturn") return;

    const elapsed = Date.now() - state.startedAt;
    const remaining = state.timeoutMs - elapsed;

    if (remaining <= 0) {
      // すでにタイムアウト
      dispatch({ type: "CANCEL", kind: "timeout" });
      return;
    }

    // タイマー設定
    const timer = setTimeout(() => {
      dispatch({ type: "CANCEL", kind: "timeout" });
    }, remaining);

    return () => clearTimeout(timer);
  }, [state]);

  // ログインボタンタップ
  const tapLogin = useCallback(
    (reason?: "need_login" | "switch_account") => {
      dispatch({ type: "TAP_LOGIN", reason });
    },
    []
  );

  // 確認モーダルで「はい」
  const confirmYes = useCallback(async () => {
    dispatch({ type: "CONFIRM_YES" });
    // redirecting状態に遷移後、login()を呼び出す
    try {
      await login();
      // login()成功後、waitingReturn状態に遷移（30秒タイムアウト）
      dispatch({
        type: "WAITING_RETURN_START",
        startedAt: Date.now(),
        timeoutMs: 30000, // 30秒
      });
    } catch (error) {
      // エラーは無視（Auth Contextが管理）
      console.error("[useAuthUxMachine] login() error:", error);
      // waitingReturn状態に遷移（エラー検知はAuth Contextで行う）
      dispatch({
        type: "WAITING_RETURN_START",
        startedAt: Date.now(),
        timeoutMs: 30000,
      });
    }
  }, [login]);

  // 確認モーダルで「いいえ」
  const confirmNo = useCallback(() => {
    dispatch({ type: "CONFIRM_NO" });
  }, []);

  // リセット（idle に戻る）
  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    tapLogin,
    confirmYes,
    confirmNo,
    reset,
  };
}
