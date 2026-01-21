# React Native スタイル管理ベストプラクティス（Thoughtbot）

出典: https://thoughtbot.com/blog/structure-for-styling-in-react-native

## 4つの原則

### 1. スタイルを見つけやすくする
- スタイルはルートソースフォルダに配置
- `../../../`のような深いパスを避ける

```
MyReactNativeApp
  - src
    - assets
    - components
      - MyComponent.js
    - styles
      - colors.js
      - index.js
      - typography.js
      - ...
```

### 2. アトミックに構築する
- 複雑なスタイルは単純なスタイルから構築
- オブジェクトのスプレッド構文を活用

```js
// buttons.js
export const small = {
  paddingHorizontal: 10,
  paddingVertical: 12,
  width: 75
};

export const rounded = {
  borderRadius: 50
};

export const smallRounded = {
  ...base,
  ...small,
  ...rounded
};
```

### 3. スタイルを使いやすくする
- 類似の変数をモジュールにグループ化
- `index.js`でバンドル

```js
// src/styles/index.js
import * as Buttons from './buttons'
import * as Colors from './colors'
import * as Spacing from './spacing'
import * as Typography from './typography'

export { Typography, Spacing, Colors, Buttons }
```

使用例:
```js
import { Typography, Colors, Spacing } from '../styles'

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: Spacing.base,
  },
  header: {
    ...Typography.mainHeader,
  },
})
```

### 4. スタイルをコンポーネントの近くに保つ（コロケーション）
- StyleSheetはコンポーネントと同じファイルに定義
- 利点:
  - 他のコンポーネントのスタイルを上書きしない
  - コンポーネントの進化に合わせてスタイルが維持される
  - デザイン反復中に柔軟性がある
  - 1つの場所を見ればよいので精神的オーバーヘッドが最小

```js
// src/MyNewComponent/index.js
import { Typography } from '../styles'

const MyNewComponent = () => (
  <View style={styles.container}>
    <View style={styles.header}>
       <MyComponent />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    ...Typography.header
  },
})
```

## 注意点

- 大規模プロジェクトや特定のビジネスニーズには異なるパターンが必要な場合がある
- テーマ対応コンポーネントには追加の抽象化が必要な場合がある


---

# コミュニティの意見（Reddit r/reactnative）

出典: https://www.reddit.com/r/reactnative/comments/18lkxj6/

## 主な意見

### 1. 再利用可能なコンポーネントを作る（7票、最高評価）
> "One of the main aspects of React is the reusability of components. Instead of reusing styles, you should reuse components and if you need further customization for different cases, you can use a props interface in the component."

**スタイルを再利用するのではなく、コンポーネントを再利用すべき。**

### 2. グローバルスタイルシートは避ける（6票）
> "Global style sheets suck IMO… hard to visualize which styles you're using, and hard to integrate any small, isolated changes. If you find yourself repeating the same style, it's better to just create generic components that use those styles, things like Typography.Title, CardView, GenericListItem, things like that"

**グローバルスタイルシートの問題点:**
- どのスタイルを使っているか可視化しにくい
- 小さな変更を分離して統合しにくい

**代替案:** `Typography.Title`, `CardView`, `GenericListItem`などの汎用コンポーネントを作成

### 3. フォルダ構造でスタイルを分離（2票）
> "Whenever I create a component I usually put it into a folder named by its name where I have an index.tsx and a styles.ts. That's the best way I could find to keep logic and styling separate but at the same time 'together'"

```
ComponentName/
  ├── index.tsx
  └── styles.ts
```

### 4. 再利用可能なコンポーネントを作る（3票）
> "Make reusable components: buttons, text, inputs etc along with your color scheme that is part of your component theme. This way you don't need to style everything since it should all be done. Just worry about the specific UI layout"

### 5. Shopify Restyleの推奨（4票）
https://github.com/shopify/restyle - テーマとバリアントのパターンが優れている

## 結論

コミュニティの合意:
1. **グローバルスタイルシートは避ける**
2. **スタイルではなくコンポーネントを再利用する**
3. **コンポーネントごとにスタイルを閉じ込める**
4. **汎用コンポーネント（Typography, Card等）を作成する**
