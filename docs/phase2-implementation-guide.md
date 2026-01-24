# Phase 2 実装ガイド

## 概要

このドキュメントは、Phase 2（ログインUX改善）の実装に必要なすべての情報をまとめたものです。

---

## 📚 ドキュメント一覧

### A. 完成コピー（文言集）
**ファイル**: `phase2-copy-final.md`

すべての画面で使用する文言が1文字単位で定義されています。

- ログイン確認モーダル
- キャンセル画面
- エラー画面（3種類）
- ローディング画面
- ログアウト確認モーダル
- 成功画面

**使い方**: このドキュメントの文言をそのままコピーして使用してください。勝手に変更しないでください。

---

### B. りんく吹き出しテンプレート
**ファイル**: `phase2-rinku-speech-templates.md`

りんくキャラクターの吹き出しで使用する文言のテンプレート集です。

- ログイン関連
- チャレンジ参加関連
- お気に入り関連
- エラー・問題発生時
- 成功・完了時
- 確認・警告時
- 空状態（Empty State）
- ガイド・ヘルプ

**使い方**: 新しい画面を作る時は、まずこのテンプレート集を確認してください。

---

### C. 遷移図
**ファイル**: `phase2-flow-diagram.md` / `phase2-flow-diagram.png`

ログインフローの全体像と詳細な遷移図です。

- 全体フロー
- ログインフロー
- エラーフロー
- キャンセルフロー
- ログアウトフロー
- 画面一覧
- 状態管理
- URLパラメータ

**使い方**: 実装前に必ず確認してください。迷ったらこの図を見てください。

---

### D. 実装ルール（NG集）
**ファイル**: `phase2-implementation-rules.md`

やってはいけないことをまとめたルール集です。

- 絶対に守るべきルール
- コンポーネント使用のルール
- エラーハンドリングのルール
- 遷移のルール
- 状態管理のルール
- テストのルール
- チェックリスト

**使い方**: 実装前に必ず読んでください。実装中も定期的に確認してください。

---

## 🎯 実装の優先順位

ChatGPTの推奨に基づき、以下の順序で実装します。

### 1. キャンセル画面（最優先）
- `LinkAuthResult` コンポーネント作成
- `type='cancel'` の実装
- OAuth コールバックの処理

### 2. エラー画面
- `LinkAuthResult` に `type='error'` を追加
- エラー種別の判定ロジック
- requestId の表示（開発環境のみ）

### 3. ローディング画面
- `LinkAuthLoading` コンポーネント作成
- りんくキャラクターのアニメーション
- OAuth からの戻り処理

### 4. ログアウト確認
- `LogoutConfirmModal` コンポーネント作成
- ログアウトボタンの動作変更
- マイページへの遷移

---

## 📦 作成するコンポーネント

### 1. LinkAuthResult（共通コンポーネント）

**ファイル**: `components/organisms/link-auth-result.tsx`

**Props**:
```typescript
interface LinkAuthResultProps {
  type: 'success' | 'cancel' | 'error';
  errorType?: 'network' | 'oauth' | 'other';
  requestId?: string;
  onRetry?: () => void;
  onBack?: () => void;
}
```

**用途**:
- 成功画面
- キャンセル画面
- エラー画面（3種類）

---

### 2. LinkAuthLoading

**ファイル**: `components/organisms/link-auth-loading.tsx`

**Props**:
```typescript
interface LinkAuthLoadingProps {
  message?: string;
}
```

**用途**:
- Twitter OAuth からの戻り時
- 認証処理中

---

### 3. LogoutConfirmModal

**ファイル**: `components/organisms/logout-confirm-modal.tsx`

**Props**:
```typescript
interface LogoutConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**用途**:
- ログアウトボタン押下時

---

## 🔄 実装フロー

### ステップ1: キャンセル画面

1. **LinkAuthResult コンポーネント作成**
   ```bash
   touch components/organisms/link-auth-result.tsx
   ```

2. **type='cancel' の実装**
   - タイトル: 「ログインをキャンセルしました」
   - 本文: 「またいつでもログインできるから、安心してね！」
   - ボタン: 「マイページに戻る」

3. **OAuth コールバックの処理**
   ```typescript
   // app/oauth/callback/+page.tsx
   if (searchParams.get('cancelled') === 'true') {
     return <LinkAuthResult type="cancel" />;
   }
   ```

4. **テスト作成**
   ```bash
   touch components/organisms/__tests__/link-auth-result.test.tsx
   ```

---

### ステップ2: エラー画面

1. **LinkAuthResult に type='error' を追加**
   - エラー種別の判定
   - 文言の出し分け
   - requestId の表示（開発環境のみ）

2. **エラー判定ロジック**
   ```typescript
   function getErrorType(error: Error): 'network' | 'oauth' | 'other' {
     if (error.message.includes('network')) return 'network';
     if (error.message.includes('oauth')) return 'oauth';
     return 'other';
   }
   ```

3. **OAuth コールバックの処理**
   ```typescript
   // app/oauth/callback/+page.tsx
   if (searchParams.get('error')) {
     const errorType = getErrorType(error);
     return (
       <LinkAuthResult 
         type="error" 
         errorType={errorType}
         requestId={requestId}
       />
     );
   }
   ```

4. **テスト更新**
   - エラー種別ごとのテスト
   - requestId 表示のテスト

---

### ステップ3: ローディング画面

1. **LinkAuthLoading コンポーネント作成**
   ```bash
   touch components/organisms/link-auth-loading.tsx
   ```

2. **りんくキャラクターのアニメーション**
   - バウンスアニメーション
   - ローディングドット

3. **OAuth からの戻り処理**
   ```typescript
   // app/oauth/callback/+page.tsx
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     async function handleCallback() {
       setLoading(true);
       try {
         await processOAuthCallback();
       } finally {
         setLoading(false);
       }
     }
     handleCallback();
   }, []);
   
   if (loading) {
     return <LinkAuthLoading />;
   }
   ```

4. **テスト作成**
   ```bash
   touch components/organisms/__tests__/link-auth-loading.test.tsx
   ```

---

### ステップ4: ログアウト確認

1. **LogoutConfirmModal コンポーネント作成**
   ```bash
   touch components/organisms/logout-confirm-modal.tsx
   ```

2. **マイページに統合**
   ```typescript
   // app/(tabs)/mypage.tsx
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
   
   const handleLogout = () => {
     setShowLogoutConfirm(true);
   };
   
   const handleConfirmLogout = async () => {
     await logout();
     setShowLogoutConfirm(false);
     router.push('/mypage');
   };
   ```

3. **テスト作成**
   ```bash
   touch components/organisms/__tests__/logout-confirm-modal.test.tsx
   ```

---

## ✅ チェックリスト

### 実装前
- [ ] phase2-copy-final.md を読んだ
- [ ] phase2-flow-diagram.md を読んだ
- [ ] phase2-implementation-rules.md を読んだ
- [ ] 既存のコンポーネントを確認した

### 実装中
- [ ] 絵文字を使っていない
- [ ] 「認証」という言葉を使っていない
- [ ] 専門用語を使っていない
- [ ] login() を自動実行していない
- [ ] 共通コンポーネントを使っている
- [ ] 文言をドキュメントから取得している

### 実装後
- [ ] スナップショットテストを書いた
- [ ] E2Eテストを書いた
- [ ] 開発環境で動作確認した
- [ ] エラーケースを確認した
- [ ] キャンセルケースを確認した
- [ ] ログアウトフローを確認した

---

## 🧪 テスト戦略

### ユニットテスト（Vitest）

```typescript
// components/organisms/__tests__/link-auth-result.test.tsx
describe('LinkAuthResult', () => {
  it('renders success state', () => {
    const { getByText } = render(<LinkAuthResult type="success" />);
    expect(getByText('ログイン完了！')).toBeTruthy();
  });
  
  it('renders cancel state', () => {
    const { getByText } = render(<LinkAuthResult type="cancel" />);
    expect(getByText('ログインをキャンセルしました')).toBeTruthy();
  });
  
  it('renders error state with network error', () => {
    const { getByText } = render(
      <LinkAuthResult type="error" errorType="network" />
    );
    expect(getByText('ネットワークに問題があるみたい...')).toBeTruthy();
  });
});
```

### E2Eテスト（Playwright）

```typescript
// tests/e2e/login-flow.spec.ts
describe('Login Flow', () => {
  it('should show cancel screen when user cancels OAuth', async () => {
    await page.goto('/mypage');
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="confirm-login-button"]');
    
    // OAuth画面でキャンセル
    await page.goto('/oauth/callback?cancelled=true');
    
    // キャンセル画面が表示される
    await expect(page.getByText('ログインをキャンセルしました')).toBeVisible();
  });
});
```

---

## 📝 実装時の注意事項

### 1. 文言は1文字も変えない
- phase2-copy-final.md の文言をそのまま使用
- 勝手に言い回しを変えない

### 2. 共通コンポーネントを使う
- LinkSpeech
- LoginConfirmModal
- LinkAuthResult
- LinkAuthLoading
- LogoutConfirmModal

### 3. エラーハンドリングを徹底
- すべてのエラーをキャッチ
- 適切なエラーメッセージを表示
- 開発環境では詳細情報を表示

### 4. 遷移のルールを守る
- マイページ起点
- エラー/キャンセル後はマイページ（未ログイン）に戻る

### 5. テストを書く
- ユニットテスト
- E2Eテスト
- スナップショットテスト

---

## 🚀 実装開始

準備ができたら、以下の順序で実装を開始してください：

1. **キャンセル画面**（最優先）
2. **エラー画面**
3. **ローディング画面**
4. **ログアウト確認**

各ステップが完了したら、テストを実行して動作を確認してください。

---

## 📞 サポート

実装中に不明点があれば、以下のドキュメントを参照してください：

- **文言**: phase2-copy-final.md
- **遷移**: phase2-flow-diagram.md
- **ルール**: phase2-implementation-rules.md
- **テンプレート**: phase2-rinku-speech-templates.md

それでも解決しない場合は、質問してください。
