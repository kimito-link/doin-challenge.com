# Project TODO

## v6.70: オンボード画面のバージョン表示、地図の表示改善、応援メッセージと貢献度ランキングのデザイン統一

### Phase 1: オンボード画面にバージョン表示を追加
- [x] オンボード画面のコンポーネントを確認
- [x] バージョン情報を取得する関数を実装
- [x] オンボード画面にバージョン表示を追加

### Phase 2: 地図の表示を全画面サイズで綺麗に調整
- [x] 都道府県別参加者の地図コンポーネントを確認
- [x] 地図のレイアウトを修正（画面サイズに応じて調整）
- [x] 地図のアスペクト比を調整
- [x] 地図の余白を削除

### Phase 3: 応援メッセージと貢献度ランキングのデザイン統一 + サイト全体のトンマナ統一
- [x] 応援メッセージ画面の現在の実装を確認
- [x] 貢献度ランキング画面の現在の実装を確認
- [x] 性別選択コンポーネントを黒ベースのカードデザインに統一
- [x] サイト全体のデザインパターンを調査
- [x] デザインシステム統一ガイドを作成（docs/design-system-unification.md）
- [x] ContributionRankingのborderRadiusを8→12に統一
- [x] RegionMapを黒ベースのカードデザインに統一
- [x] CompanionListを黒ベースのカードデザインに統一

### Phase 4: マイページと主催者カードのデザイン統一
- [x] マイページのTwitterカードコンポーネントを特定（ProfileCard.tsx）
- [x] 主催者カードコンポーネントを特定（EventHeader.tsx）
- [x] マイページのTwitterカードを黒ベースのデザインに統一
- [x] 主催者カードを黒ベースのデザインに統一

### Phase 5: 招待リンク生成の問題修正
- [x] 招待リンク生成コンポーネントを特定（app/invite/[id].tsx）
- [x] 招待リンク生成のAPI呼び出しを確認（invitations.create）
- [x] 招待リンクのドメインを修正（douin-challenge.app → doin-challenge.com）
- [x] QRコードの生成ロジックを確認（現在は静的アイコン表示）

### Phase 6: バージョン情報とコピーライトのコンポーネント化
- [x] 現在のバージョン情報表示箇所を特定（features/settings/components/SettingsSections.tsx）
- [x] バージョン情報とコピーライトの共通コンポーネントを作成（components/atoms/app-footer.tsx）
- [x] コピーライトを「© 動員ちゃれんじ」に変更（年は入れない）
- [x] 設定画面を共通コンポーネントに置き換え

### Phase 7: TypeScriptエラーを修正
- [x] tests/auth.logout.test.tsのgenderフィールドを追加

### Phase 8: ホーム画面のスワイプ挙動を調査・修正
- [x] ホーム画面のスワイプ挙動を調査
- [x] ランキング画面（チャレンジページ）の正常な挙動を参考にする
- [x] スワイプ時のコンテンツズレを修正（ScrollViewをViewに変更）
- [x] 全画面で同じ挙動のトンマナに統一

### Phase 9: 数字入力欄に入力補助を追加
- [x] 数値入力フィールドを全て検索
- [x] 前売り券・当日券の入力欄にinputMode="numeric"を追加（TicketInfoSection.tsx, event/edit/[id].tsx）
- [x] Gender型の定義を簡素化してAPIと整合性を保つ

### Phase 10: マイページで性別を設定できるようにする
- [x] usersテーブルにgenderフィールドを追加（drizzle/schema/users.ts）
- [x] マイページの現在の実装を確認
- [x] 性別選択UIコンポーネントを作成（GenderSection.tsx）
- [x] マイページに性別選択UIを追加（AuthenticatedContent.tsx）
- [x] 性別データを保存するAPIを実装（profiles.updateGender）
- [x] クライアント側のAuth.User型にgenderフィールドを追加
- [x] 楽観更新とinvalidateを実装（GPTの推奨実装に従う）

### Phase 10: 招待リンクのQRコード生成を実装
- [x] react-native-qrcode-svgライブラリをインストール
- [x] 招待画面のQRコード表示部分を修正
- [x] 実際のQRコードを生成する機能を実装（ロゴ付き）

### Phase 11: 主催者の性別による色分けを実装
- [x] ホーム画面のチャレンジカードコンポーネントを特定（features/home/components/ChallengeCard.tsx）
- [x] 主催者の性別データを取得する方法を確認（マイページで設定）
- [x] Challenge型にhostGenderフィールドを追加
- [x] challengesテーブルにhostGenderカラムを追加（マイグレーション実行済み）
- [x] getAllEvents関数でusersテーブルとLEFT JOINしてhostGenderを取得
- [x] 主催者の性別に応じた枠線の色分けを実装（左側に2pxの色付きボーダー）

### Phase 6: チェックポイント保存とデプロイ
- [ ] チェックポイント保存
- [ ] GitHubへのpush
