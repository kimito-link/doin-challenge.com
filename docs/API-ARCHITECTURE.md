# API アーキテクチャ設計書

**最終更新日**: 2025年1月17日  
**バージョン**: v5.31  
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
    ├── client.ts         # APIクライアント（fetch wrapper、エラーハンドリング、ログ）
    ├── endpoints.ts      # 各APIエンドポイントへのアクセス関数
    └── twitter-auth.ts   # Twitter認証URL生成
```

### index.ts：エントリーポイント

`lib/api/index.ts` は、API関連のすべての関数をエクスポートするエントリーポイントです。開発者やAIがAPI関連の機能を使用する際は、このファイルからインポートすることで、必要な関数を1ホップで取得できます。

```tsx
// ✅ 推奨：index.tsからインポート
import { 
  getApiBaseUrl, 
  redirectToTwitterAuth,
  apiGet,
  apiPost,
  lookupTwitterUser,
  getErrorMessage,
} from "@/lib/api";

// ❌ 非推奨：個別ファイルから直接インポート
import { getApiBaseUrl } from "@/lib/api/config";
```

---

## APIクライアントモジュール

### lib/api/client.ts

このファイルはfetch呼び出しのラッパーを提供し、エラーハンドリングとログ機能を一元管理します。すべてのAPI呼び出しはこのファイルの関数を通じて行うことで、一貫した動作を保証します。

**主要な関数:**

| 関数名 | 説明 | 用途 |
|--------|------|------|
| `apiRequest<T>(endpoint, options)` | 汎用APIリクエスト関数 | すべてのAPI呼び出しの基盤 |
| `apiGet<T>(endpoint, options)` | GETリクエスト | データ取得 |
| `apiPost<T>(endpoint, options)` | POSTリクエスト | データ送信 |
| `apiPut<T>(endpoint, options)` | PUTリクエスト | データ更新 |
| `apiDelete<T>(endpoint, options)` | DELETEリクエスト | データ削除 |
| `setApiLogging(enabled)` | ログ機能の有効/無効切り替え | デバッグ |
| `getErrorMessage(response)` | ユーザー向けエラーメッセージ取得 | エラー表示 |
| `isApiSuccess<T>(response)` | 成功レスポンスの型ガード | 型安全なデータアクセス |

**ApiResponse型:**

```tsx
interface ApiResponse<T = unknown> {
  ok: boolean;        // レスポンスが成功したかどうか
  status: number;     // HTTPステータスコード
  data: T | null;     // レスポンスデータ
  error: string | null; // エラーメッセージ
}
```

**使用例:**

```tsx
import { apiGet, apiPost, getErrorMessage, isApiSuccess } from "@/lib/api";

// GETリクエスト
const fetchUsers = async () => {
  const result = await apiGet<User[]>("/api/users");
  
  if (isApiSuccess(result)) {
    console.log(result.data); // 型安全にアクセス
  } else {
    console.error(getErrorMessage(result)); // 日本語エラーメッセージ
  }
};

// POSTリクエスト
const createUser = async (name: string) => {
  const result = await apiPost<User>("/api/users", {
    body: { name },
  });
  
  if (!result.ok) {
    Alert.alert("エラー", getErrorMessage(result));
  }
};
```

**エラーメッセージの自動変換:**

`getErrorMessage()` 関数は、HTTPステータスコードに応じた日本語メッセージを返します。

| ステータス | メッセージ |
|-----------|-----------|
| 0 | ネットワークエラーが発生しました。インターネット接続を確認してください。 |
| 400 | リクエストが不正です。入力内容を確認してください。 |
| 401 | 認証が必要です。再度ログインしてください。 |
| 403 | アクセスが拒否されました。 |
| 404 | リソースが見つかりませんでした。 |
| 429 | リクエストが多すぎます。しばらく待ってから再試行してください。 |
| 500/502/503 | サーバーエラーが発生しました。しばらく待ってから再試行してください。 |

**ログ機能:**

開発環境では自動的にAPIログが有効になります。リクエスト/レスポンスの詳細がコンソールに出力されます。

```
[API] POST /api/twitter/lookup { headers: {...}, body: {...}, timestamp: "..." }
[API] POST /api/twitter/lookup → 200 { ok: true, data: {...}, duration: "123ms" }
```

---

## APIエンドポイントモジュール

### lib/api/endpoints.ts

このファイルは各APIエンドポイントへのアクセス関数を提供します。すべてのAPI呼び出しはこのファイルの関数を通じて行います。

**認証関連API:**

| 関数名 | エンドポイント | 説明 |
|--------|---------------|------|
| `clearSession()` | POST /api/auth/clear-session | セッションをクリア |
| `validateSession(token)` | POST /api/auth/session | セッションを検証 |
| `refreshToken(token)` | POST /api/twitter/refresh | トークンをリフレッシュ |

**Twitter関連API:**

| 関数名 | エンドポイント | 説明 |
|--------|---------------|------|
| `lookupTwitterUser(input)` | POST /api/twitter/lookup | Twitterユーザーを検索 |
| `getFollowStatus(userId)` | GET /api/twitter/follow-status | フォローステータスを取得 |

**管理者API:**

| 関数名 | エンドポイント | 説明 |
|--------|---------------|------|
| `getApiUsage()` | GET /api/admin/api-usage | API使用状況を取得 |

**使用例:**

```tsx
import { lookupTwitterUser, getErrorMessage } from "@/lib/api";

const searchUser = async (username: string) => {
  const result = await lookupTwitterUser(username);
  
  if (result.ok && result.data) {
    console.log(`Found: ${result.data.name} (@${result.data.username})`);
  } else {
    console.error(getErrorMessage(result));
  }
};
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

---

## API呼び出し箇所一覧

以下は、アプリケーション内でAPIを呼び出している主要な箇所の一覧です。この一覧を維持することで、API呼び出しの全体像を1ホップで把握できます。

### fetch呼び出し（lib/api/client.ts経由）

| ファイル | 関数/コンポーネント | 使用するAPI関数 | 用途 |
|----------|---------------------|-----------------|------|
| `app/event/[id].tsx` | `handleTwitterLookup` | `lookupTwitterUser()` | 友人のTwitterユーザー検索 |
| `app/admin/api-usage.tsx` | `fetchData` | `apiGet()` | API使用状況の取得 |
| `components/organisms/account-switcher.tsx` | `handleLogout` | `clearSession()` | セッションクリア |
| `lib/token-manager.ts` | `refreshAccessToken` | `apiPost()` | トークンリフレッシュ |
| `lib/_core/api.ts` | `establishSession` | `apiPost()` | セッション確立 |
| `lib/_core/api.ts` | `checkFollowStatus` | `apiGet()` | フォローステータス確認 |

### Twitter認証関連（lib/api/twitter-auth.ts経由）

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

### 1. 新しいAPIエンドポイントの追加

新しいAPIエンドポイントを追加する場合は、以下の手順に従ってください。

1. `lib/api/endpoints.ts` に新しい関数を追加
2. 必要に応じて型定義を追加
3. `lib/api/index.ts` でエクスポート
4. 本ドキュメントの「API呼び出し箇所一覧」を更新

**例：新しいエンドポイントの追加**

```tsx
// lib/api/endpoints.ts に追加
export interface NewFeatureResult {
  id: string;
  name: string;
}

export async function getNewFeature(id: string): Promise<ApiResponse<NewFeatureResult>> {
  return apiGet<NewFeatureResult>(`/api/new-feature/${id}`);
}

// lib/api/index.ts でエクスポート
export {
  // ... 既存のエクスポート
  getNewFeature,
  type NewFeatureResult,
} from "./endpoints";
```

### 2. Twitter認証関連のURL生成

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

### 3. エラーハンドリング

すべてのAPI呼び出しでは、`getErrorMessage()` を使用してユーザーフレンドリーなエラーメッセージを表示してください。

```tsx
import { apiGet, getErrorMessage } from "@/lib/api";

const fetchData = async () => {
  const result = await apiGet("/api/data");
  
  if (!result.ok) {
    // ユーザーに表示するエラーメッセージ
    Alert.alert("エラー", getErrorMessage(result));
    return;
  }
  
  // 成功時の処理
};
```

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

### APIログの確認

開発環境では自動的にAPIログが有効になります。本番環境でログを有効にする場合：

```tsx
import { setApiLogging } from "@/lib/api";
setApiLogging(true); // ログを有効化
```

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| v5.31 | 2025-01-17 | APIクライアントモジュール（client.ts）とエンドポイントモジュール（endpoints.ts）を追加。fetch呼び出しの一元化、エラーハンドリング統一、ログ機能を実装 |
| v5.29 | 2025-01-17 | 生成AI時代の設計思想を反映。1ホップ理解、コンテキストドキュメント、ハイブリッド構成の概念を追加 |
| v5.28 | 2025-01-17 | 初版作成。API一元管理アーキテクチャを導入 |

---

## 関連ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| `docs/ARCHITECTURE.md` | システム全体の設計書 |
| `docs/DATA-FLOW.md` | データフロー設計書 |
| `server/README.md` | バックエンドAPI仕様 |
