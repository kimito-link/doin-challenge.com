import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react-native";
import { LinkAuthResult } from "@/components/organisms/link-auth-result";

describe("LinkAuthResult", () => {
  describe("キャンセル画面", () => {
    it("キャンセル時の文言が表示される", () => {
      const onBack = vi.fn();
      
      render(
        <LinkAuthResult
          type="cancel"
          onBack={onBack}
        />
      );

      // タイトル
      expect(screen.getByText("ログインをキャンセルしました")).toBeTruthy();
      
      // りんく吹き出し
      expect(screen.getByText("またいつでもログインできるから、安心してね！")).toBeTruthy();
      
      // ボタン
      expect(screen.getByText("戻る")).toBeTruthy();
    });
  });

  describe("エラー画面", () => {
    it("ネットワークエラー時の文言が表示される", () => {
      const onRetry = vi.fn();
      const onBack = vi.fn();
      
      render(
        <LinkAuthResult
          type="error"
          errorType="network"
          onRetry={onRetry}
          onBack={onBack}
        />
      );

      // タイトル
      expect(screen.getByText("ログインできませんでした")).toBeTruthy();
      
      // りんく吹き出し（ネットワークエラー）
      expect(screen.getByText(/通信がうまくいかなかったみたい/)).toBeTruthy();
      
      // ボタン
      expect(screen.getByText("もう一度試す")).toBeTruthy();
      expect(screen.getByText("戻る")).toBeTruthy();
    });

    it("OAuthエラー時の文言が表示される", () => {
      const onRetry = vi.fn();
      const onBack = vi.fn();
      
      render(
        <LinkAuthResult
          type="error"
          errorType="oauth"
          onRetry={onRetry}
          onBack={onBack}
        />
      );

      // りんく吹き出し（OAuthエラー）
      expect(screen.getByText(/X側でエラーが起きたみたい/)).toBeTruthy();
    });

    it("その他エラー時の文言が表示される", () => {
      const onRetry = vi.fn();
      const onBack = vi.fn();
      
      render(
        <LinkAuthResult
          type="error"
          errorType="other"
          onRetry={onRetry}
          onBack={onBack}
        />
      );

      // りんく吹き出し（その他エラー）
      expect(screen.getByText(/予期しないエラーが起きちゃった/)).toBeTruthy();
    });

    it("requestIdが渡された場合に表示される", () => {
      const onRetry = vi.fn();
      const onBack = vi.fn();
      
      render(
        <LinkAuthResult
          type="error"
          errorType="network"
          requestId="ERR-12345"
          onRetry={onRetry}
          onBack={onBack}
        />
      );

      // requestIdが表示される
      expect(screen.getByText(/ERR-12345/)).toBeTruthy();
    });
  });

  describe("成功画面", () => {
    it("成功時の文言が表示される", () => {
      const onBack = vi.fn();
      
      render(
        <LinkAuthResult
          type="success"
          onBack={onBack}
        />
      );

      // タイトル
      expect(screen.getByText("ログイン完了！")).toBeTruthy();
      
      // りんく吹き出し
      expect(screen.getByText("ログインできたよ！これで参加履歴やお気に入りが見られるね！")).toBeTruthy();
      
      // ボタン
      expect(screen.getByText("マイページに戻る")).toBeTruthy();
    });
  });
});
