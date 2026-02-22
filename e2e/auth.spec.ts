import { test, expect } from "@playwright/test";

test.describe("認証フロー", () => {
  test("ログインページが表示される", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Zenflow");
    await expect(page.locator("text=アカウントにログイン")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible();
  });

  test("新規登録ページが表示される", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("h1")).toContainText("Zenflow");
    await expect(page.locator("text=無料アカウントを作成")).toBeVisible();
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("ログインページから新規登録ページへ遷移できる", async ({ page }) => {
    await page.goto("/login");
    await page.click('a:has-text("新規登録")');
    await expect(page).toHaveURL(/\/signup/);
  });

  test("新規登録ページからログインページへ遷移できる", async ({ page }) => {
    await page.goto("/signup");
    await page.click('a:has-text("ログイン")');
    await expect(page).toHaveURL(/\/login/);
  });

  test("空のフォーム送信でHTML5バリデーションが作動する", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"]');

    // required属性でブラウザネイティブバリデーション
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("パスワードリセットリンクが表示される", async ({ page }) => {
    await page.goto("/login");
    const forgotLink = page.locator('a:has-text("パスワードを忘れた方")');
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });
});
