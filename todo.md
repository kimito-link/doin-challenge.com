# Project TODO

## v6.68: 無限スクロール、画像遅延読み込み、オフライン対応の実装

### Phase 1: 無限スクロールの実装（バックエンドAPI修正）
- [x] 通知APIに`cursor`と`limit`パラメータを追加
- [x] 通知DBクエリを修正（cursor対応）
- [x] メッセージAPIに`cursor`と`limit`パラメータを追加
- [x] メッセージDBクエリを修正（cursor対応）

### Phase 2: 無限スクロールの実装（フロントエンド修正）
- [x] 通知画面を`useInfiniteQuery`に変更
- [x] 通知画面に`onEndReached`を実装
- [x] メッセージ一覧画面を`useInfiniteQuery`に変更
- [x] メッセージ一覧画面に`onEndReached`を実装

### Phase 3: 画像の遅延読み込み実装
- [x] イベント一覧の画像に`placeholder`を追加 - スキップ（expo-imageがデフォルトで対応）
- [x] プロフィール画面の画像に`placeholder`を追加 - スキップ（expo-imageがデフォルトで対応）
- [x] ランキング画面の画像に`placeholder`を追加 - スキップ（expo-imageがデフォルトで### Phase 4: オフライン対応の強化
- [x] `@tanstack/react-query-persist-client`をインストール
- [x] `AsyncStoragePersister`を設定
- [x] `PersistQueryClientProvider`を統合## Phase 5: チェックポイント保存とデプロイ
- [ ] チェックポイント保存
- [ ] GitHubへのpush
