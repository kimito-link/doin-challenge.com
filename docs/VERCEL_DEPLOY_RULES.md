# Vercelデプロイルール

このドキュメントは、Vercelデプロイエラーの再発を防ぐためのルールをまとめたものです。

---

## 🚫 禁止事項

### 1. 動的require()の使用禁止

**NG例**:
```tsx
// ❌ 動的require()は使用しない
const image = require(`@/assets/images/${filename}.png`);
```

**OK例**:
```tsx
// ✅ 静的マッピングオブジェクトを使用
const IMAGES = {
  image1: require("@/assets/images/image1.png"),
  image2: require("@/assets/images/image2.png"),
};

const image = IMAGES[filename];
```

**理由**: Vercelのビルド環境では、動的なrequire()がSyntaxErrorを引き起こします。

---

## ✅ デプロイ前チェックリスト

デプロイ前に以下を確認してください：

1. **動的require()の検索**:
   ```bash
   grep -rn 'require(`' --include="*.ts" --include="*.tsx" app/ components/ hooks/ lib/ features/
   ```
   
2. **TypeScriptエラーの確認**:
   ```bash
   pnpm check
   ```

3. **ローカルビルドの成功確認**:
   ```bash
   pnpm build
   ```

---

## 📝 過去のエラー事例

### 2026-02-01: LoginModal.tsx / WelcomeMessage.tsx

**問題**:
- `LoginModal.tsx`と`WelcomeMessage.tsx`で動的require()を使用
- Vercelデプロイ時にSyntaxErrorが発生

**解決方法**:
- `CHARACTER_IMAGES`オブジェクトを作成し、静的マッピングに変更

**修正コミット**: 3955914f

---

## 🔧 トラブルシューティング

### Vercelデプロイが失敗した場合

1. **Build Logsを確認**:
   - Vercelダッシュボード → Deployments → Build Logs
   - SyntaxErrorやInvalid characterエラーを探す

2. **動的require()を検索**:
   ```bash
   grep -rn 'require(`' --include="*.ts" --include="*.tsx" app/ components/ hooks/ lib/ features/
   ```

3. **修正後、チェックポイントを保存**:
   - `webdev_save_checkpoint`を実行
   - GitHubに自動pushされる

4. **デプロイ結果を確認**:
   - Vercelダッシュボードで最新のデプロイを確認
   - 成功するまで待機（通常3〜5分）

---

## 📚 参考資料

- [Vercel Build Configuration](https://vercel.com/docs/build-step)
- [React Native require() Best Practices](https://reactnative.dev/docs/images#static-image-resources)
