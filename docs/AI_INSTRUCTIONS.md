# AI実装ガイドライン

**このファイルは、AI（Manus、ChatGPT、Claude等）が実装を行う際に必ず参照するガイドラインです。**

---

## 実装前の必須チェック

### 1. 設計原則の確認

**実装を開始する前に、必ず `DESIGN_PRINCIPLES.md` を読むこと。**

```bash
# ファイルを読む
file read /home/ubuntu/birthday-celebration/DESIGN_PRINCIPLES.md
```

- **違反していないか確認**: 実装内容が設計原則に違反していないか確認
- **不明点があれば質問**: 設計原則に不明点があれば、ユーザーに質問

---

### 2. 既存コンポーネントの検索

**新しいコンポーネントを作成する前に、必ず既存のコンポーネントを検索すること。**

```bash
# components/ ディレクトリ全体を検索
match --action glob --scope "/home/ubuntu/birthday-celebration/components/**/*.tsx"

# 特定の機能を持つコンポーネントを検索（例: ログイン）
match --action grep --scope "/home/ubuntu/birthday-celebration/components/**/*.tsx" --regex "login|Login|auth|Auth"
```

---

### 3. コンポーネントレジストリの確認

**`docs/COMPONENT_REGISTRY.md` を読み、既存コンポーネントを再利用できないか確認すること。**

```bash
# ファイルを読む
file read /home/ubuntu/birthday-celebration/docs/COMPONENT_REGISTRY.md
```

- **既存コンポーネントの確認**: 同じ機能を持つコンポーネントが既に存在しないか確認
- **再利用の検討**: 既存のコンポーネントを再利用できないか検討

---

## 実装時のガイドライン

### 1. ログイン機能

**ログインUIは `components/common/LoginModal.tsx` のみ使用すること。**

#### 使用例

```tsx
import { LoginModal } from "@/components/common/LoginModal";
import { useState } from "react";

export function MyComponent() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = () => {
    // ログイン処理
    console.log("ログイン処理を開始");
  };

  return (
    <>
      <Button onPress={() => setShowLoginModal(true)}>
        ログイン
      </Button>
      
      <LoginModal
        visible={showLoginModal}
        onConfirm={handleLogin}
        onCancel={() => setShowLoginModal(false)}
      />
    </>
  );
}
```

#### 禁止事項

- **新しいログインUIを作成しない**: `LoginModal` 以外のログインUIを作成しない
- **青いバナーを作成しない**: シンプルなログインボタンを作成しない
- **重複実装を避ける**: ログイン機能を複数の場所で実装しない

---

### 2. コンポーネントの作成

**新しいコンポーネントを作成する場合、以下のガイドラインに従うこと。**

#### 配置場所

- **共通コンポーネント**: `components/common/` に配置
- **UI部品**: `components/ui/` に配置
- **Atoms（最小単位）**: `components/atoms/` に配置
- **Molecules（複合部品）**: `components/molecules/` に配置
- **Organisms（複雑な部品）**: `components/organisms/` に配置
- **機能別コンポーネント**: `features/` に配置

#### ファイル命名規則

- **PascalCase**: `LoginModal.tsx`、`ChallengeCard.tsx`
- **kebab-case**: `login-modal.tsx`、`challenge-card.tsx`（プロジェクトの規則に従う）

#### コンポーネントの構造

```tsx
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

export interface MyComponentProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * MyComponent の説明
 * 
 * @param title - タイトル
 * @param onPress - ボタン押下時のコールバック
 * @param disabled - 無効化フラグ
 */
export function MyComponent({ title, onPress, disabled }: MyComponentProps) {
  return (
    <View className={cn("p-4", disabled && "opacity-50")}>
      <Text className="text-lg font-bold">{title}</Text>
      <Button onPress={onPress} disabled={disabled}>
        ボタン
      </Button>
    </View>
  );
}
```

---

### 3. スタイリング

**Tailwind CSS（NativeWind）を使用すること。**

#### 使用例

```tsx
<View className="flex-1 items-center justify-center p-4">
  <Text className="text-2xl font-bold text-foreground">
    Hello World
  </Text>
</View>
```

#### 禁止事項

- **グローバルスタイルに依存しない**: `styles.ts` などのグローバルスタイルに依存しない
- **インラインスタイルを避ける**: 可能な限り Tailwind CSS を使用

---

## 実装後の必須チェック

### 1. 重複チェック

**実装後、同じ機能を持つコンポーネントが複数存在しないか確認すること。**

```bash
# 類似コンポーネントを検索
match --action grep --scope "/home/ubuntu/birthday-celebration/components/**/*.tsx" --regex "MyComponent|my-component"
```

- **重複がある場合**: 統合する
- **重複がない場合**: 次のステップに進む

---

### 2. コンポーネントレジストリの更新

**新しいコンポーネントを作成した場合、`docs/COMPONENT_REGISTRY.md` に追加すること。**

#### 追加する情報

- **パス**: コンポーネントのファイルパス
- **用途**: コンポーネントの用途
- **使用箇所**: コンポーネントが使用されている場所
- **Props**: 主要な Props

#### 追加例

```markdown
### MyComponent
- **パス**: `components/common/MyComponent.tsx`
- **用途**: カスタムコンポーネント
- **使用箇所**: ホーム、チャレンジ
- **Props**:
  - `title: string` - タイトル
  - `onPress: () => void` - ボタン押下時のコールバック
  - `disabled?: boolean` - 無効化フラグ
```

---

### 3. todo.md の更新

**実装が完了したら、`todo.md` のタスクを完了としてマークすること。**

```markdown
- [x] MyComponent を作成
```

---

## チェックポイント前のチェック

**`webdev_save_checkpoint` を実行する前に、以下をチェックすること:**

### 1. 設計原則の確認

```bash
# DESIGN_PRINCIPLES.md を読む
file read /home/ubuntu/birthday-celebration/DESIGN_PRINCIPLES.md
```

- **違反していないか確認**: 実装内容が設計原則に違反していないか確認

---

### 2. コンポーネントレジストリの確認

```bash
# COMPONENT_REGISTRY.md を読む
file read /home/ubuntu/birthday-celebration/docs/COMPONENT_REGISTRY.md
```

- **最新か確認**: コンポーネントレジストリが最新か確認
- **更新**: 新しいコンポーネントを追加した場合は更新

---

### 3. 重複実装の確認

```bash
# 重複実装を検索
match --action grep --scope "/home/ubuntu/birthday-celebration/components/**/*.tsx" --regex "login|Login|auth|Auth"
```

- **重複がないか確認**: 同じ機能を持つコンポーネントが複数存在しないか確認

---

## 定期的なチェック

### 週次チェック

**週に1回、以下をチェックすること:**

1. **重複実装がないか**: `match` ツールで検索
2. **設計原則に違反していないか**: `DESIGN_PRINCIPLES.md` を再確認
3. **コンポーネントレジストリが最新か**: `docs/COMPONENT_REGISTRY.md` を更新

---

## トラブルシューティング

### 問題: 同じ機能を持つコンポーネントが複数存在する

**解決策**:
1. 既存のコンポーネントを確認
2. どちらのコンポーネントを使用するか決定
3. 使用しないコンポーネントを削除または非推奨とする
4. `docs/COMPONENT_REGISTRY.md` を更新

---

### 問題: 設計原則に違反している

**解決策**:
1. `DESIGN_PRINCIPLES.md` を読む
2. 違反している箇所を特定
3. 修正する
4. ユーザーに報告

---

### 問題: コンポーネントレジストリが古い

**解決策**:
1. 新しいコンポーネントを確認
2. `docs/COMPONENT_REGISTRY.md` に追加
3. チェックポイントを作成

---

## ユーザーへの質問

**不明点がある場合は、ユーザーに質問すること。**

### 質問例

- 「既存の `LoginModal` を使用しますか？それとも新しいログインUIを作成しますか？」
- 「このコンポーネントは共通化できますか？」
- 「この実装は設計原則に違反していますか？」

---

## まとめ

**AI実装時の必須手順:**

1. **実装前**: `DESIGN_PRINCIPLES.md` を読む
2. **実装前**: 既存コンポーネントを検索
3. **実装前**: `docs/COMPONENT_REGISTRY.md` を確認
4. **実装後**: 重複チェック
5. **実装後**: `docs/COMPONENT_REGISTRY.md` を更新
6. **チェックポイント前**: 設計原則・コンポーネントレジストリ・重複実装を確認

---

**最終更新**: 2026-01-31
