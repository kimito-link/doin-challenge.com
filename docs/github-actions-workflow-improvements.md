# GitHub Actionsワークフロー改善

**作成日**: 2026-02-16  
**目的**: Vercelデプロイの信頼性と精度を向上させる

## 🔧 実施した改善

### 1. vercel-actionの削除とVercel CLI直接実行への移行

**問題点**:
- `amondnet/vercel-action@v25`が「Unexpected error. Please try again later.」エラーを引き起こしていた
- エラーメッセージが不明瞭で、デバッグが困難

**解決策**:
- vercel-actionを削除
- Vercel CLI（`vercel deploy`）を直接実行
- 詳細なログ出力を追加

**変更内容**:
```yaml
- name: Install Vercel CLI
  run: npm install --global vercel@latest

- name: Pull Vercel Environment Information
  run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

- name: Deploy to Vercel (with retry)
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  run: |
    # デプロイスクリプト（リトライ機能付き）
```

### 2. リトライ機能の実装

**問題点**:
- 一時的なネットワークエラーやVercelサーバーの問題でデプロイが失敗していた
- 1回の失敗でワークフロー全体が停止していた

**解決策**:
- 最大3回までデプロイを再試行
- 各試行の間に30秒の待機時間を設定
- 詳細なログ出力で問題の特定を容易に

**実装**:
```bash
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "📦 Deployment attempt $((RETRY_COUNT + 1))/$MAX_RETRIES"
  
  if vercel deploy --prod --token=$VERCEL_TOKEN 2>&1 | tee deploy.log; then
    echo "✅ Deployment successful!"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "⚠️ Deployment failed. Retrying in 30 seconds..."
      sleep 30
    else
      echo "❌ Deployment failed after $MAX_RETRIES attempts."
      exit 1
    fi
  fi
done
```

### 3. デプロイ前のヘルスチェック

**目的**:
- デプロイ前に本番環境の状態を確認
- 既存の問題を早期に検出

**実装**:
```yaml
- name: Pre-deploy health check
  run: |
    echo "🏥 Checking production health before deploy..."
    HEALTH=$(curl -s https://doin-challenge.com/api/health || echo "{}")
    OK=$(echo "$HEALTH" | jq -r '.ok // false')
    if [[ "$OK" == "true" ]]; then
      echo "✅ Production is healthy before deploy"
    else
      echo "⚠️ Production health check failed, but continuing with deploy"
      echo "Health response: $HEALTH"
    fi
```

### 4. Post-deploy verifyの最適化

**問題点**:
- 10分間の待機時間が長すぎた
- Railwayのビルドを待つ必要があったが、Vercelのデプロイは独立している

**解決策**:
- 待機時間を10分から3分に短縮
- RailwayとVercelのデプロイは並行して実行されるため、Vercelのデプロイ完了後すぐに検証を開始

**変更**:
```bash
sleep 180  # 3分: デプロイの伝播を待つ（Railwayは並行してビルド中）
```

### 5. デプロイURLの取得と出力

**目的**:
- デプロイされたURLを環境変数に保存
- 後続のステップで使用可能にする

**実装**:
```bash
VERCEL_URL=$(grep -oP 'https://[^\s]+\.vercel\.app' deploy.log | head -1 || echo "")
if [ -n "$VERCEL_URL" ]; then
  echo "🌐 Deployment URL: $VERCEL_URL"
  echo "VERCEL_URL=$VERCEL_URL" >> $GITHUB_ENV
fi
```

## 📊 改善の効果

### Before（改善前）
- ❌ vercel-actionが「Unexpected error」で失敗
- ❌ エラーメッセージが不明瞭
- ❌ リトライ機能なし
- ❌ 10分間の長い待機時間

### After（改善後）
- ✅ Vercel CLI直接実行で詳細なログ出力
- ✅ 最大3回のリトライ機能
- ✅ デプロイ前のヘルスチェック
- ✅ 3分間の最適化された待機時間
- ✅ デプロイURLの自動取得

## 🔍 トラブルシューティング

### デプロイが失敗する場合

1. **Vercel Secretsの確認**
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

2. **Vercel環境変数の確認**
   - Auth0の環境変数が設定されているか
   - すべての環境変数がAll Environmentsに設定されているか

3. **ログの確認**
   - GitHub Actionsのログで詳細なエラーメッセージを確認
   - `deploy.log`の内容を確認

### リトライが3回とも失敗する場合

- Vercelのステータスページを確認（https://www.vercel-status.com/）
- Vercelのダッシュボードで手動デプロイを試す
- Vercel CLIのバージョンを確認（`vercel --version`）

## 📚 参考資料

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**最終更新**: 2026-02-16  
**担当者**: Manus AI Agent
