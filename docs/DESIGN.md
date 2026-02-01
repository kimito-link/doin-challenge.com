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


---

## データ設計（Data-Driven Design）

このセクションでは、アプリケーションが扱うデータ構造を明確に定義します。実装前にデータ構造を整理することで、仕様変更に強く、壊れにくいシステムを構築できます。

### 1. 状態（States）

アプリケーションが管理する状態を列挙します。状態は「UIのラベル」ではなく、「アプリケーションが保証すべき前提」として定義します。

#### チャレンジ（Challenge）
- **upcoming**: 開催前（イベント日時が未来）
- **active**: 開催中・参加受付中
- **ended**: 終了済み

**補足**: `draft`（下書き）状態は現在未実装。将来的に追加する可能性あり。

#### 参加（Participation）
- **confirmed**: 参加確定
- **deleted**: 削除済み（ソフトデリート）

**補足**: 削除後も統計データとして保持される（`deletedAt`カラムで管理）。

#### ユーザー（User）
- **anonymous**: 未ログイン（Twitter OAuth未実施）
- **authenticated**: ログイン済み（Twitter OAuth完了）

**補足**: `role`フィールドで`user` / `admin`を区別。

#### Twitter連携状態（TwitterFollowStatus）
- **following**: フォロー中
- **not_following**: 未フォロー

**補足**: 特定アカウント（@idolfunch）のフォロー状態を管理。

---

### 2. 関係（Relationships）

データ間の関係性を明確にします。関係性が曖昧なまま実装すると、「このデータ、どれと紐づいてるんだっけ？」という混乱が発生します。

#### 主要な関係
```
users (1) ←→ (N) challenges
  ↓
  ユーザーは複数のチャレンジを作成可能
  チャレンジは1人のホスト（主催者）を持つ

challenges (1) ←→ (N) participations
  ↓
  チャレンジには複数の参加者
  参加者は1つのチャレンジに所属

users (1) ←→ (N) participations
  ↓
  ユーザーは複数のチャレンジに参加可能
  参加は1人のユーザーに紐づく

participations (1) ←→ (N) participationCompanions
  ↓
  参加者は複数の同伴者を登録可能
  同伴者は1つの参加に紐づく

users (1) ←→ (1) twitterUserCache
  ↓
  ユーザーはTwitter連携データを持つ（任意）
  Twitter連携データは1人のユーザーに紐づく

challenges (1) ←→ (N) challengeMembers
  ↓
  グループチャレンジは複数のメンバーを持つ
  メンバーは1つのチャレンジに所属
```

#### ER図（簡易版）
```
┌─────────┐       ┌─────────────┐       ┌────────────────┐
│ users   │1────N │ challenges  │1────N │ participations │
└─────────┘       └─────────────┘       └────────────────┘
     │                                            │
     │1                                           │1
     │                                            │
     │N                                           │N
┌──────────────────┐              ┌────────────────────────────┐
│ twitterUserCache │              │ participationCompanions    │
└──────────────────┘              └────────────────────────────┘
```

---

### 3. 前提（Assumptions）

仕様書に明記されていない、しかしシステムが依存している前提条件を列挙します。これらを明文化することで、仕様変更時の影響範囲が明確になります。

#### ユーザー・認証
- ユーザーは複数のSNSアカウントでログイン可能（現在はTwitterのみ実装）
- Twitter固有データ（フォロワー数、プロフィール画像URL、説明文）は`twitterUserCache`に保存
- 共通ユーザーデータ（表示名、メールアドレス、ロール）は`users`に保存
- `users.openId`はTwitter IDを使用（Twitter OAuth完了時に設定）
- ログアウト後も、作成したチャレンジ・参加記録は保持される

#### チャレンジ
- チャレンジの作成者（ホスト）は自分のチャレンジに参加できない（UI上で制限）
- チャレンジ削除機能は未実装（将来的に追加予定）
- チャレンジの`status`は自動更新される（`eventDate`を基準に`upcoming` / `active` / `ended`を判定）
- チャレンジの`hostProfileImage`はTwitterプロフィール画像URLを使用
- グループチャレンジ（`eventType: "group"`）の場合、`challengeMembers`テーブルにメンバーを登録

#### 参加
- ユーザーは1つのチャレンジに1回のみ参加可能（重複参加は不可）
- 参加削除は「ソフトデリート」（`deletedAt`カラムで管理、レコードは物理削除しない）
- 参加削除後も、統計データとして保持される（チャレンジ詳細画面の「参加者数推移」に反映）
- 同伴者（`participationCompanions`）は、参加者が登録した友人（Twitter連携不要）
- 同伴者の数は`participation.companionCount`に保存される

#### Twitter連携
- Twitter APIから取得したデータは`twitterUserCache`にキャッシュされる（有効期限: 24時間）
- キャッシュ期限切れの場合、再度Twitter APIを呼び出す
- Twitter APIのレート制限に注意（15分あたり15リクエスト）
- フォロー状態（`twitterFollowStatus`）は、ユーザーが明示的にチェックした場合のみ更新される

#### 統計・集計
- チャレンジの`currentValue`は、参加者数（`participations`の件数）+ 同伴者数（`companionCount`の合計）
- 削除済み参加（`deletedAt`が非null）は`currentValue`に含まれない
- 統計データ（`challengeStats`）は1時間ごとに記録される（cron jobで実行）
- AI要約（`aiSummary`）は、参加者が10人以上の場合に自動生成される

---

### 4. 変化する状態と変化しない状態

どの値が変化し、どの値が不変かを明確にします。この境界線を引くだけで、更新ロジックのバグが激減します。

#### 不変（Immutable）
- `users.id`
- `users.openId`
- `challenges.id`
- `challenges.createdAt`
- `participations.id`
- `participations.createdAt`
- `challengeMembers.id`
- `challengeMembers.createdAt`

#### 可変（Mutable）
- `users.name`
- `users.email`
- `users.lastSignedIn`
- `challenges.status`（自動更新）
- `challenges.title`
- `challenges.description`
- `challenges.currentValue`（自動計算）
- `challenges.updatedAt`
- `participations.message`
- `participations.companionCount`
- `participations.deletedAt`（ソフトデリート）
- `twitterUserCache.followersCount`
- `twitterUserCache.profileImage`
- `twitterUserCache.cachedAt`

---

### 5. 状態遷移図（State Transition Diagram）

状態がどのように遷移するかを明文化します。これにより、不正な状態遷移や到達しない状態を可視化できます。

#### チャレンジ（Challenge）
```
upcoming（開催前）
  ↓ eventDateが現在時刻を過ぎる（自動）
active（開催中）
  ↓ eventDate + 24時間が経過（自動）
ended（終了済み）
```

**補足**: 
- 状態遷移は自動（cron jobで定期実行）
- 手動での状態変更は不可
- `draft`状態は未実装（将来的に追加予定）

#### 参加（Participation）
```
confirmed（参加確定）
  ↓ ユーザーが削除ボタンをクリック
deleted（削除済み）
```

**補足**:
- 削除後の復元は不可
- 削除済み参加は統計データとして保持される
- `deletedAt`カラムで管理（ソフトデリート）

#### ユーザー（User）
```
anonymous（未ログイン）
  ↓ Twitter OAuthでログイン
authenticated（ログイン済み）
  ↓ ログアウト
anonymous（未ログイン）
```

**補足**:
- ログアウト後も、作成したチャレンジ・参加記録は保持される
- `users.lastSignedIn`は最終ログイン日時を記録

#### Twitter連携状態（TwitterFollowStatus）
```
not_following（未フォロー）
  ↓ ユーザーがTwitterでフォロー
following（フォロー中）
  ↓ ユーザーがTwitterでフォロー解除
not_following（未フォロー）
```

**補足**:
- フォロー状態は、ユーザーが明示的にチェックした場合のみ更新される
- 自動更新は行わない（Twitter APIのレート制限を考慮）

---

### 6. データ構造の定義（Schema）

上記の整理を基に、実際のデータベーススキーマを定義します。

#### 主要テーブル

**users**（ユーザー）
```typescript
{
  id: number;              // 主キー（自動採番）
  openId: string;          // Twitter ID（一意）
  name: string | null;     // 表示名
  email: string | null;    // メールアドレス
  loginMethod: string | null; // ログイン方法（"twitter"）
  role: "user" | "admin";  // ロール
  gender: "male" | "female" | "unspecified"; // 性別
  createdAt: Date;         // 作成日時（不変）
  updatedAt: Date;         // 更新日時（可変）
  lastSignedIn: Date;      // 最終ログイン日時（可変）
}
```

**challenges**（チャレンジ）
```typescript
{
  id: number;              // 主キー（自動採番）
  hostUserId: number | null; // ホストユーザーID（users.id）
  hostTwitterId: string | null; // ホストTwitter ID
  hostName: string;        // ホスト表示名
  hostUsername: string | null; // ホストTwitterユーザー名
  hostProfileImage: string | null; // ホストプロフィール画像URL
  hostFollowersCount: number; // ホストフォロワー数
  hostDescription: string | null; // ホスト説明文
  title: string;           // チャレンジタイトル
  slug: string | null;     // URL用スラッグ
  description: string | null; // 説明文
  goalType: "attendance" | "followers" | "viewers" | "points" | "custom"; // 目標種別
  goalValue: number;       // 目標値
  goalUnit: string;        // 目標単位（"人"、"回"など）
  currentValue: number;    // 現在値（自動計算）
  eventType: "solo" | "group"; // イベント種別
  categoryId: number | null; // カテゴリID（categories.id）
  eventDate: Date;         // イベント日時
  venue: string | null;    // 会場
  prefecture: string | null; // 都道府県
  ticketPresale: number | null; // 前売りチケット価格
  ticketDoor: number | null; // 当日チケット価格
  ticketSaleStart: Date | null; // チケット販売開始日時
  ticketUrl: string | null; // チケット購入URL
  externalUrl: string | null; // 外部リンク
  status: "upcoming" | "active" | "ended"; // ステータス（自動更新）
  isPublic: boolean;       // 公開設定
  createdAt: Date;         // 作成日時（不変）
  updatedAt: Date;         // 更新日時（可変）
  aiSummary: string | null; // AI要約
  intentTags: string[] | null; // 意図タグ
  regionSummary: Record<string, number> | null; // 地域別集計
  participantSummary: object | null; // 参加者サマリー
  aiSummaryUpdatedAt: Date | null; // AI要約更新日時
}
```

**participations**（参加）
```typescript
{
  id: number;              // 主キー（自動採番）
  challengeId: number;     // チャレンジID（challenges.id）
  userId: number | null;   // ユーザーID（users.id）
  twitterId: string | null; // Twitter ID
  displayName: string;     // 表示名
  username: string | null; // Twitterユーザー名
  profileImage: string | null; // プロフィール画像URL
  followersCount: number;  // フォロワー数
  message: string | null;  // 応援メッセージ
  companionCount: number;  // 同伴者数
  prefecture: string | null; // 都道府県
  gender: "male" | "female" | "unspecified"; // 性別
  contribution: number;    // 貢献度（1 + companionCount）
  isAnonymous: boolean;    // 匿名参加フラグ
  attendanceType: "venue" | "streaming" | "both"; // 参加方法
  createdAt: Date;         // 作成日時（不変）
  updatedAt: Date;         // 更新日時（可変）
  deletedAt: Date | null;  // 削除日時（ソフトデリート）
  deletedBy: number | null; // 削除者ID（users.id）
}
```

**twitterUserCache**（Twitterユーザーキャッシュ）
```typescript
{
  id: number;              // 主キー（自動採番）
  twitterUsername: string; // Twitterユーザー名（一意）
  twitterId: string | null; // Twitter ID
  displayName: string | null; // 表示名
  profileImage: string | null; // プロフィール画像URL
  followersCount: number;  // フォロワー数
  description: string | null; // 説明文
  cachedAt: Date;          // キャッシュ日時
  expiresAt: Date;         // 有効期限
  createdAt: Date;         // 作成日時（不変）
  updatedAt: Date;         // 更新日時（可変）
}
```

**その他のテーブル**:
- `categories`: カテゴリマスター
- `challengeTemplates`: チャレンジテンプレート
- `challengeStats`: 統計データ
- `challengeMembers`: グループチャレンジのメンバー
- `participationCompanions`: 同伴者
- `twitterFollowStatus`: Twitterフォロー状態
- `oauthPkceData`: OAuth PKCE データ
- `invitations`: 招待リンク
- `tickets`: チケット
- `notifications`: 通知
- `achievements`: 実績
- `releaseNotes`: リリースノート
- `auditLogs`: 監査ログ

詳細は`drizzle/schema/`配下のファイルを参照。

---

### 7. データ設計の原則

このプロジェクトでは、以下の原則に従ってデータ設計を行います。

#### 原則1: データ構造を先に決める
実装前に、扱うデータの「状態」「関係」「前提」を明文化します。これにより、仕様変更に強く、壊れにくいシステムを構築できます。

#### 原則2: 状態は最小限に
状態が多ければ多いほど、システムは壊れやすくなります。不要な状態は削除し、本当に必要な状態のみを管理します。

#### 原則3: 関係性を明確にする
データ間の関係性を曖昧にしたまま実装すると、「このデータ、どれと紐づいてるんだっけ？」という混乱が発生します。関係性はデータ構造の中心です。

#### 原則4: 暗黙の前提を明文化する
仕様書に書かれていない前提条件を洗い出し、明文化します。これにより、仕様変更時の影響範囲が明確になります。

#### 原則5: 変化する状態と変化しない状態を分ける
どの値が変化し、どの値が不変かを明確にします。この境界線を引くだけで、更新ロジックのバグが激減します。

#### 原則6: 状態遷移を可視化する
状態がどのように遷移するかを明文化します。これにより、不正な状態遷移や到達しない状態を可視化できます。

---

### 8. データ設計の更新履歴

データ設計は、仕様変更に応じて更新されます。更新履歴を記録することで、過去の意思決定を振り返ることができます。

#### 2026-02-02: 初版作成
- 既存のデータ構造を分析・整理
- 状態、関係、前提、変化する状態と変化しない状態、状態遷移図を明文化
- データ設計の原則を定義

---

## 参考資料

### データ駆動設計について
- [優秀なエンジニアがデータ構造を先に決める理由](https://zenn.dev/articles/data-first-design)
- [データ設計の原則](https://zenn.dev/articles/data-design-principles)

### このプロジェクトのドキュメント
- `drizzle/schema/`: データベーススキーマ定義
- `docs/REQUIREMENTS.md`: 要件定義
- `docs/ARCHITECTURE.md`: アーキテクチャ設計
- `docs/PROGRESS.md`: 開発進捗
