# 君斗りんくの動員ちゃれんじ (doin-challenge.com)

クリエイター（君斗りんく）のイベント動員を支援するWebアプリケーション。ファンが参加予定を表明し、応援メッセージを投稿することで、イベントの盛り上がりを可視化します。

---

## 🎯 プロジェクト概要

### コンセプト

「動員ちゃれんじ」は、クリエイターのイベント動員を支援するためのプラットフォームです。ファンが参加予定を表明し、応援メッセージを投稿することで、イベントの盛り上がりを可視化し、クリエイターとファンの絆を深めます。

### 主要機能

1. **イベント一覧**: 開催予定のイベントを一覧表示
2. **参加予定表明**: 会場参加・配信視聴・両方の3択で参加予定を表明
3. **応援メッセージ**: イベントへの応援メッセージを投稿
4. **進捗可視化**: 参加予定者数と目標達成率をリアルタイム表示
5. **マイページ**: 参加予定イベントと投稿したメッセージを管理

### 技術スタック

- **フロントエンド**: React Native (Expo SDK 54) + NativeWind (Tailwind CSS)
- **バックエンド**: Express + tRPC
- **データベース**: MySQL + Drizzle ORM
- **認証**: OAuth (Twitter/X)
- **デプロイ**: Vercel (予定)

---

## 🚀 セットアップ

### 前提条件

- Node.js 22.13.0
- pnpm 9.12.0
- MySQL 8.0+

### 1. リポジトリのクローン

```bash
git clone https://github.com/kimito-link/doin-challenge.com.git
cd doin-challenge.com
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要な環境変数を設定します。

```bash
cp .env.example .env
```

**必須の環境変数:**

```env
# データベース
DATABASE_URL=mysql://user:password@localhost:3306/doin_challenge

# 認証（OAuth）
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Sentry（エラー監視）
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=development

# Feature Flags
EXPO_PUBLIC_ENABLE_REALTIME_UPDATES=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
EXPO_PUBLIC_ENABLE_ANIMATIONS=true
```

### 4. データベースのセットアップ

```bash
# マイグレーション実行
pnpm db:push
```

### 5. 開発サーバーの起動

```bash
# サーバーとクライアントを同時に起動
pnpm dev

# サーバーのみ起動
pnpm dev:server

# クライアントのみ起動（Web）
pnpm dev:metro
```

開発サーバーが起動したら、以下のURLにアクセスできます：

- **Web**: http://localhost:8081
- **API**: http://localhost:3000

---

## 🧪 テスト

### テストの実行

```bash
# 全テスト実行
pnpm test

# 特定のテスト実行
pnpm test path/to/test.test.ts

# E2Eテスト実行
pnpm test __tests__/e2e-smoke.test.ts
```

### テストの種類

- **ユニットテスト**: `__tests__/*.test.ts`
- **E2Eテスト**: `__tests__/e2e-smoke.test.ts`
- **データ整合性テスト**: `__tests__/data-integrity.test.ts`

---

## 📦 ビルドとデプロイ

### ビルド

```bash
# サーバーのビルド
pnpm build

# クライアントのビルド（Web）
pnpm build:web
```

### デプロイ

```bash
# 本番環境へデプロイ
pnpm start
```

**デプロイ前の確認事項:**

1. `docs/web-release-checklist.md`の全項目をクリア
2. `docs/user-flows-checklist.md`で主要フローを手動確認
3. `docs/performance-checklist.md`でパフォーマンスを確認
4. `docs/ui-ux-checklist.md`でUI/UXを確認

---

## 📚 ドキュメント

### 開発ガイド

- **[Web版リリースチェックリスト](./docs/web-release-checklist.md)**: リリース前の確認項目
- **[ユーザーフローチェックリスト](./docs/user-flows-checklist.md)**: 主要フローの動作確認
- **[パフォーマンスチェックリスト](./docs/performance-checklist.md)**: パフォーマンス最適化
- **[UI/UXチェックリスト](./docs/ui-ux-checklist.md)**: UI/UXの最終調整

### 運用ガイド

- **[ロールバック手順](./docs/rollback-procedure.md)**: 緊急時のロールバック手順
- **[緊急時の対応フロー](./docs/emergency-response.md)**: 緊急時の対応フロー
- **[Feature Flags](./docs/feature-flags.md)**: Feature Flagsの使い方

### セットアップガイド

- **[Sentry設定](./docs/sentry-setup.md)**: Sentryのセットアップ手順
- **[UptimeRobot設定](./docs/uptime-robot-setup.md)**: UptimeRobotのセットアップ手順

### Phase 2: ログインUX改善

Phase 2（ログインUX改善）を実装する場合は、**必ず以下のガイドに従ってください**：

📄 **[Phase 2実装ガイド](./docs/phase2-implementation-guide.md)**

**重要な原則:**
- **思想**: 迷わない／怖がらず／戻ってこれる
- **前提**: login()は黒箱、成否はAuth Context、外部遷移必須
- **ポリシー**: OAuth触らない、自動login禁止、FSM管理

---

## 🏗️ プロジェクト構成

```
.
├── app/                    # Expo Routerアプリケーション
│   ├── (tabs)/            # タブナビゲーション
│   ├── event/             # イベント詳細画面
│   ├── messages/          # メッセージ一覧画面
│   ├── admin/             # 管理画面
│   └── oauth/             # OAuth認証（触らない）
├── components/             # Reactコンポーネント
│   ├── ui/                # UIコンポーネント
│   ├── molecules/         # 複合コンポーネント
│   └── auth-ux/           # Phase 2: ログインUX改善コンポーネント
├── features/               # 機能別コンポーネント
│   ├── home/              # ホーム画面
│   ├── events/            # イベント一覧
│   ├── event-detail/      # イベント詳細
│   └── my-page/           # マイページ
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ
│   ├── telemetry/         # テレメトリー
│   └── feature-flags.ts   # Feature Flags
├── server/                 # バックエンドサーバー
│   ├── _core/             # サーバーコア
│   ├── routers/           # tRPCルーター
│   └── db/                # データベース
├── theme/                  # テーマ設定
│   └── tokens/            # カラーパレット
├── docs/                   # ドキュメント
├── __tests__/              # テスト
└── .github/
    └── workflows/          # GitHub Actions
```

---

## 🔧 開発ワークフロー

### 1. 機能開発

1. `todo.md`に新しいタスクを追加
2. 機能を実装
3. テストを追加
4. `todo.md`のタスクを完了としてマーク
5. チェックポイントを保存（`webdev_save_checkpoint`）
6. GitHubにpush

### 2. チェックポイントの保存

```bash
# チェックポイントを保存
webdev_save_checkpoint "v6.xxx: 機能名"
```

### 3. ロールバック

```bash
# チェックポイントにロールバック
webdev_rollback_checkpoint <version_id>
```

---

## 🚨 緊急時の対応

### 1. 監視

- **UptimeRobot**: `/api/readyz`を監視
- **Sentry**: エラーを監視
- **GitHub Actions**: スモークテストを自動実行

### 2. Feature Flagで無効化

```bash
# リアルタイム更新を無効化
EXPO_PUBLIC_ENABLE_REALTIME_UPDATES=false

# プッシュ通知を無効化
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false

# アニメーションを無効化
EXPO_PUBLIC_ENABLE_ANIMATIONS=false
```

### 3. ロールバック

詳細は[ロールバック手順](./docs/rollback-procedure.md)を参照してください。

---

## 📊 パフォーマンス

### 目標

- **LCP（Largest Contentful Paint）**: 3秒以内
- **TTI（Time to Interactive）**: 5秒以内
- **CLS（Cumulative Layout Shift）**: 0.1以下
- **Lighthouseスコア**: 90以上

### 実装済みの最適化

- FlatListの標準最適化（v6.96）
- 画像表示の最適化（v6.97）
- レスポンシブデザインの最適化（v6.97）

詳細は[パフォーマンスチェックリスト](./docs/performance-checklist.md)を参照してください。

---

## ♿ アクセシビリティ

### 目標

- **WCAG AA基準**: コントラスト比4.5:1以上
- **タップ領域**: 44px以上
- **性別色分け**: 色+アイコン/ラベル

### 実装済みの最適化

- コントラストの最終調整（v6.98）
- タップ領域の統一（v6.97）
- 性別色にアイコン追加（v6.97）

詳細は[UI/UXチェックリスト](./docs/ui-ux-checklist.md)を参照してください。

---

## 🤝 コントリビューション

### NG集（触ってはいけないファイル）

- `app/oauth/**`
- `server/twitter*`
- `hooks/use-auth.ts`
- `lib/auth-provider.tsx`
- OAuth callback画面/ルート

### PRマージ前の必須チェック

- ✅ Vercel Production の Commit SHA と GitHub main の HEAD が一致している
- ✅ 本番環境でログイン機能が正常動作している
- ✅ diff-check CIが通過している

---

## 📝 ライセンス

MIT

---

## 📞 サポート

質問や問題がある場合は、[GitHub Issues](https://github.com/kimito-link/doin-challenge.com/issues)で報告してください。
