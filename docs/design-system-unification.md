# デザインシステム統一ガイド (v6.70)

## 概要

サイト全体のデザインパターンを調査し、統一すべきトンマナを特定しました。

## 統一されたデザインパターン

### 1. カード型コンポーネント

#### 黒ベースのカード（リストアイテム、ランキング、メッセージ）

**統一スタイル:**
```typescript
{
  backgroundColor: palette.gray800, // #1A1D21
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: palette.gray700,
}
```

**適用済みコンポーネント:**
- `MessageCard.tsx` - 応援メッセージカード
- `ContributionRanking.tsx` - 貢献度ランキング（borderRadius: 8）
- `GenderSelector.tsx` - 性別選択ボタン（v6.70で統一）

**統一が必要なコンポーネント:**
- `RegionMap.tsx` - 都道府県マップ（現在: `#1A1D21`）
- `CompanionList.tsx` - 同伴者リスト（現在: `colors.background`）

#### 明るいカード（情報表示、フォーム）

**統一スタイル:**
```typescript
{
  backgroundColor: color.surface,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: color.border,
}
```

**適用済みコンポーネント:**
- `EventInfoSection.tsx` - イベント情報カード
- `ProgressSection.tsx` - 進捗カード
- `CountdownSection.tsx` - カウントダウンカード

### 2. ボーダーラジウスの統一

| サイズ | 用途 | 例 |
|--------|------|-----|
| `8px` | 小さなボタン、チップ、インプット | フィルターボタン、都道府県チップ |
| `12px` | 標準カード、ボタン | リストアイテム、メッセージカード、ランキング |
| `16px` | 大きなカード、セクション | イベント情報、進捗セクション、ヘッダー |

### 3. 性別による色分け

**統一カラーパレット:**
```typescript
palette.genderMale = "#3B82F6" // 青
palette.genderFemale = "#EC4899" // ピンク
palette.genderNeutral = "#6B7280" // グレー
```

**適用パターン:**
- 左ボーダー（2px）で性別を表示（MessageCard）
- 選択時のボーダーカラー（GenderSelector）
- アイコンの色（👨👩）

### 4. ランキングの色分け

**統一カラーパレット:**
```typescript
getRankColor = (index: number) => {
  if (index === 0) return "#FFD700"; // 金
  if (index === 1) return "#C0C0C0"; // 銀
  if (index === 2) return "#CD7F32"; // 銅
  return "#2D3139"; // その他
}
```

## 統一作業リスト

### Phase 1: 黒ベースのカード統一 ✅

- [x] `GenderSelector.tsx` - 性別選択ボタン（v6.70完了）
- [ ] `RegionMap.tsx` - 都道府県マップ
- [ ] `CompanionList.tsx` - 同伴者リスト

### Phase 2: ボーダーラジウスの統一

- [ ] `ContributionRanking.tsx` - borderRadius: 8 → 12に変更
- [ ] 全コンポーネントのborderRadiusを確認し、8/12/16に統一

### Phase 3: 色の統一

- [x] 性別の色（palette.genderMale, palette.genderFemale）を統一
- [ ] ランキングの色を統一（金・銀・銅）

## 実装ガイドライン

### 新しいコンポーネントを作成する際のルール

1. **カード型コンポーネント**
   - リストアイテム、ランキング、メッセージ → 黒ベース（`palette.gray800`）
   - 情報表示、フォーム → 明るいカード（`color.surface`）

2. **ボーダーラジウス**
   - 小さなボタン、チップ → `8px`
   - 標準カード、ボタン → `12px`
   - 大きなカード、セクション → `16px`

3. **性別の色**
   - 男性 → `palette.genderMale` (`#3B82F6`)
   - 女性 → `palette.genderFemale` (`#EC4899`)
   - 未設定 → `palette.genderNeutral` (`#6B7280`)

4. **ランキングの色**
   - 1位 → 金（`#FFD700`）
   - 2位 → 銀（`#C0C0C0`）
   - 3位 → 銅（`#CD7F32`）
   - その他 → グレー（`#2D3139`）

## 参考

- `palette.ts` - カラーパレットの定義
- `MessageCard.tsx` - 黒ベースのカードの実装例
- `ContributionRanking.tsx` - ランキングの実装例
- `GenderSelector.tsx` - 性別選択の実装例（v6.70で統一済み）
