# パフォーマンス最適化チェックリスト

## 概要

このドキュメントは、Web版リリース前に確認すべきパフォーマンス最適化項目をリスト化したものです。

## 1. ページ読み込み速度の最適化

### 1.1 初回表示速度（LCP: Largest Contentful Paint）

**目標: 3秒以内**

- [ ] ホーム画面のLCPが3秒以内
- [ ] イベント詳細画面のLCPが3秒以内
- [ ] マイページのLCPが3秒以内

**最適化手法:**
- [ ] 画像の遅延読み込み（Lazy Loading）
- [ ] 画像の最適化（WebP形式、適切なサイズ）
- [ ] フォントの最適化（font-display: swap）
- [ ] CSSの最小化
- [ ] JavaScriptの最小化

### 1.2 インタラクティブまでの時間（TTI: Time to Interactive）

**目標: 5秒以内**

- [ ] ホーム画面のTTIが5秒以内
- [ ] イベント詳細画面のTTIが5秒以内
- [ ] マイページのTTIが5秒以内

**最適化手法:**
- [ ] JavaScriptの分割読み込み（Code Splitting）
- [ ] 不要なJavaScriptの削除
- [ ] サードパーティスクリプトの最適化

### 1.3 累積レイアウトシフト（CLS: Cumulative Layout Shift）

**目標: 0.1以下**

- [ ] ホーム画面のCLSが0.1以下
- [ ] イベント詳細画面のCLSが0.1以下
- [ ] マイページのCLSが0.1以下

**最適化手法:**
- [ ] 画像のwidth/heightを明示
- [ ] フォントの読み込み最適化
- [ ] 動的コンテンツの領域確保

---

## 2. メモリ使用量の最適化

### 2.1 メモリリーク対策

- [ ] useEffectのクリーンアップ関数を実装
- [ ] イベントリスナーの適切な削除
- [ ] タイマーの適切なクリア
- [ ] 不要なデータのキャッシュ削除

### 2.2 FlatListの最適化

- [ ] React.memo()でメモ化
- [ ] renderItemをuseCallback()で最適化
- [ ] keyExtractorを最適化
- [ ] initialNumToRender / windowSizeを最適化
- [ ] removeClippedSubviews（Android）を有効化

### 2.3 画像の最適化

- [ ] expo-imageに統一
- [ ] プレースホルダを軽量化
- [ ] 画像のキャッシュ戦略を最適化
- [ ] 不要な画像の削除

---

## 3. ネットワーク最適化

### 3.1 APIリクエストの最適化

- [ ] 不要なAPIリクエストを削除
- [ ] APIリクエストをバッチ化
- [ ] キャッシュ戦略を最適化（TanStack Query）
- [ ] リクエストの並列化

### 3.2 データ転送量の削減

- [ ] レスポンスデータの最小化
- [ ] 圧縮（gzip/brotli）を有効化
- [ ] 不要なフィールドを削除
- [ ] ページネーションを実装

### 3.3 リアルタイム更新の最適化

- [ ] Polling間隔を最適化（現在: 30秒）
- [ ] Feature Flagで無効化できる
- [ ] バックグラウンドでの更新を停止

---

## 4. レンダリングパフォーマンスの最適化

### 4.1 不要な再レンダリングの防止

- [ ] React.memo()を適切に使用
- [ ] useMemo()を適切に使用
- [ ] useCallback()を適切に使用
- [ ] 状態管理を最適化（不要な状態を削除）

### 4.2 アニメーションの最適化

- [ ] react-native-reanimatedを使用
- [ ] 60FPSを維持
- [ ] アニメーションの持続時間を最適化（80-300ms）
- [ ] Feature Flagで無効化できる

### 4.3 スクロールパフォーマンスの最適化

- [ ] FlatListを使用（ScrollView + .map()を避ける）
- [ ] スクロール中のアニメーションを停止
- [ ] スクロール中の画像読み込みを最適化

---

## 5. バンドルサイズの最適化

### 5.1 JavaScriptバンドルサイズ

**目標: 500KB以下（gzip後）**

- [ ] 不要な依存関係を削除
- [ ] Tree Shakingを有効化
- [ ] Code Splittingを実装
- [ ] 動的インポートを使用

### 5.2 画像アセットサイズ

**目標: 合計10MB以下**

- [ ] 画像を最適化（WebP形式）
- [ ] 不要な画像を削除
- [ ] 画像をCDNから配信

---

## 6. パフォーマンス測定ツール

### 6.1 Lighthouse

- [ ] ホーム画面のスコアが90以上
- [ ] イベント詳細画面のスコアが90以上
- [ ] マイページのスコアが90以上

### 6.2 Chrome DevTools

- [ ] Performance Insightsで問題を特定
- [ ] Network Panelでリクエストを確認
- [ ] Memory Profilerでメモリリークを確認

### 6.3 React DevTools Profiler

- [ ] 不要な再レンダリングを特定
- [ ] レンダリング時間を測定
- [ ] コンポーネントのパフォーマンスを最適化

---

## 7. 実装済みの最適化

### 7.1 FlatListの標準最適化（v6.96）

- [x] React.memo(MessageCard)
- [x] renderItemをuseCallback
- [x] keyExtractorをID固定
- [x] initialNumToRender / windowSizeを明示
- [x] Androidだけ removeClippedSubviews

### 7.2 画像表示の最適化（v6.97）

- [x] expo-imageに統一
- [x] プレースホルダを軽量化（デフォルトをsolidに変更）
- [x] 画像のチラつきを防止

### 7.3 レスポンシブデザインの最適化（v6.97）

- [x] 3ブレークポイント（Mobile/Tablet/Desktop）に固定
- [x] イベント詳細画面にmaxWidthを追加

---

## 8. 今後の改善点

### 8.1 短期（1週間以内）

- [ ] Lighthouseスコアを測定
- [ ] パフォーマンスのボトルネックを特定
- [ ] 優先度の高い最適化を実施

### 8.2 中期（1ヶ月以内）

- [ ] WebSocketによるリアルタイム更新（Pollingの置き換え）
- [ ] Service Workerによるオフライン対応
- [ ] CDNの導入

### 8.3 長期（3ヶ月以内）

- [ ] SSR（Server-Side Rendering）の導入
- [ ] Edge Computingの活用
- [ ] パフォーマンス監視の自動化

---

## まとめ

### 重要なポイント

1. **LCPを3秒以内に**: 初回表示速度が最も重要
2. **FlatListを最適化**: スクロールパフォーマンスが体感速度に直結
3. **画像を最適化**: 画像が最大のボトルネック
4. **不要な再レンダリングを防止**: React.memo/useMemo/useCallbackを適切に使用
5. **Feature Flagで無効化**: 重い機能を即OFFできる

### 測定方法

- **Lighthouse**: 総合的なパフォーマンススコア
- **Chrome DevTools**: 詳細なパフォーマンス分析
- **React DevTools Profiler**: Reactコンポーネントのパフォーマンス分析
- **実機テスト**: 実際のユーザー環境での動作確認
