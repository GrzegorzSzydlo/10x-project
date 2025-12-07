import { test, expect } from "./fixtures/page-objects";
import { getE2ECredentials } from "./helpers/env";

test.describe("Create Project E2E Flow", () => {
  test.beforeEach(async ({ loginPage }) => {
    // Login as project manager or administrator
    await loginPage.goto();
    const { username, password } = getE2ECredentials();
    await loginPage.login(username, password);
  });

  test("should open create project modal when clicking the button", async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Click the create project button
    await dashboardPage.openCreateProjectModal();

    // Verify modal is visible and has correct content
    await expect(dashboardPage.createProjectModal.modal).toBeVisible();
    await expect(dashboardPage.createProjectModal.projectNameInput).toBeVisible();
  });

  test("should show validation error for invalid project name", async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Open modal
    await dashboardPage.openCreateProjectModal();

    // Try to submit with too short name
    await dashboardPage.createProjectModal.fillProjectName("ab"); // Too short (min 3 chars)
    await dashboardPage.createProjectModal.projectNameInput.blur();

    // Verify validation error appears
    await expect(dashboardPage.createProjectModal.validationError).toBeVisible();

    // Submit button should be disabled
    await expect(dashboardPage.createProjectModal.submitButton).toBeDisabled();
  });

  test("should successfully create a new project", async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Create new project using POM
    const projectName = `Test Project ${Date.now()}`;
    await dashboardPage.createNewProject(projectName);

    // Verify the projects grid is visible
    await expect(dashboardPage.projectsGrid).toBeVisible();

    // Verify the project card with the new project name exists
    const projectCard = await dashboardPage.getProjectCardByName(projectName);
    await expect(projectCard).toBeVisible();
  });

  test("should close modal when clicking cancel button", async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Open modal
    await dashboardPage.openCreateProjectModal();

    // Fill in some data
    await dashboardPage.createProjectModal.fillProjectName("Test Project");

    // Click cancel
    await dashboardPage.createProjectModal.cancel();

    // Modal should be closed
    await expect(dashboardPage.createProjectModal.modal).not.toBeVisible();

    // Project should not be created
    const projectCard = await dashboardPage.getProjectCardByName("Test Project");
    await expect(projectCard).not.toBeVisible();
  });

  test("should show API error when project creation fails", async ({ page, dashboardPage }) => {
    await dashboardPage.goto();

    // Mock API to return error
    await page.route("/api/projects", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Project with this name already exists" }),
      });
    });

    // Open modal and fill form
    await dashboardPage.openCreateProjectModal();
    await dashboardPage.createProjectModal.fillProjectName("Duplicate Project");

    // Submit
    await dashboardPage.createProjectModal.submit();

    // Verify API error is displayed
    await expect(dashboardPage.createProjectModal.apiError).toBeVisible();
    await expect(dashboardPage.createProjectModal.apiError).toContainText("Project with this name already exists");

    // Modal should still be open
    await expect(dashboardPage.createProjectModal.modal).toBeVisible();
  });

  test("should create first project from empty state", async ({ page, dashboardPage }) => {
    // Mock empty projects list
    await page.route("/api/projects", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        route.continue();
      }
    });

    await dashboardPage.goto();

    // Verify empty state is shown
    await expect(page.getByText("Brak projektów")).toBeVisible();

    // Click create first project button
    await dashboardPage.openCreateFirstProjectModal();

    // Fill and submit
    const projectName = `First Project ${Date.now()}`;
    await dashboardPage.createProjectModal.createProject(projectName);

    // Modal closes and project appears
    await expect(dashboardPage.createProjectModal.modal).not.toBeVisible();
    await expect(dashboardPage.projectsGrid).toBeVisible();
  });
});
