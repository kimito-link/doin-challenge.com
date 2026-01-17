import { test, expect } from '@playwright/test';

test.describe('Check Production localStorage', () => {
  test('should check current localStorage value on production', async ({ page }) => {
    // タイムアウトを延長
    test.setTimeout(60000);

    // コンソールログを収集
    page.on('console', msg => {
      const text = msg.text();
      console.log('[Browser]', text);
    });

    console.log('=== Checking Production localStorage ===');

    // マイページに直接アクセス
    await page.goto('https://doin-challenge.com/mypage', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // localStorageの値を取得
    const rawUserInfo = await page.evaluate(() => {
      return window.localStorage.getItem('manus-runtime-user-info');
    });

    console.log('\n=== Raw localStorage Value ===');
    console.log(rawUserInfo);

    if (rawUserInfo) {
      try {
        const parsed = JSON.parse(rawUserInfo);
        console.log('\n=== Parsed Fields ===');
        console.log('All keys:', Object.keys(parsed));
        console.log('description key exists:', 'description' in parsed);
        console.log('description value:', parsed.description);
        console.log('description type:', typeof parsed.description);
        
        if (parsed.description === undefined) {
          console.log('\n❌ ERROR: description is undefined in localStorage!');
        } else if (parsed.description === null) {
          console.log('\n❌ ERROR: description is null in localStorage!');
        } else if (parsed.description === '') {
          console.log('\n❌ ERROR: description is empty string in localStorage!');
        } else {
          console.log('\n✅ SUCCESS: description exists in localStorage!');
          console.log('Description:', parsed.description);
        }
      } catch (e) {
        console.log('Failed to parse JSON:', e);
      }
    } else {
      console.log('❌ ERROR: No user info in localStorage');
    }

    // ページのHTMLを確認
    const pageContent = await page.content();
    console.log('\n=== Page Content Check ===');
    console.log('Contains "はろー":', pageContent.includes('はろー'));
    console.log('Contains "配信者":', pageContent.includes('配信者'));
    
    // スクリーンショットを保存
    await page.screenshot({ path: '/home/ubuntu/birthday-celebration/tests/production-mypage.png', fullPage: true });
    console.log('Screenshot saved to: tests/production-mypage.png');
  });
});
