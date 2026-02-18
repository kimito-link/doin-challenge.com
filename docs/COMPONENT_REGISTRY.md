# コンポーネントレジストリ

**このファイルは、プロジェクト内の全コンポーネントを管理するためのレジストリです。**

新しいコンポーネントを作成する前に、このファイルを確認して既存のコンポーネントを再利用できないか検討してください。

---

## 1. 認証関連コンポーネント

### 1.1 ログイン

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| LoginModal | `components/common/LoginModal.tsx` | ログインモーダル（統一UI） | `visible: boolean`, `onClose: () => void` |
| LoginPromptModal | `components/organisms/login-prompt-modal.tsx` | ログインプロンプト | `visible: boolean`, `onClose: () => void`, `message?: string` |
| LoginLoadingScreen | `components/organisms/login-loading-screen.tsx` | ログイン中の読み込み画面 | なし |
| LoginErrorMessage | `components/molecules/login-error-message.tsx` | ログインエラーメッセージ | `error: string` |
| LoginSuccessModal | `components/molecules/login-success-modal.tsx` | ログイン成功モーダル | `visible: boolean`, `onClose: () => void` |

### 1.2 Auth0認証フロー

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| RedirectingScreen | `components/auth-ux/redirecting-screen.tsx` | Auth0へのリダイレクト中画面 | なし |
| WaitingReturnScreen | `components/auth-ux/waiting-return-screen.tsx` | 認証完了後の待機画面 | なし |
| SuccessScreen | `components/molecules/auth-ux/SuccessScreen.tsx` | 認証成功画面 | なし |
| ErrorScreen | `components/molecules/auth-ux/ErrorScreen.tsx` | 認証エラー画面 | `error: string` |
| CancelScreen | `components/molecules/auth-ux/CancelScreen.tsx` | 認証キャンセル画面 | なし |

---

## 2. UI部品（Atoms）

### 2.1 ボタン

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| Button | `components/atoms/button.tsx` | 基本ボタン | `title: string`, `onPress: () => void`, `variant?: 'primary' \| 'secondary'` |
| LoadingButton | `components/atoms/loading-button.tsx` | ローディング付きボタン | `title: string`, `onPress: () => void`, `loading: boolean` |
| FloatingActionButton | `components/atoms/floating-action-button.tsx` | フローティングアクションボタン | `icon: string`, `onPress: () => void` |
| HoverableButton | `components/atoms/hoverable-button.tsx` | ホバー可能なボタン | `title: string`, `onPress: () => void` |

### 2.2 入力

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| Input | `components/atoms/input.tsx` | 基本入力フィールド | `value: string`, `onChangeText: (text: string) => void`, `placeholder?: string` |
| Text | `components/atoms/text.tsx` | テキスト表示 | `children: ReactNode`, `variant?: 'title' \| 'body' \| 'caption'` |

### 2.3 表示

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| Badge | `components/atoms/badge.tsx` | バッジ表示 | `text: string`, `variant?: 'primary' \| 'success' \| 'warning' \| 'error'` |
| Countdown | `components/atoms/countdown.tsx` | カウントダウン表示 | `targetDate: Date` |
| SkeletonLoader | `components/atoms/skeleton-loader.tsx` | スケルトンローダー | `width: number`, `height: number` |
| Toast | `components/atoms/toast.tsx` | トースト通知 | `message: string`, `type?: 'success' \| 'error' \| 'info'` |

### 2.4 キャラクター

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| BlinkingCharacter | `components/atoms/blinking-character.tsx` | まばたきするキャラクター | `character: 'rinku' \| 'konta' \| 'tanune'` |
| CharacterLoadingIndicator | `components/atoms/character-loading-indicator.tsx` | キャラクターローディング | `character?: 'rinku' \| 'konta' \| 'tanune'` |

---

## 3. 分子コンポーネント（Molecules）

### 3.1 カード

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| Card | `components/molecules/card.tsx` | 基本カード | `children: ReactNode`, `onPress?: () => void` |
| HoverableCard | `components/molecules/hoverable-card.tsx` | ホバー可能なカード | `children: ReactNode`, `onPress?: () => void` |
| PressableCard | `components/molecules/pressable-card.tsx` | プレス可能なカード | `children: ReactNode`, `onPress: () => void` |
| ColorfulChallengeCard | `components/molecules/colorful-challenge-card.tsx` | カラフルなチャレンジカード | `challenge: Challenge`, `onPress: () => void` |
| MemoizedChallengeCard | `components/molecules/memoized-challenge-card.tsx` | メモ化されたチャレンジカード | `challenge: Challenge`, `onPress: () => void` |

### 3.2 モーダル

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| ConfirmModal | `components/molecules/confirm-modal.tsx` | 確認モーダル | `visible: boolean`, `title: string`, `message: string`, `onConfirm: () => void`, `onCancel: () => void` |
| WelcomeModal | `components/molecules/welcome-modal.tsx` | ウェルカムモーダル | `visible: boolean`, `onClose: () => void` |
| EncouragementModal | `components/molecules/encouragement-modal.tsx` | 励ましモーダル | `visible: boolean`, `onClose: () => void` |
| SharePromptModal | `components/molecules/share-prompt-modal.tsx` | シェアプロンプトモーダル | `visible: boolean`, `onClose: () => void`, `onShare: () => void` |
| LogoutConfirmModal | `components/molecules/logout-confirm-modal.tsx` | ログアウト確認モーダル | `visible: boolean`, `onConfirm: () => void`, `onCancel: () => void` |

### 3.3 画像

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| LazyImage | `components/molecules/lazy-image.tsx` | 遅延読み込み画像 | `source: ImageSource`, `style?: StyleProp<ImageStyle>` |
| OptimizedImage | `components/molecules/optimized-image.tsx` | 最適化された画像 | `source: ImageSource`, `width: number`, `height: number` |
| ProgressiveImage | `components/molecules/progressive-image.tsx` | プログレッシブ画像 | `source: ImageSource`, `placeholder: ImageSource` |

### 3.4 リスト

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| AnimatedListItem | `components/molecules/animated-list-item.tsx` | アニメーション付きリストアイテム | `children: ReactNode`, `index: number` |
| HoverableListItem | `components/molecules/hoverable-list-item.tsx` | ホバー可能なリストアイテム | `children: ReactNode`, `onPress: () => void` |
| NotificationItemCard | `components/molecules/notification-item-card.tsx` | 通知アイテムカード | `notification: Notification`, `onPress: () => void` |

### 3.5 その他

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| DatePicker | `components/molecules/date-picker.tsx` | 日付ピッカー | `value: Date`, `onChange: (date: Date) => void` |
| NumberStepper | `components/molecules/number-stepper.tsx` | 数値ステッパー | `value: number`, `onChange: (value: number) => void`, `min?: number`, `max?: number` |
| FilterTabs | `components/molecules/filter-tabs.tsx` | フィルタータブ | `tabs: string[]`, `activeTab: string`, `onTabChange: (tab: string) => void` |
| ExportButton | `components/molecules/export-button.tsx` | エクスポートボタン | `onExport: () => void` |
| ShareButton | `components/molecules/share-button.tsx` | シェアボタン | `onShare: () => void` |
| ReminderButton | `components/molecules/reminder-button.tsx` | リマインダーボタン | `onSetReminder: () => void` |

---

## 4. 有機体コンポーネント（Organisms）

### 4.1 ヘッダー・ナビゲーション

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| AppHeader | `components/organisms/app-header.tsx` | アプリヘッダー | `title: string`, `showBackButton?: boolean`, `rightAction?: ReactNode` |
| GlobalMenu | `components/organisms/global-menu.tsx` | グローバルメニュー | `visible: boolean`, `onClose: () => void` |
| AccountSwitcher | `components/organisms/account-switcher.tsx` | アカウント切り替え | `visible: boolean`, `onClose: () => void` |

### 4.2 プロフィール

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| UserProfileHeader | `components/organisms/user-profile-header.tsx` | ユーザープロフィールヘッダー | `user: User` |
| FanProfileModal | `components/organisms/fan-profile-modal.tsx` | ファンプロフィールモーダル | `visible: boolean`, `fan: User`, `onClose: () => void` |
| HostProfileModal | `components/organisms/host-profile-modal.tsx` | ホストプロフィールモーダル | `visible: boolean`, `host: User`, `onClose: () => void` |

### 4.3 ランキング

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| ParticipantRanking | `components/organisms/participant-ranking/ParticipantRanking.tsx` | 参加者ランキング | `participants: Participant[]` |
| TopThreeRanking | `components/organisms/participant-ranking/TopThreeRanking.tsx` | トップ3ランキング | `participants: Participant[]` |
| RankItem | `components/organisms/participant-ranking/RankItem.tsx` | ランクアイテム | `participant: Participant`, `rank: number` |
| RankBadge | `components/organisms/participant-ranking/RankBadge.tsx` | ランクバッジ | `rank: number` |

### 4.4 日本地図

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| JapanHeatmap | `components/organisms/japan-heatmap/JapanHeatmap.tsx` | 日本ヒートマップ | `data: PrefectureData[]` |
| JapanRegionBlocks | `components/organisms/japan-region-blocks.tsx` | 日本地域ブロック | `data: RegionData[]` |
| HeatmapLegend | `components/organisms/japan-heatmap/HeatmapLegend.tsx` | ヒートマップ凡例 | `min: number`, `max: number` |
| RegionCard | `components/organisms/japan-heatmap/RegionCard.tsx` | 地域カード | `region: Region`, `count: number` |

### 4.5 スケルトン・エラー

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| EventDetailSkeleton | `components/organisms/event-detail-skeleton.tsx` | イベント詳細スケルトン | なし |
| MypageSkeleton | `components/organisms/mypage-skeleton.tsx` | マイページスケルトン | なし |
| ErrorDialog | `components/organisms/error-dialog.tsx` | エラーダイアログ | `visible: boolean`, `error: string`, `onClose: () => void` |
| ErrorMessage | `components/organisms/error-message.tsx` | エラーメッセージ | `error: string` |

### 4.6 オンボーディング・チュートリアル

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| OnboardingSteps | `components/organisms/onboarding-steps.tsx` | オンボーディングステップ | `currentStep: number`, `totalSteps: number` |
| TutorialOverlay | `components/organisms/tutorial-overlay/TutorialOverlay.tsx` | チュートリアルオーバーレイ | `visible: boolean`, `step: number`, `onNext: () => void`, `onSkip: () => void` |
| ExperienceOverlay | `components/organisms/experience-overlay/ExperienceOverlay.tsx` | 経験値オーバーレイ | `visible: boolean`, `experience: number`, `onClose: () => void` |

### 4.7 その他

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| ScreenContainer | `components/organisms/screen-container.tsx` | 画面コンテナ | `children: ReactNode`, `edges?: Edge[]` |
| OfflineBanner | `components/organisms/offline-banner.tsx` | オフラインバナー | なし |
| NetworkToast | `components/organisms/network-toast.tsx` | ネットワークトースト | なし |
| NotificationSettings | `components/organisms/notification-settings.tsx` | 通知設定 | `settings: NotificationSettings`, `onChange: (settings: NotificationSettings) => void` |
| TicketTransferSection | `components/organisms/ticket-transfer-section/TicketTransferSection.tsx` | チケット譲渡セクション | `eventId: string` |
| GrowthTrajectoryChart | `components/organisms/growth-trajectory-chart.tsx` | 成長軌跡チャート | `data: GrowthData[]` |

---

## 5. UI部品（UI）

### 5.1 フォーム

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| Button | `components/ui/button.tsx` | UIボタン | `title: string`, `onPress: () => void`, `variant?: 'primary' \| 'secondary'` |
| Input | `components/ui/input.tsx` | UI入力フィールド | `value: string`, `onChangeText: (text: string) => void` |
| Checkbox | `components/ui/checkbox.tsx` | チェックボックス | `checked: boolean`, `onChange: (checked: boolean) => void`, `label: string` |
| GenderSelector | `components/ui/gender-selector.tsx` | 性別セレクター | `value: string`, `onChange: (value: string) => void` |
| PrefectureSelector | `components/ui/prefecture-selector.tsx` | 都道府県セレクター | `value: string`, `onChange: (value: string) => void` |

### 5.2 レイアウト

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| Card | `components/ui/card.tsx` | UIカード | `children: ReactNode` |
| Section | `components/ui/section.tsx` | セクション | `title: string`, `children: ReactNode` |
| List | `components/ui/list.tsx` | リスト | `items: any[]`, `renderItem: (item: any) => ReactNode` |
| Modal | `components/ui/modal.tsx` | UIモーダル | `visible: boolean`, `onClose: () => void`, `children: ReactNode` |
| KeyboardAvoidingContainer | `components/ui/keyboard-avoiding-container.tsx` | キーボード回避コンテナ | `children: ReactNode` |

### 5.3 状態表示

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| EmptyState | `components/ui/empty-state.tsx` | 空状態 | `message: string`, `icon?: string` |
| ErrorState | `components/ui/error-state.tsx` | エラー状態 | `error: string`, `onRetry?: () => void` |
| LoadingState | `components/ui/loading-state.tsx` | ローディング状態 | `message?: string` |
| ScreenLoadingState | `components/ui/screen-loading-state.tsx` | 画面ローディング状態 | `message?: string` |
| ScreenErrorState | `components/ui/screen-error-state.tsx` | 画面エラー状態 | `error: string`, `onRetry?: () => void` |

### 5.4 その他

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| EmojiIcon | `components/ui/emoji-icon.tsx` | 絵文字アイコン | `emoji: string`, `size?: number` |
| ContributionDisplay | `components/ui/contribution-display.tsx` | 貢献度表示 | `contribution: number` |
| CharacterDetailModal | `components/ui/character-detail-modal.tsx` | キャラクター詳細モーダル | `visible: boolean`, `character: Character`, `onClose: () => void` |
| CharacterIconRow | `components/ui/character-icon-row.tsx` | キャラクターアイコン行 | `characters: Character[]` |
| InlineErrorBar | `components/ui/inline-error-bar.tsx` | インラインエラーバー | `error: string` |
| RetryButton | `components/ui/retry-button.tsx` | リトライボタン | `onRetry: () => void` |
| PressableFeedback | `components/ui/pressable-feedback.tsx` | プレスフィードバック | `children: ReactNode`, `onPress: () => void` |
| Touchable | `components/ui/touchable.tsx` | タッチ可能 | `children: ReactNode`, `onPress: () => void` |

---

## 6. 共通コンポーネント（Common）

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| LoginModal | `components/common/LoginModal.tsx` | ログインモーダル（統一UI） | `visible: boolean`, `onClose: () => void` |
| WelcomeMessage | `components/common/WelcomeMessage.tsx` | ウェルカムメッセージ | `user: User` |

---

## 7. エラーバウンダリ

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| ErrorBoundary | `components/error-boundary.tsx` | エラーバウンダリ | `children: ReactNode`, `fallback?: ReactNode` |
| MapErrorBoundary | `components/ui/map-error-boundary.tsx` | 地図エラーバウンダリ | `children: ReactNode` |
| MapErrorFallback | `components/ui/map-error-fallback.tsx` | 地図エラーフォールバック | `error: Error`, `resetError: () => void` |

---

## 8. 特殊コンポーネント

| コンポーネント | パス | 用途 | Props |
|--------------|------|------|-------|
| InstallPrompt | `components/install-prompt.tsx` | インストールプロンプト | `visible: boolean`, `onClose: () => void` |

---

## 9. 使用方法

### 9.1 新しいコンポーネントを作成する前に

1. **このファイルを確認**: 既存のコンポーネントで代用できないか確認
2. **`match` ツールで検索**: `components/` ディレクトリ全体を検索
3. **再利用を検討**: 既存のコンポーネントを再利用できる場合は、必ず再利用

### 9.2 新しいコンポーネントを作成した場合

1. **このファイルに追加**: コンポーネントの情報をこのファイルに追加
2. **カテゴリを選択**: 適切なカテゴリに配置
3. **Props を明記**: コンポーネントの Props を明記

---

## 10. コンポーネントの命名規則

- **Atoms**: 最小単位のUI要素（ボタン、入力フィールドなど）
- **Molecules**: 複数のAtomsを組み合わせたコンポーネント（カード、モーダルなど）
- **Organisms**: 複雑なUIセクション（ヘッダー、ランキング、地図など）
- **UI**: 汎用的なUI部品（フォーム、レイアウト、状態表示など）
- **Common**: プロジェクト全体で共通して使用するコンポーネント

---

**最終更新**: 2026-02-17
