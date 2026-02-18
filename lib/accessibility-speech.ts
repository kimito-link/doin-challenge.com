/**
 * アクセシビリティ音声フィードバックユーティリティ
 * 
 * 視覚障害者のユーザーに対して、重要な操作の完了時に音声フィードバックを提供します。
 * expo-speechを使用して、日本語のテキストを音声で読み上げます。
 */

import * as Speech from "expo-speech";
import { Platform } from "react-native";

/**
 * 音声フィードバックのオプション
 */
interface SpeechOptions {
  /** 音声の速度 (0.5 - 2.0, デフォルト: 1.0) */
  rate?: number;
  /** 音声のピッチ (0.5 - 2.0, デフォルト: 1.0) */
  pitch?: number;
  /** 言語 (デフォルト: "ja-JP") */
  language?: string;
}

/**
 * テキストを音声で読み上げます
 * 
 * @param text 読み上げるテキスト
 * @param options 音声のオプション
 */
export async function speak(text: string, options?: SpeechOptions): Promise<void> {
  // Webでは音声フィードバックを無効化（ブラウザの音声合成は品質が低いため）
  if (Platform.OS === "web") {
    return;
  }

  try {
    // 既に読み上げ中の場合は停止
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    // 音声を読み上げ
    await Speech.speak(text, {
      language: options?.language || "ja-JP",
      rate: options?.rate || 1.0,
      pitch: options?.pitch || 1.0,
    });
  } catch (error) {
    console.error("音声フィードバックエラー:", error);
  }
}

/**
 * 成功メッセージを音声で読み上げます
 * 
 * @param message 成功メッセージ
 */
export async function speakSuccess(message: string): Promise<void> {
  await speak(message, { pitch: 1.1 }); // 少し高めのピッチで成功を表現
}

/**
 * エラーメッセージを音声で読み上げます
 * 
 * @param message エラーメッセージ
 */
export async function speakError(message: string): Promise<void> {
  await speak(message, { pitch: 0.9 }); // 少し低めのピッチでエラーを表現
}

/**
 * 情報メッセージを音声で読み上げます
 * 
 * @param message 情報メッセージ
 */
export async function speakInfo(message: string): Promise<void> {
  await speak(message);
}

/**
 * 音声の読み上げを停止します
 */
export async function stopSpeaking(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await Speech.stop();
  } catch (error) {
    console.error("音声停止エラー:", error);
  }
}

/**
 * 音声が読み上げ中かどうかを確認します
 */
export async function isSpeaking(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error("音声状態確認エラー:", error);
    return false;
  }
}
