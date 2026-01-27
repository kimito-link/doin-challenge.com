# Changelog

このプロジェクトのすべての重要な変更は、このファイルに記録されます。

このフォーマットは[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)に基づいており、このプロジェクトは[セマンティックバージョニング](https://semver.org/lang/ja/)に準拠しています。

## [Unreleased]

### 計画中
- モバイルアプリ版のリリース（iOS/Android）
- プッシュ通知機能
- イベントリマインダー機能
- 参加者同士のコミュニケーション機能

---

## [6.111] - 2026-01-27

### 追加
- **オープンソースドキュメントの整備**
  - LICENSE.md: MITライセンスの適用
  - CODE_OF_CONDUCT.md: Contributor Covenant v2.1準拠の行動規範
  - README.mdに重要ドキュメントへのリンクを追加

---

## [6.110] - 2026-01-27

### 追加
- **セキュリティポリシーとIssueテンプレート**
  - SECURITY.md: 脆弱性報告手順とセキュリティアップデート方針
  - Issueテンプレート: バグレポート、機能リクエスト、質問用のフォーム

---

## [6.109] - 2026-01-27

### 追加
- **GitHub Actionsの設定**
  - CIワークフロー: 型チェック、ESLint、テスト、ビルドの自動実行
  - Dependabot: 依存関係の自動更新（npm、GitHub Actions）

---

## [6.108] - 2026-01-27

### 追加
- **コントリビューションガイド**
  - CONTRIBUTING.md: コーディング規約、コミットメッセージ規約、ブランチ戦略、レビュープロセス
  - PRテンプレート: コード品質・テスト・ドキュメント・パフォーマンス・セキュリティのチェックリスト

---

## [6.107] - 2026-01-27

### 追加
- **アーキテクチャドキュメント**
  - docs/architecture.md: システム構成図、データフロー図、デプロイフロー図、ER図、セキュリティアーキテクチャ、パフォーマンス最適化フロー、監視・運用フロー

---

## [6.106] - 2026-01-27

### 追加
- **運用基盤の完成**
  - docs/environment-variables.md: 環境変数の詳細ドキュメント
  - docs/troubleshooting.md: トラブルシューティングガイド

---

## [6.105] - 2026-01-27

### 追加
- **ドキュメント整備（Gate 4: 運用できる）**
  - README.mdの全面更新: プロジェクト概要、セットアップ手順、開発ワークフロー
  - docs/api-specification.md: API仕様書
  - docs/design-system.md: デザインシステムドキュメント

---

## [6.104] - 2026-01-27

### 追加
- **監視・運用体制の整備（Gate 4: 運用できる）**
  - docs/monitoring-setup.md: Sentry、UptimeRobot、Vercel Analyticsの設定手順
  - docs/sentry-setup.md: Sentryの詳細設定手順
  - docs/uptime-robot-setup.md: UptimeRobotの設定手順

---

## [6.103] - 2026-01-27

### 追加
- **テスト体制の整備（Gate 3: 品質を保証できる）**
  - docs/testing-strategy.md: テスト戦略とガイドライン
  - docs/user-flows-checklist.md: ユーザーフローのテストチェックリスト
  - docs/ui-ux-checklist.md: UI/UXのテストチェックリスト
  - docs/performance-checklist.md: パフォーマンスのテストチェックリスト

---

## [6.102] - 2026-01-27

### 追加
- **デプロイ体制の整備（Gate 2: デプロイできる）**
  - docs/deployment-guide.md: Vercelへのデプロイ手順
  - docs/environment-setup.md: 環境変数の設定手順
  - docs/rollback-procedure.md: ロールバック手順

---

## [6.101] - 2026-01-27

### 追加
- **基本機能の実装（Gate 1: 動く）**
  - イベント一覧表示
  - イベント詳細表示
  - 参加予定表明（会場参加・配信視聴・両方）
  - 応援メッセージ投稿
  - 進捗可視化（参加予定者数と目標達成率）
  - マイページ（参加予定イベントと投稿したメッセージ）

---

## [6.100] - 2026-01-27

### 追加
- **プロジェクト初期化**
  - Expo SDK 54 + React Native 0.81
  - NativeWind 4（Tailwind CSS）
  - tRPC + Express
  - MySQL + Drizzle ORM
  - OAuth認証（Twitter/X）

---

## バージョニングルール

このプロジェクトは以下のバージョニングルールに従います：

- **メジャーバージョン（X.0.0）**: 破壊的変更、大規模な機能追加
- **マイナーバージョン（0.X.0）**: 後方互換性のある機能追加
- **パッチバージョン（0.0.X）**: 後方互換性のあるバグ修正

現在は開発初期段階のため、バージョン6.x系を使用しています。正式リリース時に1.0.0に移行します。

---

## 変更カテゴリ

- **追加（Added）**: 新機能
- **変更（Changed）**: 既存機能の変更
- **非推奨（Deprecated）**: 将来削除される機能
- **削除（Removed）**: 削除された機能
- **修正（Fixed）**: バグ修正
- **セキュリティ（Security）**: セキュリティ関連の変更

---

## リンク

- [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)
- [セマンティックバージョニング](https://semver.org/lang/ja/)
- [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/)
