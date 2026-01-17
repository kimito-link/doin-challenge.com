import { test, expect } from "@playwright/test";

/**
 * 本番環境でTwitterログインをテストして、descriptionが正しく保存されるか確認
 */
test("Production Twitter login - check description flow", async ({ page }) => {
  // コンソールログをキャプチャ
  const consoleLogs: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    // Twitter OAuth関連のログを出力
    if (text.includes("Twitter") || text.includes("description") || text.includes("Auth")) {
      console.log(`[Console] ${text}`);
    }
  });

  // ネットワークリクエストを監視
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("twitter-callback") || url.includes("oauth")) {
      console.log(`[Request] ${request.method()} ${url.substring(0, 200)}`);
    }
  });

  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("twitter-callback") || url.includes("oauth")) {
      console.log(`[Response] ${response.status()} ${url.substring(0, 200)}`);
    }
  });

  // 1. 本番環境のマイページにアクセス
  console.log("\n=== Step 1: Navigate to production mypage ===");
  await page.goto("https://doin-challenge.com/mypage", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 2. 現在のlocalStorageの値を確認
  console.log("\n=== Step 2: Check current localStorage ===");
  const currentUserInfo = await page.evaluate(() => {
    const info = localStorage.getItem("manus-runtime-user-info");
    return info ? JSON.parse(info) : null;
  });
  
  console.log("Current user info:", JSON.stringify(currentUserInfo, null, 2));
  
  if (currentUserInfo) {
    console.log("\n=== Current user info fields ===");
    console.log("- id:", currentUserInfo.id);
    console.log("- name:", currentUserInfo.name);
    console.log("- username:", currentUserInfo.username);
    console.log("- description:", currentUserInfo.description);
    console.log("- description type:", typeof currentUserInfo.description);
    console.log("- description length:", currentUserInfo.description?.length);
    
    // descriptionが存在するか確認
    if (currentUserInfo.description) {
      console.log("\n✅ SUCCESS: description exists in localStorage!");
      console.log("Description value:", currentUserInfo.description);
    } else {
      console.log("\n❌ PROBLEM: description is missing or empty in localStorage!");
      console.log("All keys in userInfo:", Object.keys(currentUserInfo));
    }
  } else {
    console.log("No user info in localStorage - user not logged in");
  }

  // 3. ページ上のdescription表示を確認
  console.log("\n=== Step 3: Check description display on page ===");
  const pageContent = await page.content();
  
  // プロフィールカードのdescription部分を探す
  const descriptionElement = await page.$("text=はろー");
  if (descriptionElement) {
    const descText = await descriptionElement.textContent();
    console.log("✅ Description found on page:", descText?.substring(0, 100));
  } else {
    console.log("❌ Description not found on page");
  }

  // 4. コンソールログを出力
  console.log("\n=== Step 4: Console logs summary ===");
  const relevantLogs = consoleLogs.filter(log => 
    log.includes("Twitter") || 
    log.includes("description") || 
    log.includes("Auth") ||
    log.includes("setUserInfo")
  );
  console.log("Relevant console logs:");
  relevantLogs.forEach(log => console.log(log));

  // 5. スクリーンショットを保存
  await page.screenshot({ path: "tests/production-mypage-state.png", fullPage: true });
  console.log("\n=== Screenshot saved to tests/production-mypage-state.png ===");

  // テスト結果
  if (currentUserInfo?.description) {
    console.log("\n=== TEST RESULT: PASS ===");
    console.log("Description is correctly saved in localStorage");
  } else {
    console.log("\n=== TEST RESULT: FAIL ===");
    console.log("Description is NOT saved in localStorage");
    console.log("This indicates the problem is in the Twitter OAuth callback flow");
  }
});

/**
 * Twitter OAuthコールバックのURLパラメータを確認するテスト
 */
test("Check Twitter callback URL parameters", async ({ page }) => {
  // コンソールログをキャプチャ
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("Twitter") || text.includes("description") || text.includes("data")) {
      console.log(`[Console] ${text}`);
    }
  });

  // 1. twitter-callbackページにアクセスして、URLパラメータを確認
  console.log("\n=== Checking Twitter callback page behavior ===");
  
  // 本番環境のマイページにアクセス
  await page.goto("https://doin-challenge.com/mypage", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // localStorageの値を確認
  const userInfo = await page.evaluate(() => {
    const info = localStorage.getItem("manus-runtime-user-info");
    return info ? JSON.parse(info) : null;
  });

  console.log("\n=== localStorage user info ===");
  if (userInfo) {
    // 全フィールドを出力
    for (const [key, value] of Object.entries(userInfo)) {
      if (typeof value === "string" && value.length > 100) {
        console.log(`${key}: ${(value as string).substring(0, 100)}...`);
      } else {
        console.log(`${key}: ${JSON.stringify(value)}`);
      }
    }
  } else {
    console.log("No user info found");
  }

  // descriptionの有無を確認
  const hasDescription = userInfo && "description" in userInfo && userInfo.description;
  console.log("\n=== Description check ===");
  console.log("Has description field:", "description" in (userInfo || {}));
  console.log("Description value:", userInfo?.description || "(empty/undefined)");
  console.log("Description is truthy:", !!hasDescription);
});
