# スクリーンリーダー対応ガイド

React Nativeアプリケーションのスクリーンリーダー対応のベストプラクティス。

## 基本原則

1. **すべてのインタラクティブ要素にラベルを追加**
2. **画像には説明的なラベルを設定**（装飾画像は除く）
3. **フォームのエラーメッセージをスクリーンリーダーで読み上げ可能にする**
4. **動的なコンテンツ変更を通知する**

---

## Accessibility Props

### `accessibilityLabel`

**用途**: 要素の説明を提供  
**必須**: ボタン、リンク、画像、アイコンなど

```tsx
<TouchableOpacity
  accessibilityLabel="ホーム画面に戻る"
  onPress={goHome}
>
  <IconSymbol name="house.fill" />
</TouchableOpacity>
```

### `accessibilityHint`

**用途**: 要素を操作した結果を説明  
**必須**: 操作結果が明確でない場合

```tsx
<TouchableOpacity
  accessibilityLabel="チャレンジを作成"
  accessibilityHint="新しいチャレンジを作成する画面に移動します"
  onPress={createChallenge}
>
  <Text>作成</Text>
</TouchableOpacity>
```

### `accessibilityRole`

**用途**: 要素の役割を指定  
**必須**: すべてのインタラクティブ要素

```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="ログイン"
>
  <Text>ログイン</Text>
</TouchableOpacity>
```

**主な役割**:
- `button`: ボタン
- `link`: リンク
- `header`: ヘッダー
- `image`: 画像
- `imagebutton`: 画像ボタン
- `text`: テキスト
- `none`: 装飾要素（スクリーンリーダーで無視）

### `accessibilityState`

**用途**: 要素の状態を指定  
**必須**: チェックボックス、ラジオボタン、選択可能な要素

```tsx
<TouchableOpacity
  accessibilityRole="checkbox"
  accessibilityState={{ checked: isChecked }}
  accessibilityLabel="利用規約に同意する"
  onPress={toggleCheck}
>
  <Text>{isChecked ? "☑" : "☐"} 利用規約に同意する</Text>
</TouchableOpacity>
```

**主な状態**:
- `disabled`: 無効
- `selected`: 選択済み
- `checked`: チェック済み
- `busy`: 読み込み中
- `expanded`: 展開済み

### `accessible`

**用途**: 要素をスクリーンリーダーで読み上げ可能にする  
**デフォルト**: `true`

```tsx
// 装飾要素はスクリーンリーダーで無視
<View accessible={false}>
  <Image source={decorativeImage} />
</View>
```

### `accessibilityLiveRegion`

**用途**: 動的なコンテンツ変更を通知  
**必須**: 通知、エラーメッセージ、読み込み状態など

```tsx
<View accessibilityLiveRegion="polite">
  <Text>{errorMessage}</Text>
</View>
```

**値**:
- `none`: 通知しない（デフォルト）
- `polite`: 現在の読み上げが終わってから通知
- `assertive`: すぐに通知

---

## 実装例

### ボタン

```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="チャレンジを作成"
  accessibilityHint="新しいチャレンジを作成する画面に移動します"
  onPress={createChallenge}
>
  <Text>作成</Text>
</TouchableOpacity>
```

### 画像

```tsx
// 意味のある画像
<Image
  source={userAvatar}
  accessibilityRole="image"
  accessibilityLabel={`${userName}のアバター`}
/>

// 装飾画像
<Image
  source={decorativeImage}
  accessibilityRole="none"
  accessible={false}
/>
```

### フォーム

```tsx
<View>
  <Text accessibilityRole="header">ユーザー名</Text>
  <TextInput
    accessibilityLabel="ユーザー名を入力"
    accessibilityHint="3文字以上20文字以下で入力してください"
    value={username}
    onChangeText={setUsername}
  />
  {usernameError && (
    <View accessibilityLiveRegion="polite">
      <Text accessibilityRole="alert" className="text-error">
        {usernameError}
      </Text>
    </View>
  )}
</View>
```

### チェックボックス

```tsx
<TouchableOpacity
  accessibilityRole="checkbox"
  accessibilityState={{ checked: agreedToTerms }}
  accessibilityLabel="利用規約に同意する"
  onPress={() => setAgreedToTerms(!agreedToTerms)}
>
  <Text>{agreedToTerms ? "☑" : "☐"} 利用規約に同意する</Text>
</TouchableOpacity>
```

### リスト

```tsx
<FlatList
  data={challenges}
  accessibilityRole="list"
  renderItem={({ item, index }) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`チャレンジ ${index + 1}: ${item.title}`}
      accessibilityHint="タップして詳細を表示"
      onPress={() => navigateToDetail(item.id)}
    >
      <Text>{item.title}</Text>
    </TouchableOpacity>
  )}
/>
```

### モーダル

```tsx
<Modal
  visible={isVisible}
  onRequestClose={onClose}
  accessibilityViewIsModal={true}
>
  <View>
    <Text accessibilityRole="header">確認</Text>
    <Text>本当に削除しますか？</Text>
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="削除を確認"
      onPress={onConfirm}
    >
      <Text>削除</Text>
    </TouchableOpacity>
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="キャンセル"
      onPress={onClose}
    >
      <Text>キャンセル</Text>
    </TouchableOpacity>
  </View>
</Modal>
```

### 読み込み状態

```tsx
{isLoading && (
  <View accessibilityLiveRegion="polite">
    <ActivityIndicator accessibilityLabel="読み込み中" />
  </View>
)}
```

---

## チェックリスト

### すべてのインタラクティブ要素

- [ ] `accessibilityRole`を設定
- [ ] `accessibilityLabel`を設定
- [ ] 必要に応じて`accessibilityHint`を設定
- [ ] 状態がある場合は`accessibilityState`を設定

### 画像

- [ ] 意味のある画像には`accessibilityLabel`を設定
- [ ] 装飾画像には`accessibilityRole="none"`と`accessible={false}`を設定

### フォーム

- [ ] すべての入力フィールドに`accessibilityLabel`を設定
- [ ] エラーメッセージに`accessibilityLiveRegion="polite"`を設定
- [ ] エラーメッセージに`accessibilityRole="alert"`を設定

### 動的コンテンツ

- [ ] 通知、エラーメッセージ、読み込み状態に`accessibilityLiveRegion`を設定
- [ ] 重要度に応じて`polite`または`assertive`を選択

### モーダル

- [ ] `accessibilityViewIsModal={true}`を設定
- [ ] モーダル内の最初の要素にフォーカスを移動

---

## テスト方法

### iOS

1. **VoiceOverを有効化**: 設定 > アクセシビリティ > VoiceOver
2. **ジェスチャー**:
   - 右スワイプ: 次の要素
   - 左スワイプ: 前の要素
   - ダブルタップ: アクティブ化
   - 3本指で左右スワイプ: ページ移動

### Android

1. **TalkBackを有効化**: 設定 > ユーザー補助 > TalkBack
2. **ジェスチャー**:
   - 右スワイプ: 次の要素
   - 左スワイプ: 前の要素
   - ダブルタップ: アクティブ化
   - 2本指で上下スワイプ: スクロール

---

## 参考資料

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS VoiceOver](https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios)
- [Android TalkBack](https://support.google.com/accessibility/android/answer/6283677)
