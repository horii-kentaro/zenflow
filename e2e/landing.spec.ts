import { test, expect } from "@playwright/test";

test.describe("ランディングページ", () => {
  test("トップページが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("ログインボタンが存在する", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible();
  });

  test("新規登録ボタンが存在する", async ({ page }) => {
    await page.goto("/");
    const signupLink = page.locator('a[href="/signup"]').first();
    await expect(signupLink).toBeVisible();
  });

  test("法的ページへのリンクが存在する", async ({ page }) => {
    await page.goto("/");
    // フッター等にリンクが存在するか
    await expect(page.locator('a[href="/privacy"]').first()).toBeVisible();
    await expect(page.locator('a[href="/terms"]').first()).toBeVisible();
  });

  test("プライバシーポリシーページが表示される", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText("プライバシーポリシー");
  });

  test("利用規約ページが表示される", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText("利用規約");
  });
});
