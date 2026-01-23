# ChatGPT相談用ドキュメント：doin-challenge カラーシステム問題

## 概要

React Native/Expo/TypeScript製モバイルアプリ「君斗りんくの動員ちゃれんじ」（クリエイター動員支援アプリ）において、カラーシステムの仕様準拠とCI/CDパイプラインの問題について相談します。

## 現在の状況

### 1. 確認仕様書の内容

ユーザーと合意した仕様確定メモの主要ポイント：

| 項目 | 仕様 | 現在の状態 |
|------|------|-----------|
| ベースカラー | 純粋な黒 | ✅ `#0a0a0a` に変更済み |
| 黄色 | 完全廃止 | ✅ 全てピンクに置き換え済み |
| アクセント色 | ピンク `#EC4899`、紫 `#8B5CF6`、ティール `#0F766E` のみ | ✅ 実装済み |
| アクセント色の使用箇所 | アイコン・ボーダー・左線のみ（背景塗り・文字色には使わない） | ✅ 実装済み |
| 性別表示 | 応援コメントカードのみ、左ボーダー + 小アイコン | ✅ 実装済み |

### 2. テスト失敗の詳細

**失敗テスト:** `__tests__/a11y/design-system.a11y.test.ts`

```
FAIL  セカンダリテキストと背景のコントラスト比が4.5:1以上であること
AssertionError: expected 4.175355408197547 to be greater than or equal to 4.5
```

**原因:**
- セカンダリテキスト: `#737373` (palette.gray400)
- 背景: `#0a0a0a` (palette.gray900)
- 計算されたコントラスト比: **4.17:1**
- WCAG AA基準: **4.5:1以上**

### 3. palette.ts の現在の構造

```typescript
// Neutral (text) - 視認性確保
gray500: "#525252",       // hint text
gray400: "#737373",       // secondary text / placeholder
gray300: "#a3a3a3",       // muted text
gray200: "#d4d4d4",       // subtle text
gray100: "#e5e5e5",       // primary text（最も明るい）
```

## 問題の本質

1. **黒ベースへの変更時にコントラスト比が低下**
   - 以前のダークティール背景 `#023047` から純粋な黒 `#0a0a0a` に変更
   - 背景が暗くなったことで、セカンダリテキストとのコントラストが不足

2. **解決策の選択肢**

| 選択肢 | 変更内容 | コントラスト比 | 影響範囲 |
|--------|----------|---------------|---------|
| A | gray400を `#8a8a8a` に変更 | 約5.0:1 | セカンダリテキスト全体 |
| B | gray400を `#858585` に変更 | 約4.7:1 | セカンダリテキスト全体 |
| C | 背景を `#0f0f0f` に変更 | 約4.5:1 | 全画面の背景 |

## 相談事項

### 質問1: セカンダリテキストの色調整

セカンダリテキスト（`gray400`）を明るくしてコントラスト比4.5:1以上を確保する場合、どの程度の明るさが適切でしょうか？

**考慮点:**
- WCAG AA準拠（4.5:1以上）
- プライマリテキスト（`#e5e5e5`）との視覚的階層の維持
- ダークモードでの読みやすさ

### 質問2: GitHub Actions E2Eテストの失敗

GitHub Actionsのワークフローで、E2Eテストが本番環境に対して実行されていますが、以下の問題があります：

1. **Vercel Deployment Protection** - 本番URLへのアクセスにバイパスシークレットが必要
2. **E2E Admin Bypass** - 開発環境でのみ有効な認証バイパスが本番では無効

**現在の設定:**
```yaml
env:
  PLAYWRIGHT_BASE_URL: ${{ needs.frontend.outputs.deployment_url || env.PROD_URL }}
  VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
```

**質問:** E2Eテストを本番環境に対して実行するのは適切でしょうか？それとも、プレビュー環境やステージング環境に対して実行すべきでしょうか？

### 質問3: 本番DBとの整合性

本番DBには「Host」「Cabaret Girl」「Band」などのカテゴリが存在しますが、開発DBには「Live/Concert」「Streaming Event」などが存在します。

**質問:** カテゴリの統一方針について、どのように進めるべきでしょうか？

## 参考情報

### ブランドガイドライン

```
BLUE（メイン）: #00427B
ORANGE（アクセント）: #DD6500
BLACK: #000000
WHITE: #FFFFFF
```

### 現在のパレット（抜粋）

```typescript
// Brand / Accent
primary500: "#EC4899",  // ピンク
accent500: "#8B5CF6",   // 紫
teal500: "#0F766E",     // ティール

// Neutral (dark UI)
gray900: "#0a0a0a",     // 背景
gray800: "#171717",     // surface
gray700: "#262626",     // border

// Neutral (text)
gray100: "#e5e5e5",     // primary text
gray400: "#737373",     // secondary text ← 問題の色
```

## 期待する回答

1. セカンダリテキストの推奨色（HEX値）
2. E2Eテスト戦略の推奨
3. カテゴリ統一の進め方

---

*作成日: 2026-01-23*
*プロジェクト: doin-challenge.com*
