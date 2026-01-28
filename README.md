# 動員チャレンジ（Doin Challenge）

**プロジェクト名**: 動員チャレンジ（Doin Challenge）  
**ドメイン**: [doin-challenge.com](https://doin-challenge.com)  
**バージョン**: 6.144  
**最終更新**: 2026年1月29日

---

## プロジェクト概要

**動員チャレンジ**は、アイドル・ホスト・キャバ嬢などのエンターテイナーの生誕祭やイベントを応援するためのWebアプリケーションです。ファンがTwitterログインでフォロワー数を表示し、応援メッセージを投稿・閲覧できる機能を提供します。

このプロジェクトは、**React Native + Expo**をベースとしたクロスプラットフォームアプリケーションであり、iOS、Android、Webの3つのプラットフォームで動作します。バックエンドは**Node.js + Express + tRPC**で構築され、**PostgreSQL**データベースを使用しています。

---

## 主要機能

本アプリケーションは以下の主要機能を提供します。

| 機能 | 説明 |
|------|------|
| **Twitter OAuth認証** | Twitter OAuth 2.0 with PKCEによる安全なログイン |
| **フォロワー数表示** | ログインユーザーのTwitterフォロワー数をリアルタイム表示 |
| **応援メッセージ投稿** | ファンからの応援メッセージを収集・表示 |
| **参加登録機能** | イベントへの参加表明と都道府県別の可視化 |
| **オフライン対応** | AsyncStorageによるキャッシュで一部機能をオフラインで利用可能 |
| **リアルタイム更新** | WebSocketによるリアルタイムデータ同期 |

---

## 技術スタック

本プロジェクトは、モダンなWeb技術とモバイル開発のベストプラクティスを組み合わせて構築されています。

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **React** | 19.1.0 | UIライブラリ |
| **React Native** | 0.81.5 | モバイルアプリケーションフレームワーク |
| **Expo** | ~54.0.29 | React Nativeの開発環境・ビルドツール |
| **Expo Router** | ~6.0.19 | ファイルベースルーティング |
| **NativeWind** | ^4.2.1 | Tailwind CSSのReact Native実装 |
| **TypeScript** | ~5.9.3 | 型安全性の確保 |
| **TanStack Query** | ^5.90.20 | サーバーステート管理・キャッシング |
| **tRPC Client** | 11.7.2 | 型安全なAPI通信 |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Node.js** | 22.x | サーバーランタイム |
| **Express** | ^4.22.1 | Webフレームワーク |
| **tRPC Server** | 11.7.2 | 型安全なAPIエンドポイント |
| **Drizzle ORM** | ^0.44.7 | データベースORM |
| **PostgreSQL** | 最新版 | リレーショナルデータベース |
| **Zod** | ^4.2.1 | スキーマバリデーション |
| **Jose** | 6.1.0 | JWT処理 |

### ビルド・デプロイ

| 技術 | 用途 |
|------|------|
| **pnpm** | パッケージマネージャー（9.12.0） |
| **esbuild** | サーバーサイドバンドラー |
| **Railway** | バックエンドホスティング |
| **Vercel** | フロントエンドホスティング |
| **GitHub Actions** | CI/CDパイプライン |

### テスト・品質管理

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Vitest** | ^2.1.9 | ユニットテスト |
| **Playwright** | ^1.57.0 | E2Eテスト |
| **Testing Library** | ^16.3.2 | Reactコンポーネントテスト |
| **ESLint** | ^9.39.2 | コード品質チェック |
| **Prettier** | ^3.7.4 | コードフォーマット |

---

## プロジェクト構造

プロジェクトは以下のディレクトリ構造で構成されています。

```
birthday-celebration/
├── app/                      # Expo Routerアプリケーション
│   ├── (tabs)/              # タブナビゲーション画面
│   │   ├── index.tsx        # ホーム画面
│   │   ├── create.tsx       # イベント作成画面
│   │   └── profile.tsx      # プロフィール画面
│   ├── event/               # イベント関連画面
│   │   └── [id].tsx         # イベント詳細画面
│   ├── oauth/               # OAuth認証コールバック
│   └── _layout.tsx          # ルートレイアウト
├── components/              # 再利用可能なUIコンポーネント
│   ├── screen-container.tsx # SafeAreaラッパー
│   ├── ui/                  # UIコンポーネント
│   └── auth-ux/             # 認証UXコンポーネント
├── hooks/                   # カスタムReactフック
│   ├── use-auth.ts          # 認証状態管理
│   ├── use-colors.ts        # テーマカラー管理
│   └── use-offline-cache.ts # オフラインキャッシュ
├── lib/                     # ユーティリティ・共通ロジック
│   ├── trpc.ts              # tRPCクライアント設定
│   ├── offline-cache.ts     # オフラインストレージ
│   └── utils.ts             # ユーティリティ関数
├── server/                  # バックエンドサーバー
│   ├── _core/               # サーバーコア
│   │   └── index.ts         # メインサーバーファイル
│   ├── routers/             # tRPCルーター
│   ├── db/                  # データベーススキーマ
│   ├── twitter-oauth2.ts    # Twitter OAuth実装
│   └── twitter-auth.ts      # セッション管理
├── shared/                  # クライアント・サーバー共通型定義
│   └── types.ts             # 共通型定義
├── docs/                    # ドキュメント
│   ├── ARCHITECTURE.md      # アーキテクチャ設計書
│   ├── DEPLOYMENT.md        # デプロイガイド
│   └── TROUBLESHOOTING.md   # トラブルシューティング
├── scripts/                 # ビルド・デプロイスクリプト
│   ├── generate-build-info.cjs  # ビルド情報生成
│   └── migrate.ts           # データベースマイグレーション
├── .github/                 # GitHub Actions
│   └── workflows/
│       └── deploy-vercel.yml # Vercelデプロイワークフロー
├── assets/                  # 静的アセット（画像・フォント）
├── package.json             # プロジェクト設定
├── app.config.ts            # Expo設定
├── tailwind.config.js       # Tailwind CSS設定
├── theme.config.js          # テーマカラー設定
└── vitest.config.ts         # Vitestテスト設定
```

---

## セットアップ手順

### 前提条件

以下のソフトウェアがインストールされている必要があります。

- **Node.js**: 22.x以上
- **pnpm**: 9.12.0以上
- **Git**: 最新版

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/birthday-celebration.git
cd birthday-celebration
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の環境変数を設定します。

```env
# データベース接続（Railway提供）
DATABASE_URL=postgresql://user:password@host:port/database

# Twitter OAuth 2.0認証情報
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=https://doin-challenge.com/oauth/callback

# セッション管理
SESSION_SECRET=your_random_session_secret

# Expo設定
EXPO_PORT=8081
```

### 4. データベースマイグレーション

```bash
pnpm db:migrate
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

このコマンドは以下を同時に起動します：

- **バックエンドサーバー**: `http://localhost:3000`
- **Expo Metro Bundler**: `http://localhost:8081`

### 6. アプリケーションの確認

- **Web**: ブラウザで`http://localhost:8081`にアクセス
- **iOS**: Expo Goアプリでローカルネットワーク経由で接続
- **Android**: Expo Goアプリでローカルネットワーク経由で接続

---

## 開発ガイド

### テストの実行

```bash
# 全テスト実行
pnpm test

# 特定のテスト実行
pnpm test path/to/test.test.ts

# E2Eテスト実行
pnpm e2e

# E2EテストUI表示
pnpm e2e:ui
```

### コード品質チェック

```bash
# TypeScript型チェック
pnpm check

# ESLint実行
pnpm lint

# Prettierフォーマット
pnpm format
```

### データベース操作

```bash
# スキーマ変更の生成とマイグレーション
pnpm db:push

# マイグレーション実行
pnpm db:migrate
```

---

## デプロイ

本プロジェクトは以下の環境にデプロイされています。

| 環境 | プラットフォーム | URL |
|------|----------------|-----|
| **バックエンド** | Railway | https://doin-challenge.com/api |
| **フロントエンド** | Vercel | https://doin-challenge.com |

詳細なデプロイ手順は[DEPLOYMENT.md](./docs/DEPLOYMENT.md)を参照してください。

---

## ライセンス

MIT License

---

## 作成者

**Manus AI**

---

## 関連ドキュメント

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - システムアーキテクチャ設計書
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - デプロイガイド
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - トラブルシューティング
- [ADAPTATION-GUIDE.md](./docs/ADAPTATION-GUIDE.md) - 他コンセプトへの適用方法
