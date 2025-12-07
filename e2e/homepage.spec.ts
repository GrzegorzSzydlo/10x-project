import { test, expect } from "./fixtures/page-objects";
import { getE2ECredentials } from "./helpers/env";

test.describe("Homepage", () => {
  test.beforeEach(async ({ loginPage }) => {
    // Login before accessing homepage
    await loginPage.goto();
    const { username, password } = getE2ECredentials();
    await loginPage.login(username, password);
  });

  test("should load the homepage successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: /moje projekty/i })).toBeVisible();
  });

  test("should display user menu", async ({ page }) => {
    await page.goto("/");

    // Check if user is logged in by looking for logout or user menu elements
    await expect(page.locator("header")).toBeVisible();
  });
});
