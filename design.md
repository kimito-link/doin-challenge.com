# 生誕祭応援アプリ - デザイン設計書

## アプリ概要
アイドル・ホスト・キャバ嬢の生誕祭（バースデーイベント）を盛り上げるためのアプリ。
本人とファンの両方が使用し、応援メッセージの収集・表示、参加登録、フォロワー数の誇示を実現。

## 画面一覧

### 1. ホーム画面 (Home)
- 生誕祭イベント一覧
- 新着イベントの表示
- イベント検索機能

### 2. イベント作成画面 (CreateEvent)
- 本人がTwitterログインして生誕祭イベントを作成
- イベント名、日付、説明文の入力
- 自動でTwitterプロフィール情報を取得

### 3. イベント詳細画面 (EventDetail)
- 本人のプロフィール表示（アイコン、名前、フォロワー数）
- 応援メッセージ一覧
- 参加表明ボタン
- メッセージ投稿フォーム

### 4. 参加登録画面 (JoinEvent)
- Twitterログインまたは匿名参加
- 応援メッセージ入力
- 一緒に参加する友人の追加（任意）
- 参加表明ボタン

### 5. マイページ画面 (MyPage)
- 自分が作成したイベント一覧
- 参加表明したイベント一覧
- プロフィール設定

## 主要ユーザーフロー

### フロー1: 本人がイベントを作成
1. ホーム画面 → 「イベント作成」ボタン
2. Twitterログイン
3. イベント情報入力
4. イベント作成完了 → イベント詳細画面

### フロー2: ファンが参加表明
1. ホーム画面 → イベント選択
2. イベント詳細画面 → 「参加表明する！」ボタン
3. 参加登録画面 → Twitterログインまたは匿名
4. 応援メッセージ入力
5. 参加完了 → メッセージが一覧に表示

### フロー3: SNSシェア
1. イベント詳細画面 → 「SNSでシェアして仲間を増やす」ボタン
2. シェア画面表示
3. Twitter/LINE等でシェア

## カラーパレット

### メインカラー
- **Primary**: グラデーション（ピンク→パープル）#EC4899 → #8B5CF6
- **Background**: ダークネイビー #0F172A (ダーク) / #F8FAFC (ライト)
- **Surface**: #1E293B (ダーク) / #FFFFFF (ライト)
- **Foreground**: #F1F5F9 (ダーク) / #0F172A (ライト)
- **Muted**: #64748B
- **Accent**: #06B6D4 (シアン)

### セマンティックカラー
- **Success**: #22C55E
- **Warning**: #F59E0B
- **Error**: #EF4444

## コンポーネント設計

### EventCard
- イベントサムネイル
- 本人のプロフィール画像
- イベント名
- 開催日
- 参加者数

### MessageCard
- 投稿者のプロフィール画像（Twitterアイコンまたは匿名アイコン）
- 投稿者名（@ユーザー名）
- 同伴者情報（+○○人連れて行く！）
- 応援メッセージ本文

### ProfileHeader
- 本人のTwitterプロフィール画像（大）
- 表示名
- @ユーザー名
- フォロワー数（大きく表示）
- プロフィール説明

### GradientButton
- ピンク→パープルのグラデーション
- 押下時のスケールアニメーション
- ハプティックフィードバック

## データ構造

### Event
- id: string
- hostTwitterId: string
- hostName: string
- hostUsername: string
- hostProfileImage: string
- hostFollowersCount: number
- title: string
- description: string
- eventDate: Date
- createdAt: Date

### Participation
- id: string
- eventId: string
- twitterId: string | null (匿名の場合null)
- displayName: string
- username: string | null
- profileImage: string | null
- message: string
- companionCount: number
- companions: string[] (友人のTwitter ID)
- createdAt: Date
