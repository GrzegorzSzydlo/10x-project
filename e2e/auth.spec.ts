import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /zaloguj się/i })).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/hasło/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /zaloguj się/i })).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: /zarejestruj się/i }).click();

    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByRole("heading", { name: /zarejestruj się|rejestracja/i })).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/e-mail/i).fill("invalid@example.com");
    await page.getByLabel(/hasło/i).fill("wrongpassword");
    await page.getByRole("button", { name: /zaloguj się/i }).click();

    // Wait for error message to appear
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText(/nieprawidłowe|błąd/i);
  });
});
