# 生誕祭応援アプリ - 技術ドキュメント

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [技術スタック](#技術スタック)
4. [セキュリティ](#セキュリティ)
5. [パフォーマンス最適化](#パフォーマンス最適化)
6. [ログと分析](#ログと分析)
7. [デプロイメント](#デプロイメント)
8. [トラブルシューティング](#トラブルシューティング)

---

## プロジェクト概要

生誕祭応援アプリは、ファンが推しの誕生日を祝い、チャレンジに参加し、他のファンと交流できるモバイルアプリケーションです。

### 主要機能

- **イベント管理**: 生誕祭イベントの作成、参加、管理
- **チャレンジシステム**: ファンが完了できるチャレンジの作成と追跡
- **バッジシステム**: 達成度に応じたバッジの獲得
- **ソーシャル機能**: フォロー、メッセージング、コメント
- **ランキング**: ユーザーの貢献度に基づくランキング
- **通知**: プッシュ通知によるリアルタイム更新

---

## アーキテクチャ

### システム構成

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│  API Server     │
│  (Express.js)   │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│  Database       │
│  (PostgreSQL)   │
└─────────────────┘
```

### ディレクトリ構造

```
birthday-celebration/
├── app/                    # React Native アプリケーション
│   ├── (tabs)/            # タブナビゲーション画面
│   ├── event/             # イベント関連画面
│   ├── oauth/             # 認証画面
│   └── _layout.tsx        # ルートレイアウト
├── components/            # 再利用可能なコンポーネント
│   ├── organisms/         # 複雑なコンポーネント
│   └── ui/                # UIコンポーネント
├── hooks/                 # カスタムReactフック
├── lib/                   # ユーティリティとヘルパー
│   ├── auth0-provider.tsx # Auth0統合
│   ├── error-handler.ts   # エラーハンドリング
│   ├── performance.ts     # パフォーマンス最適化
│   └── ux-improvements.ts # UX改善ユーティリティ
├── server/                # バックエンドサーバー
│   ├── _core/             # コアサーバー機能
│   ├── db/                # データベース操作
│   ├── lib/               # サーバーユーティリティ
│   │   ├── analytics.ts   # 分析機能
│   │   ├── logger.ts      # ログ機能
│   │   └── security.ts    # セキュリティ機能
│   └── routers/           # APIルーター
└── __tests__/             # テストファイル
```

---

## 技術スタック

### フロントエンド

- **React Native**: 0.81.5
- **Expo SDK**: 54
- **React**: 19.1.0
- **TypeScript**: 5.9
- **NativeWind**: 4.2.1 (Tailwind CSS for React Native)
- **React Query**: 5.90.12
- **tRPC**: 11.7.2

### バックエンド

- **Node.js**: 22.13.0
- **Express.js**: 4.22.1
- **TypeScript**: 5.9
- **Drizzle ORM**: 0.44.7
- **PostgreSQL**: (via Drizzle)
- **Auth0**: react-native-auth0

### 開発ツール

- **Vitest**: 2.1.9
- **ESLint**: 9.39.2
- **Prettier**: 3.7.4
- **pnpm**: 9.12.0

---

## セキュリティ

### 認証とセッション管理

#### Auth0統合

アプリはAuth0を使用してTwitterソーシャルログインを実装しています。

**設定ファイル**: `lib/auth0-provider.tsx`

```typescript
// Auth0設定
const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
```

**ログインフロー**:
1. ユーザーが「Twitterでログイン」をタップ
2. Auth0のログイン画面が表示
3. Twitter認証完了後、Auth0がアクセストークンを発行
4. アプリがバックエンドにトークンを送信
5. バックエンドがトークンを検証し、セッションを確立

#### セキュリティ対策

**実装ファイル**: `server/lib/security.ts`

1. **XSS対策**
   - HTMLエスケープ
   - Content Security Policy
   - X-XSS-Protection ヘッダー

2. **CSRF対策**
   - CSRFトークン生成と検証
   - Same-Site Cookie

3. **SQLインジェクション対策**
   - Drizzle ORMによるパラメータ化クエリ
   - 入力サニタイゼーション

4. **レート制限**
   - IPアドレスごとのリクエスト数制限
   - 429 Too Many Requests レスポンス

5. **セキュアヘッダー**
   - Strict-Transport-Security
   - X-Frame-Options
   - X-Content-Type-Options

### パスワードセキュリティ

```typescript
// パスワード強度チェック
const { isStrong, score, feedback } = checkPasswordStrength(password);
```

要件:
- 最低8文字
- 大文字、小文字、数字、特殊文字を含む

---

## パフォーマンス最適化

### 実装済みの最適化

**実装ファイル**: `lib/performance.ts`

1. **Debounce**: 検索入力などの頻繁なイベントを制限
2. **Throttle**: スクロールイベントなどを間引き
3. **Memoization**: 計算結果のキャッシュ
4. **画像キャッシング**: `lib/image-cache.ts`
5. **オフライン対応**: `lib/offline-sync.ts`

### 使用例

```typescript
import { debounce, throttle, memoize } from "@/lib/performance";

// 検索入力のデバウンス
const handleSearch = debounce((query: string) => {
  searchAPI(query);
}, 300);

// スクロールイベントのスロットル
const handleScroll = throttle((event) => {
  updateScrollPosition(event);
}, 100);

// 計算結果のメモ化
const expensiveCalculation = memoize((input: number) => {
  return input * input;
});
```

### パフォーマンス計測

```typescript
import { measurePerformance } from "@/server/lib/logger";

// 関数のパフォーマンスを計測
const result = await measurePerformance("fetchUserData", async () => {
  return await db.query.users.findFirst({ where: eq(users.id, userId) });
});
```

---

## ログと分析

### ログシステム

**実装ファイル**: `server/lib/logger.ts`

#### ログレベル

- **DEBUG**: 詳細なデバッグ情報
- **INFO**: 一般的な情報
- **WARN**: 警告
- **ERROR**: エラー
- **FATAL**: 致命的なエラー

#### 使用例

```typescript
import { logger } from "@/server/lib/logger";

// 基本的なログ
logger.info("User logged in", { userId: 123 });

// エラーログ
logger.error("Failed to fetch data", error, { userId: 123 });

// HTTPリクエストログ
logger.logRequest(req, userId);

// セキュリティイベントログ
logger.logSecurityEvent("Failed login attempt", "high", { ip: req.ip });
```

### 分析システム

**実装ファイル**: `server/lib/analytics.ts`

#### イベント追跡

```typescript
import { analytics } from "@/server/lib/analytics";

// ページビュー追跡
analytics.trackPageView(userId, "/event/123", sessionId);

// ボタンクリック追跡
analytics.trackClick(userId, "join_event_button", sessionId);

// フォーム送信追跡
analytics.trackFormSubmit(userId, "event_creation_form", true, sessionId);
```

#### 統計取得

```typescript
// 全体統計
const stats = analytics.getStats();
console.log(stats);
// {
//   totalEvents: 1234,
//   uniqueUsers: 567,
//   eventCounts: { page_view: 800, button_click: 434 },
//   categoryCounts: { navigation: 800, interaction: 434 },
//   activeSessions: 45
// }

// ユーザー行動分析
const behavior = analytics.analyzeUserBehavior(userId);
console.log(behavior);
// {
//   totalEvents: 89,
//   mostFrequentAction: "page_view",
//   mostFrequentActionCount: 45,
//   avgSessionDuration: "320s",
//   activeSessions: 2
// }
```

#### A/Bテスト

```typescript
import { abTestManager } from "@/server/lib/analytics";

// テスト作成
abTestManager.createTest("button_color_test", ["red", "blue", "green"]);

// バリアント割り当て
const variant = abTestManager.assignVariant("button_color_test", userId);

// コンバージョン記録
abTestManager.recordConversion("button_color_test", userId);

// 結果取得
const results = abTestManager.getTestResults("button_color_test");
```

---

## デプロイメント

### 環境変数

必要な環境変数:

```bash
# Auth0
EXPO_PUBLIC_AUTH0_DOMAIN=dev-5fz2k7cymjmhkcu4.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=50UCyVdM4Q7ZWqq70rR3iv66trxccOxi
AUTH0_CLIENT_SECRET=<secret>

# データベース
DATABASE_URL=<postgresql_connection_string>

# サーバー
PORT=3000
NODE_ENV=production
```

### ビルドとデプロイ

```bash
# 依存関係のインストール
pnpm install

# TypeScriptコンパイル
pnpm check

# テスト実行
pnpm test

# プロダクションビルド
pnpm build

# サーバー起動
pnpm start
```

### モバイルアプリのビルド

```bash
# Android
pnpm android

# iOS
pnpm ios

# Expo Go でテスト
pnpm dev
```

---

## トラブルシューティング

### よくある問題

#### 1. TypeScriptエラー: "Too many open files"

**原因**: ファイル監視の上限に達した

**解決方法**:
```bash
# サーバーを再起動
pnpm dev

# または、TypeScriptキャッシュをクリア
rm -rf .tsbuildinfo
```

#### 2. Auth0ログインが失敗する

**原因**: 環境変数が正しく設定されていない

**確認事項**:
- `.env`ファイルに正しい値が設定されているか
- Auth0ダッシュボードでTwitter Social Connectionが有効になっているか
- Callback URLが正しく設定されているか

#### 3. データベース接続エラー

**原因**: データベースURLが無効、または接続が拒否された

**解決方法**:
```bash
# データベース接続を確認
pnpm db:push

# マイグレーションを実行
pnpm db:push
```

#### 4. パフォーマンスが遅い

**診断**:
```typescript
import { logger } from "@/server/lib/logger";

// パフォーマンスログを確認
logger.logPerformance("operation_name", duration);
```

**最適化**:
- データベースクエリにインデックスを追加
- 画像キャッシングを有効化
- デバウンス/スロットルを適用

---

## 保守とアップデート

### 定期的なメンテナンス

1. **ログファイルのローテーション**: `logs/`ディレクトリを定期的にクリーンアップ
2. **データベース最適化**: 定期的にVACUUMとANALYZEを実行
3. **依存関係の更新**: セキュリティパッチを適用
4. **テストの実行**: デプロイ前に全テストを実行

### モニタリング

- **エラー追跡**: `errorTracker.getStats()`で頻繁なエラーを確認
- **パフォーマンス**: ログから遅い操作を特定
- **ユーザー行動**: 分析データから改善点を発見

---

## 参考リンク

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Auth0 Documentation](https://auth0.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [tRPC Documentation](https://trpc.io/)

---

**最終更新**: 2026-02-15
**バージョン**: 1.0.0
