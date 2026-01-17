# API アーキテクチャ設計書

**最終更新日**: 2025年1月17日  
**バージョン**: v5.28  
**作成者**: Manus AI

---

## 概要

本ドキュメントは「動員ちゃれんじ」アプリケーションにおけるAPI呼び出しの設計と実装ガイドラインを定義します。フロントエンド（Vercel）とバックエンド（Railway）が分離したアーキテクチャにおいて、API URLの構築を一元管理することで、環境間の差異によるエラーを防止します。

---

## システム構成

本アプリケーションは以下の構成で動作しています。

| コンポーネント | ホスティング | URL |
|---------------|-------------|-----|
| フロントエンド | Vercel | `https://doin-challenge.com` |
| バックエンドAPI | Railway | `https://doin-challengecom-production.up.railway.app` |
| データベース | Railway PostgreSQL | 内部接続 |

フロントエンドとバックエンドが異なるドメインで動作するため、API呼び出し時には明示的にバックエンドURLを指定する必要があります。

---

## ディレクトリ構造

API関連のユーティリティは `lib/api/` ディレクトリに集約されています。

```
lib/
└── api/
    ├── index.ts          # エクスポート集約
    ├── config.ts         # API設定・Base URL取得
    └── twitter-auth.ts   # Twitter認証URL生成
```

---

## API設定モジュール

### `lib/api/config.ts`

このファイルはAPI Base URLの取得ロジックを一元管理します。

**主要な関数:**

| 関数名 | 説明 | 戻り値 |
|--------|------|--------|
| `getApiBaseUrl()` | 環境に応じたAPI Base URLを取得 | `string` |
| `isProductionDomain(hostname)` | 本番環境ドメインかどうかを判定 | `boolean` |
| `logApiConfig()` | デバッグ用にAPI設定をログ出力 | `void` |

**URL解決の優先順位:**

1. 環境変数 `EXPO_PUBLIC_API_BASE_URL` が設定されている場合はそれを使用
2. 本番環境ドメイン（`doin-challenge.com`）の場合は Railway URL を返す
3. 開発環境の場合はポート番号を変換（8081 → 3000）
4. フォールバック: 空文字列（相対URL）

---

## Twitter認証モジュール

### `lib/api/twitter-auth.ts`

このファイルはTwitter認証に関連するURL生成を一元管理します。

**主要な関数:**

| 関数名 | 説明 | 用途 |
|--------|------|------|
| `getTwitterAuthUrl()` | 通常ログイン用URL | ログインボタン |
| `getTwitterSwitchAccountUrl()` | アカウント切り替え用URL | 別アカウントでログイン |
| `redirectToTwitterAuth()` | 認証ページにリダイレクト | ログイン処理 |
| `redirectToTwitterSwitchAccount()` | 切り替え認証ページにリダイレクト | アカウント切り替え |

**使用例:**

```tsx
import { redirectToTwitterAuth, redirectToTwitterSwitchAccount } from "@/lib/api";

// 通常ログイン
const handleLogin = () => {
  redirectToTwitterAuth();
};

// 別のアカウントでログイン
const handleSwitchAccount = () => {
  redirectToTwitterSwitchAccount();
};
```

---

## API呼び出し箇所一覧

以下は、アプリケーション内でAPIを呼び出している主要な箇所の一覧です。

### Twitter認証関連

| ファイル | 関数/コンポーネント | 使用するAPI関数 |
|----------|---------------------|-----------------|
| `app/logout.tsx` | `handleSameAccountLogin` | `redirectToTwitterAuth()` |
| `app/logout.tsx` | `handleDifferentAccountLogin` | `redirectToTwitterSwitchAccount()` |
| `components/organisms/account-switcher.tsx` | `handleAddNewAccount` | `redirectToTwitterSwitchAccount()` |

### tRPC API呼び出し

tRPCを使用したAPI呼び出しは `lib/trpc.ts` で設定されており、各コンポーネントで `trpc.xxx.useQuery()` や `trpc.xxx.useMutation()` を通じて呼び出されます。

---

## 新しいAPI呼び出しを追加する際のガイドライン

### 1. Twitter認証関連のURL生成

Twitter認証に関連するURLを生成する場合は、必ず `lib/api/twitter-auth.ts` の関数を使用してください。

**NG例（直接URL構築）:**
```tsx
// ❌ 直接URLを構築しない
const loginUrl = `${window.location.origin}/api/twitter/auth`;
window.location.href = loginUrl;
```

**OK例（ユーティリティ関数使用）:**
```tsx
// ✅ ユーティリティ関数を使用
import { redirectToTwitterAuth } from "@/lib/api";
redirectToTwitterAuth();
```

### 2. 新しいAPIエンドポイントの追加

新しいAPIエンドポイントを追加する場合は、以下の手順に従ってください。

1. `lib/api/` ディレクトリに新しいファイルを作成（または既存ファイルに追加）
2. エンドポイント定数とURL生成関数を定義
3. `lib/api/index.ts` でエクスポート
4. 本ドキュメントの「API呼び出し箇所一覧」を更新

### 3. 環境変数の追加

新しい環境変数を追加する場合は、`lib/api/config.ts` の `env` オブジェクトに追加し、適切なフォールバック値を設定してください。

---

## トラブルシューティング

### 404エラーが発生する場合

API呼び出しで404エラーが発生する場合、以下を確認してください。

1. **URL構築の確認**: `getApiBaseUrl()` が正しいURLを返しているか確認
   ```tsx
   import { logApiConfig } from "@/lib/api";
   logApiConfig(); // コンソールにAPI設定を出力
   ```

2. **本番環境の確認**: 本番環境（doin-challenge.com）では、Railway URLが使用されているか確認

3. **環境変数の確認**: `EXPO_PUBLIC_API_BASE_URL` が正しく設定されているか確認

### CORS エラーが発生する場合

CORSエラーが発生する場合は、Railway バックエンドの CORS 設定を確認してください。

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| v5.28 | 2025-01-17 | 初版作成。API一元管理アーキテクチャを導入 |

---

## 関連ドキュメント

- `docs/ARCHITECTURE.md` - システム全体の設計書
- `docs/DATA-FLOW.md` - データフロー設計書
- `server/README.md` - バックエンドAPI仕様
