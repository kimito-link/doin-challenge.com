# Phase 2 実装ルール（NG集）

## このドキュメントの目的

Phase 2（ログインUX改善）の実装において、**やってはいけないこと**を明確にし、実装事故を防ぐためのルール集です。

---

## 絶対に守るべきルール

### 1. 絵文字禁止

#### ❌ NG
```tsx
<Text>ログイン成功！ 🎉</Text>
<Text>エラーが発生しました 😢</Text>
<Text>お気に入りに追加 ❤️</Text>
```

#### ✅ OK
```tsx
<Text>ログイン成功！</Text>
<Text>エラーが発生しました</Text>
<Text>お気に入りに追加</Text>
```

#### 理由
- りんくキャラクターのイラストで統一
- 絵文字は環境によって見え方が異なる
- ブランドの一貫性を保つ

---

### 2. 「認証」という言葉を使わない

#### ❌ NG
```tsx
<Text>Xアカウントで認証しています</Text>
<Text>認証に失敗しました</Text>
<Text>認証が必要です</Text>
```

#### ✅ OK
```tsx
<Text>Xでログインする</Text>
<Text>ログインできませんでした</Text>
<Text>ログインが必要です</Text>
```

#### 理由
- 「認証」は専門用語
- 一般ユーザーには「ログイン」の方がわかりやすい

---

### 3. 専門用語を使わない

#### ❌ NG
```tsx
<Text>OAuth認証</Text>
<Text>APIエラー</Text>
<Text>トークンの有効期限が切れました</Text>
<Text>セッションがタイムアウトしました</Text>
```

#### ✅ OK
```tsx
<Text>Xでログイン</Text>
<Text>ログインできませんでした</Text>
<Text>もう一度ログインしてください</Text>
<Text>もう一度ログインしてください</Text>
```

#### 理由
- 技術的な詳細はユーザーに見せない
- わかりやすい言葉で説明する

---

### 4. login() を自動実行しない

#### ❌ NG
```tsx
// ページ表示時に自動実行
useEffect(() => {
  if (!isAuthenticated) {
    login();
  }
}, []);

// AuthGuard で即リダイレクト
function AuthGuard({ children }) {
  if (!isAuthenticated) {
    login(); // NG
    return null;
  }
  return children;
}
```

#### ✅ OK
```tsx
// ボタン押下時のみ実行
function LoginButton() {
  const handleLogin = () => {
    // 確認モーダルを表示
    setShowLoginConfirm(true);
  };
  
  return (
    <Button onPress={handleLogin}>
      ログインする
    </Button>
  );
}
```

#### 理由
- ユーザーの意図しないリダイレクトを防ぐ
- 必ず確認モーダルを経由する

---

### 5. CTA（ボタン）押下のみでログイン開始

#### ❌ NG
```tsx
// リンクをタップしたら即ログイン
<Text onPress={login}>ログインはこちら</Text>

// 画面表示時に自動ログイン
useEffect(() => {
  login();
}, []);

// 他のアクション中に自動ログイン
function handleFavorite() {
  if (!isAuthenticated) {
    login(); // NG
  }
}
```

#### ✅ OK
```tsx
// 明確なボタンのみ
<Button onPress={handleLogin}>
  ログインする
</Button>

// 他のアクション時は確認を挟む
function handleFavorite() {
  if (!isAuthenticated) {
    setShowLoginPrompt(true); // 確認モーダル表示
  }
}
```

#### 理由
- ユーザーが意図したタイミングでのみログイン
- 誤操作を防ぐ

---

## コンポーネント使用のルール

### 1. 共通コンポーネントを使う

#### ❌ NG
```tsx
// 個別に作る
function MyLoginModal() {
  return (
    <Modal>
      <Text>ログインしますか？</Text>
      <Button>はい</Button>
    </Modal>
  );
}
```

#### ✅ OK
```tsx
// 共通コンポーネントを使う
import { LoginConfirmModal } from '@/components/organisms/login-confirm-modal';

<LoginConfirmModal
  visible={showLoginConfirm}
  onConfirm={handleLogin}
  onCancel={handleCancel}
/>
```

#### 理由
- デザインの一貫性
- メンテナンスが容易
- バグの混入を防ぐ

---

### 2. りんく吹き出しは LinkSpeech を使う

#### ❌ NG
```tsx
// 独自に作る
<View style={styles.speechBubble}>
  <Image source={rinkuIcon} />
  <Text>ログインすると便利だよ！</Text>
</View>
```

#### ✅ OK
```tsx
import { LinkSpeech } from '@/components/organisms/link-speech';

<LinkSpeech>
  ログインすると、参加履歴やお気に入りが見られるよ！
</LinkSpeech>
```

#### 理由
- デザインの統一
- りんくキャラクターの表示を一元管理

---

### 3. 文言は phase2-copy-final.md から取得

#### ❌ NG
```tsx
// 独自の文言
<Text>ログインに失敗しました。再度お試しください。</Text>
```

#### ✅ OK
```tsx
// ドキュメントの文言をそのまま使用
<LinkSpeech>
  うまくいかなかったみたい...{'\n'}
  もう一度試してみてね！
</LinkSpeech>
```

#### 理由
- トーンの統一
- 文言の一元管理
- 勝手な変更を防ぐ

---

## エラーハンドリングのルール

### 1. エラーメッセージは優しく

#### ❌ NG
```tsx
<Text>エラーが発生しました</Text>
<Text>認証に失敗しました</Text>
<Text>不正なリクエストです</Text>
```

#### ✅ OK
```tsx
<LinkSpeech>
  うまくいかなかったみたい...{'\n'}
  もう一度試してみてね！
</LinkSpeech>
```

#### 理由
- ユーザーを責めない
- ポジティブな表現
- 解決策を示す

---

### 2. 技術的な詳細は隠す（本番環境）

#### ❌ NG
```tsx
// 本番環境でも表示
<Text>Error: OAuth token expired (401)</Text>
<Text>Network request failed: ECONNREFUSED</Text>
```

#### ✅ OK
```tsx
// 本番環境
<LinkSpeech>
  ログインできませんでした。{'\n'}
  もう一度試してみてね！
</LinkSpeech>

// 開発環境のみ
{process.env.NODE_ENV === 'development' && (
  <Text style={styles.debug}>
    Error: {error.message}{'\n'}
    Request ID: {requestId}
  </Text>
)}
```

#### 理由
- ユーザーには関係ない情報
- セキュリティリスク
- 開発時のデバッグには必要

---

### 3. エラーの種類を判定する

#### ❌ NG
```tsx
// すべて同じエラーメッセージ
catch (error) {
  showError('エラーが発生しました');
}
```

#### ✅ OK
```tsx
catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    showError('network'); // ネットワークエラー
  } else if (error.code === 'OAUTH_ERROR') {
    showError('oauth'); // X側のエラー
  } else {
    showError('other'); // その他のエラー
  }
}
```

#### 理由
- 適切なメッセージを表示
- ユーザーが対処しやすい

---

## 遷移のルール

### 1. マイページ起点

#### ❌ NG
```tsx
// ホーム画面からログイン
<Button onPress={login}>ログイン</Button>

// チャレンジ詳細からログイン
<Button onPress={login}>参加する（要ログイン）</Button>
```

#### ✅ OK
```tsx
// マイページからのみログイン
// 他の画面からはマイページに誘導
<Button onPress={() => router.push('/mypage')}>
  ログインする
</Button>
```

#### 理由
- ログインフローを一箇所に集約
- 管理が容易
- バグの混入を防ぐ

---

### 2. エラー/キャンセル後はマイページ（未ログイン）に戻る

#### ❌ NG
```tsx
// エラー後にホーム画面に戻る
onError={() => router.push('/')}

// キャンセル後に前の画面に戻る
onCancel={() => router.back()}
```

#### ✅ OK
```tsx
// マイページ（未ログイン）に戻る
onError={() => router.push('/mypage')}
onCancel={() => router.push('/mypage')}
```

#### 理由
- 一貫した動作
- ユーザーが迷わない

---

## 状態管理のルール

### 1. ログイン状態は AsyncStorage に保存

#### ❌ NG
```tsx
// メモリのみに保存
const [user, setUser] = useState(null);
```

#### ✅ OK
```tsx
// AsyncStorage に保存
const [user, setUser] = useState(null);

useEffect(() => {
  AsyncStorage.setItem('user', JSON.stringify(user));
}, [user]);
```

#### 理由
- アプリ再起動後も維持
- ユーザー体験の向上

---

### 2. ローディング状態を管理

#### ❌ NG
```tsx
// ローディング状態なし
async function login() {
  const user = await api.login();
  setUser(user);
}
```

#### ✅ OK
```tsx
// ローディング状態を管理
async function login() {
  setLoading(true);
  try {
    const user = await api.login();
    setUser(user);
  } finally {
    setLoading(false);
  }
}
```

#### 理由
- ユーザーに進行状況を伝える
- 二重送信を防ぐ

---

## テストのルール

### 1. 各画面のスナップショットテストを書く

#### ✅ 必須
```tsx
describe('LinkAuthResult', () => {
  it('renders success state', () => {
    const { toJSON } = render(
      <LinkAuthResult type="success" />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  
  it('renders cancel state', () => {
    const { toJSON } = render(
      <LinkAuthResult type="cancel" />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  
  it('renders error state', () => {
    const { toJSON } = render(
      <LinkAuthResult type="error" errorType="network" />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
```

---

### 2. ユーザーフローのE2Eテストを書く

#### ✅ 必須
```typescript
describe('Login Flow', () => {
  it('should complete login flow', async () => {
    // マイページに移動
    await page.goto('/mypage');
    
    // ログインボタンをクリック
    await page.click('[data-testid="login-button"]');
    
    // 確認モーダルが表示される
    await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible();
    
    // ログインボタンをクリック
    await page.click('[data-testid="confirm-login-button"]');
    
    // Twitter OAuth にリダイレクト
    await expect(page).toHaveURL(/twitter\.com/);
  });
});
```

---

## チェックリスト

実装前に必ず確認してください。

### コーディング前
- [ ] phase2-copy-final.md の文言を確認した
- [ ] phase2-flow-diagram.md の遷移図を確認した
- [ ] このドキュメント（NG集）を読んだ

### コーディング中
- [ ] 絵文字を使っていない
- [ ] 「認証」という言葉を使っていない
- [ ] 専門用語を使っていない
- [ ] login() を自動実行していない
- [ ] 共通コンポーネントを使っている
- [ ] 文言をドキュメントから取得している

### コーディング後
- [ ] スナップショットテストを書いた
- [ ] E2Eテストを書いた
- [ ] 開発環境で動作確認した
- [ ] エラーケースを確認した
- [ ] キャンセルケースを確認した

---

## まとめ

### 絶対に守る5つのルール

1. **絵文字禁止**
2. **「認証」禁止**
3. **専門用語禁止**
4. **login() 自動実行禁止**
5. **CTA押下のみログイン開始**

### 迷ったら

1. **phase2-copy-final.md を見る**
2. **phase2-flow-diagram.md を見る**
3. **このドキュメント（NG集）を見る**
4. **既存の共通コンポーネントを使う**

### 実装前に確認

- [ ] このドキュメントを読んだ
- [ ] チェックリストを確認した
- [ ] 不明点を解消した

---

## 違反例の報告

このルールに違反するコードを見つけた場合は、すぐに修正してください。

### 修正の優先順位

1. **絵文字の使用**（最優先）
2. **「認証」という言葉**
3. **login() の自動実行**
4. **専門用語の使用**
5. **文言の不統一**
