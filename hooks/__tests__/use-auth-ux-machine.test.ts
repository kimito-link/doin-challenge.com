/**
 * Phase 2: ログインUX改善
 * PR-1: useAuthUxMachine のユニットテスト
 * 
 * FSMの状態遷移をテスト（idle ↔ confirm のみ）
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthUxMachine } from "../use-auth-ux-machine";

describe("useAuthUxMachine (PR-1: idle ↔ confirm)", () => {
  it("初期状態は idle", () => {
    const { result } = renderHook(() => useAuthUxMachine());
    expect(result.current.state.name).toBe("idle");
  });

  it("tapLogin で idle → confirm に遷移", () => {
    const { result } = renderHook(() => useAuthUxMachine());

    act(() => {
      result.current.tapLogin();
    });

    expect(result.current.state.name).toBe("confirm");
    if (result.current.state.name === "confirm") {
      expect(result.current.state.reason).toBe("need_login");
    }
  });

  it("tapLogin(reason) で理由を指定できる", () => {
    const { result } = renderHook(() => useAuthUxMachine());

    act(() => {
      result.current.tapLogin("switch_account");
    });

    expect(result.current.state.name).toBe("confirm");
    if (result.current.state.name === "confirm") {
      expect(result.current.state.reason).toBe("switch_account");
    }
  });

  it("confirmNo で confirm → idle に遷移", () => {
    const { result } = renderHook(() => useAuthUxMachine());

    // idle → confirm
    act(() => {
      result.current.tapLogin();
    });
    expect(result.current.state.name).toBe("confirm");

    // confirm → idle
    act(() => {
      result.current.confirmNo();
    });
    expect(result.current.state.name).toBe("idle");
  });

  it("confirmYes は PR-1 では何もしない（次のPRで実装）", () => {
    const { result } = renderHook(() => useAuthUxMachine());

    // idle → confirm
    act(() => {
      result.current.tapLogin();
    });
    expect(result.current.state.name).toBe("confirm");

    // confirmYes（PR-1では何もしない）
    act(() => {
      result.current.confirmYes();
    });
    expect(result.current.state.name).toBe("confirm"); // 状態変化なし
  });

  it("reset で任意の状態から idle に戻る", () => {
    const { result } = renderHook(() => useAuthUxMachine());

    // idle → confirm
    act(() => {
      result.current.tapLogin();
    });
    expect(result.current.state.name).toBe("confirm");

    // reset → idle
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.name).toBe("idle");
  });

  it("idle 状態で confirmNo を呼んでも状態変化なし", () => {
    const { result } = renderHook(() => useAuthUxMachine());

    expect(result.current.state.name).toBe("idle");

    act(() => {
      result.current.confirmNo();
    });

    expect(result.current.state.name).toBe("idle"); // 変化なし
  });

  it("idle 状態で confirmYes を呼んでも状態変化なし", () => {
    const { result } = renderHook(() => useAuthUxMachine());

    expect(result.current.state.name).toBe("idle");

    act(() => {
      result.current.confirmYes();
    });

    expect(result.current.state.name).toBe("idle"); // 変化なし
  });
});
