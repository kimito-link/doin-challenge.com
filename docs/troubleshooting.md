# トラブルシューティングガイド

## 概要

このドキュメントは、動員ちゃれんじアプリケーションでよく発生する問題と解決方法を記述しています。

---

## よくあるエラーと解決方法

### 1. データベース接続エラー

#### エラーメッセージ

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

または

```
Error: Access denied for user 'user'@'localhost'
```

#### 原因

- データベースサーバーが起動していない
- `DATABASE_URL`が正しく設定されていない
- データベースの認証情報が間違っている

#### 解決方法

1. **データベースサーバーの起動を確認**

```bash
# MySQLサーバーの状態を確認
sudo systemctl status mysql

# MySQLサーバーを起動
sudo systemctl start mysql
```

2. **環境変数を確認**

```bash
# .envファイルを確認
cat .env | grep DATABASE_URL
```

3. **データベース接続をテスト**

```bash
# MySQLクライアントで接続テスト
mysql -h localhost -u user -p database_name
```

4. **マイグレーションを実行**

```bash
pnpm db:push
```

---

### 2. OAuth認証エラー

#### エラーメッセージ

```
Error: invalid_client
```

または

```
Error: redirect_uri_mismatch
```

#### 原因

- `TWITTER_CLIENT_ID`または`TWITTER_CLIENT_SECRET`が正しく設定されていない
- リダイレクトURLが正しく設定されていない
- Twitter Developer Portalでアプリが有効になっていない

#### 解決方法

1. **環境変数を確認**

```bash
# .envファイルを確認
cat .env | grep TWITTER_CLIENT
```

2. **Twitter Developer Portalで設定を確認**

- [Twitter Developer Portal](https://developer.twitter.com/)にアクセス
- アプリの「Settings」→「Authentication settings」を開く
- 「Callback URLs」に以下を追加:
  - 開発環境: `http://localhost:3000/oauth/callback`
  - 本番環境: `https://doin-challenge.com/oauth/callback`

3. **開発サーバーを再起動**

```bash
pnpm dev
```

---

### 3. Sentryにエラーが送信されない

#### エラーメッセージ

```
Warning: Sentry is not initialized
```

#### 原因

- `SENTRY_DSN`が正しく設定されていない
- Sentryが初期化されていない

#### 解決方法

1. **環境変数を確認**

```bash
# .envファイルを確認
cat .env | grep SENTRY_DSN
```

2. **Sentryダッシュボードで設定を確認**

- [Sentry](https://sentry.io/)にアクセス
- プロジェクトの「Settings」→「Client Keys (DSN)」を開く
- DSNをコピーして`.env`に追加

3. **開発サーバーを再起動**

```bash
pnpm dev
```

---

### 4. プッシュ通知が送信されない

#### エラーメッセージ

```
Error: Expo push token is invalid
```

#### 原因

- プッシュ通知の許可が得られていない
- Expo Push Tokenが無効
- `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS`が`false`に設定されている

#### 解決方法

1. **Feature Flagを確認**

```bash
# .envファイルを確認
cat .env | grep EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS
```

2. **プッシュ通知の許可を確認**

- アプリの「設定」→「通知設定」を開く
- 通知の許可状態を確認

3. **Expo Push Tokenを再取得**

- アプリをアンインストール
- アプリを再インストール
- 通知の許可をリクエスト

---

### 5. リアルタイム更新が動作しない

#### エラーメッセージ

なし（更新されない）

#### 原因

- `EXPO_PUBLIC_ENABLE_REALTIME_UPDATES`が`false`に設定されている
- ネットワーク接続が不安定
- バックグラウンドでPollingが停止している

#### 解決方法

1. **Feature Flagを確認**

```bash
# .envファイルを確認
cat .env | grep EXPO_PUBLIC_ENABLE_REALTIME_UPDATES
```

2. **ネットワーク接続を確認**

- Wi-Fiまたはモバイルデータ接続を確認
- ファイアウォールでポートが開いているか確認

3. **アプリをフォアグラウンドに戻す**

- バックグラウンドでPollingは自動停止します
- アプリをフォアグラウンドに戻すと自動的に再開します

---

### 6. 画像が表示されない

#### エラーメッセージ

```
Error: Failed to load image
```

#### 原因

- 画像URLが無効
- ネットワーク接続が不安定
- CORS設定が正しくない

#### 解決方法

1. **画像URLを確認**

```bash
# ブラウザで画像URLを開いて確認
curl -I https://example.com/image.png
```

2. **ネットワーク接続を確認**

- Wi-Fiまたはモバイルデータ接続を確認

3. **CORS設定を確認**

- サーバー側で`Access-Control-Allow-Origin`ヘッダーを設定

---

### 7. TypeScriptエラー

#### エラーメッセージ

```
Type 'string' is not assignable to type 'number'
```

#### 原因

- 型定義が正しくない
- 型推論が失敗している

#### 解決方法

1. **型チェックを実行**

```bash
pnpm check
```

2. **型定義を確認**

- エラーメッセージに表示されたファイルを開く
- 型定義を修正

3. **型推論を明示的に指定**

```typescript
// 修正前
const value = getValue();

// 修正後
const value: number = getValue();
```

---

## パフォーマンス問題のデバッグ

### 1. ページ読み込みが遅い

#### 症状

- ページの初回読み込みに10秒以上かかる
- 画像の読み込みが遅い

#### 原因

- ネットワーク接続が遅い
- 画像サイズが大きすぎる
- データベースクエリが遅い

#### 解決方法

1. **ネットワーク速度を確認**

```bash
# ネットワーク速度をテスト
curl -o /dev/null https://doin-challenge.com
```

2. **画像サイズを最適化**

- 画像をWebPフォーマットに変換
- 画像を圧縮（80%品質）
- 遅延読み込みを有効化

3. **データベースクエリを最適化**

- インデックスを追加
- N+1問題を解決（LEFT JOINを使用）
- キャッシュを追加

---

### 2. メモリ使用量が多い

#### 症状

- アプリがクラッシュする
- デバイスが熱くなる

#### 原因

- メモリリークが発生している
- 大量のデータを一度に読み込んでいる

#### 解決方法

1. **メモリ使用量を確認**

```bash
# Expo Goでメモリ使用量を確認
# デバイスの設定 → 開発者オプション → メモリ使用量
```

2. **FlatListを使用**

- `ScrollView`の代わりに`FlatList`を使用
- `initialNumToRender`を小さく設定（20）
- `removeClippedSubviews`を有効化（Android）

3. **画像キャッシュをクリア**

```bash
# Expo Goのキャッシュをクリア
# デバイスの設定 → アプリ → Expo Go → ストレージ → キャッシュをクリア
```

---

### 3. スクロールがカクつく

#### 症状

- FlatListのスクロールが滑らかでない
- アニメーションがカクつく

#### 原因

- 不要な再レンダリングが発生している
- アニメーションが重い

#### 解決方法

1. **React.memoを使用**

```typescript
// 修正前
export function MessageCard({ message }) {
  // ...
}

// 修正後
export const MessageCard = React.memo(({ message }) => {
  // ...
});
```

2. **useCallbackを使用**

```typescript
// 修正前
const renderItem = ({ item }) => <MessageCard message={item} />;

// 修正後
const renderItem = useCallback(
  ({ item }) => <MessageCard message={item} />,
  []
);
```

3. **FlatListを最適化**

```typescript
<FlatList
  data={messages}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  initialNumToRender={20}
  windowSize={21}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews={Platform.OS === 'android'}
/>
```

---

## データベース関連のトラブルシューティング

### 1. マイグレーションエラー

#### エラーメッセージ

```
Error: Migration failed
```

#### 原因

- データベーススキーマが不整合
- マイグレーションファイルが壊れている

#### 解決方法

1. **マイグレーション履歴を確認**

```bash
# データベースに接続
mysql -h localhost -u user -p database_name

# マイグレーション履歴を確認
SELECT * FROM __drizzle_migrations;
```

2. **マイグレーションをリセット**

```bash
# 開発環境のみ（本番環境では実行しないでください）
pnpm db:push
```

3. **手動でスキーマを修正**

```sql
-- 例: カラムを追加
ALTER TABLE users ADD COLUMN gender VARCHAR(10);
```

---

### 2. データ整合性エラー

#### エラーメッセージ

```
Error: Foreign key constraint fails
```

#### 原因

- 外部キー制約に違反している
- 参照先のレコードが存在しない

#### 解決方法

1. **外部キー制約を確認**

```sql
-- 外部キー制約を確認
SHOW CREATE TABLE participations;
```

2. **参照先のレコードを確認**

```sql
-- 参照先のレコードが存在するか確認
SELECT * FROM events WHERE id = 'event_id';
```

3. **データを修正**

```sql
-- 参照先のレコードを追加
INSERT INTO events (id, title, ...) VALUES ('event_id', 'Event Title', ...);
```

---

### 3. パフォーマンス問題

#### 症状

- クエリの実行に10秒以上かかる
- データベースのCPU使用率が高い

#### 原因

- インデックスが設定されていない
- N+1問題が発生している
- クエリが複雑すぎる

#### 解決方法

1. **スロークエリログを確認**

```sql
-- スロークエリログを有効化
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- スロークエリログを確認
SELECT * FROM mysql.slow_log;
```

2. **インデックスを追加**

```sql
-- 例: event_idカラムにインデックスを追加
CREATE INDEX idx_event_id ON participations(event_id);
```

3. **クエリを最適化**

```typescript
// 修正前（N+1問題）
const events = await db.select().from(eventsTable);
for (const event of events) {
  const participations = await db
    .select()
    .from(participationsTable)
    .where(eq(participationsTable.eventId, event.id));
}

// 修正後（LEFT JOIN）
const events = await db
  .select()
  .from(eventsTable)
  .leftJoin(
    participationsTable,
    eq(eventsTable.id, participationsTable.eventId)
  );
```

---

## 緊急時の対応

### 1. サービスが停止している

#### 症状

- アプリが開けない
- APIが応答しない

#### 対応手順

1. **UptimeRobotで状態を確認**

- [UptimeRobot](https://uptimerobot.com/)にアクセス
- `/api/readyz`の監視状態を確認

2. **Sentryでエラーを確認**

- [Sentry](https://sentry.io/)にアクセス
- 最近のエラーを確認

3. **ロールバックを実行**

- 詳細は[ロールバック手順](./rollback-procedure.md)を参照

---

### 2. データベースが応答しない

#### 症状

- データベース接続エラーが発生
- クエリがタイムアウト

#### 対応手順

1. **データベースサーバーの状態を確認**

```bash
# データベースサーバーの状態を確認
sudo systemctl status mysql
```

2. **データベースを再起動**

```bash
# データベースサーバーを再起動
sudo systemctl restart mysql
```

3. **接続数を確認**

```sql
-- 現在の接続数を確認
SHOW STATUS LIKE 'Threads_connected';

-- 最大接続数を確認
SHOW VARIABLES LIKE 'max_connections';
```

---

### 3. 大量のエラーが発生している

#### 症状

- Sentryに大量のエラーが報告される
- ユーザーからの問い合わせが増加

#### 対応手順

1. **Feature Flagで機能を無効化**

```bash
# リアルタイム更新を無効化
EXPO_PUBLIC_ENABLE_REALTIME_UPDATES=false

# プッシュ通知を無効化
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false

# アニメーションを無効化
EXPO_PUBLIC_ENABLE_ANIMATIONS=false
```

2. **Sentryでエラーの原因を特定**

- [Sentry](https://sentry.io/)にアクセス
- エラーのスタックトレースを確認
- 影響を受けているユーザー数を確認

3. **ロールバックを実行**

- 詳細は[ロールバック手順](./rollback-procedure.md)を参照

---

## ログの確認方法

### サーバーログ

```bash
# 開発環境
pnpm dev:server

# 本番環境（Vercel）
# Vercelダッシュボード → プロジェクト → Logs
```

### クライアントログ

```bash
# Expo Goのログを確認
# デバイスの設定 → 開発者オプション → ログを表示
```

### データベースログ

```bash
# MySQLのエラーログを確認
sudo tail -f /var/log/mysql/error.log
```

---

## サポート

問題が解決しない場合は、以下の情報を含めて[GitHub Issues](https://github.com/kimito-link/doin-challenge.com/issues)で報告してください：

1. **エラーメッセージ**: 完全なエラーメッセージとスタックトレース
2. **再現手順**: 問題を再現するための手順
3. **環境情報**: OS、ブラウザ、Node.jsバージョン
4. **ログ**: サーバーログ、クライアントログ、データベースログ

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| v1.0.0 | 2026-01-27 | 初版作成 |
