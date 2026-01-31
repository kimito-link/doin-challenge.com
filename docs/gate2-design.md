# Gate 2: E2Eテストと品質保証の設計

## 目的

Gate 1（diff-check + こまめなバージョン管理）で「危険な変更の早期検知」を実現した。Gate 2では、**主要フローの保証**と**パフォーマンス監視**を実現し、「5歩進んだら7歩下がる」問題を完全に解消する。

---

## Gate 1との違い

| 項目 | Gate 1 | Gate 2 |
|------|--------|--------|
| **目的** | 危険な変更の早期検知 | 主要フローの保証 |
| **検知対象** | OAuth、DB、Routing、Build | ログイン、チャレンジ作成、参加表明 |
| **実行タイミング** | commit前、PR作成時 | PR作成時、リリース前 |
| **実行時間** | 数秒 | 数分〜数十分 |
| **ツール** | diff-check（bash） | vitest + Detox |

---

## テスト戦略（3層構造）

### **Layer 1: ユニット/統合テスト**（高速、頻繁に実行）

**ツール**: vitest + Jest + React Native Testing Library

**対象**:
- **データベース層**: SQLクエリ、ORM、トランザクション
- **API層**: tRPCプロシージャ、ビジネスロジック、バリデーション
- **コンポーネント層**: UIレンダリング、インタラクション、状態管理

**実行タイミング**:
- commit前（pre-commit hook）
- PR作成時（GitHub Actions）
- CI/CD（すべてのpush）

**カバレッジ目標**: 80%以上

**例**:
```typescript
// server/db/challenge-db.test.ts
describe("getAllEventsWithGenderStats", () => {
  it("should return events with gender statistics", async () => {
    const events = await getAllEventsWithGenderStats();
    expect(events[0]).toHaveProperty("maleCount");
    expect(events[0]).toHaveProperty("femaleCount");
    expect(events[0]).toHaveProperty("unspecifiedCount");
  });
});
```

---

### **Layer 2: E2Eテスト**（中速、主要フローのみ）

**ツール**: Detox

**対象**:
- **主要ユーザーフロー**:
  1. ログイン（OAuth）
  2. チャレンジ作成
  3. 参加表明
  4. プロフィール編集
  5. チャレンジ検索
- **ネイティブ機能**:
  1. カメラ（プロフィール画像アップロード）
  2. 位置情報（地域別統計）
  3. プッシュ通知（チャレンジ開始通知）

**実行タイミング**:
- PR作成時（主要フローのみ、GitHub Actions）
- リリース前（すべてのフロー、手動）
- CI/CD（mainブランチへのmerge時）

**カバレッジ目標**: 主要フロー5つ + ネイティブ機能3つ = 8シナリオ

**例**:
```typescript
// e2e/login.e2e.ts
describe("Login Flow", () => {
  it("should login with OAuth", async () => {
    await element(by.id("login-button")).tap();
    await waitFor(element(by.id("home-screen"))).toBeVisible().withTimeout(5000);
    await expect(element(by.id("user-avatar"))).toBeVisible();
  });
});
```

---

### **Layer 3: 手動テスト**（低速、リリース前のみ）

**ツール**: 実機（iOS、Android）

**対象**:
- **UI/UX**: デザイン、アニメーション、レスポンシブ
- **パフォーマンス**: 起動時間、画面遷移、メモリ使用量
- **デバイス固有の問題**: 画面サイズ、OS バージョン、ネットワーク状態

**実行タイミング**:
- リリース前
- 重大なバグ修正後

**チェックリスト**:
- [ ] 起動時間が3秒以内
- [ ] 画面遷移がスムーズ（60fps）
- [ ] メモリ使用量が200MB以内
- [ ] オフライン時の挙動が正しい
- [ ] 低速ネットワーク時の挙動が正しい

---

## Gate 2の実装計画

### Phase 1: Jest + React Native Testing Libraryのセットアップ

1. **パッケージのインストール**
```bash
pnpm add -D @testing-library/react-native @testing-library/jest-native
```

2. **jest.config.jsの作成**
```javascript
module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo)/)",
  ],
};
```

3. **サンプルテストの作成**
```typescript
// features/home/components/ChallengeCard.test.tsx
import { render } from "@testing-library/react-native";
import { ChallengeCard } from "./ChallengeCard";

describe("ChallengeCard", () => {
  it("should render gender statistics", () => {
    const challenge = {
      id: 1,
      title: "Test Challenge",
      maleCount: 10,
      femaleCount: 20,
      unspecifiedCount: 5,
      totalParticipants: 35,
    };
    
    const { getByText } = render(<ChallengeCard challenge={challenge} />);
    expect(getByText("10")).toBeTruthy(); // maleCount
    expect(getByText("20")).toBeTruthy(); // femaleCount
    expect(getByText("5")).toBeTruthy(); // unspecifiedCount
  });
});
```

---

### Phase 2: Detoxのセットアップ

1. **パッケージのインストール**
```bash
pnpm add -D detox detox-cli
```

2. **.detoxrc.jsの作成**
```javascript
module.exports = {
  testRunner: {
    args: {
      $0: "jest",
      config: "e2e/jest.config.js",
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/YourApp.app",
      build: "xcodebuild -workspace ios/YourApp.xcworkspace -scheme YourApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 15",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_5_API_33",
      },
    },
  },
  configurations: {
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.debug",
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.debug",
    },
  },
};
```

3. **サンプルE2Eテストの作成**
```typescript
// e2e/login.e2e.ts
describe("Login Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should login with OAuth", async () => {
    await element(by.id("login-button")).tap();
    await waitFor(element(by.id("home-screen")))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.id("user-avatar"))).toBeVisible();
  });
});
```

---

### Phase 3: CI/CD統合（GitHub Actions）

1. **.github/workflows/gate2.ymlの作成**
```yaml
name: Gate 2 - E2E Tests

on:
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "22"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "22"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm detox build --configuration ios.sim.debug
      - run: pnpm detox test --configuration ios.sim.debug
```

---

## パフォーマンステスト基準

### 起動時間
- **目標**: 3秒以内
- **測定方法**: `react-native-performance`

### 画面遷移
- **目標**: 60fps
- **測定方法**: `react-native-performance`

### メモリ使用量
- **目標**: 200MB以内
- **測定方法**: Xcode Instruments / Android Profiler

### ネットワークリクエスト
- **目標**: 2秒以内
- **測定方法**: `react-native-performance`

---

## 次のステップ

1. **v6.177〜v6.178を完了**
   - すべての機能が正しく動作することを確認
   - Gate 1 + こまめなバージョン管理のワークフローが成功したことを記録

2. **Jest + React Native Testing Libraryのセットアップ**
   - パッケージのインストール
   - jest.config.jsの作成
   - サンプルテストの作成

3. **Detoxのセットアップ**
   - パッケージのインストール
   - .detoxrc.jsの作成
   - サンプルE2Eテストの作成

4. **CI/CD統合**
   - .github/workflows/gate2.ymlの作成
   - GitHub Actionsでテストを実行

---

## 参考資料

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox](https://wix.github.io/Detox/)
- [Expo + Detox](https://docs.expo.dev/build-reference/e2e-tests/)
- [vitest](https://vitest.dev/)
- [react-native-performance](https://github.com/oblador/react-native-performance)
