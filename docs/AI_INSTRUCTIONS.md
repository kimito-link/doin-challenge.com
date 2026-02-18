# AI実装ガイドライン

**このファイルは、AI実装時の具体的な手順とチェックリストを提供します。**

---

## 1. 実装前の必須チェックリスト

### 1.1 ドキュメントの確認

**新しい機能を実装する前に、以下のドキュメントを必ず読むこと:**

1. **設計原則**: `DESIGN_PRINCIPLES.md`
   - UI/UXの一貫性ルール
   - 認証関連コンポーネントの統一
   - スタイリングの統一（NativeWind）
   - パフォーマンス最適化のベストプラクティス

2. **コンポーネントレジストリ**: `docs/COMPONENT_REGISTRY.md`
   - 既存コンポーネントの一覧
   - 各コンポーネントのパス、用途、Props

3. **キャラクター表示ルール**: `docs/CHARACTER_DISPLAY_RULES.md`
   - りんく、こん太、たぬ姉の使い分け
   - キャラクター表示の一貫性

---

### 1.2 既存実装の検索

**新しいコンポーネントを作成する前に、必ず既存コンポーネントを検索すること:**

```bash
# 例: ログイン関連のコンポーネントを検索
match --action grep --scope "/home/ubuntu/birthday-celebration/components/**/*.tsx" --regex "(?i)(login|auth)"

# 例: カード関連のコンポーネントを検索
match --action grep --scope "/home/ubuntu/birthday-celebration/components/**/*.tsx" --regex "(?i)(card)"
```

---

## 2. 実装時のベストプラクティス

### 2.1 コンポーネント作成

**新しいコンポーネントを作成する場合:**

1. **適切なディレクトリに配置**:
   - `components/atoms/`: 最小単位のUI要素（ボタン、入力フィールドなど）
   - `components/molecules/`: 複数のAtomsを組み合わせたコンポーネント（カード、モーダルなど）
   - `components/organisms/`: 複雑なUIセクション（ヘッダー、ランキング、地図など）
   - `components/ui/`: 汎用的なUI部品（フォーム、レイアウト、状態表示など）
   - `components/common/`: プロジェクト全体で共通して使用するコンポーネント

2. **Props の型定義を明確にする**:
   ```typescript
   interface MyComponentProps {
     title: string;
     onPress: () => void;
     variant?: 'primary' | 'secondary';
   }
   ```

3. **NativeWind を使用してスタイリング**:
   ```tsx
   <View className="flex-1 items-center justify-center p-4">
     <Text className="text-2xl font-bold text-foreground">
       Hello World
     </Text>
   </View>
   ```

4. **テーマカラーを使用**:
   - `primary`, `background`, `foreground`, `muted`, `border`, `surface`
   - `success`, `warning`, `error`

---

### 2.2 認証関連の実装

**Auth0認証フローを使用すること:**

1. **認証フック**: `hooks/use-auth.ts`
   ```typescript
   import { useAuth } from "@/hooks/use-auth";
   
   const { user, isAuthenticated, isAuthReady, login, logout } = useAuth();
   ```

2. **ログインモーダル**: `components/common/LoginModal.tsx`
   ```typescript
   import { LoginModal } from "@/components/common/LoginModal";
   
   <LoginModal
     visible={showLoginModal}
     onClose={() => setShowLoginModal(false)}
   />
   ```

3. **禁止事項**:
   - Twitter OAuth 2.0の直接実装
   - カスタム認証フローの作成

---

### 2.3 パフォーマンス最適化

**パフォーマンスを考慮した実装:**

1. **React Query の活用**:
   ```typescript
   import { trpc } from "@/lib/trpc";
   
   const { data, isLoading, error } = trpc.challenges.list.useQuery({
     limit: 20,
   });
   ```

2. **画像の最適化**:
   ```typescript
   import { LazyImage } from "@/components/molecules/lazy-image";
   
   <LazyImage
     source={{ uri: imageUrl }}
     style={{ width: 100, height: 100 }}
   />
   ```

3. **リストの最適化**:
   ```typescript
   <FlatList
     data={items}
     renderItem={({ item }) => <ItemCard item={item} />}
     keyExtractor={(item) => item.id.toString()}
     getItemLayout={(data, index) => ({
       length: ITEM_HEIGHT,
       offset: ITEM_HEIGHT * index,
       index,
     })}
   />
   ```

4. **メモ化**:
   ```typescript
   import { memo, useMemo, useCallback } from "react";
   
   const MemoizedComponent = memo(MyComponent);
   
   const memoizedValue = useMemo(() => {
     return expensiveCalculation(a, b);
   }, [a, b]);
   
   const memoizedCallback = useCallback(() => {
     doSomething(a, b);
   }, [a, b]);
   ```

---

## 3. 実装後の必須チェックリスト

### 3.1 コードレビュー

**実装後、以下を確認すること:**

1. **設計原則に違反していないか?**
   - `DESIGN_PRINCIPLES.md` を再確認

2. **重複実装がないか?**
   - `match` ツールで類似コンポーネントを検索

3. **未使用インポートがないか?**
   - ESLintでチェック

4. **TypeScriptエラーがないか?**
   ```bash
   pnpm check
   ```

---

### 3.2 コンポーネントレジストリの更新

**新しいコンポーネントを作成した場合:**

1. `docs/COMPONENT_REGISTRY.md` に追加
2. カテゴリ、パス、用途、Propsを明記

---

### 3.3 テストの作成

**新しいコンポーネントを作成した場合:**

1. **単体テスト**: `__tests__` ディレクトリにテストファイルを配置
   ```typescript
   import { describe, it, expect } from "vitest";
   import { MyComponent } from "../my-component";
   
   describe("MyComponent", () => {
     it("should render correctly", () => {
       // テストコード
     });
   });
   ```

2. **テストの実行**:
   ```bash
   pnpm test
   ```

---

## 4. プロジェクト固有のガイドライン

### 4.1 チャレンジ機能

**チャレンジカードは統一されたコンポーネントを使用すること:**

```typescript
import { ColorfulChallengeCard } from "@/components/molecules/colorful-challenge-card";

<ColorfulChallengeCard
  challenge={challenge}
  onPress={() => navigate.toEventDetail(challenge.id)}
/>
```

---

### 4.2 日本地図機能

**日本地図は統一されたコンポーネントを使用すること:**

```typescript
import { JapanHeatmap } from "@/components/organisms/japan-heatmap/JapanHeatmap";

<JapanHeatmap
  data={prefectureData}
/>
```

---

### 4.3 ランキング機能

**ランキング表示は統一されたコンポーネントを使用すること:**

```typescript
import { ParticipantRanking } from "@/components/organisms/participant-ranking/ParticipantRanking";

<ParticipantRanking
  participants={participants}
/>
```

---

## 5. よくある質問

### Q1: 既存のコンポーネントを変更する場合は?

**A1**: 変更の影響範囲を確認してから変更してください。

1. `match` ツールで使用箇所を検索
2. 影響範囲を確認
3. 変更後、全テストを実行

---

### Q2: 新しいコンポーネントを作成する基準は?

**A2**: 以下の場合に新しいコンポーネントを作成してください。

1. 既存のコンポーネントで代用できない
2. 複数の場所で使用される可能性がある
3. 独立してテスト可能

---

### Q3: スタイリングはどのように行うべきか?

**A3**: NativeWind（Tailwind CSS for React Native）を使用してください。

- `className` を使用してスタイリング
- テーマカラーを使用（`primary`, `background`, `foreground`など）
- ハードコードされた色の値を使用しない

---

## 6. チェックポイント前のチェックリスト

**`webdev_save_checkpoint` を実行する前に、以下をチェックすること:**

1. **設計原則に違反していないか?**
   - `DESIGN_PRINCIPLES.md` を再確認

2. **コンポーネントレジストリは最新か?**
   - `docs/COMPONENT_REGISTRY.md` を更新

3. **重複実装はないか?**
   - `match` ツールで検索

4. **テストは全て合格しているか?**
   - `pnpm test` を実行

5. **TypeScriptエラーはないか?**
   - `pnpm check` を実行

---

## 7. デプロイ前のチェックリスト

**デプロイする前に、以下をチェックすること:**

1. **本番環境の環境変数は設定されているか?**
   - Vercel: `EXPO_PUBLIC_AUTH0_CLIENT_ID`, `EXPO_PUBLIC_API_URL`
   - Railway: `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `DATABASE_URL`

2. **Auth0の設定は正しいか?**
   - Callback URLs: `https://doin-challenge.com/oauth`
   - Logout URLs: `https://doin-challenge.com`
   - Web Origins: `https://doin-challenge.com`

3. **データベースマイグレーションは実行されているか?**
   - `pnpm db:push`

4. **全テストは合格しているか?**
   - `pnpm test`

---

## 8. トラブルシューティング

### 8.1 Auth0ログインエラー

**"Unknown client" エラーが発生する場合:**

1. Auth0ダッシュボードで Application Type を確認
   - Single Page Application (SPA) であること

2. Callback URLs, Logout URLs, Web Origins を確認
   - 本番環境のURLが設定されていること

3. Twitter connection が Application にリンクされていることを確認

---

### 8.2 TypeScriptエラー

**型エラーが発生する場合:**

1. `pnpm check` を実行してエラーを確認
2. 型定義を確認
3. 必要に応じて型定義を追加

---

### 8.3 パフォーマンス問題

**アプリが遅い場合:**

1. React Query のキャッシュ設定を確認
2. 画像の最適化を確認（`LazyImage` を使用）
3. リストの最適化を確認（`FlatList` + `getItemLayout`）
4. データベースインデックスを確認

---

**最終更新**: 2026-02-17

---

## 参考資料

- [React Native ベストプラクティス](https://reactnative.dev/docs/performance)
- [NativeWind ドキュメント](https://www.nativewind.dev/)
- [Auth0 React Native SDK](https://auth0.com/docs/quickstart/native/react-native)
- [React Query ドキュメント](https://tanstack.com/query/latest)
- [Expo ドキュメント](https://docs.expo.dev/)
