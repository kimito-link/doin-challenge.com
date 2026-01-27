# アーキテクチャドキュメント

## 概要

このドキュメントは、動員ちゃれんじアプリケーションのアーキテクチャを記述しています。システム構成図、データフロー図、デプロイフロー図を含みます。

---

## システム構成図

### 全体構成

```mermaid
graph TB
    subgraph "クライアント"
        A[React Native App<br/>Expo SDK 54]
        B[Web Browser<br/>Chrome/Safari]
    end
    
    subgraph "Vercel"
        C[Express Server<br/>Node.js 22]
        D[tRPC API<br/>Type-safe API]
    end
    
    subgraph "データベース"
        E[MySQL 8.0<br/>Drizzle ORM]
    end
    
    subgraph "外部サービス"
        F[Twitter/X OAuth<br/>認証]
        G[Sentry<br/>エラー監視]
        H[UptimeRobot<br/>外形監視]
    end
    
    A -->|HTTP/WebSocket| C
    B -->|HTTP| C
    C -->|tRPC| D
    D -->|SQL| E
    C -->|OAuth 2.0| F
    C -->|Error Tracking| G
    H -->|Health Check| C
    
    style A fill:#EC4899,stroke:#DB2777,color:#fff
    style B fill:#EC4899,stroke:#DB2777,color:#fff
    style C fill:#A855F7,stroke:#9333EA,color:#fff
    style D fill:#A855F7,stroke:#9333EA,color:#fff
    style E fill:#14B8A6,stroke:#0D9488,color:#fff
    style F fill:#1DA1F2,stroke:#0C85D0,color:#fff
    style G fill:#362D59,stroke:#2A2347,color:#fff
    style H fill:#4ADE80,stroke:#22C55E,color:#fff
```

### 技術スタック

| レイヤー | 技術 | 説明 |
|---------|------|------|
| **フロントエンド** | React Native 0.81 | モバイルアプリ |
| | Expo SDK 54 | React Nativeフレームワーク |
| | NativeWind 4 | Tailwind CSS for React Native |
| | React 19 | UIライブラリ |
| **ルーティング** | Expo Router 6 | ファイルベースルーティング |
| **状態管理** | TanStack Query | サーバー状態管理 |
| | React Context | クライアント状態管理 |
| **API通信** | tRPC 11.7 | 型安全なAPI通信 |
| **バックエンド** | Express 4.22 | Webサーバー |
| | Node.js 22 | ランタイム |
| **データベース** | MySQL 8.0 | リレーショナルデータベース |
| | Drizzle ORM 0.44 | TypeScript ORM |
| **認証** | OAuth 2.0 | Twitter/X認証 |
| **監視** | Sentry | エラー監視 |
| | UptimeRobot | 外形監視 |
| **デプロイ** | Vercel | ホスティング |

---

## データフロー図

### 1. 認証フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as React Native App
    participant S as Express Server
    participant T as Twitter/X
    participant DB as MySQL
    
    U->>A: ログインボタンをタップ
    A->>S: GET /oauth/login
    S->>T: OAuth 2.0 認証リクエスト
    T->>U: Twitter/Xログイン画面を表示
    U->>T: 認証情報を入力
    T->>S: GET /oauth/callback?code=xxx
    S->>T: POST /oauth/token (code)
    T->>S: access_token
    S->>T: GET /users/me (access_token)
    T->>S: ユーザー情報
    S->>DB: INSERT/UPDATE users
    DB->>S: user_id
    S->>A: Set-Cookie: session_token
    A->>U: ホーム画面に遷移
```

### 2. イベント作成フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as React Native App
    participant API as tRPC API
    participant DB as MySQL
    
    U->>A: イベント作成フォームを入力
    A->>A: バリデーション
    A->>API: events.create(eventData)
    API->>API: 認証チェック
    API->>DB: INSERT INTO events
    DB->>API: event_id
    API->>DB: SELECT event with relations
    DB->>API: event
    API->>A: event
    A->>U: イベント詳細画面に遷移
```

### 3. 参加表明フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as React Native App
    participant API as tRPC API
    participant DB as MySQL
    participant N as 通知システム
    
    U->>A: 参加表明フォームを入力
    A->>A: バリデーション
    A->>API: participations.create(participationData)
    API->>API: 認証チェック
    API->>DB: INSERT INTO participations
    DB->>API: participation_id
    API->>DB: SELECT participation with relations
    DB->>API: participation
    API->>N: createNotification(新規参加者)
    N->>DB: INSERT INTO notifications
    API->>A: participation
    A->>U: 参加表明完了アニメーション
    A->>U: トースト通知を表示
```

### 4. リアルタイム更新フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant A as React Native App
    participant API as tRPC API
    participant DB as MySQL
    
    U->>A: イベント詳細画面を表示
    A->>API: events.get(eventId)
    API->>DB: SELECT event with participations
    DB->>API: event
    API->>A: event
    A->>U: イベント詳細を表示
    
    loop 10秒ごと（Polling）
        A->>API: events.get(eventId)
        API->>DB: SELECT event with participations
        DB->>API: event
        API->>A: event
        A->>A: 差分を検出
        alt 新しい参加者がいる
            A->>U: バナーを表示（○○さんが参加表明！）
        end
        A->>U: 進捗バーをアニメーション更新
    end
```

---

## デプロイフロー図

### CI/CDパイプライン

```mermaid
graph LR
    A[開発環境<br/>localhost] -->|git push| B[GitHub]
    B -->|Webhook| C[GitHub Actions]
    C -->|TypeScript Check| D{型チェック}
    D -->|Pass| E[Vitest]
    D -->|Fail| F[❌ デプロイ失敗]
    E -->|Pass| G[Vercel Build]
    E -->|Fail| F
    G -->|Success| H[Vercel Preview]
    G -->|Fail| F
    H -->|Manual Promote| I[Vercel Production]
    I -->|Health Check| J[UptimeRobot]
    I -->|Error Tracking| K[Sentry]
    
    style A fill:#171717,stroke:#262626,color:#f5f5f5
    style B fill:#171717,stroke:#262626,color:#f5f5f5
    style C fill:#A855F7,stroke:#9333EA,color:#fff
    style D fill:#F59E0B,stroke:#D97706,color:#fff
    style E fill:#A855F7,stroke:#9333EA,color:#fff
    style F fill:#EF4444,stroke:#DC2626,color:#fff
    style G fill:#A855F7,stroke:#9333EA,color:#fff
    style H fill:#14B8A6,stroke:#0D9488,color:#fff
    style I fill:#22C55E,stroke:#16A34A,color:#fff
    style J fill:#4ADE80,stroke:#22C55E,color:#fff
    style K fill:#362D59,stroke:#2A2347,color:#fff
```

### デプロイ手順

#### 1. 開発環境

```bash
# 開発サーバーを起動
pnpm dev

# 型チェック
pnpm check

# テスト実行
pnpm test
```

#### 2. ステージング環境（Vercel Preview）

```bash
# GitHubにpush
git add .
git commit -m "feat: 新機能を追加"
git push origin main

# GitHub Actionsが自動実行
# - TypeScript型チェック
# - Vitestテスト
# - Vercelビルド

# Vercel Previewが自動デプロイ
# - プレビューURLが発行される
# - https://birthday-celebration-xxx.vercel.app
```

#### 3. 本番環境（Vercel Production）

```bash
# Vercelダッシュボードで「Promote to Production」をクリック
# または
vercel --prod

# 本番環境にデプロイ
# - https://doin-challenge.com

# 監視開始
# - UptimeRobot: /api/readyz を5分ごとに監視
# - Sentry: エラーを自動収集
```

---

## データベーススキーマ

### ER図

```mermaid
erDiagram
    users ||--o{ events : "creates"
    users ||--o{ participations : "participates"
    users ||--o{ notifications : "receives"
    users ||--o{ message_likes : "likes"
    events ||--o{ participations : "has"
    participations ||--o{ message_likes : "has"
    
    users {
        string id PK
        string name
        string username
        string avatarUrl
        string twitterId
        int followersCount
        string gender
        string genre
        datetime createdAt
    }
    
    events {
        string id PK
        string title
        string description
        datetime eventDate
        string eventType
        string venue
        string streamingUrl
        int targetParticipants
        string createdBy FK
        string hostGender
        datetime createdAt
    }
    
    participations {
        string id PK
        string eventId FK
        string userId FK
        string participationType
        string message
        string gender
        datetime createdAt
    }
    
    notifications {
        string id PK
        string userId FK
        string type
        string title
        string body
        boolean read
        datetime createdAt
    }
    
    message_likes {
        string id PK
        string participationId FK
        string userId FK
        datetime createdAt
    }
```

### 主要テーブル

| テーブル | 説明 | 主要カラム |
|---------|------|-----------|
| **users** | ユーザー情報 | id, name, username, twitterId, followersCount, gender, genre |
| **events** | イベント情報 | id, title, description, eventDate, targetParticipants, hostGender |
| **participations** | 参加表明 | id, eventId, userId, participationType, message, gender |
| **notifications** | 通知 | id, userId, type, title, body, read |
| **message_likes** | 応援メッセージへの「いいね」 | id, participationId, userId |

---

## セキュリティ

### 認証・認可

```mermaid
graph TB
    A[リクエスト] -->|Cookie| B[Session Token]
    B -->|検証| C{有効?}
    C -->|Yes| D[User Context]
    C -->|No| E[401 Unauthorized]
    D -->|認可チェック| F{権限あり?}
    F -->|Yes| G[API実行]
    F -->|No| H[403 Forbidden]
    
    style A fill:#171717,stroke:#262626,color:#f5f5f5
    style B fill:#A855F7,stroke:#9333EA,color:#fff
    style C fill:#F59E0B,stroke:#D97706,color:#fff
    style D fill:#14B8A6,stroke:#0D9488,color:#fff
    style E fill:#EF4444,stroke:#DC2626,color:#fff
    style F fill:#F59E0B,stroke:#D97706,color:#fff
    style G fill:#22C55E,stroke:#16A34A,color:#fff
    style H fill:#EF4444,stroke:#DC2626,color:#fff
```

### セキュリティ対策

| 対策 | 実装 |
|------|------|
| **認証** | OAuth 2.0（Twitter/X） |
| **セッション管理** | HTTPOnly Cookie |
| **CSRF対策** | SameSite Cookie |
| **XSS対策** | React自動エスケープ |
| **SQLインジェクション対策** | Drizzle ORMのパラメータ化クエリ |
| **レート制限** | 未実装（将来的に追加予定） |

---

## パフォーマンス最適化

### フロントエンド

```mermaid
graph LR
    A[ユーザー] -->|リクエスト| B[React Native App]
    B -->|React.memo| C[コンポーネント]
    B -->|useCallback| D[イベントハンドラ]
    B -->|FlatList最適化| E[リスト表示]
    B -->|expo-image| F[画像表示]
    
    style A fill:#171717,stroke:#262626,color:#f5f5f5
    style B fill:#EC4899,stroke:#DB2777,color:#fff
    style C fill:#A855F7,stroke:#9333EA,color:#fff
    style D fill:#A855F7,stroke:#9333EA,color:#fff
    style E fill:#A855F7,stroke:#9333EA,color:#fff
    style F fill:#A855F7,stroke:#9333EA,color:#fff
```

### バックエンド

```mermaid
graph LR
    A[リクエスト] -->|tRPC| B[API Layer]
    B -->|キャッシュ| C{Cache Hit?}
    C -->|Yes| D[キャッシュから返却]
    C -->|No| E[データベースクエリ]
    E -->|インデックス| F[高速検索]
    E -->|LEFT JOIN| G[N+1問題回避]
    E -->|LIMIT/OFFSET| H[ページネーション]
    
    style A fill:#171717,stroke:#262626,color:#f5f5f5
    style B fill:#A855F7,stroke:#9333EA,color:#fff
    style C fill:#F59E0B,stroke:#D97706,color:#fff
    style D fill:#22C55E,stroke:#16A34A,color:#fff
    style E fill:#14B8A6,stroke:#0D9488,color:#fff
    style F fill:#A855F7,stroke:#9333EA,color:#fff
    style G fill:#A855F7,stroke:#9333EA,color:#fff
    style H fill:#A855F7,stroke:#9333EA,color:#fff
```

---

## 監視・運用

### 監視フロー

```mermaid
graph TB
    A[本番環境] -->|Health Check| B[UptimeRobot]
    A -->|Error Tracking| C[Sentry]
    A -->|Logs| D[Vercel Logs]
    
    B -->|Down| E[アラート通知]
    C -->|Error| E
    
    E -->|Slack/Email| F[開発チーム]
    F -->|対応| G{緊急度}
    G -->|Critical| H[即座にロールバック]
    G -->|High| I[Feature Flag無効化]
    G -->|Medium| J[次回デプロイで修正]
    
    style A fill:#22C55E,stroke:#16A34A,color:#fff
    style B fill:#4ADE80,stroke:#22C55E,color:#fff
    style C fill:#362D59,stroke:#2A2347,color:#fff
    style D fill:#171717,stroke:#262626,color:#f5f5f5
    style E fill:#EF4444,stroke:#DC2626,color:#fff
    style F fill:#171717,stroke:#262626,color:#f5f5f5
    style G fill:#F59E0B,stroke:#D97706,color:#fff
    style H fill:#EF4444,stroke:#DC2626,color:#fff
    style I fill:#F59E0B,stroke:#D97706,color:#fff
    style J fill:#14B8A6,stroke:#0D9488,color:#fff
```

### 監視項目

| 項目 | ツール | 閾値 | アラート |
|------|--------|------|---------|
| **サーバー稼働率** | UptimeRobot | 99.9% | Slack/Email |
| **エラー率** | Sentry | 5xx > 1% | Slack/Email |
| **ログイン失敗率** | Sentry | > 10% | Slack/Email |
| **レスポンスタイム** | Vercel | > 3秒 | Dashboard |
| **メモリ使用量** | Vercel | > 80% | Dashboard |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| v1.0.0 | 2026-01-27 | 初版作成 |

---

## サポート

アーキテクチャに関する質問や提案がある場合は、[GitHub Issues](https://github.com/kimito-link/doin-challenge.com/issues)で報告してください。
