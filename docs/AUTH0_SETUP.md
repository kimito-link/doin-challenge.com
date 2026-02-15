# Auth0 セットアップガイド

## 概要

Auth0を使用して、以下のログイン方法をサポートします：
- Twitter OAuth2（既存）
- Google ログイン
- LINE ログイン
- メールアドレス/パスワード
- 2FA（二要素認証）

## Auth0 ダッシュボードでの設定

### 1. Auth0 アカウント作成
1. https://auth0.com/ にアクセス
2. 「Sign Up」をクリックしてアカウントを作成
3. テナント名を設定（例：`birthday-celebration`）

### 2. Application 作成
1. Dashboard → Applications → Create Application
2. Application名：`Birthday Celebration Mobile App`
3. Application Type：`Native`
4. Create をクリック

### 3. Application 設定
1. Settings タブを開く
2. 以下の情報をメモ：
   - Domain（例：`your-tenant.auth0.com`）
   - Client ID
   - Client Secret
3. Allowed Callback URLs に追加：
   ```
   exp://localhost:8081/--/oauth/callback
   manus{timestamp}://oauth/callback
   ```
4. Allowed Logout URLs に追加：
   ```
   exp://localhost:8081
   manus{timestamp}://
   ```
5. Save Changes をクリック

### 4. Social Connections 設定

#### Google ログイン
1. Dashboard → Authentication → Social
2. Google を選択
3. Google Cloud Console で OAuth 2.0 クライアント ID を作成
4. Client ID と Client Secret を Auth0 に入力
5. Save をクリック

#### LINE ログイン
1. Dashboard → Authentication → Social
2. LINE を選択（または Custom Social Connection を作成）
3. LINE Developers で Channel を作成
4. Channel ID と Channel Secret を Auth0 に入力
5. Save をクリック

### 5. Database Connection 設定
1. Dashboard → Authentication → Database
2. Username-Password-Authentication を有効化
3. Password Policy を設定（推奨：Good）
4. Save をクリック

### 6. Multi-Factor Authentication (2FA) 設定
1. Dashboard → Security → Multi-Factor Auth
2. Enable Multi-Factor Authentication をオン
3. Push Notification、SMS、または Authenticator App を選択
4. Save をクリック

## 環境変数の設定

以下の環境変数を `.env` ファイルに追加：

```env
# Auth0 設定
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/
```

## 実装の流れ

### 1. フロントエンド（React Native）
- `react-native-auth0` パッケージをインストール
- ログイン画面に Auth0 ボタンを追加
- Auth0 SDK を使用してログインフローを実装

### 2. バックエンド（Express + tRPC）
- `express-oauth2-jwt-bearer` パッケージをインストール
- Auth0 トークンを検証するミドルウェアを追加
- 既存の Twitter OAuth2 と併用

### 3. データベース
- `users` テーブルに `auth0_sub` カラムを追加
- Auth0 の `sub`（Subject）を保存して、ユーザーを識別

## セキュリティのベストプラクティス

1. **トークンの有効期限**: Access Token の有効期限を短く設定（15分〜1時間）
2. **Refresh Token**: Refresh Token を使用して、Access Token を更新
3. **HTTPS**: 本番環境では必ず HTTPS を使用
4. **PKCE**: Authorization Code Flow with PKCE を使用（モバイルアプリ推奨）
5. **2FA**: 重要な操作（チャレンジ削除、設定変更）には 2FA を要求

## トラブルシューティング

### ログインできない
- Callback URL が正しく設定されているか確認
- Auth0 Dashboard でログを確認（Monitoring → Logs）
- Client ID と Domain が正しいか確認

### トークン検証エラー
- `AUTH0_DOMAIN` と `AUTH0_AUDIENCE` が正しいか確認
- トークンの有効期限が切れていないか確認
- Auth0 Dashboard で API 設定を確認

## 参考リンク

- [Auth0 公式ドキュメント](https://auth0.com/docs)
- [React Native Auth0 SDK](https://github.com/auth0/react-native-auth0)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
