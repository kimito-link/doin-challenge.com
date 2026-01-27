# コントリビューションガイド

動員ちゃれんじプロジェクトへのコントリビューションに興味を持っていただき、ありがとうございます。このドキュメントは、プロジェクトに貢献する際のガイドラインを記述しています。

---

## 目次

- [行動規範](#行動規範)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [コーディング規約](#コーディング規約)
- [コミットメッセージ規約](#コミットメッセージ規約)
- [ブランチ戦略](#ブランチ戦略)
- [プルリクエストのプロセス](#プルリクエストのプロセス)
- [レビュープロセス](#レビュープロセス)
- [テスト](#テスト)

---

## 行動規範

このプロジェクトでは、すべてのコントリビューターに対して、尊重と協力の精神を持って行動することを期待しています。以下の行動規範を遵守してください：

- **尊重**: すべてのコントリビューターの意見を尊重し、建設的なフィードバックを提供する
- **協力**: チームメンバーと協力し、共通の目標に向かって努力する
- **透明性**: 問題や懸念事項をオープンに共有し、解決策を一緒に見つける
- **包括性**: すべてのバックグラウンドを持つ人々を歓迎し、多様性を尊重する

---

## 開発環境のセットアップ

詳細は[README.md](./README.md)の「セットアップ手順」を参照してください。

### 必要な環境

- Node.js 22以上
- pnpm 9以上
- MySQL 8.0以上
- Git

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/kimito-link/doin-challenge.com.git
cd doin-challenge.com

# 依存関係をインストール
pnpm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集して必要な環境変数を設定

# データベースをセットアップ
pnpm db:push

# 開発サーバーを起動
pnpm dev
```

---

## コーディング規約

### TypeScript

#### 型定義

- **明示的な型定義を優先**: 型推論に頼りすぎず、明示的に型を定義する

```typescript
// ✅ Good
function createEvent(title: string, date: Date): Event {
  // ...
}

// ❌ Bad
function createEvent(title, date) {
  // ...
}
```

- **`any`型を避ける**: `any`型は型安全性を損なうため、可能な限り避ける

```typescript
// ✅ Good
function processData(data: unknown): void {
  if (typeof data === 'string') {
    // ...
  }
}

// ❌ Bad
function processData(data: any): void {
  // ...
}
```

- **型エイリアスとインターフェースを適切に使い分ける**
  - オブジェクトの形状を定義する場合: `interface`
  - ユニオン型やプリミティブ型の別名: `type`

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

type UserId = string;
type UserRole = 'admin' | 'user';

// ❌ Bad
type User = {
  id: string;
  name: string;
};
```

#### 命名規則

- **変数・関数**: `camelCase`

```typescript
const userName = 'John';
function getUserById(id: string) { }
```

- **型・インターフェース**: `PascalCase`

```typescript
interface UserProfile { }
type EventType = 'live' | 'online';
```

- **定数**: `UPPER_SNAKE_CASE`

```typescript
const MAX_PARTICIPANTS = 100;
const API_BASE_URL = 'https://api.example.com';
```

- **プライベートメソッド**: `_camelCase`（先頭にアンダースコア）

```typescript
class EventService {
  private _validateEvent() { }
}
```

### React / React Native

#### コンポーネント

- **関数コンポーネントを優先**: クラスコンポーネントではなく、関数コンポーネントを使用する

```typescript
// ✅ Good
export function EventCard({ event }: { event: Event }) {
  return <View>...</View>;
}

// ❌ Bad
export class EventCard extends React.Component {
  render() {
    return <View>...</View>;
  }
}
```

- **Props型を明示的に定義**: インラインではなく、型定義を分離する

```typescript
// ✅ Good
interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  return <View>...</View>;
}

// ❌ Bad
export function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  return <View>...</View>;
}
```

- **React.memoを適切に使用**: 不要な再レンダリングを避ける

```typescript
// ✅ Good
export const EventCard = React.memo(({ event }: EventCardProps) => {
  return <View>...</View>;
});
```

#### Hooks

- **カスタムフックは`use`で始める**

```typescript
// ✅ Good
function useEventData(eventId: string) {
  // ...
}

// ❌ Bad
function getEventData(eventId: string) {
  // ...
}
```

- **依存配列を正確に指定**: ESLintの警告を無視しない

```typescript
// ✅ Good
useEffect(() => {
  fetchEvent(eventId);
}, [eventId]);

// ❌ Bad
useEffect(() => {
  fetchEvent(eventId);
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

#### スタイリング

- **NativeWind（Tailwind CSS）を優先**: インラインスタイルではなく、Tailwindクラスを使用する

```typescript
// ✅ Good
<View className="flex-1 items-center justify-center p-4">
  <Text className="text-2xl font-bold text-foreground">Hello</Text>
</View>

// ❌ Bad
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Hello</Text>
</View>
```

- **複雑なスタイルは`cn()`を使用**: 条件付きスタイルを適用する場合

```typescript
import { cn } from '@/lib/utils';

<View className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary",
  disabled && "opacity-50"
)} />
```

### ファイル構成

- **ファイル名**: `kebab-case`

```
event-card.tsx
use-event-data.ts
event-service.ts
```

- **ディレクトリ構造**: 機能ごとにグループ化

```
app/
  (tabs)/
    index.tsx
    events/
      [id].tsx
components/
  event/
    event-card.tsx
    event-list.tsx
hooks/
  use-event-data.ts
lib/
  event-service.ts
```

---

## コミットメッセージ規約

### フォーマット

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

| Type | 説明 | 例 |
|------|------|-----|
| `feat` | 新機能 | `feat(events): イベント作成機能を追加` |
| `fix` | バグ修正 | `fix(auth): ログイン後のリダイレクトを修正` |
| `docs` | ドキュメント | `docs(readme): セットアップ手順を更新` |
| `style` | コードフォーマット | `style(events): インデントを修正` |
| `refactor` | リファクタリング | `refactor(api): tRPCルーターを整理` |
| `test` | テスト | `test(events): イベント作成のテストを追加` |
| `chore` | ビルド・設定 | `chore(deps): 依存関係を更新` |

### Scope

変更の影響範囲を示す（オプション）

- `events`: イベント関連
- `auth`: 認証関連
- `participations`: 参加表明関連
- `notifications`: 通知関連
- `ui`: UIコンポーネント
- `api`: API関連
- `db`: データベース関連

### Subject

- 現在形の動詞で始める（「追加」「修正」など）
- 最初の文字は小文字
- 末尾にピリオドを付けない
- 50文字以内

### Body（オプション）

- 変更の理由や背景を説明
- 72文字で改行

### Footer（オプション）

- Breaking Changesを記述
- Issueへの参照を記述

### 例

```
feat(events): イベント作成機能を追加

ユーザーがイベントを作成できるようにするため、イベント作成フォームを追加しました。
フォームには以下のフィールドが含まれます：
- タイトル
- 説明
- 日時
- 会場

Closes #123
```

---

## ブランチ戦略

### ブランチ命名規則

```
<type>/<issue-number>-<short-description>
```

例：
- `feat/123-add-event-creation`
- `fix/456-fix-login-redirect`
- `docs/789-update-readme`

### ワークフロー

1. **`main`ブランチから新しいブランチを作成**

```bash
git checkout main
git pull origin main
git checkout -b feat/123-add-event-creation
```

2. **変更を加えてコミット**

```bash
git add .
git commit -m "feat(events): イベント作成機能を追加"
```

3. **リモートにプッシュ**

```bash
git push origin feat/123-add-event-creation
```

4. **プルリクエストを作成**

GitHubでプルリクエストを作成し、レビューを依頼します。

5. **レビュー後にマージ**

レビューが承認されたら、`main`ブランチにマージします。

---

## プルリクエストのプロセス

### プルリクエストを作成する前に

- [ ] コードが正しく動作することを確認
- [ ] 型チェックが通ることを確認（`pnpm check`）
- [ ] テストが通ることを確認（`pnpm test`）
- [ ] コミットメッセージが規約に従っていることを確認
- [ ] 不要なコメントやデバッグコードを削除

### プルリクエストのテンプレート

プルリクエストを作成する際は、以下のテンプレートを使用してください（`.github/pull_request_template.md`を参照）。

### レビュー依頼

- 適切なレビュアーを指定
- 関連するIssueをリンク
- 必要に応じてスクリーンショットやデモ動画を添付

---

## レビュープロセス

### レビュアーの責任

- **コードの品質を確認**: コーディング規約に従っているか
- **機能の正確性を確認**: 期待通りに動作するか
- **パフォーマンスを確認**: 不要な再レンダリングやメモリリークがないか
- **セキュリティを確認**: 脆弱性がないか
- **建設的なフィードバックを提供**: 改善点を具体的に指摘

### レビューの観点

| 観点 | チェック項目 |
|------|-------------|
| **機能** | 期待通りに動作するか、エッジケースが考慮されているか |
| **コード品質** | コーディング規約に従っているか、可読性が高いか |
| **パフォーマンス** | 不要な再レンダリングがないか、メモリリークがないか |
| **セキュリティ** | 脆弱性がないか、認証・認可が適切か |
| **テスト** | テストが追加されているか、カバレッジが十分か |
| **ドキュメント** | 必要に応じてドキュメントが更新されているか |

### レビューのフィードバック

- **具体的に指摘**: 「ここを改善してください」ではなく、「この部分は`React.memo`を使用することで再レンダリングを避けられます」
- **建設的に**: 批判ではなく、改善提案を提供
- **優先度を明示**: 「必須」「推奨」「任意」を明記

---

## テスト

### テストの種類

| 種類 | ツール | 説明 |
|------|--------|------|
| **ユニットテスト** | Vitest | 個別の関数やコンポーネントをテスト |
| **統合テスト** | Vitest | 複数のコンポーネントやAPIをテスト |
| **E2Eテスト** | 未実装 | アプリ全体のフローをテスト |

### テストの実行

```bash
# すべてのテストを実行
pnpm test

# 特定のファイルをテスト
pnpm test event-card.test.tsx

# カバレッジを確認
pnpm test --coverage
```

### テストの書き方

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { EventCard } from './event-card';

describe('EventCard', () => {
  it('イベントタイトルを表示する', () => {
    const event = {
      id: '1',
      title: 'テストイベント',
      // ...
    };

    render(<EventCard event={event} />);

    expect(screen.getByText('テストイベント')).toBeTruthy();
  });
});
```

---

## 質問やサポート

質問や問題がある場合は、以下の方法で連絡してください：

- [GitHub Issues](https://github.com/kimito-link/doin-challenge.com/issues)で質問を投稿
- [GitHub Discussions](https://github.com/kimito-link/doin-challenge.com/discussions)でディスカッションを開始

---

## ライセンス

このプロジェクトに貢献することで、あなたの貢献がプロジェクトのライセンス（MIT License）の下で公開されることに同意したものとみなされます。

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| v1.0.0 | 2026-01-27 | 初版作成 |

---

ご協力ありがとうございます！🎉
