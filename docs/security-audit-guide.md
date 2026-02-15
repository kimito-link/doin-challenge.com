# セキュリティ監査ガイド

## 概要

このドキュメントでは、birthday-celebrationアプリのセキュリティを監査し、脆弱性を修正するためのガイドラインを提供します。

## セキュリティチェックリスト

### 1. 認証とセッション管理

#### ✅ 実装済み
- Auth0統合によるプロ仕様のOAuth 2.0 / OpenID Connect認証
- セッショントークンのセキュアな保存（SecureStore / Cookie）
- HTTPS通信の強制

#### 🔍 確認事項
- [ ] セッションタイムアウトの設定
- [ ] リフレッシュトークンの適切な管理
- [ ] ログアウト時のトークン無効化

### 2. 入力値の検証

#### ✅ 実装済み
- Zodによる型安全なバリデーション
- tRPCによるAPI入力値の自動検証

#### 🔍 確認事項
- [ ] 全てのユーザー入力に対するバリデーション
- [ ] SQLインジェクション対策（Drizzle ORMによる自動エスケープ）
- [ ] XSS対策（React / React Nativeによる自動エスケープ）

### 3. 認可とアクセス制御

#### ✅ 実装済み
- ユーザーロールベースのアクセス制御（user / admin）
- 認証ミドルウェアによるAPI保護

#### 🔍 確認事項
- [ ] 全てのAPIエンドポイントに認証が必要か確認
- [ ] ユーザーが自分のデータのみにアクセスできることを確認
- [ ] 管理者機能が適切に保護されているか確認

### 4. データ保護

#### ✅ 実装済み
- パスワードのハッシュ化（Auth0による管理）
- HTTPS通信による暗号化

#### 🔍 確認事項
- [ ] 機密情報がログに出力されていないか確認
- [ ] データベースの暗号化設定
- [ ] バックアップの暗号化

### 5. レート制限

#### ✅ 実装済み
- `server/lib/security.ts`にレート制限ミドルウェアを実装

#### 🔍 確認事項
- [ ] ログインエンドポイントにレート制限を適用
- [ ] API全体にレート制限を適用
- [ ] DDoS攻撃対策

### 6. CSRF対策

#### ✅ 実装済み
- `server/lib/security.ts`にCSRFトークン検証を実装
- SameSite Cookieの設定

#### 🔍 確認事項
- [ ] 全ての状態変更APIにCSRFトークンを適用
- [ ] Cookieの設定が適切か確認

### 7. セキュアヘッダー

#### ✅ 実装済み
- `server/lib/security.ts`にセキュリティヘッダーを実装
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
  - Strict-Transport-Security
  - Content-Security-Policy

#### 🔍 確認事項
- [ ] 全てのレスポンスにセキュリティヘッダーが適用されているか確認

## 脆弱性スキャン

### 1. 依存関係の脆弱性

```bash
# npm auditで脆弱性をスキャン
pnpm audit

# 自動修正
pnpm audit fix
```

### 2. コードの静的解析

```bash
# ESLintでセキュリティルールを有効化
pnpm lint
```

### 3. 手動セキュリティレビュー

#### 認証フロー
1. ログイン画面でAuth0にリダイレクト
2. Auth0でTwitter認証
3. コールバックURLでトークンを受け取る
4. バックエンドでトークンを検証
5. セッションを確立

**確認ポイント:**
- [ ] トークン検証が適切に行われているか
- [ ] セッションが安全に保存されているか
- [ ] ログアウト時にセッションが削除されているか

#### API保護
1. 全てのAPIエンドポイントに認証ミドルウェアを適用
2. ユーザーIDをセッションから取得
3. リクエストされたリソースの所有者を確認

**確認ポイント:**
- [ ] 認証されていないリクエストが拒否されるか
- [ ] 他のユーザーのデータにアクセスできないか
- [ ] 管理者機能が適切に保護されているか

## セキュリティベストプラクティス

### 1. 環境変数の管理

**❌ 悪い例**
```typescript
const apiKey = "hardcoded-api-key";
```

**✅ 良い例**
```typescript
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("API_KEY is required");
```

### 2. エラーメッセージ

**❌ 悪い例**
```typescript
catch (error) {
  res.status(500).json({ error: error.message, stack: error.stack });
}
```

**✅ 良い例**
```typescript
catch (error) {
  logger.error("Error processing request", error);
  res.status(500).json({ error: "Internal server error" });
}
```

### 3. SQL injection対策

**❌ 悪い例**
```typescript
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**✅ 良い例**
```typescript
// Drizzle ORMを使用（自動エスケープ）
const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
```

### 4. XSS対策

**❌ 悪い例**
```typescript
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**✅ 良い例**
```typescript
<div>{userInput}</div> {/* Reactが自動エスケープ */}
```

### 5. パスワード管理

**✅ 良い例（Auth0使用）**
- Auth0がパスワードのハッシュ化を自動的に行う
- パスワードリセット機能も提供
- 多要素認証のサポート

### 6. ファイルアップロード

**セキュリティ対策:**
```typescript
// ファイルタイプの検証
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!allowedTypes.includes(file.type)) {
  throw new Error("Invalid file type");
}

// ファイルサイズの制限
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  throw new Error("File too large");
}

// ファイル名のサニタイズ
const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
```

## インシデント対応

### 1. セキュリティインシデントの検出

**監視項目:**
- 異常なログインパターン
- 大量のAPIリクエスト
- 不正なアクセス試行
- データベースの異常なクエリ

### 2. インシデント対応手順

1. **検出**: ログとアラートで異常を検出
2. **封じ込め**: 影響を受けたアカウントを一時停止
3. **調査**: ログを分析して原因を特定
4. **修正**: 脆弱性を修正
5. **復旧**: サービスを再開
6. **事後分析**: インシデントを文書化し、再発防止策を実施

### 3. ログ記録

**重要なイベント:**
- ログイン成功/失敗
- パスワード変更
- 権限変更
- データの作成/更新/削除
- APIエラー

**実装例:**
```typescript
import { logger } from '@/server/lib/logger';

// ログイン成功
logger.info('User logged in', { userId, email, ip: req.ip });

// ログイン失敗
logger.warn('Login failed', { email, ip: req.ip, reason: 'Invalid password' });

// 権限変更
logger.info('User role changed', { userId, oldRole, newRole, changedBy: adminId });
```

## セキュリティテスト

### 1. 認証テスト

```typescript
describe('Authentication', () => {
  it('should reject unauthenticated requests', async () => {
    const response = await request(app).get('/api/protected');
    expect(response.status).toBe(401);
  });

  it('should accept authenticated requests', async () => {
    const token = await getValidToken();
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it('should reject expired tokens', async () => {
    const expiredToken = await getExpiredToken();
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(response.status).toBe(401);
  });
});
```

### 2. 認可テスト

```typescript
describe('Authorization', () => {
  it('should allow users to access their own data', async () => {
    const token = await getUserToken(userId);
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it('should prevent users from accessing other users data', async () => {
    const token = await getUserToken(userId1);
    const response = await request(app)
      .get(`/api/users/${userId2}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it('should allow admins to access all data', async () => {
    const token = await getAdminToken();
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
```

### 3. 入力値検証テスト

```typescript
describe('Input Validation', () => {
  it('should reject invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'invalid-email', password: 'password123' });
    expect(response.status).toBe(400);
  });

  it('should reject SQL injection attempts', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: "'; DROP TABLE users; --", password: 'password123' });
    expect(response.status).toBe(400);
  });

  it('should reject XSS attempts', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ content: '<script>alert("XSS")</script>' });
    expect(response.status).toBe(400);
  });
});
```

## 定期的なセキュリティレビュー

### 月次チェックリスト
- [ ] 依存関係の脆弱性スキャン
- [ ] アクセスログのレビュー
- [ ] 異常なアクティビティの確認
- [ ] セキュリティパッチの適用

### 四半期チェックリスト
- [ ] 包括的なセキュリティ監査
- [ ] ペネトレーションテスト
- [ ] セキュリティポリシーのレビュー
- [ ] インシデント対応計画の更新

## まとめ

セキュリティは継続的なプロセスです。定期的に監査を行い、脆弱性を修正し、ベストプラクティスに従うことで、安全なアプリケーションを維持できます。

**次のステップ:**
1. セキュリティチェックリストを完了
2. 脆弱性スキャンを実行
3. セキュリティテストを追加
4. インシデント対応計画を策定
