# デザインシステム

## 概要

このドキュメントは、動員ちゃれんじアプリケーションのデザインシステムを記述しています。デザインシステムは、一貫性のあるUI/UXを提供するための基盤となるガイドラインです。

---

## デザインコンセプト

### テーマ

**ダークモード × ピンク・パープルアクセント**

動員ちゃれんじは、黒ベースのダークUIにピンクとパープルのアクセントカラーを組み合わせたデザインを採用しています。これにより、クリエイターのイベントを華やかに演出し、ファンの熱狂を視覚的に表現します。

### デザイン原則

1. **視認性**: WCAG AA基準に準拠したコントラスト比（4.5:1以上）
2. **一貫性**: 全画面で統一されたカラーパレット・タイポグラフィ・コンポーネント
3. **アクセシビリティ**: タップ領域44px以上、色+アイコン/ラベルの組み合わせ
4. **パフォーマンス**: 軽量な画像、最適化されたFlatList、レスポンシブデザイン

---

## カラーパレット

### ブランドカラー

| カラー | 16進数 | 用途 |
|--------|--------|------|
| **Primary (ピンク)** | `#EC4899` | メインアクション、CTA、強調 |
| **Primary Hover** | `#DB2777` | ホバー状態 |
| **Accent (パープル)** | `#A855F7` | アクセント、セカンダリアクション |
| **Accent Hover** | `#9333EA` | ホバー状態 |
| **Teal (ティール)** | `#14B8A6` | セカンダリアクション、補助色 |
| **Teal Hover** | `#0D9488` | ホバー状態 |

### ニュートラルカラー（ダークUI）

| カラー | 16進数 | 用途 |
|--------|--------|------|
| **Gray 900** | `#0a0a0a` | 背景（黒ベース） |
| **Gray 850** | `#121212` | 画像プレースホルダ |
| **Gray 800** | `#171717` | Surface（カード背景） |
| **Gray 750** | `#1f1f1f` | Surface alt |
| **Gray 700** | `#262626` | Border |
| **Gray 600** | `#404040` | Border alt |

### テキストカラー

| カラー | 16進数 | 用途 | コントラスト比 |
|--------|--------|------|---------------|
| **Gray 100** | `#f5f5f5` | Primary text（最も明るい） | 13.6:1 |
| **Gray 200** | `#d4d4d4` | Subtle text | 9.5:1 |
| **Gray 300** | `#a3a3a3` | Muted text | 5.8:1 |
| **Gray 400** | `#7a7a7a` | Secondary text / Placeholder | 4.61:1 |
| **Gray 500** | `#525252` | Hint text | 3.2:1 |

### セマンティックカラー

| カラー | 16進数 | 用途 |
|--------|--------|------|
| **Success** | `#22C55E` | 成功状態、完了 |
| **Success Light** | `#4ADE80` | 成功状態（明るい） |
| **Success Dark** | `#16A34A` | 成功状態（暗い） |
| **Error** | `#EF4444` | エラー状態、削除 |
| **Error Light** | `#F87171` | エラー状態（明るい） |
| **Error Dark** | `#DC2626` | エラー状態（暗い） |
| **Warning** | `#A855F7` | 警告状態（パープル） |
| **Warning Light** | `#C084FC` | 警告状態（明るい） |
| **Warning Dark** | `#9333EA` | 警告状態（暗い） |
| **Info** | `#3B82F6` | 情報、ヒント |
| **Info Light** | `#60A5FA` | 情報（明るい） |
| **Info Dark** | `#2563EB` | 情報（暗い） |

### 性別カラー（WCAG AA準拠）

| カラー | 16進数 | 用途 | コントラスト比 |
|--------|--------|------|---------------|
| **Male (男性)** | `#60A5FA` | 男性ボーダー | 4.5:1以上 |
| **Female (女性)** | `#F9A8D4` | 女性ボーダー | 4.5:1以上 |
| **Other (その他)** | `#C084FC` | その他ボーダー | 4.5:1以上 |
| **Neutral (未設定)** | `rgba(255,255,255,0.12)` | 未設定ボーダー | - |

---

## タイポグラフィ

### フォントファミリー

- **iOS**: San Francisco（システムフォント）
- **Android**: Roboto（システムフォント）
- **Web**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### フォントサイズ

| サイズ | 値 | 用途 |
|--------|-----|------|
| **XS** | 12px | キャプション、補足情報 |
| **SM** | 14px | ボディテキスト（小） |
| **Base** | 16px | ボディテキスト（標準） |
| **LG** | 18px | リード文、強調テキスト |
| **XL** | 20px | サブヘッディング |
| **2XL** | 24px | ヘッディング（小） |
| **3XL** | 30px | ヘッディング（中） |
| **4XL** | 36px | ヘッディング（大） |
| **5XL** | 48px | ディスプレイテキスト |

### フォントウェイト

| ウェイト | 値 | 用途 |
|---------|-----|------|
| **Regular** | 400 | ボディテキスト |
| **Medium** | 500 | 強調テキスト |
| **Semibold** | 600 | サブヘッディング |
| **Bold** | 700 | ヘッディング |

### 行間（Line Height）

| サイズ | 行間 | 比率 |
|--------|------|------|
| **XS** | 16px | 1.33 |
| **SM** | 20px | 1.43 |
| **Base** | 24px | 1.5 |
| **LG** | 28px | 1.56 |
| **XL** | 28px | 1.4 |
| **2XL** | 32px | 1.33 |
| **3XL** | 36px | 1.2 |
| **4XL** | 40px | 1.11 |
| **5XL** | 1 | 1 |

---

## スペーシング

### スペーシングスケール

| サイズ | 値 | 用途 |
|--------|-----|------|
| **0** | 0px | なし |
| **1** | 4px | 最小スペース |
| **2** | 8px | 小スペース |
| **3** | 12px | 中スペース |
| **4** | 16px | 標準スペース |
| **5** | 20px | 大スペース |
| **6** | 24px | 特大スペース |
| **8** | 32px | セクション間 |
| **10** | 40px | 大セクション間 |
| **12** | 48px | 最大スペース |

### パディング

- **カード**: 16px（標準）、24px（大）
- **ボタン**: 12px（縦）、24px（横）
- **入力フィールド**: 12px（縦）、16px（横）
- **画面**: 16px（左右）

### マージン

- **要素間**: 8px（小）、16px（標準）、24px（大）
- **セクション間**: 32px（標準）、48px（大）

---

## コンポーネント

### ボタン

#### Primary Button

- **背景色**: Primary (`#EC4899`)
- **テキスト色**: White (`#FFFFFF`)
- **パディング**: 12px（縦）、24px（横）
- **角丸**: 8px
- **フォントサイズ**: 16px
- **フォントウェイト**: 600（Semibold）
- **タップ領域**: 44px以上

**ホバー/プレス状態**:
- **背景色**: Primary Hover (`#DB2777`)
- **スケール**: 0.97
- **不透明度**: 0.9

#### Secondary Button

- **背景色**: Transparent
- **テキスト色**: Primary (`#EC4899`)
- **ボーダー**: 1px solid Primary
- **パディング**: 12px（縦）、24px（横）
- **角丸**: 8px
- **フォントサイズ**: 16px
- **フォントウェイト**: 600（Semibold）

**ホバー/プレス状態**:
- **背景色**: Primary + 10% opacity
- **不透明度**: 0.7

#### Text Button

- **背景色**: Transparent
- **テキスト色**: Primary (`#EC4899`)
- **パディング**: 8px（縦）、16px（横）
- **フォントサイズ**: 16px
- **フォントウェイト**: 500（Medium）

**ホバー/プレス状態**:
- **不透明度**: 0.6

### カード

#### Event Card

- **背景色**: Gray 800 (`#171717`)
- **ボーダー**: 1px solid Gray 700 (`#262626`)
- **角丸**: 12px
- **パディング**: 16px
- **シャドウ**: なし（ダークUI）

**ホバー/プレス状態**:
- **不透明度**: 0.7

#### Message Card

- **背景色**: Gray 800 (`#171717`)
- **ボーダー**: 1px solid Gender Color（性別に応じて変化）
- **角丸**: 12px
- **パディング**: 16px
- **シャドウ**: なし（ダークUI）

### 入力フィールド

#### Text Input

- **背景色**: Gray 800 (`#171717`)
- **ボーダー**: 1px solid Gray 700 (`#262626`)
- **角丸**: 8px
- **パディング**: 12px（縦）、16px（横）
- **フォントサイズ**: 16px
- **プレースホルダー色**: Gray 400 (`#7a7a7a`)

**フォーカス状態**:
- **ボーダー**: 2px solid Primary (`#EC4899`)

**エラー状態**:
- **ボーダー**: 2px solid Error (`#EF4444`)

### 進捗バー

#### Progress Bar

- **背景色**: Gray 700 (`#262626`)
- **進捗色**: Primary (`#EC4899`)
- **高さ**: 8px
- **角丸**: 4px

**100%達成時**:
- **進捗色**: Success (`#22C55E`)
- **アニメーション**: 紙吹雪（Confetti）

### モーダル

#### Modal

- **背景色**: Gray 800 (`#171717`)
- **オーバーレイ**: `rgba(0, 0, 0, 0.75)`
- **角丸**: 16px（上部のみ）
- **パディング**: 24px
- **最大幅**: 600px（Desktop）、500px（Tablet）

**レスポンシブ対応**:
- **Mobile**: 画面下部からスライドイン（ボトムシート）
- **Tablet/Desktop**: 中央配置

### バッジ

#### Badge

- **背景色**: Primary (`#EC4899`)
- **テキスト色**: White (`#FFFFFF`)
- **パディング**: 4px（縦）、8px（横）
- **角丸**: 4px
- **フォントサイズ**: 12px
- **フォントウェイト**: 600（Semibold）

---

## アイコン

### アイコンライブラリ

- **iOS**: SF Symbols
- **Android/Web**: Material Icons

### アイコンサイズ

| サイズ | 値 | 用途 |
|--------|-----|------|
| **SM** | 16px | インラインアイコン |
| **Base** | 20px | 標準アイコン |
| **LG** | 24px | ボタンアイコン |
| **XL** | 28px | タブバーアイコン |
| **2XL** | 32px | ヘッダーアイコン |

### 性別アイコン

| 性別 | アイコン | カラー |
|------|---------|--------|
| **男性** | `male` (Material Icons) | `#60A5FA` |
| **女性** | `female` (Material Icons) | `#F9A8D4` |
| **その他** | `transgender` (Material Icons) | `#C084FC` |

---

## レスポンシブデザイン

### ブレークポイント

| デバイス | 幅 | 用途 |
|---------|-----|------|
| **Mobile** | 〜375px | スマートフォン（縦向き） |
| **Tablet** | 〜768px | タブレット |
| **Desktop** | 1024px+ | デスクトップ・Web |

### 最大幅

- **コンテンツ最大幅**: 1200px

### レイアウト

- **Mobile**: 1カラム、フルスクリーン
- **Tablet**: 1〜2カラム、パディング追加
- **Desktop**: 2〜3カラム、中央配置、最大幅1200px

---

## アニメーション

### トランジション

| 要素 | デュレーション | イージング |
|------|--------------|-----------|
| **ボタンプレス** | 80ms | ease-out |
| **モーダル表示** | 250ms | ease-out |
| **ページ遷移** | 300ms | ease-in-out |
| **進捗バー** | 400ms | ease-in-out |

### スケール

- **ボタンプレス**: 0.97
- **カードプレス**: 0.98

### 不透明度

- **ホバー**: 0.7〜0.9
- **プレス**: 0.6〜0.8

---

## アクセシビリティ

### WCAG AA基準

- **コントラスト比**: 4.5:1以上（テキスト）
- **タップ領域**: 44px以上（ボタン・リンク）
- **色+アイコン/ラベル**: 色だけでなく、アイコンやラベルも併用

### スクリーンリーダー対応

- **accessibilityLabel**: 全てのインタラクティブ要素に追加
- **accessibilityHint**: 必要に応じて追加
- **accessibilityRole**: ボタン・リンク・ヘッディングなど

---

## パフォーマンス

### 画像最適化

- **フォーマット**: WebP（Web）、PNG/JPEG（Native）
- **プレースホルダ**: expo-imageのデフォルトプレースホルダ（solid）
- **遅延読み込み**: expo-imageの自動最適化

### FlatList最適化

- **keyExtractor**: ID固定（useCallback）
- **renderItem**: useCallback
- **initialNumToRender**: 20
- **windowSize**: 21
- **maxToRenderPerBatch**: 10
- **updateCellsBatchingPeriod**: 50ms
- **removeClippedSubviews**: Androidのみ有効化

### リアルタイム更新

- **Polling間隔**: 10秒
- **バックグラウンド時**: 自動停止（AppState監視）
- **フォアグラウンド復帰時**: 即座にデータ更新

---

## ファイル構成

### カラーパレット

- **定義**: `theme/tokens/palette.ts`
- **使用**: `useColors()`フック、Tailwind CSS

### タイポグラフィ

- **定義**: `theme.config.js`
- **使用**: Tailwind CSS

### コンポーネント

- **UIコンポーネント**: `components/ui/`
- **複合コンポーネント**: `components/molecules/`
- **機能別コンポーネント**: `features/*/components/`

---

## 使用例

### ボタン

```tsx
import { Pressable, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export function PrimaryButton({ onPress, children }) {
  const colors = useColors();
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          minHeight: 44,
        },
        pressed && {
          transform: [{ scale: 0.97 }],
          opacity: 0.9,
        },
      ]}
      accessibilityLabel="参加表明する"
      accessibilityRole="button"
    >
      <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
        {children}
      </Text>
    </Pressable>
  );
}
```

### カード

```tsx
import { View, Text } from 'react-native';

export function EventCard({ event }) {
  return (
    <View className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <Text className="text-lg font-semibold text-gray-100">
        {event.title}
      </Text>
      <Text className="text-sm text-gray-400 mt-2">
        {event.description}
      </Text>
    </View>
  );
}
```

### 進捗バー

```tsx
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function ProgressBar({ progress }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, { duration: 400 }),
  }));
  
  return (
    <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <Animated.View
        className="h-full bg-primary rounded-full"
        style={animatedStyle}
      />
    </View>
  );
}
```

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| v1.0.0 | 2026-01-27 | 初版作成 |

---

## サポート

デザインシステムに関する質問や提案がある場合は、[GitHub Issues](https://github.com/kimito-link/doin-challenge.com/issues)で報告してください。
