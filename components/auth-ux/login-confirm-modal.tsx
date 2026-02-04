/**
 * Phase 2: ログインUX改善
 * PR-1: LoginConfirmModalコンポーネント（ログイン確認モーダル）
 *
 * @deprecated ログイン確認は components/common/LoginModal に統一済み。新規実装では LoginModal を使用すること。
 * このファイルはPhase 2実装ガイドに基づいて作成されています。
 * docs/phase2-implementation-guide.md を参照してください。
 */

import { Modal, View, Text, Pressable } from "react-native";
import { LinkSpeech, type LinkSpeechProps } from "./link-speech";

export type LoginConfirmModalProps = {
  open: boolean;
  speech: LinkSpeechProps;
  confirmLabel: string; // "Xでログインする"
  cancelLabel: string; // "やめる"
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

/**
 * ログイン確認モーダル
 * 
 * PR-1: idle ↔ confirm の状態遷移で使用
 */
export function LoginConfirmModal({
  open,
  speech,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
}: LoginConfirmModalProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-background rounded-3xl p-6 w-full max-w-sm gap-6">
          {/* りんくの吹き出し */}
          <LinkSpeech {...speech} />

          {/* ボタン */}
          <View className="gap-3">
            {/* 確認ボタン（プライマリ） */}
            <Pressable
              onPress={onConfirm}
              disabled={busy}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`
                bg-primary rounded-full py-4 items-center
                ${busy ? "opacity-50" : ""}
              `}
            >
              <Text className="text-background font-semibold text-base">
                {confirmLabel}
              </Text>
            </Pressable>

            {/* キャンセルボタン（セカンダリ） */}
            <Pressable
              onPress={onCancel}
              disabled={busy}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`
                bg-surface border border-border rounded-full py-4 items-center
                ${busy ? "opacity-50" : ""}
              `}
            >
              <Text className="text-foreground font-semibold text-base">
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
