# コンポーネントアーキテクチャ（Atomic Design）

このプロジェクトでは、Atomic Designパターンに基づいてコンポーネントを整理しています。

## ディレクトリ構成

```
components/
├── atoms/           # 基本UI要素（Button, Input, Text, Icon等）
├── molecules/       # 複合コンポーネント（Card, Avatar, ListItem等）
├── organisms/       # 機能単位コンポーネント（Header, TicketTransfer等）
├── templates/       # ページレイアウト（将来追加予定）
└── ui/              # 既存のUIコンポーネント（段階的に移行）
```

## Atoms（原子）

最小単位のUIコンポーネント。単独で意味を持ち、他のコンポーネントの構成要素となります。

| コンポーネント | 説明 |
|--------------|------|
| Button | 基本ボタン（variant: primary/secondary/ghost/danger） |
| LoadingButton | ローディング状態付きボタン |
| HoverableButton | ホバー効果付きボタン |
| Input | テキスト入力フィールド |
| Textarea | 複数行テキスト入力 |
| Text | スタイル付きテキスト |
| Badge | ステータスバッジ |
| IconSymbol | アイコン表示 |
| Skeleton | ローディングスケルトン |
| Toast | 通知トースト |

## Molecules（分子）

Atomsを組み合わせた再利用可能なコンポーネント。

| コンポーネント | 説明 |
|--------------|------|
| Card | カードコンテナ（Header, Footer付き） |
| HoverableCard | ホバー効果付きカード |
| PressableCard | プレス効果付きカード |
| LazyImage/LazyAvatar | 遅延読み込み画像 |
| OptimizedImage/OptimizedAvatar | 最適化画像 |
| HoverableListItem | ホバー効果付きリストアイテム |

## Organisms（有機体）

特定の機能を持つ大きなコンポーネント。

| コンポーネント | 説明 |
|--------------|------|
| AppHeader | アプリヘッダー |
| TicketTransferSection | チケット譲渡セクション |
| NetworkError | ネットワークエラー表示 |
| EmptyState | 空状態表示 |
| ErrorMessage | エラーメッセージ表示 |
| OfflineBanner | オフラインバナー |

## 使用方法

### Atomsからのインポート

```tsx
import { Button, Input, Badge } from "@/components/atoms";
```

### Moleculesからのインポート

```tsx
import { Card, CardHeader, LazyAvatar } from "@/components/molecules";
```

### Organismsからのインポート

```tsx
import { AppHeader, TicketTransferSection } from "@/components/organisms";
```

## 設計原則

1. **単一責任**: 各コンポーネントは1つの責任のみを持つ
2. **再利用性**: 汎用的に使えるよう設計
3. **一貫性**: デザインシステムに従った統一されたスタイル
4. **アクセシビリティ**: タッチターゲット44px以上、適切なコントラスト比
5. **パフォーマンス**: 遅延読み込み、メモ化の活用

## 今後の予定

- [ ] Templates（ページレイアウト）の追加
- [ ] 既存コンポーネントの段階的な移行
- [ ] Storybookの導入（コンポーネントカタログ）
