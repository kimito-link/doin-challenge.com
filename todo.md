# Project TODO

## v6.70: オンボード画面のバージョン表示、地図の表示改善、応援メッセージと貢献度ランキングのデザイン統一

### Phase 1: オンボード画面にバージョン表示を追加
- [x] オンボード画面のコンポーネントを確認
- [x] バージョン情報を取得する関数を実装
- [x] オンボード画面にバージョン表示を追加

### Phase 2: 地図の表示を全画面サイズで綺麗に調整
- [x] 都道府県別参加者の地図コンポーネントを確認
- [x] 地図のレイアウトを修正（画面サイズに応じて調整）
- [x] 地図のアスペクト比を調整
- [x] 地図の余白を削除

### Phase 3: 応援メッセージと貢献度ランキングのデザイン統一 + サイト全体のトンマナ統一
- [x] 応援メッセージ画面の現在の実装を確認
- [x] 貢献度ランキング画面の現在の実装を確認
- [x] 性別選択コンポーネントを黒ベースのカードデザインに統一
- [x] サイト全体のデザインパターンを調査
- [x] デザインシステム統一ガイドを作成（docs/design-system-unification.md）
- [x] ContributionRankingのborderRadiusを8→12に統一
- [x] RegionMapを黒ベースのカードデザインに統一
- [x] CompanionListを黒ベースのカードデザインに統一

### Phase 4: マイページと主催者カードのデザイン統一
- [x] マイページのTwitterカードコンポーネントを特定（ProfileCard.tsx）
- [x] 主催者カードコンポーネントを特定（EventHeader.tsx）
- [x] マイページのTwitterカードを黒ベースのデザインに統一
- [x] 主催者カードを黒ベースのデザインに統一

### Phase 5: 招待リンク生成の問題修正
- [x] 招待リンク生成コンポーネントを特定（app/invite/[id].tsx）
- [x] 招待リンク生成のAPI呼び出しを確認（invitations.create）
- [x] 招待リンクのドメインを修正（douin-challenge.app → doin-challenge.com）
- [x] QRコードの生成ロジックを確認（現在は静的アイコン表示）

### Phase 6: バージョン情報とコピーライトのコンポーネント化
- [x] 現在のバージョン情報表示箇所を特定（features/settings/components/SettingsSections.tsx）
- [x] バージョン情報とコピーライトの共通コンポーネントを作成（components/atoms/app-footer.tsx）
- [x] コピーライトを「© 動員ちゃれんじ」に変更（年は入れない）
- [x] 設定画面を共通コンポーネントに置き換え

### Phase 7: TypeScriptエラーを修正
- [x] tests/auth.logout.test.tsのgenderフィールドを追加

### Phase 8: ホーム画面のスワイプ挙動を調査・修正
- [x] ホーム画面のスワイプ挙動を調査
- [x] ランキング画面（チャレンジページ）の正常な挙動を参考にする
- [x] スワイプ時のコンテンツズレを修正（ScrollViewをViewに変更）
- [x] 全画面で同じ挙動のトンマナに統一

### Phase 9: 数字入力欄に入力補助を追加
- [x] 数値入力フィールドを全て検索
- [x] 前売り券・当日券の入力欄にinputMode="numeric"を追加（TicketInfoSection.tsx, event/edit/[id].tsx）
- [x] Gender型の定義を簡素化してAPIと整合性を保つ

### Phase 10: マイページで性別を設定できるようにする
- [x] usersテーブルにgenderフィールドを追加（drizzle/schema/users.ts）
- [x] マイページの現在の実装を確認
- [x] 性別選択UIコンポーネントを作成（GenderSection.tsx）
- [x] マイページに性別選択UIを追加（AuthenticatedContent.tsx）
- [x] 性別データを保存するAPIを実装（profiles.updateGender）
- [x] クライアント側のAuth.User型にgenderフィールドを追加
- [x] 楽観更新とinvalidateを実装（GPTの推奨実装に従う）

### Phase 10: 招待リンクのQRコード生成を実装
- [x] react-native-qrcode-svgライブラリをインストール
- [x] 招待画面のQRコード表示部分を修正
- [x] 実際のQRコードを生成する機能を実装（ロゴ付き）

### Phase 11: 主催者の性別による色分けを実装
- [x] ホーム画面のチャレンジカードコンポーネントを特定（features/home/components/ChallengeCard.tsx）
- [x] 主催者の性別データを取得する方法を確認（マイページで設定）
- [x] Challenge型にhostGenderフィールドを追加
- [x] challengesテーブルにhostGenderカラムを追加（マイグレーション実行済み）
- [x] getAllEvents関数でusersテーブルとLEFT JOINしてhostGenderを取得
- [x] 主催者の性別に応じた枠線の色分けを実装（左側に2pxの色付きボーダー）

### Phase 6: チェックポイント保存とデプロイ
- [x] チェックポイント保存（v6.82）
- [x] GitHubへのpush

### Phase 12: チャレンジ作成時にhostGenderを保存
- [x] チャレンジ作成APIでhostGenderを取得・保存する処理を追加
- [x] createEvent関数でhostTwitterIdからusersテーブルを検索してhostUserIdとhostGenderを取得
- [x] INSERT文にhostGenderカラムを追加

### Phase 13: 既存チャレンジのhostGenderを同期
- [x] 既存チャレンジのhostGenderを一括同期するバッチ処理を実装（syncChallengeHostGender関数）
- [x] events.syncHostGender APIエンドポイントを追加
- [x] バッチ処理を実行して既存データを同期（対象データなし）

### Phase 14: Web固めフェーズ - 設計資料作成
- [x] 遷移図1枚を作成（作成→表示→編集の遷移）
- [x] りんく吹き出し文言を作成（legacy向け説明）
- [x] SUPPORTED_PURPOSES + フォールバック最小TSを作成
- [x] docs/web-solidification-phase.mdに全てをまとめた

### Phase 15: Web固めフェーズ - purpose実装（B: 目標作成フォーム）
- [x] データベースにpurposeカラムを追加（mysqlEnumでliveのみサポート）
- [x] normalizePurposeとisLegacyPurpose関数を追加（event-categories.ts）
- [x] チャレンジ作成時にpurposeを保存する実装（createEvent関数）
- [x] 既存データのpurposeをliveに更新（バッチ処理実行済み、0件）

### Phase 16: Web固めフェーズ - マイページのジャンル選択UI実装
- [x] usersテーブルにgenreフィールドを追加（マイグレーション実行済み）
- [x] profiles.updateGenre mutationを実装（server/routers/profiles.ts）
- [x] updateUserGenre関数を実装（server/db/user-db.ts）
- [x] Auth.User型にgenreフィールドを追加（lib/_core/auth.ts）
- [x] GenreSelectorコンポーネントを作成（components/ui/genre-selector.tsx）
- [x] GenreSectionコンポーネントを作成（features/mypage/components/sections/GenreSection.tsx）
- [x] AuthenticatedContentにGenreSectionを追加し、onGenreChangeハンドラーを実装
- [x] 楽観更新とinvalidateを実装（GenderSectionと同様）

### Phase 17: Web固めフェーズ - 応援コメントに日時を追加
- [x] 応援メッセージカードに日時表示を追加（「○分前」「○時間前」「○日前」形式）
- [x] createdAtフィールドを使用して相対時間を表示（getRelativeTime関数）
- [x] 動員の勢い・速度が可視化されるようにする

### Phase 18: Web固めフェーズ - チャレンジ詳細画面のレイアウト最適化完了
- [x] app/event/[id].tsxのレイアウトを再配置
- [x] EventBasicInfoをファーストビューに追加（タイトルの下）
- [x] ProgressSectionをその下に配置
- [x] ShareSection（参加表明CTA）をProgressSectionの下に移動
- [x] EventDescriptionを中部に追加
- [x] 応援メッセージを下部に移動
- [ ] 文言の統一（「参加者数」→「参加予定数」など）

### Phase 19: Web固めフェーズ - 参加表明フローの完了演出実装
- [x] 参加表明後の成功フィードバックを実装（アニメーション・トースト）
- [x] 進捗バーのアニメーション更新（react-native-reanimatedでスプリングアニメーション）
- [x] トースト通知コンポーネントを作成（Alert.alertの代わり）
- [x] useParticipationFormフックにトースト通知を統合
- [x] 文言の統一（「参加者数」→「参加予定数」、「達成率」→「進捗」）

### Phase 20: Web版の動作確認とデプロイ
- [ ] Expo Goで実機テストを行う
- [ ] ジャンル選択・日時表示・レイアウト最適化・参加表明演出の動作を確認
- [x] チェックポイント保存（v6.87）
- [ ] Publish

### Phase 21: 応援メッセージのパフォーマンス改善（簡易版）
- [x] バックエンドAPIにページネーション機能を追加（participations.listByEvent）
- [x] getParticipationsByEventId関数にlimit/offsetパラメータを追加
- [x] MessageSectionコンポーネントで.map()をFlatListに変更
- [x] FlatListの最適化オプションを追加（removeClippedSubviews, maxToRenderPerBatchなど）
- [x] 既存のフィルター機能を維持（全件取得のまま）

### Phase 22: プッシュ通知機能実装
- [x] 参加表明後にプッシュ通知を送信する機能を追加
- [x] 通知の内容を設計（「🎉 新しい参加者！」「○○さんが参加表明しました！現在○○人」）
- [x] 通知の送信タイミングを設計（参加表明成功時）
- [x] createNotification関数とgetUsersWithNotificationEnabled関数を使用
- [x] 通知の許可リクエストは既に実装済み（app/notifications.tsx）
### Phase 23: チェックポイント保存とデプロイ
- [x] チェックポイント保存（v6.88）
- [x] GitHubへのpush（既に同期済み）
- [ ] Publish（ユーザーがボタンをクリック）oで実機テスト
- [ ] Publish

### Phase 24: 通知設定の最適化
- [x] 通知設定のデフォルト値を設定（新規参加者の通知をオンにする）
- [x] 初回起動時の通知設定オンボーディングを追加
- [x] 通知許可のリクエストUIを改善（NotificationOnboardingModalコンポーネント）
- [x] チェックポイント保存（v6.89）
- [x] GitHubへのpush（既に同期済み）

### Phase 25: 通知設定画面の改善
- [x] 各通知タイプの説明を改善
  - 目標達成: 「目標人数に到達したときに通知します」
  - マイルストーン: 「進捗が25%、50%、75%に到達したときに通知します」
  - 新規参加者: 「新しい参加者が参加表明したときに通知します」
  - チャレンジ更新: 「イベント開始のリマインダーなどを通知します」
- [x] UIを改善して、ユーザーが通知の内容を理解しやすくする
- [x] チェックポイント保存（v6.90）
- [x] GitHubへのpush（既に同期済み）

### Phase 26: 通知のテスト送信機能実装
- [x] テスト通知送信APIを作成（notifications.sendTestNotification）
- [x] 通知の種類を選択できるようにする（目標達成・マイルストーン・新規参加者）
- [x] 管理画面にテスト通知送信画面を作成（app/admin/test-notifications.tsx）
- [x] テスト通知の送信結果を表示（Alert.alert）
- [x] チェックポイント保存（v6.91）
- [x] GitHubへのpush（既に同期済み）

### Phase 27: 文言統一（「生誕祭」→「動員ちゃれんじ」）
- [x] アプリ全体で「生誕祭」を検索（2箇所発見）
- [x] 「生誕祭」を「動員ちゃれんじ」に置換
  - app/edit-challenge/[id].tsx: 「例: 君斗りんくの動員ちゃれんじ2025」
  - app/event/edit/[id].tsx: 「例: 君斗りんくの動員ちゃれんじ2026」
- [x] チェックポイント保存（v6.92）
- [x] GitHubへのpush（既に同期済み）

### Phase 28: リアルタイム性の向上
- [x] Polling機構を実装（10秒間隔、画面表示中のみ）
  - [x] useIntervalフックを作成
  - [x] イベント詳細画面でのみ有効
  - [x] AppState監視でバックグラウンド時に停止
- [x] 差分更新と進捗バーのアニメーション
  - [x] Pollingによりrefetch()でデータ更新
  - [x] 進捗バーはreact-native-reanimatedでアニメーション済み
- [x] アプリ内バナー（「○○さんが参加表明！」）
  - [x] ParticipationBannerコンポーネントを作成
  - [x] 画面上部に表示
  - [x] 3秒後に自動的に消える（react-native-reanimated）
  - [x] 新しい参加者を検出するロジック
- [x] 応援メッセージのリアルタイム追加
  - [x] Pollingによりrefetch()でデータ更新
  - [x] FlatListが自動的に新しいメッセージを表示
- [x] チェックポイント保存（v6.93）
- [x] GitHubへのpush（既に同期済み）

### Phase 29: 応援メッセージに「いいね」機能を追加
- [x] バックエンドに「いいね」機能を追加
  - [x] message_likesテーブルを作成（drizzle/schema/participations.ts）
  - [x] participations.likeMessage APIを追加
  - [x] participations.unlikeMessage APIを追加
  - [x] 「いいね」数を取得するロジックを追加（getParticipationsByEventId）
  - [x] データベースマイグレーション実行
- [x] フロントエンドに「いいね」ボタンを追加
  - [x] MessageCardコンポーネントに「いいね」ボタンを追加
  - [x] MessagesSectionコンポーネントで「いいね」機能を統合
  - [x] イベント詳細画面で「いいね」機能を統合
  - [x] useEventDetailフックにlikeMessage/unlikeMessageを追加
  - [x] 「いいね」数を表示
  - [x] ログインユーザーのみ「いいね」可能
  - [x] リアルタイムで「いいね」数を更新（Pollingで自動更新）
- [x] チェックポイント保存（v6.94）
- [x] GitHubへのpush（既に同期済み）

### Phase 30: 目標達成時の演出を追加
- [x] 紙吹雪アニメーションライブラリを追加（react-native-confetti-cannon）
- [x] 目標達成検出ロジックを実装（進捗が100%に到達したとき）
- [x] 紙吹雪演出をイベント詳細画面に追加（ConfettiCannon）
- [x] Haptic feedbackで達成感を強化（Haptics.notificationAsync）
- [ ] チェックポイント保存（v6.95）
- [ ] GitHubへのpush

### Phase 31: UX改善の最優先ポイント
- [x] ホームカードの情報整理（ファーストビューの情報削減）
  - 情報を最大5要素に制限（タイトル・日時・参加予定・進捗バー・ジャンル）
  - 説明文・補足は詳細画面へ移動
  - カードの縦幅を削減
- [x] 詳細画面の参加CTA固定（参加導線を常に表示）
  - 「参加予定を表明」 CTAをスクロールしても常に見える位置に
  - FixedParticipationCTAコンポーネントを作成
- [x] FlatList標準最適化の統一（パフォーマンス改善）
  - React.memo(MessageCard)
  - renderItem を useCallback
  - keyExtractor をID固定
  - initialNumToRender / windowSize を明示
  - Androidだけ removeClippedSubviews
- [x] チェックポイント保存（v6.96）
- [x] GitHubへのpush

### Phase 32: レスポンシブデザイン、画像表示、アクセシビリティの最適化
- [x] レスポンシブデザインの最適化（3ブレークポイントに固定）
  - Mobile（～375px）、Tablet（～768px）、Desktop/Web（1024px+）
  - 最大幅を設定（横に伸びすぎないように）
  - イベント詳細画面にmaxWidthを追加
- [x] 画像表示の最適化（expo-imageに統一）
  - 既存のImageコンポーネントをexpo-imageに置き換え
  - プレースホルダを軽量化（デフォルトをsolidに変更）
  - 画像のチラつきを防止
- [x] アクセシビリティの改善（タップ領域と視認性）
  - タップ領域あ44px以上に統一（既に実装済み）
  - 性別色分けにアイコン/ラベルを追加（MessageCard、MessagesSection）
  - 主要ボタンにaccessibilityLabelを追加（FixedParticipationCTA）
- [x] チェックポイント保存（v6.97）
- [x] GitHubへのpush

### Phase 33: コントラストの最終調整とモーダルのレスポンシブ対応
- [x] コントラストの最終調整（WCAG AA基準）
  - 暗背景でのピンク/青の視認性を改善
  - WCAG AA基準（コントラスト比4.5:1以上）を満たす色に調整
  - 性別色（男性：青、女性：ピンク）のコントラストを改善
  - theme/tokens/palette.tsを更新
- [x] モーダルのレスポンシブ対応
  - 各モーダルを中央配置＋スクロール可能に最適化
  - Desktop/Tabletでの表示を改善（最大幅を600px/500pxに制限）
  - 横向き（ランドスケープ）でも崩れないように調整
  - components/ui/modal.tsxを更新
- [ ] チェックポイント保存（v6.98）
- [ ] GitHubへのpush
