# 生誕祭応援アプリ (doin-challenge.com)

推しの生誕祭を応援するためのWebアプリケーション。

---

## 開発ガイド

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

### テスト

```bash
# 全テスト実行
pnpm test

# 特定のテスト実行
pnpm test path/to/test.test.ts
```

---

## Phase 2: ログインUX改善

Phase 2（ログインUX改善）を実装する場合は、**必ず以下のガイドに従ってください**：

📄 **[Phase 2実装ガイド](./docs/phase2-implementation-guide.md)**

### 重要な原則

- **思想**: 迷わない／怖がらず／戻ってこれる
- **前提**: login()は黒箱、成否はAuth Context、外部遷移必須
- **ポリシー**: OAuth触らない、自動login禁止、FSM管理

### 実装順序

1. **PR-1**: FSMの器だけ（idle/confirmだけ、login呼ばない）
2. **PR-2**: redirecting（login呼ぶが、waitingReturnは"ただの画面"でOK）
3. **PR-3**: waitingReturn + 成否検知（Auth Context監視・AppState復帰・タイムアウト）
4. **PR-4**: cancel画面（retry/back導線）
5. **PR-5**: error画面（auth.error表示を「短文」に整形）
6. **PR-6**: success画面 + 自動close（短い演出）
7. **PR-7**: 二重導線整理（トップ/メニューのログイン導線を「1つの入口」に統一）

### PRマージ前の必須チェック

- ✅ Vercel Production の Commit SHA と GitHub main の HEAD が一致している
- ✅ 本番環境でログイン機能が正常動作している
- ✅ diff-check CIが通過している

### NG集（触ってはいけないファイル）

- `app/oauth/**`
- `server/twitter*`
- `hooks/use-auth.ts`
- `lib/auth-provider.tsx`
- OAuth callback画面/ルート

詳細は[Phase 2実装ガイド](./docs/phase2-implementation-guide.md)を参照してください。

---

## プロジェクト構成

```
.
├── app/                    # Next.jsアプリケーション
├── components/             # Reactコンポーネント
│   └── auth-ux/           # Phase 2: ログインUX改善コンポーネント
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ
├── server/                 # バックエンドサーバー
├── docs/                   # ドキュメント
│   ├── phase2-implementation-guide.md
│   ├── phase2-pr0-readme-update.md
│   └── phase2-pr1-guide.md
└── .github/
    └── workflows/
        └── phase2-diff-check.yml  # Phase 2 CI保護
```

---

## ライセンス

MIT
