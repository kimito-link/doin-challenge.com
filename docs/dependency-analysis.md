# コンポーネント依存関係分析レポート

## 現状の問題点

### 1. 巨大な共有スタイルファイル

| ファイル | 行数 | 使用箇所 |
|---------|------|---------|
| experience-overlay/styles.ts | 1,284行 | ExperienceOverlay.tsx, preview-content.tsx |
| japan-region/styles.ts | 431行 | JapanRegionBlocks.tsx |
| participation-form/styles.ts | 439行 | ParticipationForm.tsx |
| settings/styles.ts | 263行 | SettingsSections.tsx |

**問題**: スタイルファイルが巨大で、1つの変更が複数コンポーネントに影響を与える可能性がある。

### 2. theme/tokensへの依存

- **222ファイル**が`@/theme/tokens`をインポート
- グローバルなカラー定義に依存しているため、テーマ変更時の影響範囲が広い

### 3. コンポーネント間の依存関係

最も多くのコンポーネントをインポートしているファイル:
1. app/event/[id].tsx - 8個のコンポーネント
2. app/_layout.tsx - 8個のコンポーネント
3. app/(tabs)/index.tsx - 6個のコンポーネント
4. app/edit-challenge/[id].tsx - 5個のコンポーネント
5. app/(tabs)/mypage.tsx - 5個のコンポーネント

## リファクタリング優先度

### 高優先度（影響範囲が大きい）

1. **experience-overlay/styles.ts** (1,284行)
   - 2つのコンポーネントで共有
   - 今回の修正で問題が発生した箇所
   - スタイルを各コンポーネントに分割すべき

2. **theme/tokens**
   - 222ファイルが依存
   - CSS変数またはテーマプロバイダーへの移行を検討

### 中優先度

3. **japan-region/styles.ts** (431行)
4. **participation-form/styles.ts** (439行)

### 低優先度

5. **settings/styles.ts** (263行)
   - 1つのコンポーネントのみで使用

## 推奨アプローチ

### 1. スタイルのコロケーション（Co-location）

各コンポーネントファイル内にスタイルを定義する:

```tsx
// Before: 外部スタイルファイル
import { styles } from "./styles";

// After: コンポーネント内にスタイル定義
const styles = StyleSheet.create({
  container: { ... },
});
```

### 2. スタイルの分割

大きなスタイルファイルを、使用するコンポーネントごとに分割:

```
experience-overlay/
  ├── ExperienceOverlay.tsx
  ├── ExperienceOverlay.styles.ts  # このコンポーネント専用
  ├── preview-content.tsx
  └── preview-content.styles.ts    # このコンポーネント専用
```

### 3. 共通スタイルの抽出

本当に共通で使うスタイルのみを`shared/`に配置:

```
shared/
  └── styles/
      ├── spacing.ts    # マージン、パディング
      ├── typography.ts # フォントサイズ、行高
      └── colors.ts     # カラーパレット
```

## 次のステップ

1. GPTに相談してベストプラクティスを確認
2. experience-overlay/styles.tsから分割を開始
3. 各変更後にテストで確認
4. 段階的にGitHubにプッシュ
