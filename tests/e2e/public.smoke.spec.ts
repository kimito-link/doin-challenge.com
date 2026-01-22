// tests/e2e/public.smoke.spec.ts
import { test } from "@playwright/test";
import { attachGuards, gotoAndWait, expectAnyHeading } from "./_helpers";

const EVENT_ID = process.env.SMOKE_EVENT_ID ?? "90001";
const USER_ID = process.env.SMOKE_USER_ID ?? "1";
const INVITE_ID = process.env.SMOKE_INVITE_ID ?? EVENT_ID;

test.describe("Public Smoke", () => {
  test("Home /", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    await gotoAndWait(page, "/");

    // ホームが開けたことの軽い判定
    await expectAnyHeading(page, [/総合/i, /お気に入り/i, /ソロ/i, /グループ/i, /ランキング/i, /チャレンジ/i, /動員/i]);

    await assertNoErrors();
  });

  test("Create /create", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    await gotoAndWait(page, "/create");
    // 何かしら "作成" 文言があればOK
    await expectAnyHeading(page, [/作成/i, /チャレンジ/i, /イベント/i, /新規/i]);
    await assertNoErrors();
  });

  test("MyPage /mypage", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    await gotoAndWait(page, "/mypage");
    await expectAnyHeading(page, [/マイページ/i, /プロフィール/i, /設定/i, /ログイン/i]);
    await assertNoErrors();
  });

  test("Event detail /event/[id]", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    await gotoAndWait(page, `/event/${EVENT_ID}`);
    await expectAnyHeading(page, [/参加/i, /応援/i, /目標/i, /進捗/i, /チャレンジ/i]);
    await assertNoErrors();
  });

  test("Profile /profile/[userId]", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    await gotoAndWait(page, `/profile/${USER_ID}`);
    await expectAnyHeading(page, [/フォロー/i, /プロフィール/i, /応援/i, /参加/i]);
    await assertNoErrors();
  });

  test("Invite /invite/[id]", async ({ page }, testInfo) => {
    const assertNoErrors = await attachGuards(page, testInfo);
    await gotoAndWait(page, `/invite/${INVITE_ID}`);
    await expectAnyHeading(page, [/招待/i, /共有/i, /リンク/i, /参加/i]);
    await assertNoErrors();
  });
});
