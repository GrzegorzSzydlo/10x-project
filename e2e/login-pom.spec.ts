import { test } from "./fixtures/page-objects";
import { expect } from "@playwright/test";

// Example test using Page Object Model
test.describe("Login with Page Object Model", () => {
  test("should login with valid credentials", async ({ loginPage, page }) => {
    await loginPage.goto();

    await loginPage.login("test@example.com", "password123");

    // Verify successful login - adjust based on your app's behavior
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
