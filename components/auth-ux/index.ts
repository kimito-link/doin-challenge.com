/**
 * Phase 2: ログインUX改善
 * コンポーネントの統一エクスポート
 */

export { LinkSpeech, type LinkSpeechProps, type LinkSpeechTone } from "./link-speech";
/** @deprecated ログイン確認は components/common/LoginModal を使用すること */
export { LoginConfirmModal, type LoginConfirmModalProps } from "./login-confirm-modal";
export { RedirectingScreen, type RedirectingScreenProps } from "./redirecting-screen";
export { WaitingReturnScreen, type WaitingReturnScreenProps } from "./waiting-return-screen";
