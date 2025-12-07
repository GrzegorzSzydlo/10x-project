import { test as base } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

// Page Object Model for Create Project Modal
export class CreateProjectModal {
  readonly modal: Locator;
  readonly projectNameInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly validationError: Locator;
  readonly apiError: Locator;

  constructor(private page: Page) {
    this.modal = page.locator('[data-test-id="create-project-modal"]');
    this.projectNameInput = page.locator('[data-test-id="project-name-input"]');
    this.submitButton = page.locator('[data-test-id="submit-button"]');
    this.cancelButton = page.locator('[data-test-id="cancel-button"]');
    this.validationError = page.locator('[data-test-id="validation-error"]');
    this.apiError = page.locator('[data-test-id="api-error"]');
  }

  async waitForModal() {
    await this.modal.waitFor({ state: "visible" });
  }

  async fillProjectName(name: string) {
    await this.projectNameInput.fill(name);
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async createProject(name: string) {
    await this.waitForModal();
    await this.fillProjectName(name);
    await this.submit();
  }

  async isVisible() {
    return await this.modal.isVisible();
  }

  async waitForClose() {
    await this.modal.waitFor({ state: "hidden" });
  }
}

// Page Object Model for Dashboard Page
export class DashboardPage {
  readonly createProjectButton: Locator;
  readonly createFirstProjectButton: Locator;
  readonly projectsGrid: Locator;
  readonly projectCards: Locator;
  readonly createProjectModal: CreateProjectModal;

  constructor(private page: Page) {
    this.createProjectButton = page.locator('[data-test-id="create-project-button"]');
    this.createFirstProjectButton = page.locator('[data-test-id="create-first-project-button"]');
    this.projectsGrid = page.locator('[data-test-id="projects-grid"]');
    this.projectCards = page.locator('[data-test-id="project-card"]');
    this.createProjectModal = new CreateProjectModal(page);
  }

  async goto() {
    await this.page.goto("/");
  }

  async openCreateProjectModal() {
    await this.createProjectButton.click();
    await this.createProjectModal.waitForModal();
  }

  async openCreateFirstProjectModal() {
    await this.createFirstProjectButton.click();
    await this.createProjectModal.waitForModal();
  }

  async getProjectCardByName(name: string) {
    return this.projectCards.filter({ hasText: name });
  }

  async hasProjects() {
    return await this.projectsGrid.isVisible();
  }

  async getProjectsCount() {
    return await this.projectCards.count();
  }

  async createNewProject(name: string) {
    await this.openCreateProjectModal();
    await this.createProjectModal.createProject(name);
    await this.createProjectModal.waitForClose();
  }
}

// Example Page Object Model for Login Page
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    // Listen for API response to debug
    const responsePromise = this.page.waitForResponse((response) => response.url().includes("/api/auth/login"));

    await this.page.getByLabel(/e-mail/i).fill(email);
    await this.page.getByLabel(/hasło/i).fill(password);
    await this.page.getByRole("button", { name: /zaloguj się/i }).click();

    // Wait for login API response
    const response = await responsePromise;
    const status = response.status();

    console.log("Login response status:", status);

    if (status !== 200) {
      const body = await response.text();
      console.error("Login failed:", body);
      throw new Error(`Login failed with status ${status}: ${body}`);
    }

    // Wait for successful navigation
    await this.page.waitForURL("/", { timeout: 5000 });
  }

  async getEmailInput() {
    return this.page.getByLabel(/e-mail/i);
  }

  async getPasswordInput() {
    return this.page.getByLabel(/hasło/i);
  }

  async getSubmitButton() {
    return this.page.getByRole("button", { name: /zaloguj się/i });
  }
} // Extend base test with page objects
interface PageFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  createProjectModal: CreateProjectModal;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
  createProjectModal: async ({ page }, use) => {
    const createProjectModal = new CreateProjectModal(page);
    await use(createProjectModal);
  },
});

export { expect } from "@playwright/test";
