# API アーキテクチャ設計書

**最終更新日**: 2025年1月17日  
**バージョン**: v5.29  
**作成者**: Manus AI

---

## 設計思想：生成AI時代のAPI設計

本ドキュメントは「動員ちゃれんじ」アプリケーションにおけるAPI呼び出しの設計と実装ガイドラインを定義します。従来の「人間向け・正規化重視」の設計から、「AI向け・推論効率重視」の設計へとパラダイムシフトした考え方を採用しています。

### パラダイムシフト：評価指標の転換

従来のAPI設計では、コードの重複を避けることや正規化が重視されてきました。しかし、生成AI時代においては「AIが一発で理解できるか？」という指標が重要になります。

| 従来の評価指標 | 新しい評価指標 |
|---------------|---------------|
| コードの重複を避ける | 1ホップで理解できる |
| 正規化・DRY原則 | コンテキストの完全性 |
| ファイル数を減らす | 関心の分離と明確な責務 |

### 1ホップ理解の原則

API関連のコードを理解するために、複数のファイルを辿る必要がある設計は避けます。`lib/api/` ディレクトリを見れば、API呼び出しに関するすべてが把握できる設計を目指します。

```
開発者/AI → lib/api/index.ts → 必要な関数をすべてエクスポート
                ↓
            1ホップで理解 = 速い＆安い
```

---

## システム構成

本アプリケーションは以下の構成で動作しています。フロントエンドとバックエンドが異なるドメインで動作するため、API呼び出し時には明示的にバックエンドURLを指定する必要があります。

| コンポーネント | ホスティング | URL | 役割 |
|---------------|-------------|-----|------|
| フロントエンド | Vercel | `https://doin-challenge.com` | UI表示、ユーザー操作 |
| バックエンドAPI | Railway | `https://doin-challengecom-production.up.railway.app` | 認証、データ処理 |
| データベース | Railway PostgreSQL | 内部接続 | データ永続化 |

---

## ディレクトリ構造：コンテキストドキュメント的アプローチ

API関連のユーティリティは `lib/api/` ディレクトリに集約されています。このディレクトリ自体が「API Context Document」として機能し、API呼び出しに関するすべての情報を1箇所で提供します。

```
lib/
└── api/
    ├── index.ts          # エクスポート集約（エントリーポイント）
    ├── config.ts         # API設定・Base URL取得
    └── twitter-auth.ts   # Twitter認証URL生成
```

### index.ts：エントリーポイント

`lib/api/index.ts` は、API関連のすべての関数をエクスポートするエントリーポイントです。開発者やAIがAPI関連の機能を使用する際は、このファイルからインポートすることで、必要な関数を1ホップで取得できます。

```tsx
// ✅ 推奨：index.tsからインポート
import { getApiBaseUrl, redirectToTwitterAuth } from "@/lib/api";

// ❌ 非推奨：個別ファイルから直接インポート
import { getApiBaseUrl } from "@/lib/api/config";
```

---

## API設定モジュール

### lib/api/config.ts

このファイルはAPI Base URLの取得ロジックを一元管理します。環境（開発/本番）に応じて適切なURLを返すことで、環境間の差異によるエラーを防止します。

**主要な関数と定数:**

| 名前 | 種類 | 説明 |
|------|------|------|
| `PRODUCTION_API_URL` | 定数 | Railway本番APIのURL |
| `PRODUCTION_DOMAINS` | 定数 | 本番環境ドメインのリスト |
| `getApiBaseUrl()` | 関数 | 環境に応じたAPI Base URLを取得 |
| `isProductionDomain(hostname)` | 関数 | 本番環境ドメインかどうかを判定 |
| `logApiConfig()` | 関数 | デバッグ用にAPI設定をログ出力 |

**URL解決の優先順位:**

URL解決は以下の優先順位で行われます。これにより、環境変数による明示的な設定、本番環境の自動検出、開発環境のポート変換がすべてカバーされます。

1. 環境変数 `EXPO_PUBLIC_API_BASE_URL` が設定されている場合はそれを使用
2. 本番環境ドメイン（`doin-challenge.com`）の場合は Railway URL を返す
3. 開発環境の場合はポート番号を変換（8081 → 3000）
4. フォールバック: 空文字列（相対URL）

---

## Twitter認証モジュール

### lib/api/twitter-auth.ts

このファイルはTwitter認証に関連するURL生成を一元管理します。ログイン、ログアウト、アカウント切り替えなど、すべてのTwitter認証フローでこのファイルの関数を使用します。

**エンドポイント定数:**

```tsx
export const TWITTER_AUTH_ENDPOINTS = {
  auth: "/api/twitter/auth",      // 認証開始
  callback: "/api/twitter/callback", // コールバック
  logout: "/api/twitter/logout",   // ログアウト
} as const;
```

**主要な関数:**

| 関数名 | 説明 | 用途 |
|--------|------|------|
| `getTwitterAuthUrl()` | 通常ログイン用URL | ログインボタン |
| `getTwitterSwitchAccountUrl()` | アカウント切り替え用URL | 別アカウントでログイン |
| `redirectToTwitterAuth()` | 認証ページにリダイレクト | ログイン処理 |
| `redirectToTwitterSwitchAccount()` | 切り替え認証ページにリダイレクト | アカウント切り替え |
| `logTwitterAuthUrls()` | デバッグ用にURLをログ出力 | トラブルシューティング |

**使用例:**

```tsx
import { redirectToTwitterAuth, redirectToTwitterSwitchAccount } from "@/lib/api";

// 通常ログイン
const handleLogin = () => {
  redirectToTwitterAuth();
};

// 別のアカウントでログイン（switch=trueパラメータ付き）
const handleSwitchAccount = () => {
  redirectToTwitterSwitchAccount();
};
```

---

## API呼び出し箇所一覧

以下は、アプリケーション内でAPIを呼び出している主要な箇所の一覧です。この一覧を維持することで、API呼び出しの全体像を1ホップで把握できます。

### Twitter認証関連

| ファイル | 関数/コンポーネント | 使用するAPI関数 | 用途 |
|----------|---------------------|-----------------|------|
| `app/logout.tsx` | `handleSameAccountLogin` | `redirectToTwitterAuth()` | 同じアカウントで再ログイン |
| `app/logout.tsx` | `handleDifferentAccountLogin` | `redirectToTwitterSwitchAccount()` | 別のアカウントでログイン |
| `components/organisms/account-switcher.tsx` | `handleAddNewAccount` | `redirectToTwitterSwitchAccount()` | 新規アカウント追加 |

### tRPC API呼び出し

tRPCを使用したAPI呼び出しは `lib/trpc.ts` で設定されており、各コンポーネントで `trpc.xxx.useQuery()` や `trpc.xxx.useMutation()` を通じて呼び出されます。tRPCはBase URLを自動的に解決するため、個別のURL構築は不要です。

---

## ハイブリッド構成：書き込みと読み取りの分離

生成AI時代のDB設計で推奨される「ハイブリッド構成（CQRS応用）」の考え方をAPI設計にも適用しています。

### 書き込み用（実装コード）

`lib/api/` ディレクトリ内のTypeScriptファイルが「書き込み用」の正規化されたコードです。実際のAPI呼び出しロジックはここに集約されています。

### 読み取り用（設計ドキュメント）

本ドキュメント（`docs/API-ARCHITECTURE.md`）が「読み取り用」の非正規化ビューです。開発者やAIがAPI設計を理解するために必要な情報を、冗長であっても分かりやすく記述しています。

```
┌─────────────────────────────────────────────────────────────┐
│                    同期パイプライン                          │
│  コード変更 → ドキュメント更新 → 常に最新                    │
└─────────────────────────────────────────────────────────────┘
        ↓                                    ↓
┌───────────────────┐              ┌───────────────────┐
│  lib/api/         │              │  docs/            │
│  (書き込み用)      │              │  (読み取り用)      │
│  正規化コード      │              │  非正規化ドキュメント│
└───────────────────┘              └───────────────────┘
```

---

## 新しいAPI呼び出しを追加する際のガイドライン

### 1. Twitter認証関連のURL生成

Twitter認証に関連するURLを生成する場合は、必ず `lib/api/twitter-auth.ts` の関数を使用してください。直接URLを構築すると、環境間の差異によるエラーの原因になります。

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

### CORSエラーが発生する場合

CORSエラーが発生する場合は、Railway バックエンドの CORS 設定を確認してください。フロントエンドのドメイン（`doin-challenge.com`）が許可リストに含まれている必要があります。

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| v5.29 | 2025-01-17 | 生成AI時代の設計思想を反映。1ホップ理解、コンテキストドキュメント、ハイブリッド構成の概念を追加 |
| v5.28 | 2025-01-17 | 初版作成。API一元管理アーキテクチャを導入 |

---

## 関連ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| `docs/ARCHITECTURE.md` | システム全体の設計書 |
| `docs/DATA-FLOW.md` | データフロー設計書 |
| `server/README.md` | バックエンドAPI仕様 |
