# 設計書: Twitter OAuthでprofileImageを保存

## アーキテクチャ

```
Twitter OAuth → server/twitter-routes.ts → db.upsertUser → usersテーブル
                                                                ↓
                                                          profileImage保存
                                                                ↓
チャレンジ作成 → use-create-challenge.ts → user.profileImage → hostProfileImage
```

## タスク

### タスク1: Twitter OAuthコールバック処理でprofileImageを保存

**ファイル**: `server/twitter-routes.ts`

**実装内容**:
1. Twitter APIから取得したprofile_image_urlを変数に保存
2. db.upsertUserを呼び出して、usersテーブルにprofileImageを保存

**テストケース**:
- [ ] Twitter OAuth成功後、usersテーブルのprofileImageが保存される
- [ ] 既存ユーザーの場合、profileImageが更新される
- [ ] profileImageがnullの場合、エラーが発生しない

### タスク2: チャレンジ作成時にprofileImageを使用

**ファイル**: `features/create/hooks/use-create-challenge.ts`

**実装内容**:
1. useAuthフックからuserオブジェクトを取得
2. user.profileImageをhostProfileImageとして使用

**テストケース**:
- [ ] チャレンジ作成時、hostProfileImageが正しく設定される
- [ ] user.profileImageがnullの場合、デフォルト画像を使用

### タスク3: Auth.User型にprofileImageを追加

**ファイル**: `lib/_core/auth.ts`

**実装内容**:
1. Auth.User型にprofileImageフィールドを追加（既に追加済み）

**テストケース**:
- [ ] Auth.User型にprofileImageフィールドが含まれる

## テストケース

### ユニットテスト

**ファイル**: `__tests__/twitter-oauth-profile-image.test.ts`

```typescript
describe('Twitter OAuth profileImage保存', () => {
  it('Twitter OAuth成功後、usersテーブルのprofileImageが保存される', async () => {
    // テストコード
  });

  it('既存ユーザーの場合、profileImageが更新される', async () => {
    // テストコード
  });

  it('profileImageがnullの場合、エラーが発生しない', async () => {
    // テストコード
  });
});

describe('チャレンジ作成時のprofileImage使用', () => {
  it('チャレンジ作成時、hostProfileImageが正しく設定される', async () => {
    // テストコード
  });

  it('user.profileImageがnullの場合、デフォルト画像を使用', async () => {
    // テストコード
  });
});
```

## 実装順序

1. Twitter OAuthコールバック処理でprofileImageを保存（タスク1）
2. テストを作成して動作確認
3. テストに通らない場合は修正
4. PROGRESS.mdに記録してgit commit
5. チェックポイント保存
