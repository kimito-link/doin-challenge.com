import { getDb } from "../server/db/connection";
import { sql } from "drizzle-orm";

/**
 * 既存チャレンジのpurposeをliveに更新するバッチ処理
 * 
 * 理由: purposeカラムを追加したため、既存データは全てliveに設定する
 */
async function updatePurposeToLive() {
  console.log("既存チャレンジのpurposeをliveに更新します...");
  
  const db = await getDb();
  if (!db) {
    console.error("データベースに接続できませんでした");
    process.exit(1);
  }
  
  try {
    // 全てのチャレンジのpurposeをliveに更新
    const result = await db.execute(sql`
      UPDATE challenges
      SET purpose = 'live'
      WHERE purpose IS NULL OR purpose != 'live'
    `);
    
    console.log(`✅ 更新完了: ${(result[0] as any).affectedRows}件のチャレンジを更新しました`);
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

updatePurposeToLive();
