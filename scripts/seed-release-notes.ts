/**
 * Seed Release Notes
 * 
 * 既存のリリースノートデータをデータベースに挿入
 */

import { getDb } from "../server/db/connection";
import { releaseNotes } from "../drizzle/schema";

const releaseNotesData = [
  {
    version: "v6.172",
    date: "2026-02-01",
    title: "アカウント情報表示の統一と男女別色分けの実装",
    changes: [
      { type: "new", text: "ユーザープロフィールヘッダーに男女別の色分けを追加（男性：青系、女性：ピンク系）" },
      { type: "improve", text: "アカウント情報表示を統一し、すべての箇所で同じデザインを使用" },
      { type: "improve", text: "リリースノートをデータベースで管理し、動的に表示" },
      { type: "improve", text: "サーバーのcron設定を追加（古いデータの削除、統計データの集計）" },
    ],
  },
  {
    version: "v6.171",
    date: "2026-02-01",
    title: "デプロイ前チェックリストの追加とTypeScriptエラーの修正",
    changes: [
      { type: "new", text: "デプロイ前チェックリストを追加（README.md、docs/DEPLOY.md）" },
      { type: "fix", text: "LoginModalとWelcomeMessageの動的require()エラーを修正" },
      { type: "fix", text: "TypeScriptエラーを修正（app/invite/[id].tsx、app/oauth/twitter-callback.tsx）" },
    ],
  },
  {
    version: "v6.160",
    date: "2025-01-29",
    title: "アップデート履歴とバージョン表示の改善",
    changes: [
      { type: "new", text: "メニューから「アップデート履歴」を確認できるようになりました" },
      { type: "improve", text: "バージョン表示をわかりやすい場所に移動しました" },
      { type: "fix", text: "オンボーディング画面とホーム画面でバージョン表示が異なる問題を修正" },
    ],
  },
  {
    version: "v6.53",
    date: "2025-01-25",
    title: "安定性とデプロイの改善",
    changes: [
      { type: "improve", text: "自動デプロイシステムを改善し、より安定した運用を実現" },
      { type: "improve", text: "エラー時の復旧機能を強化" },
      { type: "fix", text: "一部の画面で表示が崩れる問題を修正" },
    ],
  },
  {
    version: "v5.81",
    date: "2025-01-19",
    title: "用語改善・検索修正",
    changes: [
      { type: "improve", text: "「ホスト」を「主催者」に変更し、初めての方にもわかりやすく" },
      { type: "improve", text: "ランキング画面に説明を追加（貢献度・主催者ランキングの違いを明記）" },
      { type: "fix", text: "検索窓の入力が正常に動作しない問題を修正" },
    ],
  },
  {
    version: "v5.80",
    date: "2025-01-19",
    title: "見やすさの改善",
    changes: [
      { type: "improve", text: "アチーブメントバッジの色を見やすい色に変更" },
      { type: "improve", text: "全画面で薄いグレー文字を明るい色に変更" },
      { type: "change", text: "ダークモード専用に変更（目に優しいデザイン）" },
    ],
  },
  {
    version: "v5.79",
    date: "2025-01-18",
    title: "動作速度の改善",
    changes: [
      { type: "improve", text: "一覧ページの読み込み速度を改善" },
      { type: "fix", text: "スクロール時のカクつきを軽減" },
    ],
  },
  {
    version: "v5.78",
    date: "2025-01-17",
    title: "チュートリアル機能追加",
    changes: [
      { type: "new", text: "初めての方向けチュートリアルを追加" },
      { type: "new", text: "ハイライト表示で操作をガイド" },
    ],
  },
  {
    version: "v5.77",
    date: "2025-01-16",
    title: "お気に入り機能強化",
    changes: [
      { type: "new", text: "お気に入りフィルターを追加" },
      { type: "improve", text: "お気に入り登録時のアニメーションを追加" },
    ],
  },
  {
    version: "v5.75",
    date: "2025-01-14",
    title: "カラフルカード表示",
    changes: [
      { type: "new", text: "チャレンジカードのカラフル表示モードを追加" },
      { type: "improve", text: "見やすさを考慮した配色に変更" },
    ],
  },
];

async function seedReleaseNotes() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  console.log("Seeding release notes...");

  for (const note of releaseNotesData) {
    await db.insert(releaseNotes).values(note);
    console.log(`Inserted ${note.version}`);
  }

  console.log("Release notes seeded successfully!");
  process.exit(0);
}

seedReleaseNotes();
