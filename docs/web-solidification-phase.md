# Web固めフェーズ: 設計資料

**目的**: Webを"正"として固めるため、導線・文言・状態・計測・パフォーマンスをWeb版で高速に改善し、仕様を確定してからアプリに移植する。

---

## 1. 遷移図: 作成→表示→編集の遷移

```
┌─────────────────────────────────────────────────────────────────┐
│                    チャレンジ作成フロー                           │
└─────────────────────────────────────────────────────────────────┘

[ホーム画面]
    │
    ├─「チャレンジを作成」ボタン
    │
    ↓
[チャレンジ作成画面]
    │
    ├─ ジャンル選択 (GENRES)
    │   └─ アイドル / アーティスト / Vtuber / 配信者 / バンド / ダンサー / 声優 / その他
    │
    ├─ 目的選択 (PURPOSES)
    │   └─ **ライブ・イベントのみ** (live)
    │       ※ 将来的に「配信イベント」「作品リリース」を追加予定
    │
    ├─ 基本情報入力
    │   ├─ タイトル
    │   ├─ 日時
    │   ├─ 場所（会場名 / 配信URL）
    │   ├─ 目標設定（参加予定数）
    │   └─ チケット情報（任意）
    │
    ├─ 確認画面
    │
    └─ 作成完了
        │
        ↓
[チャレンジ詳細画面] ← **ファーストビュー最適化**
    │
    ├─ 表示内容（優先順位順）
    │   ├─ 1. タイトル
    │   ├─ 2. 日時 / 場所（配信があるなら配信）
    │   ├─ 3. 参加予定数（会場/配信/両方の内訳）
    │   ├─ 4. 目標と進捗（進捗バー）
    │   ├─ 5. 参加表明CTA（常に見える）
    │   └─ 6. 応援メッセージ（下部に配置）
    │
    ├─ 参加表明ボタン
    │   └─「参加予定を表明」（※「参加する」ではない）
    │
    └─ 編集ボタン（主催者のみ）
        │
        ↓
[チャレンジ編集画面]
    │
    ├─ ジャンル選択 (GENRES)
    │   └─ 既存値を表示・編集可能
    │
    ├─ 目的選択 (PURPOSES)
    │   ├─ **新規作成時と同じ（liveのみ）**
    │   └─ **legacy値の場合**:
    │       ├─ フォールバック表示（例: 「配信イベント」→「ライブ・イベント」）
    │       └─ りんく吹き出しで説明:
    │           「現在は「ライブ・イベント」のみ対応しています。
    │            将来的に「配信イベント」「作品リリース」も追加予定です。」
    │
    ├─ 基本情報編集
    │   └─ 作成時と同じ項目
    │
    └─ 保存
        │
        ↓
[チャレンジ詳細画面]（更新後）

┌─────────────────────────────────────────────────────────────────┐
│                    マイページのジャンル選択                        │
└─────────────────────────────────────────────────────────────────┘

[マイページ]
    │
    ├─ プロフィール編集
    │   ├─ 性別選択（既存実装）
    │   ├─ ジャンル選択（新規実装）
    │   │   └─ GENRES から選択
    │   │       ├─ アイドル / アーティスト / Vtuber / 配信者 / バンド / ダンサー / 声優 / その他
    │   │       └─ 複数選択可能（将来的に）
    │   │
    │   └─ 保存ボタン
    │
    └─ 自分のチャレンジ一覧
        ├─ 作成したチャレンジ
        └─ 参加表明したチャレンジ
```

---

## 2. りんく吹き出し文言（legacy向け説明）

### 2.1. チャレンジ編集画面（legacy目的を持つ場合）

```tsx
// legacy値（streaming, release, birthday, etc.）を持つチャレンジを編集する場合

<View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
  <View className="flex-row items-start gap-3">
    {/* りんくアイコン */}
    <Image
      source={require("@/assets/images/rink-icon.png")}
      className="w-10 h-10"
    />
    
    <View className="flex-1">
      <Text className="text-sm font-semibold text-blue-900 mb-1">
        現在は「ライブ・イベント」のみ対応しています
      </Text>
      <Text className="text-xs text-blue-700 leading-relaxed">
        このチャレンジは以前の目的（{legacyPurposeLabel}）で作成されました。
        現在は「ライブ・イベント」のみ対応しており、編集時は自動的に変更されます。
        将来的に「配信イベント」「作品リリース」も追加予定です。
      </Text>
    </View>
  </View>
</View>
```

### 2.2. マイページのジャンル選択（初回設定時）

```tsx
// 初回ジャンル設定時の説明

<View className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
  <View className="flex-row items-start gap-3">
    {/* りんくアイコン */}
    <Image
      source={require("@/assets/images/rink-icon.png")}
      className="w-10 h-10"
    />
    
    <View className="flex-1">
      <Text className="text-sm font-semibold text-pink-900 mb-1">
        あなたの活動ジャンルを教えてください
      </Text>
      <Text className="text-xs text-pink-700 leading-relaxed">
        ジャンルを設定すると、同じジャンルのチャレンジが見つけやすくなります。
        後からいつでも変更できます。
      </Text>
    </View>
  </View>
</View>
```

---

## 3. SUPPORTED_PURPOSES + フォールバック最小TS

### 3.1. 型定義の更新（`constants/event-categories.ts`）

```typescript
/**
 * イベントカテゴリ定義
 * 
 * 3軸カテゴリシステム:
 * - ジャンル: アイドル/アーティスト/Vtuber/配信者など
 * - 目的: イベント/グッズ/調査/その他
 * - タグ: 自由入力のキーワード（将来実装）
 */

// ジャンル（活動ジャンル）
export const GENRES = [
  { id: "idol", label: "アイドル", icon: "🎀", color: "#EC4899" },
  { id: "artist", label: "アーティスト", icon: "🎤", color: "#8B5CF6" },
  { id: "vtuber", label: "Vtuber", icon: "🎮", color: "#06B6D4" },
  { id: "streamer", label: "配信者", icon: "📺", color: "#F59E0B" },
  { id: "band", label: "バンド", icon: "🎸", color: "#EF4444" },
  { id: "dancer", label: "ダンサー", icon: "💃", color: "#10B981" },
  { id: "voice_actor", label: "声優", icon: "🎙️", color: "#6366F1" },
  { id: "other", label: "その他", icon: "✨", color: "#64748B" },
] as const;

export type GenreId = typeof GENRES[number]["id"];

// 目的（チャレンジの目的）
// 現在はライブ動員のみに集中（将来的にstreaming/releaseを追加予定）
export const PURPOSES = [
  { id: "live", label: "ライブ・イベント", icon: "🎪", description: "ライブ、コンサート、ファンミーティングなど" },
] as const;

// 将来追加予定の目的（伏線）
// { id: "streaming", label: "配信イベント", icon: "📡", description: "YouTubeプレミア同時視聴など" },
// { id: "release", label: "作品リリース", icon: "💿", description: "漫画、楽曲、動画などの反応を見る" },

// 既存データ用のフォールバック定義（表示のみ、新規作成不可）
export const LEGACY_PURPOSES = [
  { id: "streaming", label: "配信イベント", icon: "📡", description: "YouTube配信、ミクチャ、ツイキャスなど" },
  { id: "release", label: "リリース", icon: "💿", description: "CD、DVD、グッズのリリースイベント" },
  { id: "birthday", label: "生誕祭", icon: "🎂", description: "メンバーの誕生日イベント" },
  { id: "anniversary", label: "周年イベント", icon: "🎉", description: "デビュー周年、グループ結成周年など" },
  { id: "goods", label: "グッズ・物販", icon: "🛍️", description: "グッズ販売、物販イベント" },
  { id: "survey", label: "調査・アンケート", icon: "📊", description: "ファン調査、アンケート企画" },
  { id: "other", label: "その他", icon: "📋", description: "上記に当てはまらないもの" },
] as const;

// 新規作成でサポートされる目的（現在はliveのみ）
export type SupportedPurposeId = typeof PURPOSES[number]["id"];

// 既存データで使われている可能性があるレガシー目的
export type LegacyPurposeId = typeof LEGACY_PURPOSES[number]["id"];

// 全ての目的ID（新規 + レガシー）
export type PurposeId = SupportedPurposeId | LegacyPurposeId;

// ジャンルIDからジャンル情報を取得
export function getGenreById(id: GenreId | string | null | undefined) {
  return GENRES.find((g) => g.id === id) || null;
}

// 目的IDから目的情報を取得（フォールバック対応）
export function getPurposeById(id: PurposeId | string | null | undefined) {
  // まずPURPOSESから検索
  const purpose = PURPOSES.find((p) => p.id === id);
  if (purpose) return purpose;
  
  // 見つからなければLEGACY_PURPOSESから検索（既存データ用）
  return LEGACY_PURPOSES.find((p) => p.id === id) || null;
}

// legacy目的をliveにフォールバック
export function normalizePurpose(id: PurposeId | string | null | undefined): SupportedPurposeId {
  // nullまたはundefinedの場合はliveにフォールバック
  if (!id) return "live";
  
  // サポートされている目的の場合はそのまま返す
  if (PURPOSES.some((p) => p.id === id)) {
    return id as SupportedPurposeId;
  }
  
  // legacy目的の場合はliveにフォールバック
  return "live";
}

// legacy目的かどうかを判定
export function isLegacyPurpose(id: PurposeId | string | null | undefined): boolean {
  if (!id) return false;
  return LEGACY_PURPOSES.some((p) => p.id === id);
}

// ジャンルと目的の組み合わせからラベルを生成
export function getCategoryLabel(genreId: GenreId | string | null | undefined, purposeId: PurposeId | string | null | undefined): string {
  const genre = getGenreById(genreId);
  const purpose = getPurposeById(purposeId);
  
  if (genre && purpose) {
    return `${genre.icon} ${genre.label} / ${purpose.icon} ${purpose.label}`;
  } else if (genre) {
    return `${genre.icon} ${genre.label}`;
  } else if (purpose) {
    return `${purpose.icon} ${purpose.label}`;
  }
  return "カテゴリ未設定";
}
```

### 3.2. データベーススキーマの更新（`drizzle/schema/challenges.ts`）

```typescript
export const challenges = mysqlTable("challenges", {
  // ... 既存フィールド
  
  // 目的（現在はliveのみサポート）
  purpose: mysqlEnum("purpose", ["live"]).default("live"),
  
  // ... 既存フィールド
});
```

### 3.3. チャレンジ作成時のpurpose保存（`server/db/challenge-db.ts`）

```typescript
export async function createEvent(data: {
  // ... 既存フィールド
  purpose?: string;
}) {
  // purposeをliveに正規化（legacy値が渡された場合もliveにフォールバック）
  const normalizedPurpose = normalizePurpose(data.purpose);
  
  const result = await db.execute(sql`
    INSERT INTO challenges (
      -- ... 既存フィールド
      purpose,
      -- ... 既存フィールド
    ) VALUES (
      -- ... 既存値
      ${normalizedPurpose},
      -- ... 既存値
    )
  `);
  
  return result;
}
```

### 3.4. チャレンジ編集時のlegacy対応（`features/create/hooks/use-create-challenge.ts`）

```typescript
// チャレンジ編集時のpurpose取得
const challenge = await trpc.events.getById.query({ id: challengeId });

// legacy目的の場合はフォールバックしてUIに警告表示
const isLegacy = isLegacyPurpose(challenge.purpose);
const displayPurpose = normalizePurpose(challenge.purpose);

if (isLegacy) {
  // りんく吹き出しで説明を表示
  const legacyPurposeLabel = getPurposeById(challenge.purpose)?.label || "不明";
  showLegacyPurposeWarning(legacyPurposeLabel);
}

// フォーム初期値
const initialState = {
  // ... 既存フィールド
  purpose: displayPurpose, // liveに正規化された値
  // ... 既存フィールド
};
```

---

## 4. 実装順序（着手順）

### 4.1. B: 目標作成フォーム（優先）

1. データベースに`purpose`カラムを追加（`mysqlEnum`で`live`のみサポート）
2. チャレンジ作成時に`purpose`を保存する実装
3. 既存データの`purpose`を`null`または`live`にフォールバック

**理由**: まず作成側で正規データを作り、legacy値を表示のみ許可にして事故を防ぐ

### 4.2. A: マイページのジャンル選択（次）

1. マイページのジャンル選択UIを実装
2. legacy値を持つ場合のフォールバック表示
3. りんく吹き出しで説明（編集はliveのみ）

**理由**: 既存ユーザーの表示崩れ（legacy）を吸収する

---

## 5. 文言の統一（誇張しない）

| 変更前 | 変更後 | 理由 |
|--------|--------|------|
| 「参加者数」 | 「参加予定数」 | 実参加ではなく予定を表明 |
| 「動員」 | 「会場参加予定」 | 誇張を避ける |
| 「同接」 | 「配信視聴予定」 | 誇張を避ける |
| 「達成率」 | 「進捗」 | ニュートラルな表現 |
| 「参加する」 | 「参加予定を表明」 | 正確な意味を伝える |

---

## 6. 表示状態の統一

| 状態 | 表示方法 | 実装 |
|------|----------|------|
| 初回ロード | スケルトン | `<Skeleton />` |
| データあり | 即表示 | 通常レンダリング |
| 裏更新 | 小インジケータ | スケルトン禁止 |
| 空状態 | りんく吹き出し＋次アクション | `<EmptyState />` |
| エラー | 復帰導線（再読み込み/戻る） | `<ErrorState />` |

---

## 7. 次のステップ

1. **Phase 15**: データベースに`purpose`カラムを追加し、チャレンジ作成時に保存
2. **Phase 16**: マイページのジャンル選択UIを実装し、legacy対応
3. **Phase 17**: チャレンジ詳細画面のファーストビュー最適化
4. **Phase 18**: 参加表明フローの完了演出実装
5. **Phase 19**: ホームカードの情報整理（最大5つに固定）

---

## 8. 参考: 直す順番（全体）

①チャレンジ詳細 → ②参加表明（完了演出含む）→ ③ホームカード → ④チャレンジ作成 → ⑤認証/オンボーディング → ⑥招待 → ⑦マイページ

**理由**:
- 「判断材料」になるのは詳細画面（日時/場所/目標/進捗/参加内訳）
- 次に重要なのは参加表明の完了体験（"可視化"が気持ちよく終わる）
- ホームは入口だけど、詳細が弱いと改善が空回りする
