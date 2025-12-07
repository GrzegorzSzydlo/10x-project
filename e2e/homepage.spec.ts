import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/10x-project/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should navigate to login page from homepage", async ({ page }) => {
    await page.goto("/");

    // Adjust the selector based on your actual navigation
    await page.getByRole("link", { name: /log in/i }).click();

    await expect(page).toHaveURL(/.*login/);
  });
});
