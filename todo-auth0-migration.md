# Auth0 移行タスク

## 目標
既存のTwitter OAuth2をAuth0に完全に置き換えて、ログイン機能を強化する。

## フェーズ1: Auth0設定と環境変数

- [ ] Auth0アカウントを作成
- [ ] Auth0 Applicationを作成（Native）
- [ ] Twitter Social Connectionを設定
- [ ] 環境変数を追加（AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET）
- [ ] Callback URLとLogout URLを設定

## フェーズ2: パッケージインストール

- [ ] `react-native-auth0`をインストール
- [ ] `express-oauth2-jwt-bearer`をインストール
- [ ] `app.config.ts`にAuth0設定を追加

## フェーズ3: フロントエンド実装

- [ ] `lib/auth0.ts`を作成してAuth0クライアントを初期化
- [ ] `hooks/use-auth.ts`をAuth0対応に書き換え
- [ ] ログイン画面のボタンをAuth0に置き換え
- [ ] ログアウト処理をAuth0に置き換え
- [ ] トークン保存を`expo-secure-store`に変更

## フェーズ4: バックエンド実装

- [ ] `server/auth0-middleware.ts`を作成してトークン検証
- [ ] `server/_core/oauth.ts`をAuth0対応に書き換え
- [ ] `server/routers/auth.ts`をAuth0対応に書き換え
- [ ] Auth0のユーザー情報を`users`テーブルに保存

## フェーズ5: 既存コード削除

- [ ] `server/twitter-oauth2.ts`を削除
- [ ] `server/twitter-routes.ts`を削除
- [ ] 不要なTwitter OAuth2関連のコードを削除

## フェーズ6: データベースマイグレーション

- [ ] `users`テーブルに`auth0_sub`カラムを追加
- [ ] 既存ユーザーのマイグレーションスクリプトを作成
- [ ] マイグレーションを実行

## フェーズ7: テスト

- [ ] ログインフローをテスト
- [ ] ログアウトフローをテスト
- [ ] トークン更新をテスト
- [ ] エラーハンドリングをテスト
- [ ] 既存ユーザーのログインをテスト

## フェーズ8: チェックポイント

- [ ] PROGRESS.mdを更新
- [ ] チェックポイントを保存
- [ ] GitHubにプッシュ

## 注意事項

- **既存ユーザーのデータを保持**: マイグレーション時に既存ユーザーのデータを失わないように注意
- **テストを徹底**: ログイン機能は命なので、各フェーズで徹底的にテスト
- **ロールバック計画**: 問題が発生した場合は、すぐに既存のTwitter OAuth2に戻せるようにする
