# ドキュメント一覧

このディレクトリには、プロジェクトの各種ドキュメントが格納されています。

---

## 📚 目的別ドキュメント

### 🚀 デプロイ・運用

| ドキュメント | 説明 |
|------------|------|
| [GATE1-SETUP.md](./GATE1-SETUP.md) | **Gate 1「壊れない運用」のセットアップガイド**<br>Vercel明示的デプロイとデプロイ反映確認機構の設定手順 |
| [GITHUB-SECRETS-SETUP.md](./GITHUB-SECRETS-SETUP.md) | **GitHub Secrets設定ガイド**<br>VERCEL_TOKEN等の取得と設定手順 |
| [UPTIMEROBOT-SETUP.md](./UPTIMEROBOT-SETUP.md) | **UptimeRobot監視設定ガイド**<br>ダウンタイム検知の設定手順 |
| [SENTRY-SETUP.md](./SENTRY-SETUP.md) | **Sentry導入ガイド**<br>エラー監視の設定手順 |
| [DEPLOY.md](./DEPLOY.md) | デプロイ手順の詳細 |
| [RAILWAY_DEPLOY_SETUP.md](./RAILWAY_DEPLOY_SETUP.md) | Railwayへのデプロイ設定 |
| [emergency-response.md](./emergency-response.md) | 緊急対応手順 |
| [rollback-procedure.md](./rollback-procedure.md) | ロールバック手順 |

### 🏗️ アーキテクチャ

| ドキュメント | 説明 |
|------------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | プロジェクト全体のアーキテクチャ |
| [API-ARCHITECTURE.md](./API-ARCHITECTURE.md) | API設計とアーキテクチャ |
| [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md) | コンポーネント設計 |
| [DATA-FLOW.md](./DATA-FLOW.md) | データフローの設計 |
| [api-specification.md](./api-specification.md) | API仕様書 |

### 💻 開発ガイド

| ドキュメント | 説明 |
|------------|------|
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | 開発環境のセットアップと開発手順 |
| [component-guidelines.md](./component-guidelines.md) | コンポーネント開発ガイドライン |
| [code-reference.md](./code-reference.md) | コードリファレンス |
| [environment-variables.md](./environment-variables.md) | 環境変数の設定 |
| [troubleshooting.md](./troubleshooting.md) | トラブルシューティング |

### 🎨 デザイン

| ドキュメント | 説明 |
|------------|------|
| [design-system.md](./design-system.md) | デザインシステム |
| [COLOR_PALETTE_CANDIDATES.md](./COLOR_PALETTE_CANDIDATES.md) | カラーパレット候補 |
| [UI-FLOW.md](./UI-FLOW.md) | UI/UXフロー |

### 📊 パフォーマンス

| ドキュメント | 説明 |
|------------|------|
| [PERFORMANCE-OPTIMIZATION.md](./PERFORMANCE-OPTIMIZATION.md) | パフォーマンス最適化ガイド |
| [performance-monitoring.md](./performance-monitoring.md) | パフォーマンス監視 |
| [performance-best-practices.md](./performance-best-practices.md) | パフォーマンスベストプラクティス |

### ✅ チェックリスト

| ドキュメント | 説明 |
|------------|------|
| [pre-deployment-checklist.md](./pre-deployment-checklist.md) | デプロイ前チェックリスト |
| [web-release-checklist.md](./web-release-checklist.md) | Web版リリースチェックリスト |
| [critical-features-checklist.md](./critical-features-checklist.md) | 重要機能チェックリスト |
| [ui-ux-checklist.md](./ui-ux-checklist.md) | UI/UXチェックリスト |

### 📝 その他

| ドキュメント | 説明 |
|------------|------|
| [USER-GUIDE.md](./USER-GUIDE.md) | ユーザーガイド |
| [DECISION-LOG.md](./DECISION-LOG.md) | 設計判断の記録 |
| [IMPROVEMENT-REPORT.md](./IMPROVEMENT-REPORT.md) | 改善レポート |
| [project-summary.md](./project-summary.md) | プロジェクトサマリー |

---

## 🔍 ドキュメントの探し方

### 1. デプロイ・運用関連

デプロイやCI/CD、監視設定については、以下のドキュメントを参照してください：

1. **[GATE1-SETUP.md](./GATE1-SETUP.md)** - Gate 1「壊れない運用」の全体像
2. **[GITHUB-SECRETS-SETUP.md](./GITHUB-SECRETS-SETUP.md)** - GitHub Secretsの設定
3. **[UPTIMEROBOT-SETUP.md](./UPTIMEROBOT-SETUP.md)** - 監視の設定
4. **[SENTRY-SETUP.md](./SENTRY-SETUP.md)** - エラー監視の設定

### 2. 開発開始時

開発環境のセットアップと開発手順については、以下のドキュメントを参照してください：

1. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - 開発環境のセットアップ
2. **[component-guidelines.md](./component-guidelines.md)** - コンポーネント開発ガイドライン
3. **[environment-variables.md](./environment-variables.md)** - 環境変数の設定

### 3. トラブルシューティング

問題が発生した場合は、以下のドキュメントを参照してください：

1. **[troubleshooting.md](./troubleshooting.md)** - 一般的なトラブルシューティング
2. **[emergency-response.md](./emergency-response.md)** - 緊急対応手順
3. **[rollback-procedure.md](./rollback-procedure.md)** - ロールバック手順

---

## 📌 重要なドキュメント（優先度順）

1. **[GATE1-SETUP.md](./GATE1-SETUP.md)** - Gate 1「壊れない運用」のセットアップ
2. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - 開発ガイド
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - アーキテクチャ
4. **[api-specification.md](./api-specification.md)** - API仕様書
5. **[troubleshooting.md](./troubleshooting.md)** - トラブルシューティング

---

## 🔄 ドキュメントの更新

ドキュメントは常に最新の状態を保つよう心がけてください。

- 新機能を追加した場合は、関連するドキュメントを更新してください
- 設計判断を行った場合は、[DECISION-LOG.md](./DECISION-LOG.md)に記録してください
- トラブルシューティングの知見を得た場合は、[troubleshooting.md](./troubleshooting.md)に追加してください

---

## 📚 参考資料

- [プロジェクトREADME](../README.md)
- [design.md](../design.md) - アプリのデザイン思想
- [todo.md](../todo.md) - タスク管理
