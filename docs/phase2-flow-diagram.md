# Phase 2 遷移図

## 全体フロー

```mermaid
graph TD
    A[マイページ<br/>未ログイン] --> B[ログインボタン押下]
    B --> C[ログイン確認モーダル]
    C --> D{ユーザーの選択}
    D -->|ログインする| E[Twitter OAuth画面へ]
    D -->|キャンセル| F[マイページに戻る<br/>未ログイン]
    
    E --> G{OAuth結果}
    G -->|成功| H[ローディング画面]
    G -->|キャンセル| I[キャンセル画面]
    G -->|エラー| J[エラー画面]
    
    H --> K[ログイン成功画面]
    K --> L[マイページ<br/>ログイン済み]
    
    I --> M{ユーザーの選択}
    M -->|マイページに戻る| F
    
    J --> N{ユーザーの選択}
    N -->|もう一度試す| C
    N -->|マイページに戻る| F
    
    L --> O[ログアウトボタン押下]
    O --> P[ログアウト確認モーダル]
    P --> Q{ユーザーの選択}
    Q -->|ログアウトする| R[ログアウト処理]
    Q -->|キャンセル| L
    R --> F
```

---

## 詳細フロー

### 1. ログインフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant MyPage as マイページ
    participant Modal as ログイン確認モーダル
    participant OAuth as Twitter OAuth
    participant Loading as ローディング画面
    participant Result as 結果画面
    
    User->>MyPage: ログインボタン押下
    MyPage->>Modal: モーダル表示
    
    alt ログインする
        User->>Modal: ログインボタン押下
        Modal->>OAuth: リダイレクト
        OAuth->>Loading: 認証成功
        Loading->>Result: ログイン成功画面表示
        Result->>MyPage: マイページ（ログイン済み）
    else キャンセル
        User->>Modal: キャンセルボタン押下
        Modal->>MyPage: マイページに戻る（未ログイン）
    end
```

### 2. エラーフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant OAuth as Twitter OAuth
    participant Error as エラー画面
    participant Modal as ログイン確認モーダル
    participant MyPage as マイページ
    
    OAuth->>Error: 認証エラー
    Error->>User: エラー画面表示
    
    alt もう一度試す
        User->>Error: もう一度試すボタン押下
        Error->>Modal: ログイン確認モーダル表示
    else マイページに戻る
        User->>Error: マイページに戻るボタン押下
        Error->>MyPage: マイページ（未ログイン）
    end
```

### 3. キャンセルフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant OAuth as Twitter OAuth
    participant Cancel as キャンセル画面
    participant MyPage as マイページ
    
    OAuth->>Cancel: ユーザーがOAuthをキャンセル
    Cancel->>User: キャンセル画面表示
    User->>Cancel: マイページに戻るボタン押下
    Cancel->>MyPage: マイページ（未ログイン）
```

### 4. ログアウトフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant MyPage as マイページ（ログイン済み）
    participant Modal as ログアウト確認モーダル
    participant Logout as ログアウト処理
    participant MyPageUnauth as マイページ（未ログイン）
    
    User->>MyPage: ログアウトボタン押下
    MyPage->>Modal: モーダル表示
    
    alt ログアウトする
        User->>Modal: ログアウトボタン押下
        Modal->>Logout: ログアウト処理実行
        Logout->>MyPageUnauth: マイページ（未ログイン）
    else キャンセル
        User->>Modal: キャンセルボタン押下
        Modal->>MyPage: マイページに留まる（ログイン済み）
    end
```

---

## 画面一覧

### 既存画面（Phase 1）
1. **マイページ（未ログイン）**
   - ログインボタン表示
   - ファイル: `app/(tabs)/mypage.tsx`

2. **ログイン確認モーダル**
   - ログインのメリット表示
   - 「ログインする」「キャンセル」ボタン
   - ファイル: `components/organisms/login-confirm-modal.tsx`

3. **マイページ（ログイン済み）**
   - ユーザー情報表示
   - ログアウトボタン表示
   - ファイル: `app/(tabs)/mypage.tsx`

### 新規画面（Phase 2）

4. **ローディング画面**
   - りんくキャラクターのアニメーション
   - 「ログイン中...」メッセージ
   - ファイル: `components/organisms/link-auth-loading.tsx`（新規作成）

5. **結果画面（共通コンポーネント）**
   - 成功/キャンセル/エラーを出し分け
   - ファイル: `components/organisms/link-auth-result.tsx`（新規作成）
   - Props:
     - `type: 'success' | 'cancel' | 'error'`
     - `errorType?: 'network' | 'oauth' | 'other'`（エラー時のみ）
     - `requestId?: string`（エラー時、開発環境のみ）

6. **ログアウト確認モーダル**
   - ログアウトの影響を説明
   - 「ログアウトする」「キャンセル」ボタン
   - ファイル: `components/organisms/logout-confirm-modal.tsx`（新規作成）

---

## 状態管理

### ログイン状態

```typescript
type AuthState = 
  | { status: 'unauthenticated' }
  | { status: 'loading' }
  | { status: 'authenticated', user: User }
  | { status: 'error', error: AuthError };
```

### エラー種別

```typescript
type AuthError = 
  | { type: 'network', message: string }
  | { type: 'oauth', message: string }
  | { type: 'other', message: string, requestId?: string };
```

---

## URL パラメータ

### OAuth コールバック

```
/oauth/callback?code=xxx&state=yyy
```

### エラー時

```
/oauth/callback?error=access_denied&error_description=xxx
```

### キャンセル時

```
/oauth/callback?cancelled=true
```

---

## 実装の優先順位

1. **キャンセル画面**（最優先）
   - ユーザーが戻るボタンを押した時の対応
   - `LinkAuthResult` コンポーネント作成
   - `type='cancel'` の実装

2. **エラー画面**
   - `LinkAuthResult` に `type='error'` を追加
   - エラー種別の判定ロジック
   - requestId の表示（開発環境のみ）

3. **ローディング画面**
   - `LinkAuthLoading` コンポーネント作成
   - りんくキャラクターのアニメーション

4. **ログアウト確認**
   - `LogoutConfirmModal` コンポーネント作成
   - ログアウトボタンの動作変更

---

## 遷移のルール

### 基本ルール
1. **マイページ起点**
   - すべてのログイン関連フローはマイページから開始
   - エラー/キャンセル後はマイページ（未ログイン）に戻る

2. **モーダルの使い分け**
   - 確認: モーダル
   - 結果: フルスクリーン画面

3. **戻るボタンの動作**
   - モーダル: 閉じる
   - フルスクリーン: マイページに戻る

### エラー時の遷移
1. **もう一度試す**
   - ログイン確認モーダルを再表示
   - Twitter OAuth に再度リダイレクト

2. **マイページに戻る**
   - マイページ（未ログイン）に遷移
   - エラー状態をクリア

### キャンセル時の遷移
1. **マイページに戻る**
   - マイページ（未ログイン）に遷移
   - キャンセル状態をクリア

---

## 実装時の注意事項

1. **状態の永続化**
   - ログイン状態は AsyncStorage に保存
   - アプリ再起動後も維持

2. **エラーハンドリング**
   - すべてのエラーをキャッチ
   - ユーザーに優しいメッセージを表示
   - 開発環境では詳細情報を表示

3. **ローディング状態**
   - 最小表示時間: 500ms
   - 最大表示時間: 10秒（タイムアウト）

4. **アニメーション**
   - モーダルの開閉: 300ms
   - 画面遷移: 250ms
   - ローディング: 無限ループ

5. **アクセシビリティ**
   - すべてのボタンに適切なラベル
   - スクリーンリーダー対応
   - キーボードナビゲーション対応（Web）
