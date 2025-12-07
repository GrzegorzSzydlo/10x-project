import { test } from "./fixtures/page-objects";
import { expect } from "@playwright/test";
import { getE2ECredentials } from "./helpers/env";

// Example test using Page Object Model
test.describe("Login with Page Object Model", () => {
  test("should login with valid credentials", async ({ loginPage, page }) => {
    await loginPage.goto();

    const { username, password } = getE2ECredentials();
    await loginPage.login(username, password);

    // Verify successful login - redirect to dashboard
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: /moje projekty/i })).toBeVisible();
  });
});
