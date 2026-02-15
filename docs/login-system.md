# ログインシステムドキュメント

## 概要

このアプリケーションは、Twitter OAuth2とAuth0の2つのログイン方法をサポートしています。

## アーキテクチャ

### 1. Twitter OAuth2ログイン（既存実装）

**フロー:**
1. ユーザーが「Xでログイン」ボタンをクリック
2. `/api/twitter/auth`エンドポイントにリクエスト
3. PKCE（Proof Key for Code Exchange）パラメータを生成
4. Twitter認証画面にリダイレクト
5. ユーザーが認証を承認
6. `/api/twitter/callback`にリダイレクト
7. 認証コードをアクセストークンに交換
8. ユーザー情報を取得してセッションを確立
9. セッショントークンをCookieに保存
10. ホーム画面にリダイレクト

**実装ファイル:**
- `server/twitter-routes.ts`: Twitter OAuth2エンドポイント
- `server/twitter-oauth2.ts`: OAuth2ヘルパー関数
- `server/token-store.ts`: トークン保存・取得
- `hooks/use-auth.ts`: フロントエンドの認証フック

**セキュリティ機能:**
- PKCE（Code Challenge/Verifier）
- State Parameter（CSRF対策）
- セッショントークンの有効期限管理
- ログイン失敗回数制限
- IPベースのレート制限

### 2. Auth0ログイン（新規実装）

**フロー:**
1. ユーザーがAuth0ログインボタンをクリック
2. `react-native-auth0`ライブラリを使用してAuth0認証画面を表示
3. ユーザーがTwitter Social Connectionで認証
4. Auth0からIDトークンとアクセストークンを取得
5. `/api/auth0/login`エンドポイントにトークンを送信
6. バックエンドでトークンを検証
7. ユーザー情報を取得してセッションを確立
8. セッショントークンを返却
9. フロントエンドでセッショントークンを保存

**実装ファイル:**
- `lib/auth0-provider.tsx`: Auth0プロバイダーコンポーネント
- `server/routers/auth0.ts`: Auth0エンドポイント
- `server/lib/auth0-verify.ts`: Auth0トークン検証
- `hooks/use-auth.ts`: フロントエンドの認証フック（Auth0対応）

**セキュリティ機能:**
- OpenID Connect準拠
- JWTトークン検証
- HTTPS必須
- トークンの有効期限管理

## セッション管理

### Web環境
- **保存先**: Cookie（HttpOnly, Secure, SameSite=Lax）
- **有効期限**: 30日間
- **キャッシュ**: localStorage（ユーザー情報のみ）

### Native環境
- **保存先**: SecureStore（iOS/Android）
- **有効期限**: 30日間
- **キャッシュ**: AsyncStorage（ユーザー情報のみ）

## エラーハンドリング

### ネットワークエラー
- 自動リトライ（最大2回）
- ユーザーフレンドリーなエラーメッセージ表示
- ハプティックフィードバック（エラー）

### 認証エラー
- 無効なトークン: 自動ログアウト
- セッション期限切れ: 再ログイン促進
- OAuth state不一致: エラーメッセージ表示

### タイムアウトエラー
- タイムアウト時間: 30秒
- リトライ促進メッセージ

## テスト

### ユニットテスト
- `__tests__/login-integration.test.ts`: ログイン統合テスト
- `__tests__/auth0-config.test.ts`: Auth0設定テスト
- `__tests__/auth0-full.test.ts`: Auth0包括テスト

### 手動テスト手順

#### Twitter OAuth2ログイン
1. ホーム画面で「Xでログイン」ボタンをクリック
2. カスタムログインモーダルが表示されることを確認
3. 「Xでログイン」ボタンをクリック
4. Twitter認証画面にリダイレクトされることを確認
5. 認証を承認
6. ホーム画面に戻ることを確認
7. ログイン状態が保持されることを確認

#### Auth0ログイン
1. `/oauth`画面に移動
2. 「Login with Auth0」ボタンをクリック
3. Auth0ログイン画面が表示されることを確認
4. Twitter Social Connectionを選択
5. 認証を承認
6. ホーム画面に戻ることを確認
7. ログイン状態が保持されることを確認

## トラブルシューティング

### ログインできない
1. ネットワーク接続を確認
2. ブラウザのCookieが有効か確認
3. サーバーログを確認（`/api/health`）
4. 環境変数が正しく設定されているか確認

### セッションが保持されない
1. Cookie設定を確認（HttpOnly, Secure, SameSite）
2. セッショントークンの有効期限を確認
3. ブラウザのストレージをクリア
4. アプリを再起動

### Auth0ログインが動作しない
1. Auth0設定を確認（Domain, Client ID, Client Secret）
2. Twitter Social Connectionが有効か確認
3. Callback URLが正しく設定されているか確認
4. 環境変数が正しく設定されているか確認

## 環境変数

### Twitter OAuth2
- `TWITTER_CLIENT_ID`: Twitter OAuth2クライアントID
- `TWITTER_CLIENT_SECRET`: Twitter OAuth2クライアントシークレット

### Auth0
- `EXPO_PUBLIC_AUTH0_DOMAIN`: Auth0ドメイン
- `EXPO_PUBLIC_AUTH0_CLIENT_ID`: Auth0クライアントID
- `AUTH0_CLIENT_SECRET`: Auth0クライアントシークレット

## セキュリティベストプラクティス

1. **HTTPS必須**: 本番環境では必ずHTTPSを使用
2. **トークンの安全な保存**: SecureStore/HttpOnly Cookieを使用
3. **PKCE使用**: OAuth2.0のセキュリティ強化
4. **State Parameter**: CSRF攻撃対策
5. **レート制限**: ブルートフォース攻撃対策
6. **セッション有効期限**: 適切な有効期限設定
7. **エラーメッセージ**: 詳細情報を漏らさない

## 今後の改善案

1. **多要素認証（MFA）**: Auth0のMFA機能を有効化
2. **ソーシャルログイン拡張**: Google, Facebookログインの追加
3. **パスワードレスログイン**: メールマジックリンク認証
4. **セッション管理画面**: ユーザーが自分のセッションを管理
5. **監査ログ**: ログイン履歴の記録と表示
