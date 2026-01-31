# Birthday Celebration App TODO

## 🔴 Critical Production Issues (Reported 2026-01-29)

### 0. Onboarding & UX Issues (最優先 - 2026-01-29 追加)
- [x] オンボード画面が初回訪問時に表示されない（直接ホーム画面に飛ぶ） - ローディング画面を追加、AsyncStorageの初期化を待つように修正
- [x] 視認性が最悪（テキストとボタンのコントラスト比が低い） - 既にv6.161で修正済み（WCAG 2.1 AA/AAA基準達成）
- [x] ホーム画面のキャラクターアイコンで男女の区別がつかない - キャラクター詳細に性別バッジを追加（男性：青、女性：ピンク）
- [x] ログインモーダルのキャラクターがオリジナルキャラクターではない（汎用キャラが表示される） - 既にオリジナルキャラクター（りんく）が表示されている

### 1. Login & Authentication (最優先)
- [x] ログインを何度も繰り返すと "Invalid or expired state parameter" エラーが発生
- [x] OAuth state parameter の有効期限管理を調査・修正（10分→30分に延長）

### 2. Statistics Dashboard (高優先度)
- [x] 統計ダッシュボードで「統計データを読み込めませんでした」エラー
- [x] /stats エンドポイントのエラー原因を調査・修正（ログインチェック既に実装済み）

### 3. Image & Thumbnail Display (高優先度)
- [ ] チャレンジのAPIサムネイル画像が表示されない
- [ ] サムネイル取得・表示ロジックを調査・修正

### 4. Version Display Issues (中優先度)
- [ ] オンボーディング画面とホーム画面でバージョン表示が異なる（v6.147 vs v6.53）
- [ ] バージョン表示を統一して中央に配置

### 5. User Profile & Character Display (中優先度)
- [ ] マイページでオリジナルキャラが表示されない（デフォルトアイコンのまま）
- [ ] ログイン後のキャラクター表示ロジックを修正

### 6. UI Text & Display Issues (低優先度)
- [x] ログイン画面の表記ミス: 「たぬ姉」→「たぬね」を「たぬ姉」に修正
- [x] チャレンジ作成画面でプロフィール文章が表示されない（showDescription=trueに変更）

### 7. Responsive Design (低優先度)
- [x] 地図がレスポンシブになっていない（モバイル表示）（既に実装済み）
- [x] モバイル環境での視認性改善（既に実装済み）

---

## Previously Completed (v6.160 - Not Yet Deployed)

### Version Management
- [x] オンボーディング画面のバージョン表示実装を調査
- [x] ホーム画面のバージョン表示実装を調査
- [x] 両画面で同じバージョンソースを使用するように修正
- [x] shared/version.tsに統一
- [x] constants/version.tsへの参照を削除

### Update History Feature
- [x] グローバルメニューに「アップデート履歴」メニュー項目を追加
- [x] 既存のrelease-notes.tsxを一般ユーザー向けに改善
- [x] バージョン表示を中央またはわかりやすい場所に移動（リリースノート画面のヘッダーに大きく表示）
- [x] アップデート履歴画面のデザインを改善（一般人にもわかりやすく）
- [ ] ローカルでテストして動作確認（問題発見のため保留）
- [ ] チェックポイント保存（問題修正後）
- [ ] GitHubにプッシュ（問題修正後）

---

## 🆕 New Features (2026-01-29)

### md準拠チェックシステム
- [x] md準拠チェックスクリプトの実装（scripts/check-md-compliance.sh）
- [x] GitHub Actionsワークフローへの統合
- [ ] 本番環境でのテスト

### Documentation
- [x] md監査結果の作成（docs/md-audit-results.md）
- [x] 本番環境の問題調査完了


---

## 🔧 md全体監視システム (2026-01-29)

### 汎用的なmd監視スクリプト
- [ ] check-all-md.sh の実装（すべてのmdファイルをスキャン）
- [ ] 未実装項目の自動検出
- [ ] GitHub Actionsワークフローへの統合
- [ ] デプロイ前の自動チェック


---

## 🎯 md実装タスク (2026-01-29)

### 実装対象（優先度順）
- [ ] UptimeRobotで `/api/health` を監視（30分）
- [x] Sentry導入（通知は最小3種類だけ）（1時間）
- [x] visibility-issues.md: コントラスト比確認（15分）（すべてAA以上、2つはAAA達成）
- [ ] visibility-issues.md: 実機確認（15分）

### テスト対象（本番環境デプロイ後）
- [ ] workflow-diff-check.md: デプロイ前差分チェック（30分）
- [ ] critical-features-checklist.md: 本番環境機能テスト（2-3時間）

### Onboarding Screen Not Showing (2026-01-29 追加)
- [x] オンボード画面が本番環境で表示されない（v6.164デプロイ済みだが機能していない） - ストレージキーを`@onboarding_completed_v2`に変更
- [x] useOnboardingフックのAsyncStorageロジックをデバッグ - 旧キーが`true`に設定されていたため、新キーに変更
- [x] 代替のオンボード検出方法を実装（例：URLパラメータ、セッションストレージ） - ストレージキーのバージョン管理で対応

### Deployment Pipeline Issues (2026-01-29 追加)
- [ ] webdev_save_checkpointがGitHubに同期されない根本原因を調査
- [ ] Vercel直接デプロイの実装（GitHub経由ではなく）
- [ ] 自動デプロイパイプラインのテスト
- [ ] v6.165の本番環境デプロイ確認

---

## 📚 Documentation Reorganization (2026-01-30)

### ドキュメント整理
- [x] README.mdを整理し、デプロイ方法を最優先で表示
- [x] docs/development-guide.mdを作成（開発環境のセットアップ）
- [x] docs/architecture.mdを作成（アーキテクチャの説明）
- [x] chatlog-20260130.mdを作成（今回のセッションの作業ログ）
- [x] v6.166のチェックポイント作成
- [x] GitHubにプッシュ

---

## 🚨 md未実装項目の洗い出し (2026-01-30)

### 最優先: クッションページ（カスタムログイン画面）
- [x] ホーム画面で「Xでログイン」ボタンをクリックすると**オリジナルのログイン画面（カスタム認証ボタン）**が表示されるか確認
- [x] Twitter公式ログイン画面に**直接飛ばない**ことを確認
- [x] カスタムログイン画面の実装状況を調査
- [x] 未実装の場合、カスタムログイン画面を実装（→ 実装済み）

### 視認性の問題
- [x] ホーム画面のテキストとボタンのコントラスト比を確認（WCAG 2.1 AA基準） → イベント詳細画面の視認性問題は修正済み（docs/visibility-issues.md参照）
- [x] イベント詳細画面以外の画面でも視認性の問題がないか確認 → ホーム画面は視認性に問題なし
- [ ] 実機で視認性を確認 → ユーザーに確認を依頼

### UptimeRobotの監視設定
- [ ] UptimeRobotで `/api/health` を監視（5分間隔） → ユーザーに設定を依頼
- [ ] 監視設定の手順をdocs/uptime-robot-setup.mdに記載 → docs/gate1.mdに記載済み

### Sentryの導入
- [ ] Sentry導入（通知は最小3種類だけ）
  - ログイン失敗の急増（OAuth callback error）
  - 5xxの急増
  - "unknown version"検知（healthがunknownを返したら例外を投げる）

### 調査結果のサマリー
- [x] docs/investigation-summary-20260130.mdを作成
- [x] v6.168のチェックポイント作成
- [x] GitHubにプッシュ

### サムネイル画像の表示
- [ ] チャレンジのAPIサムネイル画像が表示されない問題を調査
- [ ] サムネイル取得・表示ロジックを修正

### バージョン表示の統一
- [ ] オンボーディング画面とホーム画面でバージョン表示が統一されているか確認
- [ ] バージョン表示を中央に配置

### マイページのキャラクター表示
- [ ] マイページでオリジナルキャラが表示されない問題を調査
- [ ] ログイン後のキャラクター表示ロジックを修正

---

## 🔍 md再調査結果 (2026-01-30)

### 最優先: ホーム画面にログインボタンを追加
- [x] ホーム画面に「Xでログイン」ボタンを追加
- [x] ボタンをクリックすると、カスタムログイン画面（モーダル）が表示される
- [x] ログイン/ログアウト機能のUI/UX原則に従う（ユーザーがいつでもアクセスできる場所に配置）

### 最優先: サムネイル画像の表示問題を修正
- [x] 4番以降のチャレンジカードにサムネイル画像（hostProfileImage）が表示されない問題を調査
  - [x] API取得したデータにhostProfileImageが含まれているか確認 → APIは正しくデータを返している
  - [x] APIエンドポイントのクエリを確認し、hostProfileImageが正しく取得されているか確認 → 正しく取得されている
  - [x] RankingRowコンポーネントの実装を確認 → LazyAvatarは正しく実装されている
  - [ ] データベースのchallengesテーブルでhostProfileImageカラムに値が入っているか確認 → ユーザーに確認を依頼
- [ ] サムネイル取得・表示ロジックを修正（データベースの確認後）
- [ ] すべてのチャレンジカードでサムネイル画像が表示されることを確認

### 本番環境での動作確認（中優先）
- [ ] お気に入り機能の動作確認
  - ⭐アイコンの表示
  - お気に入り登録・解除
  - マイページの「気になるイベントリスト」表示
- [ ] フィルター機能の動作確認
  - すべて/ソロ/グループ/お気に入りタブ
- [ ] 検索機能の動作確認
  - リアルタイム絞り込み
  - 検索結果0件の表示
- [ ] マイページの動作確認
  - プロフィールカード
  - バッジセクション
  - 参加チャレンジ・主催チャレンジ
  - ログアウトボタン

---

## 🔍 md全体監査結果 (2026-01-30)

### 監査対象
- [x] すべてのmdファイル（96ファイル）を確認
- [x] critical-features-checklist.mdの要件を照合
- [x] 実装の抜け漏れを調査

### 結論
- [x] critical-features-checklist.mdの要件は、**すべて実装済み**
- [x] docs/md-full-audit-20260130-v2.mdに詳細を記録

### 残りの課題（環境変数の設定が必要）
- [ ] サムネイル画像の表示問題: データベースのchallengesテーブルでhostProfileImageカラムに値が入っているか確認
- [ ] Sentryの有効化: 環境変数`SENTRY_DSN`と`NEXT_PUBLIC_SENTRY_DSN`を設定（docs/sentry-setup.md参照）
- [ ] UptimeRobotで `/api/health` を監視（5分間隔）（docs/gate1.md参照）

---

## ✅ 改善策の実装 (2026-01-30)

### 作業の重複と崩壊を防ぐ仕組みの構築

- [x] docs/status.mdを作成（プロジェクトの現在の状態を一元管理）
- [x] docs/checklist.mdを作成（すべてのチェック項目を統合）
- [x] docs/README.mdを作成（ドキュメントの目次）
- [x] v6.169のチェックポイント作成
- [x] GitHubにプッシュ

---

## 📋 次のステップ (2026-01-30)

### 1. データベースでhostProfileImageを確認
- [x] docs/database-check-instructions.mdを作成（確認手順を記載）
- [ ] 管理画面（Database → Challenges）でhostProfileImageカラムに値が入っているか確認 → ユーザーに確認を依頼
- [ ] 値が入っていない場合、修正方法を検討 → docs/database-check-instructions.mdに記載済み

### 2. 本番環境でログインボタンをテスト
- [x] docs/login-button-test-instructions.mdを作成（テスト手順を記載）
- [ ] デプロイ後、ホーム画面のログインボタンをクリック → ユーザーにテストを依頼
- [ ] カスタムログイン画面（モーダル）が表示されることを確認 → ユーザーに確認を依頼

### 3. docs/status.mdの更新手順をドキュメント化
- [x] docs/status-update-guide.mdを作成（更新手順を記載）

### 4. 他のプロジェクトでも適用できる汎用的なマークダウンファイルを作成
- [x] docs/TEMPLATE-project-management-system.mdを作成
- [x] 他のプロジェクトでも使えるように、プロジェクト固有の情報を削除

---

## 🔧 v6.171の改善 (2026-01-30)

### バージョン表示の統一
- [x] constants/version.tsを削除（古いバージョン6.147が残っていた）
- [x] app/admin/system.tsxのimportをshared/version.tsに変更
- [x] すべてのファイルでshared/version.tsを参照するように統一

### データベース調査
- [x] challengesテーブルのhostProfileImageを確認（6件のレコードを確認）
- [ ] hostProfileImageが空の場合の対応（ユーザーに確認を依頼中）

### Sentry状態確認
- [x] Sentryの設定状況を確認（正常に動作中）
- [x] エラー記録を確認（7件のエラー、1件のイシュー）

### マイページのキャラクター表示
- [x] マイページの実装を確認
- [x] ログイン後はユーザーのTwitterプロフィール画像が表示されるのが正しい動作
- [x] オリジナルキャラクターはログイン前の画面でのみ表示される


---

## 🏗️ Gate 1: 構造化された開発プロセスの導入 (2026-01-31)

### 背景
「5歩進んだら7歩下がる」問題の根本原因は**構造の欠落**。技術ミスではなく、機械で固定していなかったことが原因。

### 対策の核
1. **diff-check**: 危険な変更を自動検知
2. **Gate制**: PRチェックボックス必須化
3. **PR契約**: 自然言語の命令を「チェックリスト契約」に変換

### タスク

#### 1. Gate 1の詳細設計書を作成
- [x] diff-check.shの仕様を詳細化（OAuth / deploy / env / db / health を強制検知）
- [x] GitHub Actions CIの設計（diff-check job、Deploy後ヘルス照合、OAuthスモーク）
- [x] PR契約テンプレートの設計（Gate 1必須チェックリスト）
- [x] Deploy後ヘルス照合の設計（commit SHA比較）
- [x] OAuthスモークテストの設計（curl）

#### 2. 汎用的なテンプレートを作成
- [x] 他のプロジェクトにも適用できる汎用テンプレート
- [x] 命令の「4点セット」テンプレート（Why, What, NG, Done）
- [x] PRテンプレート
- [x] docs/contract.mdテンプレート

#### 3. GPTに見せるための相談文章を作成
- [x] Gate 1の設計書をGPTに見せて、フィードバックを得る
- [x] 汎用テンプレートの妥当性を確認

#### 4. 実装（次のフェーズ）
- [ ] diff-check.shの実装
- [ ] GitHub Actions CIの実装
- [ ] PR契約テンプレートの実装


---

## 🏗️ Gate 1実装 (2026-01-31)

### 背景
GPTから「設計は完璧」との評価を受け、Gate 1の実装を開始。「5歩進んだら7歩下がる」問題を根本的に解決する。

### タスク

#### 1. diff-check.shを実装
- [x] OAuth / 認証の検知
- [x] Deploy / CIの検知
- [x] Envの検知
- [x] DBの検知
- [x] Healthの検知
- [x] **Routing / Redirect / Proxyの検知**（GPTの追加提案）
- [x] 影響範囲マップをコメントに記載
- [x] 警告表示（exit 1ではなく、警告のみ）

#### 2. わざと鳴らすPRを作る
- [x] OAuth関連ファイルを変更（`server/routers/auth.ts`にコメント追加）
- [x] diff-checkが警告を表示することを確認
- [x] 「これで守られてる」を#### 3. GitHub Actions CIを実装
- [x] `.github/workflows/gate1.yml`を作成
- [x] diff-check jobを追加
- [x] Deploy後ヘルス照合 jobを追加
- [x] OAuthスモークテスト jobを追加
- [x] PRコメント機能を追加2確認）

#### 4. PR契約テンプレートを実装
- [x] `.github/pull_request_template.md`を作成
- [x] Gate 1必須チェックリストを追加
- [x] 6つの危険な変更の確認項目を追加

#### 5. テストと調整
- [ ] diff-check.shが正しく動作することを確認
- [ ] GitHub Actions CIが正しく動作することを確認
- [ ] PR契約テンプレートが正しく表示されることを確認


---

## 🎨 v6.174: 性別統計表示機能の段階的実装（Gate 1準拠）

### 背景
v6.172で性別統計表示機能を実装した際、サムネイル画像とログイン機能が壊れた。
Gate 1のプロセスに従って、段階的に実装し、各レイヤーでテストを行う。

### 命令の「4点セット」

#### 1. 目的（Why）
- ユーザーから「チャレンジ参加者の男女の区別がつかない」という要望が何度もあった
- ホーム画面のチャレンジカードで、参加者の性別統計を表示したい

#### 2. やること（What）
- データベースクエリで性別統計を集計するAPI関数を実装
- ホーム画面のチャレンジカードに性別統計を表示

#### 3. やってはいけないこと（NG）
- サムネイル画像の表示を壊さない
- ログイン機能を壊さない
- 既存のチャレンジカードのレイアウトを大きく変更しない

#### 4. Done条件（チェック可能）
- [ ] APIが性別統計を返す（テスト済み）
- [ ] ホーム画面のチャレンジカードに性別統計が表示される
- [ ] サムネイル画像が正しく表示される
- [ ] ログイン機能が正しく動作する

### タスク

#### 1. データベース層
- [ ] 性別統計を集計するSQLクエリを実装
- [ ] SQLクエリをテスト実行して結果を確認
- [ ] commit

#### 2. API層
- [ ] `challenge-db.ts`に`getAllEventsWithGenderStats()`関数を実装
- [ ] `events.ts`の`listPaginated`プロシージャから呼び出す
- [ ] APIレスポンスをテスト（curl or Postman）
- [ ] commit

#### 3. UI層
- [ ] `ColorfulChallengeCard`に性別統計を表示
- [ ] サムネイル画像が正しく表示されることを確認
- [ ] commit

#### 4. 統合テスト
- [ ] ホーム画面でサムネイル・性別統計が両方表示されることを確認
- [ ] ログイン機能が正しく動作することを確認
- [ ] diff-check.shを実行して警告を確認
- [ ] commit

#### 5. チェックポイント作成
- [ ] v6.174のチェックポイントを作成
- [ ] GitHubにpush


---

## 📦 こまめなバージョン管理の汎用テンプレート作成

### 背景
v6.172の失敗から、こまめなバージョン管理の重要性が明らかになった。
各バージョンが1つの小さな変更のみを含むことで、問題の特定とロールバックが容易になる。

### タスク

#### 1. こまめなバージョン管理の詳細設計書を作成
- [x] こまめなバージョン管理の原則を文書化
- [x] バージョン番号の付け方を定義
- [x] 各バージョンで実施すべきチェックリストを作成
- [x] Gate 1との統合方法を設計

#### 2. 汎用的なテンプレートを作成
- [x] Gate 1 + こまめなバージョン管理の統合テンプレートを作成
- [x] 他のプロジェクトにも適用可能な形式

#### 3. GPTに見せるための相談文章を作成
- [x] こまめなバージョン管理の設計書をGPTに見せて、フィードバックを得る
- [x] 汎用テンプレートの妥当性を確認

---

## 🎉 GPTフィードバック反映: Build/Toolchainパターン追加 (2026-01-31)

### 背景
GPTから「設計は完璧」との評価を受け、1点だけ追加推奨がありました：
**Build / Bundler / Toolchain** パターンの追加（build-info問題対策）

### タスク

#### 1. diff-check.shにBuild/Toolchainパターンを追加
- [x] touch_build変数を追加
- [x] Build/Toolchainの検知ロジックを追加（esbuild, webpack, vite, next.config, tsconfig, package.json, pnpm-lock.yaml, yarn.lock, package-lock.json）
- [x] sensitive判定にtouch_buildを追加
- [x] 警告メッセージに「Build / Bundler / Toolchain に変更があります」を追加

#### 2. ドキュメントの更新
- [x] docs/gate1-design.mdにBuild/Toolchainセクションを追加
- [x] docs/TEMPLATE-gate1-with-version-management.mdにBuild/Toolchainパターンを追加
- [x] docs/gpt-consultation-version-management.mdにBuild/Toolchainパターンを追加

#### 3. チェックポイント作成
- [x] v6.XXXのチェックポイントを作成
- [ ] GitHubにプッシュ

### GPTの評価

> **あなたの設計（Gate 1 + こまめなバージョン管理）は、「5歩進んだら7歩下がる」問題を解決するのに"十分かつ実戦的"です。しかも、AI時代・個人〜小規模開発における最適解にかなり近い。**

### 次のステップ

1. **diff-check を"1回わざと鳴らすPR"を作る**（OAuth or build config に軽く触る）
2. それが通れば、Gate 1は"完成"
3. 次は Gate 2（主要フロー保証）に進んでOK

---

## 🎯 Gate 1完成と性別統計表示機能の再実装 (2026-01-31)

### Phase 1: diff-checkをわざと鳴らすPRを作成

#### 目的
Gate 1が正しく動作することを確認する。

#### タスク
- [x] OAuth関連ファイルにコメントを追加（server/routers/auth.ts）
- [x] diff-checkを実行して警告が表示されることを確認
- [x] 警告メッセージが正しく表示されることを確認
- [x] Gate 1は正しく動作していることを確認

---

### Phase 2: 性別統計表示機能の再実装（v6.174～v6.178）

#### 背景
v6.172で性別統計表示機能を実装した際、サムネイル画像とログイン機能が壊れた。
Gate 1 + こまめなバージョン管理のワークフローに従って、段階的に再実装する。

#### v6.174: データベース層
- [ ] 性別統計を集計するSQLクエリを実装
- [ ] SQLクエリをテスト実行して結果を確認
- [ ] commit
- [ ] バージョン番号を更新（shared/version.ts）
- [ ] checkpoint
- [ ] diff-check実行

#### v6.175: API層（challenge-db.ts）
- [ ] `getAllEventsWithGenderStats()`関数を実装
- [ ] APIレスポンスをテスト（curl or Postman）
- [ ] commit
- [ ] バージョン番号を更新
- [ ] checkpoint
- [ ] diff-check実行

#### v6.176: API層（events.ts統合）
- [ ] `listPaginated`プロシージャを`getAllEventsWithGenderStats()`に変更
- [ ] フロントエンドからAPIを呼び出して結果を確認
- [ ] commit
- [ ] バージョン番号を更新
- [ ] checkpoint
- [ ] diff-check実行

#### v6.177: UI層（GenderStatsコンポーネント統合）
- [ ] `ColorfulChallengeCard`に性別統計を表示
- [ ] サムネイル画像が正しく表示されることを確認
- [ ] commit
- [ ] バージョン番号を更新
- [ ] checkpoint
- [ ] diff-check実行

#### v6.178: 統合テスト完了
- [ ] ホーム画面でサムネイル・性別統計が両方表示されることを確認
- [ ] ログイン機能が正しく動作することを確認
- [ ] commit
- [ ] バージョン番号を更新
- [ ] checkpoint
- [ ] diff-check実行

---

### Phase 3: Gate 2の設計

#### 目的
主要フロー保証（E2Eテスト）、Visual Regression Test、パフォーマンステストなど、次のレベルの品質保証を検討する。

#### タスク
- [ ] Gate 2の目的を定義
- [ ] E2Eテストの範囲を定義
- [ ] Visual Regression Testの範囲を定義
- [ ] パフォーマンステストの範囲を定義
- [ ] Gate 2の実装計画を作成
- [ ] docs/gate2-design.mdを作成
