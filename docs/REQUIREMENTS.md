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


---

## 状態遷移図（State Transition Diagrams）

このセクションでは、アプリケーションが管理する状態の遷移を明文化します。状態遷移図を明確にすることで、不正な状態遷移や到達しない状態を可視化できます。

### チャレンジ（Challenge）の状態遷移

```
upcoming（開催前）
  ↓ eventDateが現在時刻を過ぎる（自動）
active（開催中）
  ↓ eventDate + 24時間が経過（自動）
ended（終了済み）
```

**遷移条件**:
- `upcoming` → `active`: `eventDate`が現在時刻を過ぎたとき（cron jobで定期チェック）
- `active` → `ended`: `eventDate + 24時間`が経過したとき（cron jobで定期チェック）

**遷移不可**:
- `ended` → `active`: 終了したチャレンジは再開できない
- `ended` → `upcoming`: 終了したチャレンジは開催前に戻せない
- 手動での状態変更は不可（自動更新のみ）

**補足**:
- `draft`（下書き）状態は未実装（将来的に追加予定）
- 状態遷移は自動（cron jobで定期実行）
- チャレンジ削除機能は未実装（将来的に追加予定）

---

### 参加（Participation）の状態遷移

```
confirmed（参加確定）
  ↓ ユーザーが削除ボタンをクリック
deleted（削除済み）
```

**遷移条件**:
- `confirmed` → `deleted`: ユーザーが削除ボタンをクリックしたとき（`deletedAt`カラムに現在時刻を設定）

**遷移不可**:
- `deleted` → `confirmed`: 削除後の復元は不可

**補足**:
- 削除は「ソフトデリート」（`deletedAt`カラムで管理、レコードは物理削除しない）
- 削除済み参加は統計データとして保持される（チャレンジ詳細画面の「参加者数推移」に反映）
- `deletedBy`カラムで削除者（本人 or 管理者）を記録

---

### ユーザー（User）の状態遷移

```
anonymous（未ログイン）
  ↓ Twitter OAuthでログイン
authenticated（ログイン済み）
  ↓ ログアウト
anonymous（未ログイン）
```

**遷移条件**:
- `anonymous` → `authenticated`: Twitter OAuthでログイン成功したとき（`users`テーブルにレコードが作成される）
- `authenticated` → `anonymous`: ログアウトしたとき（セッションが削除される）

**遷移不可**:
- なし（ログイン・ログアウトは何度でも可能）

**補足**:
- ログアウト後も、作成したチャレンジ・参加記録は保持される
- `users.lastSignedIn`は最終ログイン日時を記録
- `users.role`フィールドで`user` / `admin`を区別（管理者権限の付与は手動）

---

### Twitter連携状態（TwitterFollowStatus）の状態遷移

```
not_following（未フォロー）
  ↓ ユーザーがTwitterでフォロー
following（フォロー中）
  ↓ ユーザーがTwitterでフォロー解除
not_following（未フォロー）
```

**遷移条件**:
- `not_following` → `following`: ユーザーがTwitterでフォローしたとき（Twitter APIで確認）
- `following` → `not_following`: ユーザーがTwitterでフォロー解除したとき（Twitter APIで確認）

**遷移不可**:
- なし（フォロー・フォロー解除は何度でも可能）

**補足**:
- フォロー状態は、ユーザーが明示的にチェックした場合のみ更新される（`lastCheckedAt`カラムで記録）
- 自動更新は行わない（Twitter APIのレート制限を考慮）
- 特定アカウント（@idolfunch）のフォロー状態を管理

---

### Twitterユーザーキャッシュ（TwitterUserCache）の状態遷移

```
valid（有効）
  ↓ expiresAtが現在時刻を過ぎる
expired（期限切れ）
  ↓ Twitter APIで再取得
valid（有効）
```

**遷移条件**:
- `valid` → `expired`: `expiresAt`が現在時刻を過ぎたとき（有効期限: 24時間）
- `expired` → `valid`: Twitter APIで再取得したとき（`cachedAt`と`expiresAt`を更新）

**遷移不可**:
- なし（キャッシュは自動更新される）

**補足**:
- キャッシュ期限切れの場合、再度Twitter APIを呼び出す
- Twitter APIのレート制限に注意（15分あたり15リクエスト）
- `twitterUsername`が一意キー（同じユーザー名のキャッシュは1つのみ）

---

### 状態遷移図の読み方

#### 記号の意味
- `→`: 遷移可能
- `↓`: 一方向の遷移（戻れない）
- `（自動）`: システムが自動で遷移
- `（手動）`: ユーザーの操作で遷移

#### 遷移条件の記載
各遷移には、以下の情報を記載します：
- **遷移条件**: どのような条件で遷移するか
- **遷移不可**: どのような遷移が不可能か
- **補足**: 遷移に関する追加情報

#### 状態遷移図の更新
状態遷移図は、仕様変更に応じて更新されます。更新履歴は以下に記録します。

---

### 状態遷移図の更新履歴

#### 2026-02-02: 初版作成
- チャレンジ、参加、ユーザー、Twitter連携状態、Twitterユーザーキャッシュの状態遷移図を作成
- 遷移条件、遷移不可、補足を明記

---

## 参考資料

### 状態遷移図について
- [状態遷移図の書き方](https://zenn.dev/articles/state-transition-diagram)
- [ステートマシンパターン](https://zenn.dev/articles/state-machine-pattern)

### このプロジェクトのドキュメント
- `docs/DESIGN.md`: データ設計（状態、関係、前提、変化する状態と変化しない状態）
- `docs/ARCHITECTURE.md`: アーキテクチャ設計
- `docs/PROGRESS.md`: 開発進捗
