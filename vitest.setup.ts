// Expo環境変数をグローバルに定義
(global as any).__DEV__ = true;

// React Nativeのモック
(global as any).window = {};

// Expoのモック
vi.mock("expo", () => ({
  default: {},
}));

vi.mock("expo-modules-core", () => ({
  EventEmitter: class MockEventEmitter {
    addListener = vi.fn();
    removeListener = vi.fn();
    emit = vi.fn();
  },
}));
