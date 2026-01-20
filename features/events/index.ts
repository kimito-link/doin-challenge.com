/**
 * イベント機能モジュール
 * 
 * イベント詳細画面で使用するコンポーネント、フック、ユーティリティをエクスポート
 */

// コンポーネント
export * from "./components";

// 型定義は types/participation.ts から再エクスポート
export type { Participation, Companion, FanProfile, HostProfile, Gender } from "@/types/participation";
export { genderLabels, genderIcons, getGenderLabel, getGenderIcon } from "@/types/participation";
