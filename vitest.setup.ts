// Expo環境変数をグローバルに定義
(global as any).__DEV__ = true;

// React Nativeのモック
(global as any).window = {};
