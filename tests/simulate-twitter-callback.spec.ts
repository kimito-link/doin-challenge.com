import { test, expect } from "@playwright/test";

/**
 * Twitter OAuthコールバックをシミュレートして、descriptionが正しく保存されるかテスト
 */
test("Simulate Twitter OAuth callback with description", async ({ page }) => {
  // コンソールログをキャプチャ
  const consoleLogs: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    // 重要なログを出力
    if (text.includes("Twitter") || text.includes("description") || text.includes("Auth") || text.includes("setUserInfo")) {
      console.log(`[Console] ${text}`);
    }
  });

  // 1. モックユーザーデータを作成（descriptionを含む）
  const mockUserData = {
    twitterId: "1781090940826066945",
    name: "君斗りんく＠クリエイター応援",
    username: "streamerfunch",
    profileImage: "https://pbs.twimg.com/profile_images/1890275406290513922/kewXCU0t_400x400.jpg",
    followersCount: 451,
    followingCount: 100,
    description: "はろー！君斗りんくなのだ🎶配信者•クリエイターの収益アップを目的に、ボクの作ったYouTube動画やコンテンツで配信者さん達を応援しているのだ📣",
    accessToken: "mock_access_token",
    refreshToken: "mock_refresh_token",
    isFollowingTarget: true,
    targetAccount: {
      username: "idolfunch",
      displayName: "君斗りんく",
      profileUrl: "https://twitter.com/idolfunch"
    }
  };

  console.log("\n=== Step 1: Mock user data ===");
  console.log("Mock description:", mockUserData.description);

  // 2. エンコードしたデータでコールバックURLを作成
  const encodedData = encodeURIComponent(JSON.stringify(mockUserData));
  const callbackUrl = `https://doin-challenge.com/oauth/twitter-callback?data=${encodedData}`;
  
  console.log("\n=== Step 2: Navigate to callback URL ===");
  console.log("Callback URL length:", callbackUrl.length);

  // 3. コールバックページにアクセス
  await page.goto(callbackUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // 4. localStorageの値を確認
  console.log("\n=== Step 3: Check localStorage after callback ===");
  const userInfo = await page.evaluate(() => {
    const info = localStorage.getItem("manus-runtime-user-info");
    return info ? JSON.parse(info) : null;
  });

  if (userInfo) {
    console.log("\n=== localStorage user info ===");
    console.log("- id:", userInfo.id);
    console.log("- name:", userInfo.name);
    console.log("- username:", userInfo.username);
    console.log("- description:", userInfo.description);
    console.log("- description type:", typeof userInfo.description);
    console.log("- description length:", userInfo.description?.length);
    console.log("- All keys:", Object.keys(userInfo).join(", "));

    if (userInfo.description) {
      console.log("\n✅ SUCCESS: description is saved correctly!");
      console.log("Saved description:", userInfo.description);
    } else {
      console.log("\n❌ PROBLEM: description is missing or empty!");
    }
  } else {
    console.log("❌ No user info in localStorage after callback");
  }

  // 5. コンソールログを確認
  console.log("\n=== Step 4: Relevant console logs ===");
  const relevantLogs = consoleLogs.filter(log => 
    log.includes("Twitter") || 
    log.includes("description") || 
    log.includes("Auth") ||
    log.includes("setUserInfo") ||
    log.includes("stored")
  );
  relevantLogs.forEach(log => console.log(log));

  // 6. スクリーンショットを保存
  await page.screenshot({ path: "tests/twitter-callback-result.png", fullPage: true });
  console.log("\n=== Screenshot saved ===");

  // 7. マイページにリダイレクトされるのを待つ
  console.log("\n=== Step 5: Wait for redirect to mypage ===");
  await page.waitForTimeout(2000);
  
  // 現在のURLを確認
  const currentUrl = page.url();
  console.log("Current URL:", currentUrl);

  // 8. マイページでdescriptionが表示されるか確認
  if (currentUrl.includes("mypage")) {
    console.log("\n=== Step 6: Check description on mypage ===");
    await page.waitForTimeout(2000);
    
    const finalUserInfo = await page.evaluate(() => {
      const info = localStorage.getItem("manus-runtime-user-info");
      return info ? JSON.parse(info) : null;
    });
    
    console.log("Final localStorage description:", finalUserInfo?.description);
    
    // ページ上のdescription表示を確認
    const pageContent = await page.content();
    const hasDescriptionOnPage = pageContent.includes("はろー");
    console.log("Description visible on page:", hasDescriptionOnPage);
    
    await page.screenshot({ path: "tests/mypage-with-description.png", fullPage: true });
  }

  // テスト結果
  expect(userInfo?.description).toBeTruthy();
});

/**
 * バックエンドから返されるデータの形式を確認するテスト
 */
test("Check backend response format", async ({ page }) => {
  console.log("\n=== Testing backend response format ===");
  
  // バックエンドのAPIエンドポイントを直接呼び出して、レスポンス形式を確認
  // （認証が必要なので、実際には呼び出せないが、フォーマットを確認）
  
  // 期待されるレスポンス形式
  const expectedFormat = {
    twitterId: "string",
    name: "string",
    username: "string",
    profileImage: "string",
    followersCount: "number",
    followingCount: "number",
    description: "string", // ← これが必要
    accessToken: "string",
    refreshToken: "string",
    isFollowingTarget: "boolean",
    targetAccount: "object"
  };

  console.log("Expected response format:");
  for (const [key, type] of Object.entries(expectedFormat)) {
    console.log(`  ${key}: ${type}`);
  }

  // 本番環境のマイページにアクセスして、現在のlocalStorageを確認
  await page.goto("https://doin-challenge.com/mypage", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const userInfo = await page.evaluate(() => {
    const info = localStorage.getItem("manus-runtime-user-info");
    return info ? JSON.parse(info) : null;
  });

  if (userInfo) {
    console.log("\nActual localStorage format:");
    for (const [key, value] of Object.entries(userInfo)) {
      const type = typeof value;
      const hasValue = value !== null && value !== undefined && value !== "";
      console.log(`  ${key}: ${type} (${hasValue ? "has value" : "EMPTY"})`);
    }

    // descriptionフィールドの存在を確認
    const hasDescriptionField = "description" in userInfo;
    const hasDescriptionValue = userInfo.description && userInfo.description.length > 0;
    
    console.log("\n=== Description field check ===");
    console.log("Has 'description' field:", hasDescriptionField);
    console.log("Has description value:", hasDescriptionValue);
    
    if (!hasDescriptionField) {
      console.log("\n❌ PROBLEM: 'description' field is missing from localStorage");
      console.log("This means the backend is NOT returning 'description' in the user data");
    } else if (!hasDescriptionValue) {
      console.log("\n❌ PROBLEM: 'description' field exists but is empty");
      console.log("This means the backend is returning empty 'description'");
    } else {
      console.log("\n✅ SUCCESS: 'description' field exists and has value");
    }
  } else {
    console.log("\nNo user info in localStorage - user not logged in");
  }
});
