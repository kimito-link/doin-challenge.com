# Vercel環境変数設定

**作成日**: 2026-02-16  
**目的**: Vercelデプロイ時のAuth0エラーを解決するため

## 🔧 設定した環境変数

Vercelのプロジェクト設定（Settings → Environment Variables）で、以下の環境変数を追加しました。

### 1. AUTH0_DOMAIN

- **Key**: `AUTH0_DOMAIN`
- **Value**: `dev-5f22k7cymjmhkcu4.us.auth0.com`
- **Environments**: All Environments（Production, Preview, Development）
- **用途**: Auth0のドメイン（サーバーサイド）

### 2. AUTH0_CLIENT_ID

- **Key**: `AUTH0_CLIENT_ID`
- **Value**: `50UCyVdM4Q7ZWqq70rR3iv66trxccOxl`
- **Environments**: All Environments
- **用途**: Auth0のクライアントID（サーバーサイド）

### 3. AUTH0_CLIENT_SECRET

- **Key**: `AUTH0_CLIENT_SECRET`
- **Value**: `31mH47KLIKqHYBqXQkFu0W3AOTk8CaM9VZ8XR7Zn08zzy9L0rJgkJUgWJ2J2q_DW`
- **Environments**: All Environments
- **Sensitive**: ON
- **用途**: Auth0のクライアントシークレット（サーバーサイド、機密情報）

### 4. EXPO_PUBLIC_AUTH0_DOMAIN

- **Key**: `EXPO_PUBLIC_AUTH0_DOMAIN`
- **Value**: `dev-5f22k7cymjmhkcu4.us.auth0.com`
- **Environments**: All Environments
- **用途**: Auth0のドメイン（クライアントサイド、Expoアプリ用）

### 5. EXPO_PUBLIC_AUTH0_CLIENT_ID

- **Key**: `EXPO_PUBLIC_AUTH0_CLIENT_ID`
- **Value**: `50UCyVdM4Q7ZWqq70rR3iv66trxccOxl`
- **Environments**: All Environments
- **用途**: Auth0のクライアントID（クライアントサイド、Expoアプリ用）

## 📋 設定手順

1. Vercelのプロジェクトページを開く
2. **Settings** → **Environment Variables**に移動
3. **「Add Environment Variable」**ボタンをクリック
4. 上記の環境変数を1つずつ追加
5. **「Save」**ボタンをクリック

## ⚠️ 注意事項

- **AUTH0_CLIENT_SECRET**は機密情報のため、必ず**Sensitive**をONにしてください
- すべての環境変数は**All Environments**に設定してください（Production, Preview, Developmentすべて）
- 環境変数を変更した後、Vercelは自動的に新しいデプロイを開始します

## 🔍 エラーの原因

Vercelのビルド時に以下のエラーが発生していました：

```
Metro error: A valid "domain" is required for the Auth0 client.
InitializationError: A valid "domain" is required for the Auth0 client.
```

これは、Auth0の環境変数がVercelに設定されていなかったためです。

## ✅ 解決策

上記の5つの環境変数をVercelに追加することで、Auth0の初期化エラーが解決されました。

## 📚 参考資料

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Auth0 React Native SDK Documentation](https://auth0.com/docs/quickstart/native/react-native)

---

**最終更新**: 2026-02-16  
**担当者**: Manus AI Agent
