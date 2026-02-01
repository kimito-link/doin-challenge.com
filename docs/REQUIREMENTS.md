# 要件定義: Twitter OAuthでprofileImageを保存

## 目的

Twitter OAuth認証後、ユーザーのプロフィール画像URLをusersテーブルに保存し、チャレンジ作成時に使用できるようにする。

## 背景

現在、チャレンジカードのサムネイル（hostProfileImage）が表示されない問題が発生している。原因は、Twitter OAuth後にusersテーブルのprofileImageフィールドが保存されていないため。

## 要件

### 機能要件

1. **Twitter OAuth認証後、usersテーブルにprofileImageを保存**
   - Twitter APIから取得したprofile_image_urlをusersテーブルに保存
   - 既存ユーザーの場合は、profileImageを更新

2. **チャレンジ作成時、usersテーブルからprofileImageを取得**
   - useAuthフックが返すuserオブジェクトにprofileImageが含まれる
   - チャレンジ作成時、hostProfileImageとしてprofileImageを使用

3. **プレビュー環境と本番環境で同じ動作**
   - プレビュー環境でもチャレンジカードのサムネイルが表示される

### 非機能要件

1. **パフォーマンス**: Twitter OAuth処理に追加の遅延が発生しない
2. **セキュリティ**: profileImageのURLは公開情報なので、特別な保護は不要
3. **テスト**: ユニットテストで動作を保証

## 成功基準

- [ ] Twitter OAuth後、usersテーブルのprofileImageが保存される
- [ ] チャレンジ作成時、hostProfileImageが正しく設定される
- [ ] プレビュー環境でチャレンジカードのサムネイルが表示される
- [ ] ユニットテストがすべてパス

## 関連ファイル

- `server/twitter-routes.ts`: Twitter OAuthコールバック処理
- `server/db/user-db.ts`: usersテーブルへの保存処理
- `features/create/hooks/use-create-challenge.ts`: チャレンジ作成処理
- `lib/_core/auth.ts`: Auth.User型定義
