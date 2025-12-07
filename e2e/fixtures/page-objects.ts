import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

// Example Page Object Model for Login Page
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole("button", { name: /log in/i }).click();
  }

  async getEmailInput() {
    return this.page.getByLabel(/email/i);
  }

  async getPasswordInput() {
    return this.page.getByLabel(/password/i);
  }

  async getSubmitButton() {
    return this.page.getByRole("button", { name: /log in/i });
  }
}

// Extend base test with page objects
interface PageFixtures {
  loginPage: LoginPage;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export { expect } from "@playwright/test";
