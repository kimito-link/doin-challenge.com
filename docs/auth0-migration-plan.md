# Auth0完全移行計画

## 概要

このドキュメントは、Twitter OAuth2からAuth0への完全移行計画を記載します。

## 現状分析

### Twitter OAuth2を使用しているファイル

#### サーバーサイド
1. **server/twitter-routes.ts** - Twitter OAuth2エンドポイント（削除対象）
2. **server/twitter-oauth2.ts** - OAuth2ヘルパー関数（削除対象）
3. **server/twitter-auth.ts** - Twitter認証関連（確認必要）
4. **server/token-store.ts** - トークン管理（部分的に保持）
5. **server/_core/index.ts** - ルート登録（修正必要）
6. **server/_core/oauth.ts** - OAuth関連（確認必要）

#### フロントエンド
1. **lib/api/twitter-auth.ts** - Twitter認証URL構築（削除対象）
2. **lib/_core/api.ts** - Twitter APIエンドポイント（修正必要）
3. **lib/api/endpoints.ts** - Twitter APIエンドポイント（修正必要）
4. **lib/api/profile-cache.ts** - プロフィールキャッシュ（確認必要）
5. **lib/token-manager.ts** - トークン管理（修正必要）
6. **components/organisms/account-switcher.tsx** - アカウント切り替え（修正必要）

#### テスト
1. **__tests__/twitter-oauth2.test.ts** - Twitter OAuth2テスト（削除対象）
2. **__tests__/force-login.test.ts** - ログインテスト（修正必要）
3. **__tests__/follow-status.test.ts** - フォロー状態テスト（修正必要）
4. **tests/twitter-routes-security.test.ts** - セキュリティテスト（削除対象）

## 移行方針

### 1. Auth0で実現する機能

#### 認証機能
- ✅ Twitter Social Connection経由のログイン
- ✅ OpenID Connect準拠の認証
- ✅ JWTトークン検証
- ✅ セッション管理

#### ユーザー情報取得
- ✅ Auth0 Management APIでユーザー情報取得
- ✅ Twitter Social Connectionからプロフィール情報取得
- ⚠️ フォロー状態確認 → Twitter API v2を直接使用（Auth0経由ではなく）

### 2. Twitter API v2を直接使用する機能

以下の機能はAuth0では提供されないため、Twitter API v2を直接使用します：

1. **フォロー状態確認**
   - `GET /2/users/:id/following` エンドポイント
   - ユーザーが特定のアカウントをフォローしているか確認

2. **ユーザー情報取得（詳細）**
   - `GET /2/users/by/username/:username` エンドポイント
   - プロフィール画像、フォロワー数、説明文など

3. **ユーザー検索**
   - `GET /2/users/by` エンドポイント
   - 複数ユーザーの情報を一括取得

### 3. 削除するファイル

以下のファイルは完全に削除します：

```
server/twitter-routes.ts
server/twitter-oauth2.ts
lib/api/twitter-auth.ts
__tests__/twitter-oauth2.test.ts
tests/twitter-routes-security.test.ts
```

### 4. 修正するファイル

以下のファイルはAuth0対応に修正します：

#### サーバーサイド
- **server/_core/index.ts**
  - `registerTwitterRoutes()`を削除
  - Auth0ルートのみ登録

- **server/token-store.ts**
  - Twitter OAuth2のリフレッシュトークン処理を削除
  - Auth0トークン管理のみに統一

- **server/_core/oauth.ts**
  - Twitter OAuth2のトークンリボーク処理を削除
  - Auth0ログアウト処理のみに統一

#### フロントエンド
- **lib/_core/api.ts**
  - `/api/twitter/me` → `/api/auth0/me` に変更
  - `/api/twitter/follow-status` → 新しいエンドポイントに変更

- **lib/api/endpoints.ts**
  - Twitter OAuth2エンドポイントを削除
  - Auth0エンドポイントに統一

- **lib/token-manager.ts**
  - Twitter OAuth2のトークンリフレッシュを削除
  - Auth0トークン管理に統一

- **components/organisms/account-switcher.tsx**
  - Twitter OAuth2のアカウント切り替えを削除
  - Auth0のログアウト→再ログインフローに変更

- **hooks/use-auth.ts**
  - Twitter OAuth2関連のコードを削除
  - Auth0専用のシンプルな実装に変更

#### テスト
- **__tests__/force-login.test.ts**
  - `/api/twitter/auth` → `/oauth` に変更

- **__tests__/follow-status.test.ts**
  - Twitter OAuth2のモックを削除
  - 新しいフォロー状態確認APIのテストに変更

## 実装手順

### フェーズ1: Twitter API v2直接使用の実装（準備）

Auth0移行後もフォロー状態確認などの機能を維持するため、Twitter API v2を直接使用する実装を準備します。

1. **server/routers/twitter-api.ts** を作成
   - フォロー状態確認エンドポイント
   - ユーザー情報取得エンドポイント
   - Twitter API v2を直接呼び出し

2. **lib/api/twitter-api.ts** を作成
   - フロントエンドからTwitter API v2エンドポイントを呼び出す関数

### フェーズ2: サーバーサイドの削除と修正

1. **server/twitter-routes.ts** を削除
2. **server/twitter-oauth2.ts** を削除
3. **server/_core/index.ts** を修正
   - `registerTwitterRoutes()`を削除
4. **server/token-store.ts** を修正
   - Twitter OAuth2のリフレッシュトークン処理を削除
5. **server/_core/oauth.ts** を修正
   - Twitter OAuth2のトークンリボーク処理を削除

### フェーズ3: フロントエンドの修正

1. **lib/api/twitter-auth.ts** を削除
2. **lib/_core/api.ts** を修正
   - `/api/twitter/me` → `/api/auth0/me`
   - `/api/twitter/follow-status` → `/api/twitter-api/follow-status`
3. **lib/api/endpoints.ts** を修正
   - Twitter OAuth2エンドポイントを削除
4. **lib/token-manager.ts** を修正
   - Twitter OAuth2のトークンリフレッシュを削除
5. **components/organisms/account-switcher.tsx** を修正
   - Auth0のログアウト→再ログインフローに変更
6. **hooks/use-auth.ts** を修正
   - Twitter OAuth2関連のコードを削除
   - Auth0専用のシンプルな実装に変更

### フェーズ4: テストの修正

1. **__tests__/twitter-oauth2.test.ts** を削除
2. **tests/twitter-routes-security.test.ts** を削除
3. **__tests__/force-login.test.ts** を修正
4. **__tests__/follow-status.test.ts** を修正

### フェーズ5: ドキュメントの更新

1. **docs/login-system.md** を更新
   - Twitter OAuth2の説明を削除
   - Auth0専用の説明に変更
2. **README.md** を更新
   - 環境変数の説明を更新

### フェーズ6: 動作確認とテスト

1. ログイン機能の動作確認
2. フォロー状態確認の動作確認
3. ユーザー情報取得の動作確認
4. アカウント切り替えの動作確認
5. すべてのテストが合格することを確認

## 環境変数の変更

### 削除する環境変数
```
TWITTER_CLIENT_ID
TWITTER_CLIENT_SECRET
```

### 追加する環境変数
```
# Auth0
EXPO_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Twitter API v2（フォロー状態確認用）
TWITTER_API_BEARER_TOKEN=your-bearer-token
```

## リスクと対策

### リスク1: フォロー状態確認が動作しない

**対策:**
- Twitter API v2を直接使用する実装を事前にテスト
- フォールバック処理を実装（APIエラー時はフォロー状態を「不明」として扱う）

### リスク2: 既存ユーザーのセッションが無効になる

**対策:**
- 移行時にすべてのユーザーに再ログインを促す
- ログイン画面に「システム更新のため再ログインが必要です」というメッセージを表示

### リスク3: テストが失敗する

**対策:**
- 各フェーズごとにテストを実行
- 失敗したテストを修正してから次のフェーズに進む

## 完了条件

以下の条件をすべて満たした場合、移行完了とします：

1. ✅ すべてのログイン機能がAuth0経由で動作
2. ✅ フォロー状態確認が正常に動作
3. ✅ ユーザー情報取得が正常に動作
4. ✅ アカウント切り替えが正常に動作
5. ✅ すべてのテストが合格
6. ✅ TypeScriptエラーが0件
7. ✅ ドキュメントが更新されている

## スケジュール

- **フェーズ1**: 30分（Twitter API v2直接使用の実装）
- **フェーズ2**: 30分（サーバーサイドの削除と修正）
- **フェーズ3**: 60分（フロントエンドの修正）
- **フェーズ4**: 30分（テストの修正）
- **フェーズ5**: 15分（ドキュメントの更新）
- **フェーズ6**: 30分（動作確認とテスト）

**合計**: 約3時間
