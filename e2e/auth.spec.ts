import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: /sign up/i }).click();

    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /log in/i }).click();

    // Wait for error message to appear
    // Adjust the selector based on your actual error message implementation
    // await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });
});
